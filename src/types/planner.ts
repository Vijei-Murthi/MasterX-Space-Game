/**
 * MASTERX – SPACE MACHINE
 * Mission Planner Domain Types & Game Planning Interfaces
 * 
 * Clean separation of concerns:
 * These types define the gaming-oriented mission planning preferences.
 * Physical hardware validation and engineering equations are owned by Member 2.
 */

export type MissionObjectiveId =
  | 'land-surface'
  | 'ocean-observation'
  | 'atmospheric-monitoring'
  | 'vegetation-agriculture'
  | 'disaster-flood';

export interface MissionObjective {
  id: MissionObjectiveId;
  title: string;
  shortName: string;
  tagline: string;
  description: string;
  scientificImportance: string;
  examplePurpose: string;
  primaryBands: string;
  suggestedSensor: string;
  colorAccent: string;
  badge: string;
  iconName: string;
  suggestedTargetIds: string[];
}

export interface ObservationTarget {
  id: string;
  name: string;
  region: string;
  coordinates: string;
  description: string;
  scientificMetric: string;
  coveragePattern: 'Continuous Swath' | 'Grid Mosaic' | 'Pinpoint Target' | 'Rapid Littoral Strip';
  compatibleObjectives: MissionObjectiveId[];
  spectralFocus: string;
  threatLevel?: 'Normal' | 'Elevated' | 'Critical';
}

export interface ObservationPriorities {
  resolutionPriority: number; // 1 to 5
  frequencyPriority: number;  // 1 to 5
  scienceDataPriority: number; // 1 to 5
  coveragePriority: number;   // 1 to 5
}

export type MissionDurationId = '3-months' | '6-months' | '12-months' | '24-months';

export interface MissionDurationOption {
  id: MissionDurationId;
  months: number;
  days: number;
  title: string;
  subtitle: string;
  gameTradeoffs: string;
  radiationExposure: 'Low' | 'Moderate' | 'High' | 'Severe';
  batteryCycles: string;
  scienceYield: string;
  orbitalDecayRisk: 'Negligible' | 'Low' | 'Moderate' | 'High';
}

export type PlannerDifficultyId = 'cadet' | 'engineer' | 'commander';

export interface PlannerDifficultyOption {
  id: PlannerDifficultyId;
  label: string;
  role: string;
  description: string;
  budgetUSD: number;
  maxMassKg: number;
  powerMarginW: number;
  complexityLevel: string;
  color: string;
}

export interface FullMissionPlan {
  objectiveId: MissionObjectiveId;
  targetIds: string[];
  priorities: ObservationPriorities;
  durationId: MissionDurationId;
  difficultyId: PlannerDifficultyId;
}
