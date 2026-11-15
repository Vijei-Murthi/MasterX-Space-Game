/**
 * MASTERX – SPACE MACHINE
 * Mission Stage Manager (Member 3)
 *
 * Deterministic finite state machine managing the 10 lifecycle stages
 * of the CubeSat Earth-observation mission.
 */

import type {
  MissionStage,
  StageExecutionStatus,
  StageDefinition,
  StageRecord,
} from './types';

export const MISSION_STAGES: StageDefinition[] = [
  {
    id: 'LAUNCH_PREP',
    order: 1,
    displayName: 'Launch Preparation',
    description: 'Pre-flight bus telemetry checks, internal battery charging verification, and launch vehicle umbilical disconnect.',
    minDurationSeconds: 15,
    nominalDurationSeconds: 30,
    requiredSubsystems: ['EPS', 'CDH'],
  },
  {
    id: 'LAUNCH',
    order: 2,
    displayName: 'Launch & Ascent',
    description: 'Rocket ignition, atmospheric ascent, stage separation, and surviving peak acoustic and vibrational mechanical stress.',
    minDurationSeconds: 30,
    nominalDurationSeconds: 60,
    requiredSubsystems: ['STRUCTURE'],
  },
  {
    id: 'DEPLOYMENT',
    order: 3,
    displayName: 'Spacecraft Deployment',
    description: 'P-POD canister spring release, separation switch activation, and initial tumbling motion dampening.',
    minDurationSeconds: 15,
    nominalDurationSeconds: 30,
    requiredSubsystems: ['STRUCTURE', 'ADCS'],
  },
  {
    id: 'ORBIT_INSERTION',
    order: 4,
    displayName: 'Orbit Insertion',
    description: 'Verification of target 500 km Low Earth Orbit trajectory, orbital period establishment, and eclipse boundary tracking.',
    minDurationSeconds: 30,
    nominalDurationSeconds: 45,
    requiredSubsystems: ['ADCS', 'CDH'],
  },
  {
    id: 'SYSTEM_ACTIVATION',
    order: 5,
    displayName: 'System Activation',
    description: 'Solar array mechanical deployment, EPS bus live power generation, and primary attitude detumbling to Sun-pointing lock.',
    minDurationSeconds: 30,
    nominalDurationSeconds: 45,
    requiredSubsystems: ['EPS', 'POWER', 'BATTERY', 'ADCS'],
  },
  {
    id: 'SCIENTIFIC_OBSERVATION',
    order: 6,
    displayName: 'Scientific Observation',
    description: 'Nadir Earth pointing alignment, sensor optical calibration, and targeting designated observation zones.',
    minDurationSeconds: 45,
    nominalDurationSeconds: 60,
    requiredSubsystems: ['PAYLOAD', 'ADCS'],
  },
  {
    id: 'DATA_COLLECTION',
    order: 7,
    displayName: 'Data Collection & Storage',
    description: 'Multispectral optical imaging acquisition, image compression, and high-speed write to onboard solid-state storage.',
    minDurationSeconds: 45,
    nominalDurationSeconds: 90,
    requiredSubsystems: ['PAYLOAD', 'CDH'],
  },
  {
    id: 'GROUND_COMMUNICATION',
    order: 8,
    displayName: 'Ground Station Acquisition',
    description: 'AOS (Acquisition of Signal) with Svalbard/Wallops ground terminal, antenna steering, and carrier frequency lock.',
    minDurationSeconds: 20,
    nominalDurationSeconds: 40,
    requiredSubsystems: ['COMMS'],
  },
  {
    id: 'DATA_TRANSMISSION',
    order: 9,
    displayName: 'Science Data Downlink',
    description: 'High-throughput downlink of collected multispectral data swaths and mission telemetry logs to the ground station.',
    minDurationSeconds: 45,
    nominalDurationSeconds: 90,
    requiredSubsystems: ['COMMS', 'CDH', 'EPS'],
  },
  {
    id: 'MISSION_COMPLETE',
    order: 10,
    displayName: 'Mission Complete',
    description: 'Observation cycle completed, ground confirmation verified, telemetry archived, and mission score calculated.',
    minDurationSeconds: 10,
    nominalDurationSeconds: 10,
    requiredSubsystems: [],
  },
];

export interface StageTransitionResult {
  success: boolean;
  fromStage: MissionStage;
  toStage: MissionStage;
  error?: string;
}

export class StageManager {
  private currentStageIndex: number = 0;
  private currentStageStatus: StageExecutionStatus = 'IN_PROGRESS';
  private stageStartedAtSeconds: number = 0;
  private history: StageRecord[] = [];
  private failureReason?: string;

  constructor(initialStage: MissionStage = 'LAUNCH_PREP', startTimeSeconds: number = 0) {
    const idx = MISSION_STAGES.findIndex((s) => s.id === initialStage);
    this.currentStageIndex = idx >= 0 ? idx : 0;
    this.stageStartedAtSeconds = startTimeSeconds;
    this.history.push({
      stage: this.getCurrentStageDefinition().id,
      status: 'IN_PROGRESS',
      startedAtSeconds: startTimeSeconds,
      completedAtSeconds: null,
      durationSeconds: 0,
    });
  }

  public getCurrentStageDefinition(): StageDefinition {
    return MISSION_STAGES[this.currentStageIndex];
  }

  public getCurrentStage(): MissionStage {
    return this.getCurrentStageDefinition().id;
  }

  public getStageIndex(): number {
    return this.currentStageIndex;
  }

  public getStageStatus(): StageExecutionStatus {
    return this.currentStageStatus;
  }

  public getStageStartedAt(): number {
    return this.stageStartedAtSeconds;
  }

  public getStageElapsedSeconds(currentTimeSeconds: number): number {
    return Math.max(0, currentTimeSeconds - this.stageStartedAtSeconds);
  }

  public getStageProgressPercent(currentTimeSeconds: number): number {
    if (this.currentStageStatus === 'COMPLETED') return 100;
    if (this.currentStageStatus === 'FAILED' || this.currentStageStatus === 'ABORTED') return 0;

    const def = this.getCurrentStageDefinition();
    if (def.nominalDurationSeconds <= 0) return 100;

    const elapsed = this.getStageElapsedSeconds(currentTimeSeconds);
    return Math.min(100, Math.round((elapsed / def.nominalDurationSeconds) * 100));
  }

  public isStageDurationSatisfied(currentTimeSeconds: number): boolean {
    const def = this.getCurrentStageDefinition();
    const elapsed = this.getStageElapsedSeconds(currentTimeSeconds);
    return elapsed >= def.minDurationSeconds;
  }

  public canTransitionTo(targetStage: MissionStage): { allowed: boolean; reason?: string } {
    if (this.currentStageStatus === 'FAILED' || this.currentStageStatus === 'ABORTED') {
      return { allowed: false, reason: `Cannot transition: mission is in ${this.currentStageStatus} state.` };
    }

    const targetIndex = MISSION_STAGES.findIndex((s) => s.id === targetStage);
    if (targetIndex === -1) {
      return { allowed: false, reason: `Unknown stage: ${targetStage}` };
    }

    // Nominal rule: transitions must be strictly sequential (index + 1)
    if (targetIndex !== this.currentStageIndex + 1) {
      return {
        allowed: false,
        reason: `Invalid transition: cannot jump from ${this.getCurrentStage()} (Stage ${this.currentStageIndex + 1}) to ${targetStage} (Stage ${targetIndex + 1}). Stages must advance sequentially.`,
      };
    }

    return { allowed: true };
  }

  public transitionToNext(currentTimeSeconds: number, notes?: string): StageTransitionResult {
    const fromStage = this.getCurrentStage();

    if (this.currentStageIndex >= MISSION_STAGES.length - 1) {
      return {
        success: false,
        fromStage,
        toStage: fromStage,
        error: 'Mission is already at the final stage (MISSION_COMPLETE).',
      };
    }

    const nextStageDef = MISSION_STAGES[this.currentStageIndex + 1];
    const check = this.canTransitionTo(nextStageDef.id);
    if (!check.allowed) {
      return {
        success: false,
        fromStage,
        toStage: nextStageDef.id,
        error: check.reason,
      };
    }

    // Complete current stage record
    const elapsed = this.getStageElapsedSeconds(currentTimeSeconds);
    if (this.history.length > 0) {
      const currentRecord = this.history[this.history.length - 1];
      currentRecord.status = 'COMPLETED';
      currentRecord.completedAtSeconds = currentTimeSeconds;
      currentRecord.durationSeconds = elapsed;
      if (notes) currentRecord.notes = notes;
    }

    // Advance to next stage
    this.currentStageIndex += 1;
    this.stageStartedAtSeconds = currentTimeSeconds;
    this.currentStageStatus = this.currentStageIndex === MISSION_STAGES.length - 1 ? 'COMPLETED' : 'IN_PROGRESS';

    this.history.push({
      stage: nextStageDef.id,
      status: this.currentStageStatus,
      startedAtSeconds: currentTimeSeconds,
      completedAtSeconds: this.currentStageStatus === 'COMPLETED' ? currentTimeSeconds : null,
      durationSeconds: 0,
    });

    return {
      success: true,
      fromStage,
      toStage: nextStageDef.id,
    };
  }

  public failStage(currentTimeSeconds: number, reason: string): void {
    this.currentStageStatus = 'FAILED';
    this.failureReason = reason;

    if (this.history.length > 0) {
      const currentRecord = this.history[this.history.length - 1];
      currentRecord.status = 'FAILED';
      currentRecord.completedAtSeconds = currentTimeSeconds;
      currentRecord.durationSeconds = this.getStageElapsedSeconds(currentTimeSeconds);
      currentRecord.notes = `FAILED: ${reason}`;
    }
  }

  public abortStage(currentTimeSeconds: number, reason: string): void {
    this.currentStageStatus = 'ABORTED';
    this.failureReason = reason;

    if (this.history.length > 0) {
      const currentRecord = this.history[this.history.length - 1];
      currentRecord.status = 'ABORTED';
      currentRecord.completedAtSeconds = currentTimeSeconds;
      currentRecord.durationSeconds = this.getStageElapsedSeconds(currentTimeSeconds);
      currentRecord.notes = `ABORTED: ${reason}`;
    }
  }

  public isMissionComplete(): boolean {
    return this.getCurrentStage() === 'MISSION_COMPLETE' && this.currentStageStatus === 'COMPLETED';
  }

  public isFailed(): boolean {
    return this.currentStageStatus === 'FAILED' || this.currentStageStatus === 'ABORTED';
  }

  public getFailureReason(): string | undefined {
    return this.failureReason;
  }

  public getHistory(): StageRecord[] {
    return [...this.history];
  }
}
