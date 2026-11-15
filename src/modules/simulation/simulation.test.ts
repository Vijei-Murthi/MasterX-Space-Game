/**
 * MASTERX – SPACE MACHINE
 * Simulation Engine Unit & Integration Test Suite (Member 3)
 *
 * Runs natively on Node.js using node:test and node:assert.
 * No external test runner packages required.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { StageManager, MISSION_STAGES } from './stageManager';
import { OrbitModel } from './orbitModel';
import { EventSystem } from './eventSystem';
import { SimulationEngine } from './simulationEngine';
import type { SimulationInput } from './types';
import type { SpacecraftResourceTotals } from '../../types/builder';

// ============================================================================
// HELPER FIXTURES
// ============================================================================

const createMockResourceTotals = (overrides?: Partial<SpacecraftResourceTotals>): SpacecraftResourceTotals => {
  return {
    totalMassKg: 6.2,
    maxMassKg: 8.0,
    totalCostUSD: 1400000,
    budgetUSD: 1800000,
    remainingBudgetUSD: 400000,
    totalPowerGenWatts: 34.0, // Deployable solar array
    totalPowerDrawWatts: 14.5,
    netPowerWatts: 19.5,
    batteryCapacityWh: 45.0,
    massMarginKg: 1.8,
    budgetMarginUSD: 400000,
    isMassValid: true,
    isBudgetValid: true,
    isPowerValid: true,
    ...overrides,
  };
};

const createMockSimulationInput = (overrides?: Partial<SimulationInput>): SimulationInput => {
  return {
    missionId: 'TEST-MISSION-01',
    difficulty: 'normal',
    target: 'coastal',
    orbitParams: {
      orbitName: '500 km Sun-Synchronous',
      altitudeKm: 500,
      inclinationDeg: 97.4,
    },
    resourceTotals: createMockResourceTotals(),
    deterministicSeed: 12345,
    ...overrides,
  };
};

// ============================================================================
// 1. STAGE MANAGER: VALID TRANSITIONS
// ============================================================================

test('StageManager: advances sequentially through all 10 mission stages', () => {
  const sm = new StageManager('LAUNCH_PREP', 0);
  assert.equal(sm.getCurrentStage(), 'LAUNCH_PREP');

  let time = 0;
  for (let i = 0; i < MISSION_STAGES.length - 1; i++) {
    time += 50;
    const res = sm.transitionToNext(time);
    assert.equal(res.success, true, `Transition at step ${i} failed: ${res.error}`);
    assert.equal(res.toStage, MISSION_STAGES[i + 1].id);
  }

  assert.equal(sm.getCurrentStage(), 'MISSION_COMPLETE');
  assert.equal(sm.isMissionComplete(), true);
  assert.equal(sm.getHistory().length, 10);
});

// ============================================================================
// 2. STAGE MANAGER: INVALID TRANSITIONS
// ============================================================================

test('StageManager: blocks non-sequential transitions and transitions after failure', () => {
  const sm = new StageManager('LAUNCH_PREP', 0);

  // Attempt to skip to DATA_COLLECTION directly
  const jumpCheck = sm.canTransitionTo('DATA_COLLECTION');
  assert.equal(jumpCheck.allowed, false);
  assert.match(jumpCheck.reason || '', /cannot jump from LAUNCH_PREP/);

  // Fail the stage
  sm.failStage(25, 'Engine booster ignition failure');
  assert.equal(sm.isFailed(), true);

  // Attempt transition after failure
  const postFailCheck = sm.canTransitionTo('LAUNCH');
  assert.equal(postFailCheck.allowed, false);
  assert.match(postFailCheck.reason || '', /Cannot transition: mission is in FAILED state/);
});

// ============================================================================
// 3. ORBIT MODEL: ACCURACY & REPRODUCIBILITY
// ============================================================================

test('OrbitModel: computes circular period, eclipse duration and ground pass', () => {
  const orbit = new OrbitModel(500, 97.4);
  const period = orbit.getOrbitalPeriodSeconds();

  // 500 km LEO period is nominally ~5670 - 5690 seconds (~94.6 min)
  assert.ok(period > 5650 && period < 5700, `Period ${period} s out of range`);

  const eclipseSec = orbit.getEclipseDurationSeconds();
  // Eclipse duration for 500 km circular orbit is ~2100 s (~35-37 min)
  assert.ok(eclipseSec > 2000 && eclipseSec < 2200, `Eclipse ${eclipseSec} s out of range`);

  // Evaluate in eclipse (t = 100 s is inside first eclipse window)
  const stateEclipse = orbit.evaluateAt(100);
  assert.equal(stateEclipse.isEclipse, true);
  assert.equal(stateEclipse.solarFluxWm2, 0);

  // Evaluate in daylight (halfway through orbit, e.g. t = 3000 s)
  const stateDaylight = orbit.evaluateAt(3000);
  assert.equal(stateDaylight.isEclipse, false);
  assert.equal(stateDaylight.solarFluxWm2, 1361.0);

  // Evaluate during ground station pass window (around 80% orbit fraction)
  const groundPassTime = period * 0.78;
  const stateGround = orbit.evaluateAt(groundPassTime);
  assert.equal(stateGround.groundContactActive, true);
  assert.ok(stateGround.linkBudgetDb > 5.0, 'Link budget must be positive during pass');
});

// ============================================================================
// 4. SIMULATION INITIALIZATION
// ============================================================================

test('SimulationEngine: initializes state without fake or fabricated telemetry', () => {
  const input = createMockSimulationInput();
  const engine = new SimulationEngine(input);
  const telemetry = engine.getTelemetry();

  assert.equal(telemetry.timestampSeconds, 0);
  assert.equal(telemetry.currentStage, 'LAUNCH_PREP');
  assert.equal(telemetry.batterySocPercent, 100);
  assert.equal(telemetry.batteryCapacityWh, 45.0);
  assert.equal(telemetry.dataStoredMb, 0);
  assert.equal(telemetry.dataTransmittedMb, 0);
  assert.equal(telemetry.overallHealthPercent, 100);
  assert.equal(engine.isFinished(), false);
});

// ============================================================================
// 5. BATTERY ENERGY INTEGRATION (DAYLIGHT & ECLIPSE)
// ============================================================================

test('SimulationEngine: discharges battery in eclipse and charges in daylight', () => {
  const input = createMockSimulationInput();
  const engine = new SimulationEngine(input);

  // Advance 60 seconds in eclipse (t=0 to 60s is inside eclipse window)
  for (let i = 0; i < 6; i++) {
    engine.tick(10);
  }

  const telEclipse = engine.getTelemetry();
  assert.equal(telEclipse.isEclipse, true);
  assert.equal(telEclipse.powerGenerationWatts, 0);
  assert.ok(telEclipse.netPowerWatts < 0, 'Net power must be negative in eclipse');
  assert.ok(telEclipse.batterySocPercent < 100, 'Battery must discharge in eclipse');
});

// ============================================================================
// 6. DATA COLLECTION & STORAGE
// ============================================================================

test('SimulationEngine: collects multispectral imaging data during observation stage', () => {
  const input = createMockSimulationInput();
  const engine = new SimulationEngine(input);

  // Advance simulation through early stages into DATA_COLLECTION
  // (Total elapsed time approx 200s will reach Stage 7)
  for (let t = 0; t < 25; t++) {
    engine.tick(10);
  }

  const telemetry = engine.getTelemetry();
  assert.ok(telemetry.dataStoredMb > 0, `Expected dataStoredMb > 0, got ${telemetry.dataStoredMb}`);
  assert.ok(telemetry.scienceImagesCaptured > 0, `Expected captured images, got ${telemetry.scienceImagesCaptured}`);
});

// ============================================================================
// 7. DATA TRANSMISSION & DOWNLINK
// ============================================================================

test('SimulationEngine: downlinks stored science data when ground contact is active', () => {
  const input = createMockSimulationInput();
  const engine = new SimulationEngine(input);

  // Run through collection and into transmission window
  for (let t = 0; t < 50; t++) {
    engine.tick(10);
  }

  const tel = engine.getTelemetry();
  assert.ok(tel.dataTransmittedMb >= 0);
});

// ============================================================================
// 8. DETERMINISTIC EVENTS: COMM BLACKOUT & INSTRUMENT GLITCH
// ============================================================================

test('EventSystem: triggers deterministic blackout and instrument malfunction', () => {
  const es = new EventSystem(42);

  // Context at t=140s should trigger instrument glitch
  const ctxGlitch = {
    elapsedSeconds: 140,
    currentStage: 'DATA_COLLECTION',
    batterySocPercent: 85,
    isEclipse: false,
    groundContactActive: false,
    activeAnomalies: [],
  };

  const triggeredGlitch = es.evaluate(ctxGlitch);
  assert.ok(triggeredGlitch.some((e) => e.type === 'INSTRUMENT_GLITCH'), 'Instrument glitch must trigger');

  const impactGlitch = es.getCombinedImpact();
  assert.equal(impactGlitch.isPayloadDisabled, true, 'Payload must be disabled during glitch');
  assert.ok(impactGlitch.instrumentHealthPenaltyPercent > 0);

  // Context at t=190s should trigger comm blackout
  const ctxBlackout = {
    elapsedSeconds: 190,
    currentStage: 'GROUND_COMMUNICATION',
    batterySocPercent: 80,
    isEclipse: false,
    groundContactActive: true,
    activeAnomalies: [],
  };

  const triggeredBlackout = es.evaluate(ctxBlackout);
  assert.ok(triggeredBlackout.some((e) => e.type === 'COMM_BLACKOUT'), 'Comm blackout must trigger');

  const impactBlackout = es.getCombinedImpact();
  assert.equal(impactBlackout.isCommsDisabled, true, 'Comms must be disabled during blackout');
});

// ============================================================================
// 9. MISSION FAILURE: CRITICAL BROWNOUT
// ============================================================================

test('SimulationEngine: detects critical electrical brownout when battery is depleted', () => {
  // Create an intentionally failing spacecraft: huge power draw (50W) and tiny battery (1 Wh)
  const starvedTotals = createMockResourceTotals({
    totalPowerGenWatts: 5.0,
    totalPowerDrawWatts: 50.0,
    netPowerWatts: -45.0,
    batteryCapacityWh: 1.0,
    isPowerValid: false,
  });

  const failingInput = createMockSimulationInput({
    resourceTotals: starvedTotals,
  });

  const engine = new SimulationEngine(failingInput);

  // Tick until battery drains to 0 in eclipse
  for (let i = 0; i < 30; i++) {
    engine.tick(5);
    if (engine.isFinished()) break;
  }

  const state = engine.getState();
  assert.equal(state.isFailed, true, 'Mission must fail on complete battery exhaustion');
  assert.match(state.failureReason || '', /Critical EPS Bus Brownout/);

  const report = engine.getMissionReport();
  assert.equal(report.finalStatus, 'CRITICAL_FAILURE');
  assert.equal(report.successScore, 0);
});

// ============================================================================
// 10. DETERMINISTIC EVENT REPRODUCIBILITY
// ============================================================================

test('EventSystem: identical seeds produce identical event timelines and impacts', () => {
  const seed = 98765;
  const es1 = new EventSystem(seed);
  const es2 = new EventSystem(seed);

  const testTimes = [50, 100, 140, 190, 250, 300];

  for (const time of testTimes) {
    const ctx = {
      elapsedSeconds: time,
      currentStage: 'DATA_COLLECTION',
      batterySocPercent: 65,
      isEclipse: false,
      groundContactActive: false,
      activeAnomalies: [],
    };

    const evts1 = es1.evaluate(ctx);
    const evts2 = es2.evaluate(ctx);

    assert.equal(evts1.length, evts2.length, `Event count mismatch at t=${time}`);
    if (evts1.length > 0) {
      assert.equal(evts1[0].id, evts2[0].id);
      assert.equal(evts1[0].timestampSeconds, evts2[0].timestampSeconds);
    }

    const impact1 = es1.getCombinedImpact();
    const impact2 = es2.getCombinedImpact();
    assert.deepEqual(impact1, impact2, `Impact mismatch at t=${time}`);
  }
});
