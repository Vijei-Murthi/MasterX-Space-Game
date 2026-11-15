/**
 * MASTERX – SPACE MACHINE
 * Reserved Engineering Types & Contracts (Owned by Member 2)
 * Reference: docs/integration-guide.md
 * 
 * Member 1 UI components consume these interfaces via src/adapters/engineeringAdapter.ts.
 * Do NOT alter these contracts without coordinating with Member 2 (Engineering Lead).
 */

export interface SpacecraftComponent {
  id: string;
  name: string;
  subsystem: 'EPS' | 'ADCS' | 'COMM' | 'CDH' | 'TCS' | 'PAYLOAD' | 'PROPULSION' | 'STRUCTURE';
  massKg: number;
  powerWatts: number;
  costUSD: number;
  volumeUnitsU: number; // e.g. 0.5U, 1U
  description?: string;
  specs?: Record<string, string>;
}

export interface SpacecraftDesign {
  id: string;
  name: string;
  chassisSizeU: 1 | 2 | 3 | 6;
  components: SpacecraftComponent[];
  totalMassKg: number;
  totalPowerWatts: number;
  totalCostUSD: number;
}

export interface ResourceState {
  powerBalanceWatts: number;
  batteryCapacityWh: number;
  massMarginKg: number;
  linkBudgetDb: number;
  isDemoData?: boolean;
}

export interface OrbitOption {
  id: string;
  name: string;
  code: string;
  altitudeKm: number;
  inclinationDeg: number;
  periodMinutes: number;
  eclipseDurationMinutes: number;
  description: string;
  advantages: string[];
  scientificFitness: string;
  revisitDays: number;
}

export interface LaunchVehicle {
  id: string;
  name: string;
  provider: string;
  maxPayloadKg: number;
  targetOrbit: string;
  costUSD: number;
  fairingDiameterMeters: number;
  reliabilityScore: number;
  description: string;
}

export type ValidationStatus = 'PASS' | 'WARNING' | 'FAIL' | 'PENDING';

export interface ValidationCheckItem {
  id: string;
  category: 'MASS' | 'POWER' | 'BUDGET' | 'STORAGE' | 'COMM' | 'ORBIT' | 'LAUNCH' | 'THERMAL';
  title: string;
  status: ValidationStatus;
  explanation: string;
  suggestedCorrection?: string;
  metricCurrent?: string;
  metricLimit?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  checks?: ValidationCheckItem[];
  isDemoData?: boolean;
}

export interface CalculatedMetrics {
  totalMassKg: number;
  maxMassKg: number;
  massMarginKg: number;
  powerGeneratedWatts: number;
  powerConsumedWatts: number;
  netPowerWatts: number;
  batteryCapacityWh: number;
  totalCostUSD: number;
  maxBudgetUSD: number;
  remainingBudgetUSD: number;
  dataGeneratedMbPerDay: number;
  storageCapacityMb: number;
  remainingStorageMb: number;
  downlinkBandwidthMbps: number;
  linkMarginDb: number;
  isDemoData: boolean;
  dataSourceLabel: string;
  orbitAltitudeKm?: number;
  imagingDataRateMbPerSec?: number;
}

/** Engineering-owned specification. Values in the project catalogue are illustrative. */
export interface EngineeringComponentSpec extends SpacecraftComponent {
  category: SpacecraftComponent['subsystem'];
  powerGenerationWatts?: number;
  powerConsumptionWatts?: number;
  batteryCapacityWh?: number;
  downlinkBandwidthMbps?: number;
  storageCapacityMb?: number;
  imagingDataRateMbPerSec?: number;
  dutyCyclePercent?: number;
  compatibleWith?: string[];
}

export interface EngineeringResult {
  metrics: CalculatedMetrics;
  validation: ValidationResult;
  resourceState: ResourceState;
}
