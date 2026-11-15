/**
 * MASTERX – SPACE MACHINE
 * Reserved Simulation Types & Contracts (Owned by Member 3)
 * Reference: docs/integration-guide.md
 * 
 * Member 1 UI components consume these interfaces via src/adapters/simulationAdapter.ts.
 * Do NOT alter these contracts without coordinating with Member 3 (Simulation Lead).
 */

export interface SimulationEvent {
  id: string;
  timestampSeconds: number;
  type: 'ECLIPSE_ENTRY' | 'ECLIPSE_EXIT' | 'EARTH_IMAGING' | 'GROUND_PASS' | 'ANOMALY';
  description: string;
  impact: Record<string, number>;
}

export interface SimulationState {
  missionElapsedTimeSeconds: number;
  currentOrbitFraction: number; // 0.0 to 1.0 (or total orbits completed)
  orbitNumber: number;
  batterySocPercent: number; // 0 to 100%
  solarFluxWm2: number;
  dataCollectedMb: number;
  isEclipse: boolean;
  activeAnomalies: string[];
  altitudeKm: number;
  orbitalVelocityKmS: number;
  subSatelliteLatitude: number;
  subSatelliteLongitude: number;
  isDemoData?: boolean;
}

export interface MissionReport {
  missionId: string;
  missionName: string;
  successScore: number; // 0 - 100
  totalImagesCaptured: number;
  scienceDataDownlinkedMb: number;
  anomaliesResolved: number;
  anomaliesEncountered: number;
  finalStatus: 'MISSION_SUCCESS' | 'PARTIAL_SUCCESS' | 'CRITICAL_FAILURE';
  executiveSummary: string;
  scoreBreakdown: {
    scientificValueScore: number; // 0-100
    resourceEfficiencyScore: number; // 0-100
    budgetEfficiencyScore: number; // 0-100
    orbitalReliabilityScore: number; // 0-100
  };
  keyEvents: SimulationEvent[];
  recommendations: string[];
  isDemoData?: boolean;
}
