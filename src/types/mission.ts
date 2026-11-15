/**
 * MASTERX – SPACE MACHINE
 * Unified Frontend Mission State Types
 * Connects all 6 game stages and manages local persistence.
 */

import { MissionDifficulty, ScientificTargetId } from './briefing';
import { MissionObjectiveId, ObservationPriorities } from './planner';
import { SelectedSpacecraftComponents } from './builder';

export type StageNum = '01' | '02' | '03' | '04' | '05' | '06';

export interface BriefingState {
  difficulty: MissionDifficulty;
  targetId: ScientificTargetId;
  budgetUSD: number;
  maxMassKg: number;
  batteryReserveWh: number;
  minPowerWatts: number;
}

export interface PlannerState {
  objectiveId: MissionObjectiveId;
  selectedTargetIds: string[]; // up to 3 geographic target coordinates
  priorities: ObservationPriorities;
  durationDays: number;
  revisitFrequencyHours: number;
  resolutionGsdMeters: number;
}

export interface SubsystemsState {
  structureId: string;
  epsId: string;
  batteryId: string;
  commId: string;
  adcsId: string;
  cdhId: string;
  tcsId: string;
}

export interface PayloadState {
  selectedPayloadId: string;
  targetSpectrum: 'visible' | 'multispectral' | 'hyperspectral' | 'thermal-ir' | 'synthetic-aperture';
  dutyCyclePercent: number;
}

export interface OrbitLaunchState {
  selectedOrbitId: string;
  selectedLaunchVehicleId: string;
}

export interface MissionState {
  schemaVersion: number; // version 1
  missionId: string;
  missionName: string;
  createdAt: string;
  lastUpdated: string;
  currentStage: StageNum;
  briefing: BriefingState;
  planner: PlannerState;
  spacecraft: SelectedSpacecraftComponents;
  subsystems: SubsystemsState;
  payload: PayloadState;
  orbitLaunch: OrbitLaunchState;
}

export interface MissionContextType {
  mission: MissionState;
  hasSavedMission: boolean;
  savedDraftTimestamp: string | null;
  startNewMission: (initialBriefing?: Partial<BriefingState>) => void;
  restoreSavedMission: () => boolean;
  resetMission: () => void;
  updateBriefing: (briefing: Partial<BriefingState>) => void;
  updatePlanner: (planner: Partial<PlannerState>) => void;
  updateSpacecraft: (components: Partial<SelectedSpacecraftComponents>) => void;
  updateSubsystems: (subsystems: Partial<SubsystemsState>) => void;
  updatePayload: (payload: Partial<PayloadState>) => void;
  updateOrbitLaunch: (orbitLaunch: Partial<OrbitLaunchState>) => void;
  setCurrentStage: (stage: StageNum) => void;
}
