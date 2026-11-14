/**
 * MASTERX – SPACE MACHINE
 * Mission Briefing UI Presentation Contracts (Task 04 & Task 08)
 * 
 * IMPORTANT TEAM SEPARATION:
 * These types represent illustrative UI configuration parameters for the Briefing phase.
 * Actual engineering calculations, component catalogues, and physics models are owned by Member 2.
 */

export type MissionDifficulty = 'easy' | 'normal' | 'hard';

export type ScientificTargetId = 'vegetation' | 'coastal' | 'atmosphere';

export interface ScientificTarget {
  id: ScientificTargetId;
  title: string;
  category: string;
  description: string;
  payloadType: string;
  spectralBand: string;
  accentColor: string;
  observationFocus: string;
}

export interface IllustrativeGameParameters {
  difficulty: MissionDifficulty;
  difficultyLabel: string;
  difficultyRole: string;
  difficultyDescription: string;
  budgetUSD: number;
  maxMassKg: number;
  minPowerWatts: number;
  batteryReserveWh: number;
  durationDays: number;
  storageGB: number;
  orbitName: string;
  orbitAltitudeKm: number;
  orbitInclinationDeg: number;
}

export interface FlightParameterItem {
  id: string;
  num: string;
  label: string;
  value: string;
  unit: string;
  category: 'FINANCIAL' | 'PHYSICAL' | 'POWER' | 'DATA' | 'ORBITAL';
  hoverTooltip: string;
  meaning: string;
  whyItMatters: string;
  ifExceeded: string;
  howToImprove: string;
}

export type ConstraintStatus = 'PASS' | 'WARNING' | 'FAIL';

export interface EngineeringConstraintCheck {
  id: string;
  label: string;
  status: ConstraintStatus;
  threshold: string;
  metric: string;
  description: string;
}
