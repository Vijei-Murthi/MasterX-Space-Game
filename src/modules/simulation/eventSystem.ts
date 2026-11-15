/**
 * MASTERX – SPACE MACHINE
 * Deterministic Event System (Member 3)
 *
 * Implements a fair, predictable, and reproducible mission anomaly & event engine.
 *
 * All events are triggered either through deterministic time milestones
 * or transparent engineering condition thresholds (e.g. thermal/battery limits),
 * avoiding arbitrary random failures that make gameplay unfair.
 */

import type {
  SimulationEvent,
  SimulationEventType,
  EventSeverity,
} from './types';

export interface DeterministicEventRule {
  id: string;
  type: SimulationEventType;
  title: string;
  description: string;
  severity: EventSeverity;
  triggerTimeSeconds?: number;
  triggerCondition?: (telemetry: EventEvaluationContext) => boolean;
  nominalDurationSeconds: number;
  impact: {
    powerDrawDeltaWatts?: number;
    solarGenFractionMultiplier?: number;
    batteryCapacityLossWh?: number;
    disableComms?: boolean;
    disablePayload?: boolean;
    instrumentHealthDelta?: number;
  };
  recommendedMitigation?: string;
}

export interface EventEvaluationContext {
  elapsedSeconds: number;
  currentStage: string;
  batterySocPercent: number;
  isEclipse: boolean;
  groundContactActive: boolean;
  activeAnomalies: string[];
}

export interface CombinedEventImpact {
  netPowerDrawDeltaWatts: number;
  solarGenMultiplier: number;
  totalBatteryCapacityLossWh: number;
  isCommsDisabled: boolean;
  isPayloadDisabled: boolean;
  instrumentHealthPenaltyPercent: number;
}

/**
 * Lightweight deterministic pseudo-random number generator (Mulberry32)
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class EventSystem {
  private seed: number;
  private prng: () => number;
  private scheduledRules: DeterministicEventRule[] = [];
  private activeEvents: Map<string, SimulationEvent> = new Map();
  private eventHistory: SimulationEvent[] = [];
  private triggeredRuleIds: Set<string> = new Set();

  constructor(seed: number = 42) {
    this.seed = seed;
    this.prng = mulberry32(seed);
    this.initializeDefaultScenarioRules();
  }

  public getRandomValue(): number {
    return this.prng();
  }

  /**
   * Defines the standard mission anomalies for the Earth Observation scenario.
   */
  private initializeDefaultScenarioRules(): void {
    this.scheduledRules = [
      // 1. Communication Blackout
      // Triggers during the first ground station pass window due to ionospheric scintillation
      {
        id: 'EVT-COMM-BLACKOUT-01',
        type: 'COMM_BLACKOUT',
        title: 'Ionospheric Scintillation Blackout',
        description: 'Severe atmospheric plasma turbulence disrupts VHF/UHF carrier lock with the ground station.',
        severity: 'WARNING',
        triggerTimeSeconds: 190,
        nominalDurationSeconds: 40,
        impact: {
          disableComms: true,
        },
        recommendedMitigation: 'Switch to redundant low-gain backup transponder or wait for pass zenith.',
      },

      // 2. Battery Thermal Degradation
      // Triggers if battery SOC drops low while entering cold eclipse
      {
        id: 'EVT-BATT-DEG-01',
        type: 'BATTERY_DEGRADATION',
        title: 'Cold-Soak Battery Cell Degradation',
        description: 'Sub-zero temperatures during extended eclipse reduce lithium-ion electrolyte conductivity by 15%.',
        severity: 'WARNING',
        triggerCondition: (ctx) => ctx.isEclipse && ctx.batterySocPercent < 45,
        nominalDurationSeconds: 120,
        impact: {
          batteryCapacityLossWh: 6.0,
        },
        recommendedMitigation: 'Engage internal battery survival heaters and reduce non-essential bus draw.',
      },

      // 3. Instrument Optical Malfunction
      // Triggers during data collection stage (SEU or sensor detector temperature spike)
      {
        id: 'EVT-INST-GLITCH-01',
        type: 'INSTRUMENT_GLITCH',
        title: 'CMOS Detector Single Event Upset (SEU)',
        description: 'A cosmic ray hit causes memory bit-flip in the multispectral focal plane buffer, halting imaging.',
        severity: 'WARNING',
        triggerTimeSeconds: 140,
        nominalDurationSeconds: 35,
        impact: {
          disablePayload: true,
          instrumentHealthDelta: -25,
        },
        recommendedMitigation: 'Execute payload software soft-reset and reload optical calibration registers.',
      },

      // 4. Unexpected Power Shortage
      // Triggers when spacecraft attitude misalignment causes partial solar shadowing
      {
        id: 'EVT-PWR-SHORT-01',
        type: 'POWER_DEFICIT',
        title: 'Solar Array Partial Shading',
        description: 'Deployable panel hinge deflection causes a 30% reduction in photovoltaic illumination angle.',
        severity: 'CRITICAL',
        triggerTimeSeconds: 100,
        nominalDurationSeconds: 50,
        impact: {
          solarGenFractionMultiplier: 0.70,
          powerDrawDeltaWatts: 2.5,
        },
        recommendedMitigation: 'Trim reaction wheel speed bias to re-align panel normal vector with Sun.',
      },
    ];
  }

  /**
   * Registers a custom deterministic event rule
   */
  public registerRule(rule: DeterministicEventRule): void {
    this.scheduledRules.push(rule);
  }

  /**
   * Evaluates all rules against the current simulation state and triggers/resolves events.
   */
  public evaluate(context: EventEvaluationContext): SimulationEvent[] {
    const newlyTriggeredEvents: SimulationEvent[] = [];

    // 1. Check for new event triggers
    for (const rule of this.scheduledRules) {
      if (this.triggeredRuleIds.has(rule.id)) continue;

      let shouldTrigger = false;

      if (rule.triggerTimeSeconds !== undefined) {
        if (context.elapsedSeconds >= rule.triggerTimeSeconds) {
          shouldTrigger = true;
        }
      } else if (rule.triggerCondition) {
        if (rule.triggerCondition(context)) {
          shouldTrigger = true;
        }
      }

      if (shouldTrigger) {
        this.triggeredRuleIds.add(rule.id);

        const newEvent: SimulationEvent = {
          id: rule.id,
          timestampSeconds: context.elapsedSeconds,
          type: rule.type,
          description: `${rule.title}: ${rule.description}`,
          severity: rule.severity,
          status: 'ACTIVE',
          durationSeconds: rule.nominalDurationSeconds,
          impact: {
            powerDrawDeltaWatts: rule.impact.powerDrawDeltaWatts ?? 0,
            solarGenFractionMultiplier: rule.impact.solarGenFractionMultiplier ?? 1.0,
            batteryCapacityLossWh: rule.impact.batteryCapacityLossWh ?? 0,
            disableComms: rule.impact.disableComms ? 1 : 0,
            disablePayload: rule.impact.disablePayload ? 1 : 0,
            instrumentHealthDelta: rule.impact.instrumentHealthDelta ?? 0,
          },
        };

        this.activeEvents.set(rule.id, newEvent);
        this.eventHistory.push(newEvent);
        newlyTriggeredEvents.push(newEvent);
      }
    }

    // 2. Check for automatic expiration / resolution of active events
    for (const [eventId, event] of this.activeEvents.entries()) {
      if (event.durationSeconds !== undefined && event.status === 'ACTIVE') {
        const activeElapsed = context.elapsedSeconds - event.timestampSeconds;
        if (activeElapsed >= event.durationSeconds) {
          this.resolveEvent(eventId, context.elapsedSeconds, 'Automatic system recovery timer elapsed.');
        }
      }
    }

    return newlyTriggeredEvents;
  }

  /**
   * Allows the player or automated flight software to mitigate an active event
   */
  public mitigateEvent(eventId: string, currentTimeSeconds: number, mitigationLog?: string): boolean {
    const event =
      this.activeEvents.get(eventId) ||
      Array.from(this.activeEvents.values()).find(
        (e) => e.id === eventId || e.description === eventId || e.type === eventId
      );
    if (!event || event.status !== 'ACTIVE') return false;

    event.status = 'MITIGATED';
    if (mitigationLog) {
      event.description += ` [MITIGATED at T+${currentTimeSeconds}s: ${mitigationLog}]`;
    }
    return true;
  }

  /**
   * Resolves an active or mitigated event
   */
  public resolveEvent(eventId: string, currentTimeSeconds: number, resolutionLog?: string): boolean {
    const event = this.activeEvents.get(eventId);
    if (!event) return false;

    event.status = 'RESOLVED';
    event.resolvedAtSeconds = currentTimeSeconds;
    if (resolutionLog) {
      event.description += ` [RESOLVED at T+${currentTimeSeconds}s: ${resolutionLog}]`;
    }
    this.activeEvents.delete(eventId);
    return true;
  }

  /**
   * Computes the combined physical impacts of all currently active/mitigated events.
   */
  public getCombinedImpact(): CombinedEventImpact {
    let netPowerDrawDeltaWatts = 0;
    let solarGenMultiplier = 1.0;
    let totalBatteryCapacityLossWh = 0;
    let isCommsDisabled = false;
    let isPayloadDisabled = false;
    let instrumentHealthPenaltyPercent = 0;

    for (const event of this.activeEvents.values()) {
      if (event.status === 'RESOLVED') continue;

      // Mitigated events have their negative impact halved
      const impactScale = event.status === 'MITIGATED' ? 0.5 : 1.0;

      if (event.impact.powerDrawDeltaWatts) {
        netPowerDrawDeltaWatts += event.impact.powerDrawDeltaWatts * impactScale;
      }
      if (event.impact.solarGenFractionMultiplier !== undefined) {
        // Multiplier blended towards 1.0 if mitigated
        const factor = event.impact.solarGenFractionMultiplier;
        const scaledFactor = 1.0 - (1.0 - factor) * impactScale;
        solarGenMultiplier *= scaledFactor;
      }
      if (event.impact.batteryCapacityLossWh) {
        totalBatteryCapacityLossWh += event.impact.batteryCapacityLossWh * impactScale;
      }
      if (event.impact.disableComms === 1 && event.status === 'ACTIVE') {
        isCommsDisabled = true;
      }
      if (event.impact.disablePayload === 1 && event.status === 'ACTIVE') {
        isPayloadDisabled = true;
      }
      if (event.impact.instrumentHealthDelta) {
        instrumentHealthPenaltyPercent += Math.abs(event.impact.instrumentHealthDelta) * impactScale;
      }
    }

    return {
      netPowerDrawDeltaWatts: Number(netPowerDrawDeltaWatts.toFixed(2)),
      solarGenMultiplier: Number(solarGenMultiplier.toFixed(3)),
      totalBatteryCapacityLossWh: Number(totalBatteryCapacityLossWh.toFixed(2)),
      isCommsDisabled,
      isPayloadDisabled,
      instrumentHealthPenaltyPercent: Number(instrumentHealthPenaltyPercent.toFixed(1)),
    };
  }

  public getActiveEvents(): SimulationEvent[] {
    return Array.from(this.activeEvents.values());
  }

  public getEventHistory(): SimulationEvent[] {
    return [...this.eventHistory];
  }

  public reset(newSeed?: number): void {
    if (newSeed !== undefined) {
      this.seed = newSeed;
    }
    this.prng = mulberry32(this.seed);
    this.activeEvents.clear();
    this.eventHistory = [];
    this.triggeredRuleIds.clear();
    this.initializeDefaultScenarioRules();
  }
}
