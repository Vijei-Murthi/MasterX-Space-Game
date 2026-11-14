# MASTERX – SPACE MACHINE
## Multi-Developer Integration Guide

### 1. Development Team Separation
Our shared repository maintains a strict separation of concerns across three core team members:

| Member | Area of Ownership | Owned Boundaries | Prohibited Modifications |
| :--- | :--- | :--- | :--- |
| **Member 1 (Frontend Lead)** | Presentation, routing, layouts, homepage, 3D satellite rendering, accessibility. | `src/app/`, `src/components/`, `src/layouts/`, `src/pages/`, `src/styles/` | Do NOT embed mission physics or simulation logic inside UI components. |
| **Member 2 (Engineering Lead)** | Spacecraft component catalogue, mass/power/budget calculation, orbit options, launch compatibility validation. | `src/modules/engineering/` (suggested) | Do NOT create duplicate UI shells or alternate layouts. |
| **Member 3 (Simulation Lead)** | Orbital simulation, telemetry streams, event bus, anomalies, scoring, mission reports. | `src/modules/simulation/` (suggested) | Do NOT create competing routing or duplicate state stores. |

---

### 2. Interface Contracts for Coordination
To prevent conflicting type definitions, the following shared types are reserved for coordination:

#### Reserved Engineering Types (Owned by Member 2):
```typescript
// Proposed interface contract for Member 2 integration:
export interface SpacecraftComponent {
  id: string;
  name: string;
  subsystem: 'EPS' | 'ADCS' | 'COMM' | 'CDH' | 'TCS' | 'PAYLOAD' | 'PROPULSION';
  massKg: number;
  powerWatts: number;
  costUSD: number;
  volumeUnitsU: number; // e.g. 0.5U, 1U
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
}

export interface OrbitOption {
  id: string;
  name: string;
  altitudeKm: number;
  inclinationDeg: number;
  periodMinutes: number;
  eclipseDurationMinutes: number;
}

export interface LaunchVehicle {
  id: string;
  name: string;
  maxPayloadKg: number;
  targetOrbit: string;
  costUSD: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
```

#### Reserved Simulation Types (Owned by Member 3):
```typescript
// Proposed interface contract for Member 3 integration:
export interface SimulationEvent {
  id: string;
  timestampSeconds: number;
  type: 'ECLIPSE_ENTRY' | 'ECLIPSE_EXIT' | 'EARTH_IMAGING' | 'GROUND_PASS' | 'ANOMALY';
  description: string;
  impact: Record<string, number>;
}

export interface SimulationState {
  missionElapsedTimeSeconds: number;
  currentOrbitFraction: number;
  batterySocPercent: number;
  solarFluxWm2: number;
  dataCollectedMb: number;
  isEclipse: boolean;
  activeAnomalies: string[];
}

export interface MissionReport {
  missionId: string;
  successScore: number;
  totalImagesCaptured: number;
  scienceDataDownlinkedMb: number;
  anomaliesResolved: number;
  finalStatus: 'MISSION_SUCCESS' | 'PARTIAL_SUCCESS' | 'CRITICAL_FAILURE';
}
```

---

### 3. Route Mount Points & Briefing Handoff
Member 1 has created clean mount points and handoff contracts:
- `/briefing`: Interactive Mission Briefing Interface (Step 01 / 06)
- `/planner`: Spacecraft Design Workbench (`Member 2` Mount Point)
- `/continue`: Saved Mission State & Active Telemetry (`Member 3` Mount Point)
- `/simulation`: Real-time Mission Simulation Runner (`Member 3` Mount Point)
- `/report`: Final Mission Performance Report (`Member 3` Mount Point)

#### Briefing to Planner State Handoff Contract:
When the user clicks `CONTINUE TO PLANNER` on the Briefing screen, React Router `location.state` transfers the chosen profile to Member 2's Workbench:
```typescript
export interface BriefingHandoffState {
  difficulty: 'easy' | 'normal' | 'hard';
  target: 'vegetation' | 'coastal' | 'atmosphere';
  params: {
    budgetUSD: number;
    maxMassKg: number;
    minPowerWatts: number;
    batteryReserveWh: number;
    durationDays: number;
    storageGB: number;
    orbitName: string;
    orbitAltitudeKm: number;
    orbitInclinationDeg: number;
  };
}
```

---

### 4. Git Collaboration Workflow
1. Never commit directly to `main`.
2. Work on dedicated feature branches:
   - Frontend: `feature/shashidar` (or `feature/frontend-homepage`)
   - Engineering: `feature/vijei`
   - Simulation: feature branch assigned to Member 3
3. Always pull latest `origin/main` with rebase or clean merge before submitting PRs.
4. Keep shared dependencies in `package.json` minimal and coordinated.

---

### 5. Stage 02: Spacecraft Builder (Mars Engineering Bay) Integration
Implemented in **Task 07** by Member 1 as the primary spacecraft design workbench (`/planner`):

1. **State Hydration from Briefing:**
   - Ingests `difficulty`, `target`, `budgetUSD`, `maxMassKg`, and `batteryReserveWh` from `location.state`.
   - Dynamic resource telemetry HUD displays live calculations for Total Mass, Remaining Budget, Net Power Balance, and Battery Capacity.

2. **Member 2 Integration Hooks:**
   - The UI currently renders an illustrative catalogue (`src/data/builderCatalogue.ts`) conforming to `src/types/builder.ts`.
   - Once Member 2's engineering engine in `src/modules/engineering/` is ready:
     - Swap `COMPONENT_CATALOGUE` with Member 2's component database.
     - Replace frontend `resourceTotals` with Member 2's `calculateDesignMetrics(selectedComponents)` and `validateLaunchCompatibility(design)`.
   - The stage gate modal on clicking `CONTINUE TO SUBSYSTEMS` will directly route to Member 2's Phase 03 EPS & Subsystems workbench.

3. **Member 3 Simulation Dependencies:**
   - Finalized `SelectedSpacecraftComponents` will be passed down to the simulation runner in Phase 06 (`/continue`) to drive telemetry streams, battery drain curves, and imaging swath outputs.
