/**
 * MASTERX – SPACE MACHINE
 * Headless Mission Simulation Engine (Member 3)
 *
 * Fully decoupled from React and presentation layers.
 * Orchestrates orbital propagation, 10-stage lifecycle progression,
 * physical power/battery energy integration, payload data collection,
 * ground communications, deterministic events, and scoring.
 */

import type {
  SimulationInput,
  SimulationState,
  TelemetryData,
  MissionReport,
  SimulationEvent,
} from './types';
import { StageManager } from './stageManager';
import { OrbitModel } from './orbitModel';
import { EventSystem } from './eventSystem';
import { ScoringEngine } from './scoringEngine';

export class SimulationEngine {
  private input: SimulationInput;
  private stageManager: StageManager;
  private orbitModel: OrbitModel;
  private eventSystem: EventSystem;

  // Physical State Variables
  private missionElapsedTimeSeconds: number = 0;
  private batteryStoredWh: number = 0;
  private minBatterySocObserved: number = 100;
  private totalDataCollectedMb: number = 0;
  private dataStoredMb: number = 0;
  private scienceDataDownlinkedMb: number = 0;
  private scienceImagesCaptured: number = 0;
  private instrumentHealthPercent: number = 100;
  private isBrownout: boolean = false;
  private isStructuralFailure: boolean = false;
  private failureReason?: string;

  // Subsystem Performance Specs (from input or standard CubeSat baselines)
  private downlinkRateMbps: number = 2.0;
  private imagingDataRateMbPerSec: number = 12.0;
  private storageCapacityMb: number = 32768; // 32 GB baseline
  private targetDataMb: number = 150.0;

  // Latest Telemetry Snapshot
  private latestTelemetry!: TelemetryData;
  private telemetryHistory: TelemetryData[] = [];
  private maxTelemetryHistoryLength: number = 300;

  constructor(input: SimulationInput) {
    this.input = input;

    // Initialize Subsystems
    this.stageManager = new StageManager('LAUNCH_PREP', 0);
    this.orbitModel = new OrbitModel(
      input.orbitParams.altitudeKm ?? 500,
      input.orbitParams.inclinationDeg ?? 97.4
    );
    this.eventSystem = new EventSystem(input.deterministicSeed ?? 42);

    this.configureSubsystemSpecs();
    this.initializeState();
  }

  /**
   * Resolves communications and payload rates from input
   */
  private configureSubsystemSpecs(): void {
    if (this.input.subsystemSpecs) {
      if (this.input.subsystemSpecs.downlinkRateMbps) {
        this.downlinkRateMbps = this.input.subsystemSpecs.downlinkRateMbps;
      }
      if (this.input.subsystemSpecs.imagingDataRateMbPerSec) {
        this.imagingDataRateMbPerSec = this.input.subsystemSpecs.imagingDataRateMbPerSec;
      }
      if (this.input.subsystemSpecs.storageCapacityMb) {
        this.storageCapacityMb = this.input.subsystemSpecs.storageCapacityMb;
      }
    } else if (this.input.selectedComponents) {
      // Heuristic fallback matching builderCatalogue components if available
      const commsId = this.input.selectedComponents.comms;
      if (commsId === 'comm-uhf') this.downlinkRateMbps = 0.05; // 50 kbps
      else if (commsId === 'comm-sband') this.downlinkRateMbps = 2.0; // 2 Mbps
      else if (commsId === 'comm-xband') this.downlinkRateMbps = 50.0; // 50 Mbps

      const compId = this.input.selectedComponents.computer;
      if (compId === 'comp-basic') this.storageCapacityMb = 8192;
      else if (compId === 'comp-radhard') this.storageCapacityMb = 32768;
      else if (compId === 'comp-edgeai') this.storageCapacityMb = 131072;
    }

    // Set science data objective based on difficulty
    if (this.input.difficulty === 'easy') {
      this.targetDataMb = 60.0;
    } else if (this.input.difficulty === 'normal') {
      this.targetDataMb = 120.0;
    } else {
      this.targetDataMb = 200.0;
    }
  }

  /**
   * Initializes state using actual resource values
   */
  private initializeState(): void {
    this.missionElapsedTimeSeconds = 0;
    this.isBrownout = false;
    this.isStructuralFailure = false;
    this.failureReason = undefined;

    // Battery begins fully charged (100% capacity)
    const cap = Math.max(1.0, this.input.resourceTotals.batteryCapacityWh ?? 45);
    this.batteryStoredWh = cap;
    this.minBatterySocObserved = 100;
    this.totalDataCollectedMb = 0;
    this.dataStoredMb = 0;
    this.scienceDataDownlinkedMb = 0;
    this.scienceImagesCaptured = 0;
    this.instrumentHealthPercent = 100;
    this.telemetryHistory = [];

    // Verify initial launch structural limits
    if (!this.input.resourceTotals.isMassValid && this.input.resourceTotals.massMarginKg < -2.0) {
      this.isStructuralFailure = true;
      this.failureReason = 'Mass limit exceeded launch vehicle structural clearance envelope.';
    }

    this.latestTelemetry = this.generateTelemetrySnapshot(0);
  }

  /**
   * Main simulation tick
   * Advances the physical clock by deltaSeconds and updates all models.
   */
  public tick(deltaSeconds: number): TelemetryData {
    if (this.isFinished()) {
      return this.latestTelemetry;
    }

    const dt = Math.max(0.01, Math.min(10.0, deltaSeconds));
    this.missionElapsedTimeSeconds += dt;

    // 1. Evaluate Orbit Physics
    const orbitState = this.orbitModel.evaluateAt(this.missionElapsedTimeSeconds);

    // 2. Evaluate Deterministic Events & Anomalies
    const eventContext = {
      elapsedSeconds: this.missionElapsedTimeSeconds,
      currentStage: this.stageManager.getCurrentStage(),
      batterySocPercent: this.getBatterySocPercent(),
      isEclipse: orbitState.isEclipse,
      groundContactActive: orbitState.groundContactActive,
      activeAnomalies: this.eventSystem.getActiveEvents().map((e) => e.type),
    };

    this.eventSystem.evaluate(eventContext);
    const combinedImpact = this.eventSystem.getCombinedImpact();

    // 3. Integrate Power & Energy
    this.integratePower(dt, orbitState.isEclipse, orbitState.solarFluxWm2, combinedImpact);

    // 4. Update Science Data Collection & Downlink
    this.updateScienceAndData(dt, orbitState.groundContactActive, combinedImpact);

    // 5. Update Mission Stage Progression
    this.updateStageProgression(combinedImpact);

    // 6. Generate Telemetry Snapshot
    this.latestTelemetry = this.generateTelemetrySnapshot(dt);

    // Store in circular history buffer
    this.telemetryHistory.push(this.latestTelemetry);
    if (this.telemetryHistory.length > this.maxTelemetryHistoryLength) {
      this.telemetryHistory.shift();
    }

    return this.latestTelemetry;
  }

  /**
   * Integrates electrical power generation and battery storage
   */
  private integratePower(
    dt: number,
    isEclipse: boolean,
    solarFluxWm2: number,
    impact: ReturnType<typeof this.eventSystem.getCombinedImpact>
  ): void {
    if (this.isBrownout || this.isStructuralFailure) return;

    const baseSolarGen = this.input.resourceTotals.totalPowerGenWatts ?? 24;
    const basePowerDraw = this.input.resourceTotals.totalPowerDrawWatts ?? 12;
    const nominalCapacityWh = Math.max(1.0, this.input.resourceTotals.batteryCapacityWh ?? 45);

    // Effective capacity accounting for battery degradation anomalies
    const effectiveCapacityWh = Math.max(1.0, nominalCapacityWh - impact.totalBatteryCapacityLossWh);

    // Calculate solar generation
    let liveGenWatts = 0;
    if (!isEclipse) {
      const fluxRatio = solarFluxWm2 / OrbitModel.SOLAR_CONSTANT_WM2;
      liveGenWatts = baseSolarGen * fluxRatio * impact.solarGenMultiplier;
    }

    // Calculate power draw
    let stageDrawFactor = 1.0;
    const stage = this.stageManager.getCurrentStage();
    if (stage === 'LAUNCH_PREP' || stage === 'LAUNCH') {
      stageDrawFactor = 0.5; // Low-power standby
    } else if (stage === 'DATA_COLLECTION' && !impact.isPayloadDisabled) {
      stageDrawFactor = 1.25; // Optical sensor array active
    } else if (stage === 'DATA_TRANSMISSION' && !impact.isCommsDisabled) {
      stageDrawFactor = 1.40; // RF power amplifier active
    }

    const liveDrawWatts = (basePowerDraw * stageDrawFactor) + impact.netPowerDrawDeltaWatts;
    const netPowerWatts = liveGenWatts - liveDrawWatts;

    // Energy integration: dE = P * dt / 3600 (Watt-hours)
    const energyDeltaWh = (netPowerWatts * dt) / 3600.0;
    this.batteryStoredWh = Math.max(0, Math.min(effectiveCapacityWh, this.batteryStoredWh + energyDeltaWh));

    // Track minimum SOC
    const soc = (this.batteryStoredWh / effectiveCapacityWh) * 100;
    if (soc < this.minBatterySocObserved) {
      this.minBatterySocObserved = soc;
    }

    // Brownout failure check: battery depleted to 0%
    if (this.batteryStoredWh <= 0.05 && netPowerWatts < 0) {
      this.isBrownout = true;
      this.failureReason = 'Critical EPS Bus Brownout: Battery completely exhausted during eclipse.';
      this.stageManager.failStage(this.missionElapsedTimeSeconds, this.failureReason);
    }
  }

  /**
   * Updates science observations, data recording, and RF downlink
   */
  private updateScienceAndData(
    dt: number,
    groundContactActive: boolean,
    impact: ReturnType<typeof this.eventSystem.getCombinedImpact>
  ): void {
    if (this.isBrownout || this.isStructuralFailure) return;

    const stage = this.stageManager.getCurrentStage();

    // 1. Data Collection
    if (stage === 'DATA_COLLECTION' && !impact.isPayloadDisabled) {
      const mbCollected = this.imagingDataRateMbPerSec * dt;
      const spaceAvailable = this.storageCapacityMb - this.dataStoredMb;
      const actualStored = Math.min(spaceAvailable, mbCollected);

      this.dataStoredMb += actualStored;
      this.totalDataCollectedMb += actualStored;

      // Estimate captured images (approx 12 MB per multispectral image tile)
      this.scienceImagesCaptured = Math.floor(this.totalDataCollectedMb / 12.0);
    }

    // 2. Data Downlink Transmission
    if (
      (stage === 'DATA_TRANSMISSION' || stage === 'GROUND_COMMUNICATION') &&
      groundContactActive &&
      !impact.isCommsDisabled &&
      this.dataStoredMb > 0
    ) {
      // Downlink rate: Mbps to MB/s = rate / 8
      const maxDownlinkMb = (this.downlinkRateMbps / 8.0) * dt;
      const actualDownlinked = Math.min(this.dataStoredMb, maxDownlinkMb);

      this.dataStoredMb = Math.max(0, this.dataStoredMb - actualDownlinked);
      this.scienceDataDownlinkedMb += actualDownlinked;
    }

    // Instrument health decay / update
    this.instrumentHealthPercent = Math.max(
      0,
      100 - impact.instrumentHealthPenaltyPercent
    );
  }

  /**
   * Advances the mission through the 10 stages based on physical conditions
   */
  private updateStageProgression(
    impact: ReturnType<typeof this.eventSystem.getCombinedImpact>
  ): void {
    if (this.isFinished()) return;

    const currentStage = this.stageManager.getCurrentStage();
    const isDurationReady = this.stageManager.isStageDurationSatisfied(this.missionElapsedTimeSeconds);

    if (!isDurationReady) return;

    switch (currentStage) {
      case 'LAUNCH_PREP':
        if (this.isStructuralFailure) {
          this.stageManager.failStage(this.missionElapsedTimeSeconds, this.failureReason!);
        } else {
          this.stageManager.transitionToNext(this.missionElapsedTimeSeconds, 'Pre-flight bus verification passed.');
        }
        break;

      case 'LAUNCH':
        this.stageManager.transitionToNext(this.missionElapsedTimeSeconds, 'Ascent complete; payload fairing jettisoned.');
        break;

      case 'DEPLOYMENT':
        this.stageManager.transitionToNext(this.missionElapsedTimeSeconds, 'Canister ejection verified; solar arrays deployed.');
        break;

      case 'ORBIT_INSERTION':
        this.stageManager.transitionToNext(this.missionElapsedTimeSeconds, 'Stable 500 km LEO trajectory acquired.');
        break;

      case 'SYSTEM_ACTIVATION':
        if (this.getBatterySocPercent() > 20) {
          this.stageManager.transitionToNext(this.missionElapsedTimeSeconds, 'ADCS locked to Sun; EPS bus energized.');
        }
        break;

      case 'SCIENTIFIC_OBSERVATION':
        if (!impact.isPayloadDisabled) {
          this.stageManager.transitionToNext(this.missionElapsedTimeSeconds, `Nadir Earth-pointing target locked on ${this.input.target.toUpperCase()}.`);
        }
        break;

      case 'DATA_COLLECTION':
        // Transition once data collection target is achieved or stage duration elapsed
        if (this.totalDataCollectedMb >= this.targetDataMb || this.stageManager.getStageElapsedSeconds(this.missionElapsedTimeSeconds) >= 90) {
          this.stageManager.transitionToNext(this.missionElapsedTimeSeconds, `Captured ${this.totalDataCollectedMb.toFixed(1)} MB multispectral imaging data.`);
        }
        break;

      case 'GROUND_COMMUNICATION':
        // Wait for ground station pass window
        if (this.orbitModel.evaluateAt(this.missionElapsedTimeSeconds).groundContactActive && !impact.isCommsDisabled) {
          this.stageManager.transitionToNext(this.missionElapsedTimeSeconds, 'Svalbard ground station link carrier locked.');
        }
        break;

      case 'DATA_TRANSMISSION':
        // Finish when data is downlinked or pass ends
        if (this.scienceDataDownlinkedMb >= this.targetDataMb * 0.8 || this.dataStoredMb <= 0.1) {
          this.stageManager.transitionToNext(this.missionElapsedTimeSeconds, `Science swath successfully transmitted (${this.scienceDataDownlinkedMb.toFixed(1)} MB).`);
        }
        break;

      case 'MISSION_COMPLETE':
        // Terminal stage
        break;
    }
  }

  /**
   * Generates a complete physical TelemetryData packet
   */
  private generateTelemetrySnapshot(dt: number): TelemetryData {
    const orbit = this.orbitModel.evaluateAt(this.missionElapsedTimeSeconds);
    const impact = this.eventSystem.getCombinedImpact();

    const baseSolarGen = this.input.resourceTotals.totalPowerGenWatts ?? 24;
    const basePowerDraw = this.input.resourceTotals.totalPowerDrawWatts ?? 12;
    const nominalCapacityWh = Math.max(1.0, this.input.resourceTotals.batteryCapacityWh ?? 45);
    const effectiveCapacityWh = Math.max(1.0, nominalCapacityWh - impact.totalBatteryCapacityLossWh);

    let liveGenWatts = 0;
    if (!orbit.isEclipse) {
      liveGenWatts = baseSolarGen * (orbit.solarFluxWm2 / OrbitModel.SOLAR_CONSTANT_WM2) * impact.solarGenMultiplier;
    }

    const stage = this.stageManager.getCurrentStage();
    let stageDrawFactor = 1.0;
    if (stage === 'LAUNCH_PREP' || stage === 'LAUNCH') stageDrawFactor = 0.5;
    else if (stage === 'DATA_COLLECTION' && !impact.isPayloadDisabled) stageDrawFactor = 1.25;
    else if (stage === 'DATA_TRANSMISSION' && !impact.isCommsDisabled) stageDrawFactor = 1.40;

    const liveDrawWatts = (basePowerDraw * stageDrawFactor) + impact.netPowerDrawDeltaWatts;
    const netPowerWatts = liveGenWatts - liveDrawWatts;
    const soc = (this.batteryStoredWh / effectiveCapacityWh) * 100;

    // Overall spacecraft health calculation
    let health = 100;
    if (soc < 30) health -= (30 - soc);
    health -= impact.instrumentHealthPenaltyPercent * 0.3;
    if (impact.isCommsDisabled) health -= 20;
    if (this.isBrownout || this.isStructuralFailure) health = 0;

    return {
      timestampSeconds: this.missionElapsedTimeSeconds,
      currentStage: this.stageManager.getCurrentStage(),
      stageProgressPercent: this.stageManager.getStageProgressPercent(this.missionElapsedTimeSeconds),
      batterySocPercent: Number(Math.max(0, Math.min(100, soc)).toFixed(1)),
      batteryCapacityWh: Number(effectiveCapacityWh.toFixed(1)),
      batteryStoredWh: Number(this.batteryStoredWh.toFixed(2)),
      powerGenerationWatts: Number(liveGenWatts.toFixed(1)),
      powerDrawWatts: Number(liveDrawWatts.toFixed(1)),
      netPowerWatts: Number(netPowerWatts.toFixed(1)),
      solarFluxWm2: orbit.solarFluxWm2,
      isEclipse: orbit.isEclipse,
      altitudeKm: this.input.orbitParams.altitudeKm ?? 500,
      currentOrbitFraction: orbit.orbitFraction,
      orbitsCompleted: orbit.orbitsCompleted,
      imagingActive: stage === 'DATA_COLLECTION' && !impact.isPayloadDisabled,
      scienceImagesCaptured: this.scienceImagesCaptured,
      dataStoredMb: Number(this.dataStoredMb.toFixed(1)),
      maxStorageMb: this.storageCapacityMb,
      dataTransmittedMb: Number(this.scienceDataDownlinkedMb.toFixed(1)),
      downlinkRateMbps: impact.isCommsDisabled ? 0 : this.downlinkRateMbps,
      groundContactActive: orbit.groundContactActive && !impact.isCommsDisabled,
      linkBudgetDb: impact.isCommsDisabled ? 0 : orbit.linkBudgetDb,
      instrumentHealthPercent: Number(this.instrumentHealthPercent.toFixed(1)),
      thermalStatusC: orbit.isEclipse ? -15.0 : 22.5,
      activeAnomalies: this.eventSystem.getActiveEvents().map((e) => e.description),
      overallHealthPercent: Number(Math.max(0, Math.min(100, health)).toFixed(1)),
    };
  }

  // =========================================================================
  // PUBLIC ACCESSORS & CONTROLS
  // =========================================================================

  public getBatterySocPercent(): number {
    const nominal = Math.max(1.0, this.input.resourceTotals.batteryCapacityWh ?? 45);
    const loss = this.eventSystem.getCombinedImpact().totalBatteryCapacityLossWh;
    const effective = Math.max(1.0, nominal - loss);
    return Math.max(0, Math.min(100, (this.batteryStoredWh / effective) * 100));
  }

  public getTelemetry(): TelemetryData {
    return this.latestTelemetry;
  }

  public getTelemetryHistory(): TelemetryData[] {
    return [...this.telemetryHistory];
  }

  public getState(): SimulationState {
    const orbit = this.orbitModel.evaluateAt(this.missionElapsedTimeSeconds);
    return {
      missionElapsedTimeSeconds: this.missionElapsedTimeSeconds,
      currentOrbitFraction: orbit.orbitFraction,
      batterySocPercent: this.getBatterySocPercent(),
      solarFluxWm2: orbit.solarFluxWm2,
      dataCollectedMb: this.totalDataCollectedMb,
      isEclipse: orbit.isEclipse,
      activeAnomalies: this.eventSystem.getActiveEvents().map((e) => e.id),
      currentStage: this.stageManager.getCurrentStage(),
      stageStatus: this.stageManager.getStageStatus(),
      dataDownlinkedMb: this.scienceDataDownlinkedMb,
      isCompleted: this.stageManager.isMissionComplete(),
      isFailed: this.isBrownout || this.isStructuralFailure || this.stageManager.isFailed(),
      failureReason: this.failureReason,
    };
  }

  public isFinished(): boolean {
    return this.stageManager.isMissionComplete() || this.stageManager.isFailed() || this.isBrownout || this.isStructuralFailure;
  }

  public mitigateEvent(eventId: string, mitigationLog?: string): boolean {
    return this.eventSystem.mitigateEvent(eventId, this.missionElapsedTimeSeconds, mitigationLog);
  }

  public getMissionReport(): MissionReport {
    return ScoringEngine.evaluate({
      missionId: this.input.missionId,
      difficulty: this.input.difficulty,
      target: this.input.target,
      elapsedTimeSeconds: this.missionElapsedTimeSeconds,
      orbitsCompleted: this.orbitModel.evaluateAt(this.missionElapsedTimeSeconds).orbitsCompleted,
      totalDataCollectedMb: this.totalDataCollectedMb,
      scienceDataDownlinkedMb: this.scienceDataDownlinkedMb,
      targetDataMb: this.targetDataMb,
      scienceImagesCaptured: this.scienceImagesCaptured,
      minBatterySocPercent: this.minBatterySocObserved,
      finalBatterySocPercent: this.getBatterySocPercent(),
      budgetMarginUSD: this.input.resourceTotals.budgetMarginUSD ?? 0,
      massMarginKg: this.input.resourceTotals.massMarginKg ?? 0,
      isMassValid: this.input.resourceTotals.isMassValid,
      isPowerValid: this.input.resourceTotals.isPowerValid,
      isBudgetValid: this.input.resourceTotals.isBudgetValid,
      stageHistory: this.stageManager.getHistory(),
      eventHistory: this.eventSystem.getEventHistory(),
      isBrownout: this.isBrownout,
      isStructuralFailure: this.isStructuralFailure,
    });
  }

  public reset(): void {
    this.stageManager = new StageManager('LAUNCH_PREP', 0);
    this.eventSystem.reset(this.input.deterministicSeed ?? 42);
    this.initializeState();
  }
}
