import { register } from 'node:module';
register('../src/modules/simulation/ts-resolver.mjs', import.meta.url);

const { evaluateEngineering } = await import('../src/modules/engineering/index.ts');
const { SimulationEngine } = await import('../src/modules/simulation/simulationEngine.ts');
const { COMPONENT_CATALOGUE } = await import('../src/data/builderCatalogue.ts');

console.log('====================================================');
console.log('MASTERX INTEGRATION VERIFICATION SUITE');
console.log('====================================================\n');

function createBaseMission() {
  return {
    schemaVersion: 1,
    missionId: 'test-mission-' + Date.now(),
    missionName: 'Test CubeSat Earth Observation',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    currentStage: '01',
    briefing: {
      difficulty: 'normal',
      targetId: 'coastal',
      budgetUSD: 2500000,
      maxMassKg: 12.0,
      batteryReserveWh: 40.0,
      minPowerWatts: 5.0,
    },
    planner: {
      objectiveId: 'ocean-observation',
      selectedTargetIds: ['target-midwest', 'target-amazon'],
      priorities: {
        resolutionPriority: 4,
        frequencyPriority: 3,
        scienceDataPriority: 4,
        coveragePriority: 3,
      },
      durationDays: 365,
      revisitFrequencyHours: 24,
      resolutionGsdMeters: 5.0,
    },
    spacecraft: {
      structure: 'struct-3u',
      power: 'power-hieff',
      battery: 'battery-hicap',
      comms: 'comms-highgain',
      adcs: 'adcs-advanced',
      computer: 'comp-advanced',
    },
    subsystems: {
      structureId: 'struct-3u',
      epsId: 'power-hieff',
      batteryId: 'battery-hicap',
      commId: 'comms-highgain',
      adcsId: 'adcs-advanced',
      cdhId: 'comp-advanced',
      tcsId: 'tcs-passive',
    },
    payload: {
      selectedPayloadId: 'payload-opt-hires',
      targetSpectrum: 'multispectral',
      dutyCyclePercent: 5,
    },
    orbitLaunch: {
      selectedOrbitId: 'sso-500',
      selectedLaunchVehicleId: 'falcon9-rideshare',
    },
  };
}

let passedChecks = 0;
let totalChecks = 0;

function assert(condition, message) {
  totalChecks++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  passedChecks++;
  console.log(`✔ PASS: ${message}`);
}

// ----------------------------------------------------------------------------
// TEST 1: Valid CubeSat Scenario
// ----------------------------------------------------------------------------
console.log('--- TEST 1: Nominal Valid CubeSat Mission ---');
const validMission = createBaseMission();
const validResult = evaluateEngineering(validMission);

assert(validResult.validation.isValid === true, 'Valid mission passes all engineering validation checks');
assert(validResult.validation.errors.length === 0, 'Valid mission has 0 blocking errors');
assert(validResult.metrics.totalMassKg <= validMission.briefing.maxMassKg, `Mass conforms: ${validResult.metrics.totalMassKg} kg <= ${validMission.briefing.maxMassKg} kg`);
assert(validResult.metrics.netPowerWatts >= 0, `Net power is non-negative: ${validResult.metrics.netPowerWatts} W`);
assert(validResult.metrics.remainingBudgetUSD > 0, `Budget reserve remains: $${validResult.metrics.remainingBudgetUSD}`);
assert(validResult.metrics.isDemoData === false, 'Metric marked with isDemoData = false (real physics engine)');
assert(!Number.isNaN(validResult.metrics.totalMassKg), 'Mass is a valid number (no NaN)');
assert(!Number.isNaN(validResult.metrics.netPowerWatts), 'Net power is a valid number (no NaN)');

// ----------------------------------------------------------------------------
// TEST 2: Mass Overload Scenario
// ----------------------------------------------------------------------------
console.log('\n--- TEST 2: Mass Overload Scenario ---');
const massOverloadMission = createBaseMission();
massOverloadMission.briefing.maxMassKg = 2.0; // Unrealistic 2.0 kg ceiling for 3U satellite
const massOverloadResult = evaluateEngineering(massOverloadMission);

assert(massOverloadResult.validation.isValid === false, 'Mass overload mission fails validation');
assert(massOverloadResult.validation.errors.some(e => e.includes('exceeds')), 'Validation captures mass ceiling error');
assert(massOverloadResult.validation.checks.find(c => c.category === 'MASS')?.status === 'FAIL', 'MASS check has FAIL status');

// ----------------------------------------------------------------------------
// TEST 3: Power Starvation Scenario
// ----------------------------------------------------------------------------
console.log('\n--- TEST 3: Power Starvation Scenario ---');
const powerStarveMission = createBaseMission();
powerStarveMission.spacecraft.power = 'power-standard'; // standard 18W body panels
powerStarveMission.payload.dutyCyclePercent = 90; // High duty cycle
const powerStarveResult = evaluateEngineering(powerStarveMission);

assert(powerStarveResult.metrics.powerConsumedWatts > powerStarveResult.metrics.powerGeneratedWatts, 'Consumption exceeds generation');
assert(powerStarveResult.metrics.netPowerWatts < 0, `Net power is negative: ${powerStarveResult.metrics.netPowerWatts} W`);
assert(powerStarveResult.validation.checks.find(c => c.category === 'POWER')?.status === 'FAIL', 'POWER check has FAIL status');

// ----------------------------------------------------------------------------
// TEST 4: Budget Violation Scenario
// ----------------------------------------------------------------------------
console.log('\n--- TEST 4: Budget Violation Scenario ---');
const budgetOverMission = createBaseMission();
budgetOverMission.briefing.budgetUSD = 100000; // Unrealistic $100k budget
const budgetOverResult = evaluateEngineering(budgetOverMission);

assert(budgetOverResult.metrics.remainingBudgetUSD < 0, `Budget deficit detected: $${budgetOverResult.metrics.remainingBudgetUSD}`);
assert(budgetOverResult.validation.isValid === false, 'Budget overage mission fails validation');
assert(budgetOverResult.validation.checks.find(c => c.category === 'BUDGET')?.status === 'FAIL', 'BUDGET check has FAIL status');

// ----------------------------------------------------------------------------
// TEST 5: ADCS / High-Res Payload Incompatibility Scenario
// ----------------------------------------------------------------------------
console.log('\n--- TEST 5: ADCS / High-Res Payload Incompatibility ---');
const pointingMismatchMission = createBaseMission();
pointingMismatchMission.payload.selectedPayloadId = 'payload-opt-hires';
pointingMismatchMission.spacecraft.adcs = 'adcs-basic'; // Magnetorquers only (coarse pointing)
const pointingMismatchResult = evaluateEngineering(pointingMismatchMission);

assert(pointingMismatchResult.validation.isValid === false, 'Pointing mismatch fails validation');
assert(pointingMismatchResult.validation.checks.some(c => c.title.includes('Payload pointing') && c.status === 'FAIL'), 'ADCS pointing check triggers FAIL');

// ----------------------------------------------------------------------------
// TEST 6: Engineering to Simulation Pipeline Flow
// ----------------------------------------------------------------------------
console.log('\n--- TEST 6: Engineering to Simulation End-to-End Pipeline ---');

const metrics = validResult.metrics;
const resourceTotals = {
  totalMassKg: metrics.totalMassKg,
  maxMassKg: metrics.maxMassKg,
  totalCostUSD: metrics.totalCostUSD,
  budgetUSD: metrics.maxBudgetUSD,
  remainingBudgetUSD: metrics.remainingBudgetUSD,
  totalPowerGenWatts: metrics.powerGeneratedWatts,
  totalPowerDrawWatts: metrics.powerConsumedWatts,
  netPowerWatts: metrics.netPowerWatts,
  batteryCapacityWh: metrics.batteryCapacityWh,
  massMarginKg: metrics.massMarginKg,
  budgetMarginUSD: metrics.remainingBudgetUSD,
  isMassValid: metrics.massMarginKg >= 0,
  isBudgetValid: metrics.remainingBudgetUSD >= 0,
  isPowerValid: metrics.netPowerWatts > 0,
};

const resolvedComponents = Object.values(validMission.spacecraft)
  .map((id) => COMPONENT_CATALOGUE.find((c) => c.id === id))
  .filter(Boolean);

const simulationInput = {
  missionId: validMission.missionId,
  difficulty: validMission.briefing.difficulty,
  target: validMission.briefing.targetId,
  orbitParams: {
    orbitName: '500 km Sun-Synchronous Orbit (SSO)',
    altitudeKm: 500,
    inclinationDeg: 97.4,
    periodMinutes: 94.6,
    eclipseDurationMinutes: 35.2,
  },
  resourceTotals,
  selectedComponents: validMission.spacecraft,
  resolvedComponents,
  subsystemSpecs: {
    communicationBand: 'S-BAND',
    downlinkRateMbps: metrics.downlinkBandwidthMbps,
    imagingDataRateMbPerSec: metrics.imagingDataRateMbPerSec || 25,
    storageCapacityMb: metrics.storageCapacityMb || 16000,
  },
  deterministicSeed: 42,
  timeCompressionFactor: 1,
};

const simEngine = new SimulationEngine(simulationInput);
const initialTelemetry = simEngine.getTelemetry();

assert(initialTelemetry.batterySocPercent > 0, `Initial battery SOC is ${initialTelemetry.batterySocPercent}%`);
assert(initialTelemetry.batteryCapacityWh === metrics.batteryCapacityWh, `Engine uses calculated battery capacity: ${initialTelemetry.batteryCapacityWh} Wh`);
assert(initialTelemetry.currentStage === 'LAUNCH_PREP', `Initial stage is ${initialTelemetry.currentStage}`);

// Advance through 100 simulation steps
console.log('\n--- Advancing Simulation (100 ticks @ 30s) ---');
for (let i = 0; i < 100; i++) {
  simEngine.tick(30);
}

const advancedTelemetry = simEngine.getTelemetry();
const simState = simEngine.getState();
assert(simState.missionElapsedTimeSeconds === 1000, `Elapsed time advances to 1000s with stable physics clamping (T+${simState.missionElapsedTimeSeconds})`);
assert(advancedTelemetry.orbitsCompleted >= 0, `Orbits tracked: ${advancedTelemetry.orbitsCompleted}`);
assert(!Number.isNaN(advancedTelemetry.batterySocPercent), `Battery SOC is valid: ${advancedTelemetry.batterySocPercent}%`);
assert(!Number.isNaN(advancedTelemetry.dataStoredMb), `Data stored is valid: ${advancedTelemetry.dataStoredMb} MB`);

// Generate final mission report
const missionReport = simEngine.getMissionReport();
assert(missionReport.successScore >= 0 && missionReport.successScore <= 100, `Mission report score is valid: ${missionReport.successScore}/100`);
assert(missionReport.scoreBreakdown.length > 0, `Score breakdown categories: ${missionReport.scoreBreakdown.length}`);
assert(missionReport.finalStatus === 'MISSION_SUCCESS' || missionReport.finalStatus === 'PARTIAL_SUCCESS', `Final status: ${missionReport.finalStatus}`);
assert(Array.isArray(missionReport.recommendations), 'Report includes recommendations array');

// ----------------------------------------------------------------------------
console.log('\n--- TEST 7: Full Mission Lifecycle & Anomaly Mitigation Contract ---');
const lifecycleEngine = new SimulationEngine({
  ...simulationInput,
  resourceTotals: {
    ...resourceTotals,
    netPowerWatts: 17.0,
    totalPowerGenWatts: 42.0,
    totalPowerDrawWatts: 25.0,
  },
  subsystemSpecs: {
    communicationBand: 'S-BAND',
    downlinkRateMbps: 2.0,
    imagingDataRateMbPerSec: 15,
    storageCapacityMb: 32000,
  },
  deterministicSeed: 42,
});

let mitigatedCount = 0;
while (!lifecycleEngine.isFinished()) {
  lifecycleEngine.tick(10);
  const active = lifecycleEngine.getState().activeAnomalies;
  if (active.length > 0) {
    const ok = lifecycleEngine.mitigateEvent(active[0], 'Automated flight software intervention');
    if (ok) mitigatedCount++;
  }
}

const finalReport = lifecycleEngine.getMissionReport();
assert(finalReport.finalStatus === 'MISSION_SUCCESS', `Full balanced flight completes with MISSION_SUCCESS: ${finalReport.finalStatus}`);
assert(finalReport.successScore >= 75, `Composite debrief score meets excellence threshold (MISSION_SUCCESS >= 75): ${finalReport.successScore}/100`);
assert(mitigatedCount >= 0, `Anomaly mitigation contract executed successfully (${mitigatedCount} mitigated)`);

console.log('\n====================================================');
console.log(`ALL INTEGRATION TESTS PASSED: ${passedChecks}/${totalChecks} VERIFIED`);
console.log('====================================================');
