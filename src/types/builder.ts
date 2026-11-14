/**
 * MASTERX – SPACE MACHINE
 * Spacecraft Builder UI & Presentation Contracts (Task 07)
 * 
 * IMPORTANT TEAM ARCHITECTURE:
 * These types represent the UI presentation contract for the Spacecraft Builder (Mars Engineering Bay).
 * Actual component catalogue databases and rigorous orbital physics engines are owned by Member 2.
 */

export type ComponentCategory =
  | 'structure'
  | 'power'
  | 'battery'
  | 'comms'
  | 'adcs'
  | 'computer';

export interface SpacecraftComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  shortDescription: string;
  massKg: number;
  costUSD: number;
  powerGenerationWatts: number; // Positive if generates power (e.g. solar panels)
  powerConsumptionWatts: number; // Positive if consumes power (subsystems)
  storageCapacityWh?: number; // Battery capacity in Wh
  dimensions: string;
  compatibilityNote: string;
  educationalDeepDive: string;
  specsSummary: {
    label: string;
    value: string;
  }[];
}

export interface SelectedSpacecraftComponents {
  structure: string;
  power: string;
  battery: string;
  comms: string;
  adcs: string;
  computer: string;
}

export interface SpacecraftResourceTotals {
  totalMassKg: number;
  maxMassKg: number;
  totalCostUSD: number;
  budgetUSD: number;
  remainingBudgetUSD: number;
  totalPowerGenWatts: number;
  totalPowerDrawWatts: number;
  netPowerWatts: number;
  batteryCapacityWh: number;
  massMarginKg: number;
  budgetMarginUSD: number;
  isMassValid: boolean;
  isBudgetValid: boolean;
  isPowerValid: boolean;
}
