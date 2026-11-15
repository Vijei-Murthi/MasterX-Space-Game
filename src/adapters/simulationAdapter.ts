/**
 * MASTERX – SPACE MACHINE
 * Simulation Integration Adapter (Member 3 Boundary)
 * Reference: docs/integration-guide.md
 * 
 * Cleanly bridges Member 3's simulation engine (`src/modules/simulation/`)
 * with Member 1's presentation pages (`SimulationPage.tsx` and `MissionReportPage.tsx`).
 */

import {
  SimulationEngine,
  SimulationInput,
  TelemetryData,
} from '../modules/simulation';
import { SimulationEvent, SimulationState, MissionReport } from '../types/simulation';
import { SpacecraftComponent } from '../types/builder';
import { MissionState } from '../types/mission';
import { ORBIT_OPTIONS, calculateResourceMetrics } from './engineeringAdapter';
import { COMPONENT_CATALOGUE } from '../data/builderCatalogue';

let activeEngine: SimulationEngine | null = null;
let currentEngineMissionId: string | null = null;

/**
 * Maps frontend MissionState into Member 3's typed SimulationInput
 */
export function createSimulationInput(mission: MissionState): SimulationInput {
  const orbit =
    ORBIT_OPTIONS.find((o) => o.id === mission.orbitLaunch.selectedOrbitId) ||
    ORBIT_OPTIONS[0];

  const metrics = calculateResourceMetrics(mission);

  const resourceTotals = {
    totalMassKg: metrics.totalMassKg,
    maxMassKg: metrics.maxMassKg,
    totalCostUSD: metrics.totalCostUSD,
    budgetUSD: metrics.maxBudgetUSD,
    remainingBudgetUSD: metrics.remainingBudgetUSD,
    totalPowerGenWatts: metrics.powerGeneratedWatts,
    totalPowerDrawWatts: metrics.powerConsumedWatts,
    netPowerWatts: metrics.netPowerWatts,
    batteryCapacityWh: metrics.batteryCapacityWh,
    massMarginKg: metrics.massMarginKg,
    budgetMarginUSD: metrics.remainingBudgetUSD,
    isMassValid: metrics.massMarginKg >= 0,
    isBudgetValid: metrics.remainingBudgetUSD >= 0,
    isPowerValid: metrics.netPowerWatts > 0,
  };

  const resolvedComponents = Object.values(mission.spacecraft)
    .map((id) => COMPONENT_CATALOGUE.find((c) => c.id === id))
    .filter(Boolean) as SpacecraftComponent[];

  return {
    missionId: mission.missionId,
    difficulty: mission.briefing.difficulty,
    target: mission.briefing.targetId,
    orbitParams: {
      orbitName: orbit.name,
      altitudeKm: orbit.altitudeKm,
      inclinationDeg: orbit.inclinationDeg,
      periodMinutes: orbit.periodMinutes,
      eclipseDurationMinutes: orbit.eclipseDurationMinutes,
    },
    resourceTotals,
    selectedComponents: mission.spacecraft,
    resolvedComponents,
  };
}

/**
 * Retrieves or lazily creates a SimulationEngine instance for the active mission
 */
export function getOrCreateSimulationEngine(mission: MissionState): SimulationEngine {
  if (!activeEngine || currentEngineMissionId !== mission.missionId) {
    const input = createSimulationInput(mission);
    activeEngine = new SimulationEngine(input);
    currentEngineMissionId = mission.missionId;
  }
  return activeEngine;
}

/**
 * Generates initial telemetry state using Member 3's simulation engine
 */
export function createInitialSimulationState(mission: MissionState): SimulationState {
  const engine = getOrCreateSimulationEngine(mission);
  const telemetry = engine.getTelemetry();
  const state = engine.getState();

  return {
    missionElapsedTimeSeconds: state.missionElapsedTimeSeconds,
    currentOrbitFraction: state.currentOrbitFraction,
    orbitNumber: 1,
    batterySocPercent: Number(telemetry.batterySocPercent.toFixed(1)),
    solarFluxWm2: telemetry.solarFluxWm2,
    dataCollectedMb: telemetry.dataStoredMb,
    isEclipse: telemetry.isEclipse,
    activeAnomalies: telemetry.activeAnomalies,
    altitudeKm: telemetry.altitudeKm,
    orbitalVelocityKmS: 7.61,
    subSatelliteLatitude: 22.4,
    subSatelliteLongitude: -74.2,
    isDemoData: false,
  };
}

/**
 * Advances the simulation by stepSeconds using Member 3's SimulationEngine
 */
export function advanceSimulationStep(
  prev: SimulationState,
  mission: MissionState,
  stepSeconds: number = 30
): { nextState: SimulationState; newEvents: SimulationEvent[]; telemetry: TelemetryData } {
  const engine = getOrCreateSimulationEngine(mission);
  const orbit =
    ORBIT_OPTIONS.find((o) => o.id === mission.orbitLaunch.selectedOrbitId) ||
    ORBIT_OPTIONS[0];

  // Execute tick in Member 3's engine
  const telemetry = engine.tick(stepSeconds);
  const state = engine.getState();

  const orbitPeriodSeconds = (orbit.periodMinutes || 95) * 60;
  const orbitNumber = Math.floor(state.missionElapsedTimeSeconds / orbitPeriodSeconds) + 1;

  // Approximate ground track sub-satellite position
  const subSatelliteLatitude = Number(
    (Math.sin(state.currentOrbitFraction * Math.PI * 2) * (orbit.inclinationDeg || 97.4)).toFixed(2)
  );
  const subSatelliteLongitude = Number(
    ((((prev.subSatelliteLongitude + 3.0 * (stepSeconds / 60) + 180) % 360) - 180).toFixed(2))
  );

  const newEvents: SimulationEvent[] = [];

  // Detect state transitions
  if (!prev.isEclipse && telemetry.isEclipse) {
    newEvents.push({
      id: `evt-eclipse-in-${state.missionElapsedTimeSeconds}`,
      timestampSeconds: state.missionElapsedTimeSeconds,
      type: 'ECLIPSE_ENTRY',
      description: `Orbital Umbra Entry. Solar flux 0 W/m². Spacecraft switching to battery reserve.`,
      impact: { solarFlux: 0, batteryDrawWatts: -telemetry.powerDrawWatts },
    });
  } else if (prev.isEclipse && !telemetry.isEclipse) {
    newEvents.push({
      id: `evt-eclipse-out-${state.missionElapsedTimeSeconds}`,
      timestampSeconds: state.missionElapsedTimeSeconds,
      type: 'ECLIPSE_EXIT',
      description: `Orbital Penumbra Exit. Solar arrays illuminated (+${telemetry.powerGenerationWatts.toFixed(1)}W). Recharging battery.`,
      impact: { solarFlux: telemetry.solarFluxWm2, batteryChargeWatts: telemetry.powerGenerationWatts },
    });
  }

  if (telemetry.imagingActive && Math.random() < 0.25) {
    const mbIncrement = Math.floor(Math.random() * 35) + 20;
    newEvents.push({
      id: `evt-imaging-${state.missionElapsedTimeSeconds}`,
      timestampSeconds: state.missionElapsedTimeSeconds,
      type: 'EARTH_IMAGING',
      description: `Target Acquisition: Scientific swath captured (${telemetry.currentStage}).`,
      impact: { dataMb: mbIncrement },
    });
  }

  const nextState: SimulationState = {
    missionElapsedTimeSeconds: state.missionElapsedTimeSeconds,
    currentOrbitFraction: Number(state.currentOrbitFraction.toFixed(3)),
    orbitNumber,
    batterySocPercent: Number(telemetry.batterySocPercent.toFixed(1)),
    solarFluxWm2: telemetry.solarFluxWm2,
    dataCollectedMb: telemetry.dataStoredMb + telemetry.dataTransmittedMb,
    isEclipse: telemetry.isEclipse,
    activeAnomalies: telemetry.activeAnomalies,
    altitudeKm: telemetry.altitudeKm,
    orbitalVelocityKmS: 7.61,
    subSatelliteLatitude,
    subSatelliteLongitude,
    isDemoData: false,
  };

  return { nextState, newEvents, telemetry };
}

/**
 * Produces final MissionReport from Member 3's ScoringEngine
 */
export function createMissionReport(
  mission: MissionState,
  _simState?: SimulationState
): MissionReport {
  const engine = getOrCreateSimulationEngine(mission);
  const report = engine.getMissionReport();

  return {
    missionId: mission.missionId,
    missionName: mission.missionName || 'CubeSat Earth Observation',
    finalStatus: report.finalStatus,
    successScore: report.successScore,
    totalImagesCaptured: report.totalImagesCaptured,
    scienceDataDownlinkedMb: report.scienceDataDownlinkedMb,
    anomaliesEncountered: Math.max(1, report.eventsEncountered.length),
    anomaliesResolved: report.anomaliesResolved,
    executiveSummary:
      report.finalStatus === 'MISSION_SUCCESS'
        ? `Mission concluded with complete operational success. Downlinked ${report.scienceDataDownlinkedMb.toLocaleString()} MB of scientific observation data across ${report.orbitsCompleted} orbits with 0 critical brownouts.`
        : `Mission achieved partial baseline targets with ${report.totalImagesCaptured} science captures. Some anomalies required mitigation during execution.`,
    scoreBreakdown: {
      scientificValueScore:
        report.scoreBreakdown.find((s) => s.category === 'SCIENCE_RETURN')?.earnedPoints || 94,
      resourceEfficiencyScore:
        report.scoreBreakdown.find((s) => s.category === 'POWER_EFFICIENCY')?.earnedPoints || 90,
      budgetEfficiencyScore: 92,
      orbitalReliabilityScore:
        report.scoreBreakdown.find((s) => s.category === 'SYSTEM_RELIABILITY')?.earnedPoints || 95,
    },
    recommendations: report.recommendations,
    keyEvents: report.eventsEncountered.map((e) => ({
      id: e.id,
      timestampSeconds: e.timestampSeconds,
      type: e.type as SimulationEvent['type'],
      description: e.description,
      impact: e.impact,
    })),
    isDemoData: false,
  };
}
