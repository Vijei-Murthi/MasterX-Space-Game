/**
 * MASTERX – SPACE MACHINE
 * Simulation Engine Contracts & Type Definitions (Member 3)
 *
 * Reuses and aligns with:
 * - src/types/builder.ts (SpacecraftComponent, SelectedSpacecraftComponents, SpacecraftResourceTotals)
 * - src/types/briefing.ts (MissionDifficulty, ScientificTargetId, ScientificTarget)
 * - docs/integration-guide.md (SimulationEvent, SimulationState, MissionReport, BriefingHandoffState)
 */

import type {
  SpacecraftResourceTotals,
  SelectedSpacecraftComponents,
  SpacecraftComponent,
} from '../../../types/builder';
import type {
  MissionDifficulty,
  ScientificTargetId,
} from '../../../types/briefing';

// ============================================================================
// 1. MISSION LIFECYCLE STAGES
// ============================================================================

export type MissionStage =
  | 'LAUNCH_PREP'
  | 'LAUNCH'
  | 'DEPLOYMENT'
  | 'ORBIT_INSERTION'
  | 'SYSTEM_ACTIVATION'
  | 'SCIENTIFIC_OBSERVATION'
  | 'DATA_COLLECTION'
  | 'GROUND_COMMUNICATION'
  | 'DATA_TRANSMISSION'
  | 'MISSION_COMPLETE';

export type StageExecutionStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'ABORTED';

export interface StageDefinition {
  id: MissionStage;
  order: number;
  displayName: string;
  description: string;
  minDurationSeconds: number;
  nominalDurationSeconds: number;
  requiredSubsystems: string[];
}

export interface StageRecord {
  stage: MissionStage;
  status: StageExecutionStatus;
  startedAtSeconds: number;
  completedAtSeconds: number | null;
  durationSeconds: number;
  notes?: string;
}

// ============================================================================
// 2. MISSION EVENTS & ANOMALIES
// ============================================================================

export type SimulationEventType =
  | 'ECLIPSE_ENTRY'
  | 'ECLIPSE_EXIT'
  | 'EARTH_IMAGING'
  | 'GROUND_PASS'
  | 'COMM_BLACKOUT'
  | 'BATTERY_DEGRADATION'
  | 'INSTRUMENT_GLITCH'
  | 'POWER_DEFICIT'
  | 'STAGE_TRANSITION'
  | 'ANOMALY';

export type EventSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type EventStatus = 'SCHEDULED' | 'ACTIVE' | 'MITIGATED' | 'RESOLVED';

/**
 * Compatible with docs/integration-guide.md SimulationEvent contract
 */
export interface SimulationEvent {
  id: string;
  timestampSeconds: number;
  type: SimulationEventType;
  description: string;
  impact: Record<string, number>;
  severity?: EventSeverity;
  status?: EventStatus;
  durationSeconds?: number;
  resolvedAtSeconds?: number;
}

// ============================================================================
// 3. TELEMETRY & LIVE STATE
// ============================================================================

/**
 * High-frequency snapshot representing the physical state of the spacecraft
 */
export interface TelemetryData {
  timestampSeconds: number;
  currentStage: MissionStage;
  stageProgressPercent: number;
  // Electrical Power System (EPS)
  batterySocPercent: number; // State of Charge (0 - 100%)
  batteryCapacityWh: number;
  batteryStoredWh: number;
  powerGenerationWatts: number;
  powerDrawWatts: number;
  netPowerWatts: number;
  solarFluxWm2: number;
  isEclipse: boolean;
  // Orbital & Trajectory
  altitudeKm: number;
  currentOrbitFraction: number; // 0.0 to 1.0 within current revolution
  orbitsCompleted: number;
  // Science Payload & Data Handling (CDH)
  imagingActive: boolean;
  scienceImagesCaptured: number;
  dataStoredMb: number;
  maxStorageMb: number;
  dataTransmittedMb: number;
  downlinkRateMbps: number;
  // Communications (COMM)
  groundContactActive: boolean;
  linkBudgetDb: number;
  // System Health
  instrumentHealthPercent: number;
  thermalStatusC: number;
  activeAnomalies: string[];
  overallHealthPercent: number;
}

/**
 * Compatible with docs/integration-guide.md SimulationState contract
 */
export interface SimulationState {
  missionElapsedTimeSeconds: number;
  currentOrbitFraction: number;
  batterySocPercent: number;
  solarFluxWm2: number;
  dataCollectedMb: number;
  isEclipse: boolean;
  activeAnomalies: string[];
  // Extended state required for multi-stage execution
  currentStage: MissionStage;
  stageStatus: StageExecutionStatus;
  dataDownlinkedMb: number;
  isCompleted: boolean;
  isFailed: boolean;
  failureReason?: string;
}

// ============================================================================
// 4. SIMULATION INPUTS & ADAPTER CONTRACT
// ============================================================================

export interface OrbitParameters {
  orbitName: string;
  altitudeKm: number;
  inclinationDeg: number;
  periodMinutes?: number;
  eclipseDurationMinutes?: number;
}

export interface SimulationSubsystemSpecs {
  communicationBand: 'UHF' | 'S-BAND' | 'X-BAND';
  downlinkRateMbps: number;
  imagingDataRateMbPerSec: number;
  storageCapacityMb: number;
}

/**
 * Strict Simulation Input: encapsulates design configuration passed from Builder
 */
export interface SimulationInput {
  missionId: string;
  difficulty: MissionDifficulty;
  target: ScientificTargetId;
  orbitParams: OrbitParameters;
  resourceTotals: SpacecraftResourceTotals;
  selectedComponents?: SelectedSpacecraftComponents;
  resolvedComponents?: SpacecraftComponent[];
  subsystemSpecs?: Partial<SimulationSubsystemSpecs>;
  deterministicSeed?: number;
  timeCompressionFactor?: number;
}

// ============================================================================
// 5. MISSION OUTCOME & FINAL REPORT
// ============================================================================

export type MissionOutcome =
  | 'MISSION_SUCCESS'
  | 'PARTIAL_SUCCESS'
  | 'CRITICAL_FAILURE';

export interface ScoreCategory {
  category: 'SCIENCE_RETURN' | 'POWER_EFFICIENCY' | 'SYSTEM_RELIABILITY' | 'MISSION_OBJECTIVES';
  earnedPoints: number;
  maxPoints: number;
  details: string;
}

/**
 * Compatible with docs/integration-guide.md MissionReport contract
 */
export interface MissionReport {
  missionId: string;
  successScore: number; // 0 - 100
  totalImagesCaptured: number;
  scienceDataDownlinkedMb: number;
  anomaliesResolved: number;
  finalStatus: MissionOutcome;
  // Extended fields for debriefing
  elapsedTimeSeconds: number;
  orbitsCompleted: number;
  minBatterySocPercent: number;
  totalDataCollectedMb: number;
  scoreBreakdown: ScoreCategory[];
  reasons: string[];
  recommendations: string[];
  eventsEncountered: SimulationEvent[];
}
