/**
 * MASTERX – SPACE MACHINE
 * Scoring & Evaluation Engine (Member 3)
 *
 * Provides a transparent, deterministic scoring algorithm and diagnostic
 * recommendations for the final Mission Report.
 */

import type {
  MissionReport,
  MissionOutcome,
  ScoreCategory,
  SimulationEvent,
  TelemetryData,
  StageRecord,
} from './types';

export interface EvaluationInput {
  missionId: string;
  difficulty: 'easy' | 'normal' | 'hard';
  target: string;
  elapsedTimeSeconds: number;
  orbitsCompleted: number;
  totalDataCollectedMb: number;
  scienceDataDownlinkedMb: number;
  targetDataMb: number;
  scienceImagesCaptured: number;
  minBatterySocPercent: number;
  finalBatterySocPercent: number;
  budgetMarginUSD: number;
  massMarginKg: number;
  isMassValid: boolean;
  isPowerValid: boolean;
  isBudgetValid: boolean;
  stageHistory: StageRecord[];
  eventHistory: SimulationEvent[];
  isBrownout: boolean;
  isStructuralFailure: boolean;
}

export class ScoringEngine {
  /**
   * Computes the complete mission report with transparent scoring rules.
   */
  public static evaluate(input: EvaluationInput): MissionReport {
    const reasons: string[] = [];
    const recommendations: string[] = [];
    const scoreBreakdown: ScoreCategory[] = [];

    // =========================================================================
    // 1. CATASTROPHIC FAILURE GATES
    // =========================================================================
    if (input.isStructuralFailure) {
      reasons.push('CRITICAL: Spacecraft structural failure during ascent. Launch mass exceeded launch vehicle payload capacity.');
      recommendations.push('Reduce spacecraft mass by selecting lightweight composite chassis structures or downsizing redundant components.');
      return this.createFailureReport(input, reasons, recommendations, 'Structural failure during launch ascent.');
    }

    if (input.isBrownout) {
      reasons.push('CRITICAL: Total EPS bus power collapse (battery depleted to 0% during eclipse).');
      recommendations.push('Increase battery capacity (Wh) or choose higher-efficiency deployable solar panels to ensure daylight surplus.');
      recommendations.push('Reduce steady-state power draw by selecting lower-power onboard computers or duty-cycling high-draw payloads.');
      return this.createFailureReport(input, reasons, recommendations, 'Total electrical power blackout in eclipse.');
    }

    // =========================================================================
    // 2. CATEGORY 1: SCIENCE RETURN (MAX 40 PTS)
    // =========================================================================
    const dataTarget = Math.max(10, input.targetDataMb);
    const dataRatio = Math.min(1.0, input.scienceDataDownlinkedMb / dataTarget);
    const sciencePoints = Math.round(dataRatio * 40);

    scoreBreakdown.push({
      category: 'SCIENCE_RETURN',
      earnedPoints: sciencePoints,
      maxPoints: 40,
      details: `Downlinked ${input.scienceDataDownlinkedMb.toFixed(1)} MB of ${dataTarget.toFixed(0)} MB target (${Math.round(dataRatio * 100)}%). Captured ${input.scienceImagesCaptured} multispectral frames.`,
    });

    if (dataRatio >= 0.95) {
      reasons.push(`Full scientific imaging objectives achieved for ${input.target.toUpperCase()}.`);
    } else if (dataRatio >= 0.5) {
      reasons.push(`Partial scientific return downlinked (${Math.round(dataRatio * 100)}% of target swath).`);
      recommendations.push('Upgrade communication subsystem to S-band or X-band to downlink more data during limited ground pass windows.');
    } else {
      reasons.push(`Low scientific return: only ${Math.round(dataRatio * 100)}% of requested data was received on the ground.`);
      recommendations.push('Ensure instrument is operational during observation passes and verify high-throughput downlink bandwidth.');
    }

    // =========================================================================
    // 3. CATEGORY 2: EPS & RESOURCE EFFICIENCY (MAX 30 PTS)
    // =========================================================================
    let powerPoints = 0;

    // Minimum battery SOC margin: reward keeping battery above 30% during eclipse
    if (input.minBatterySocPercent >= 50) {
      powerPoints += 15;
    } else if (input.minBatterySocPercent >= 30) {
      powerPoints += 10;
    } else if (input.minBatterySocPercent >= 15) {
      powerPoints += 5;
      reasons.push(`Deep battery discharge warning: battery dipped to ${input.minBatterySocPercent.toFixed(1)}% in eclipse.`);
      recommendations.push('Add battery reserve to avoid deep discharge cycles that accelerate cell aging.');
    } else {
      powerPoints += 2;
      reasons.push(`Near-brownout condition: battery dropped to critical ${input.minBatterySocPercent.toFixed(1)}% reserve.`);
      recommendations.push('Critical: battery reserve is dangerously thin. Increase storage capacity by at least 20 Wh.');
    }

    // Net power balance reward
    if (input.isPowerValid) {
      powerPoints += 10;
    } else {
      reasons.push('Negative daylight power balance: solar generation was insufficient to cover baseline avionics draw.');
      recommendations.push('Install higher-wattage solar arrays to generate positive daylight energy surplus.');
    }

    // Budget margin efficiency (up to 5 pts)
    if (input.isBudgetValid && input.budgetMarginUSD > 0) {
      powerPoints += 5;
    } else if (!input.isBudgetValid) {
      reasons.push('Mission budget overrun: total component cost exceeded briefing ceiling.');
      recommendations.push('Select standard or non-radiation hardened components where acceptable to stay under budget cap.');
    }

    scoreBreakdown.push({
      category: 'POWER_EFFICIENCY',
      earnedPoints: powerPoints,
      maxPoints: 30,
      details: `Min Battery SOC: ${input.minBatterySocPercent.toFixed(1)}%, Power Balance: ${input.isPowerValid ? 'SURPLUS' : 'DEFICIT'}, Budget Margin: $${(input.budgetMarginUSD / 1000).toFixed(0)}k.`,
    });

    // =========================================================================
    // 4. CATEGORY 3: SYSTEM RELIABILITY & ANOMALY SURVIVAL (MAX 20 PTS)
    // =========================================================================
    let reliabilityPoints = 20;
    const unresolvedAnomalies = input.eventHistory.filter((e) => e.status === 'ACTIVE').length;
    const resolvedAnomalies = input.eventHistory.filter((e) => e.status === 'RESOLVED' || e.status === 'MITIGATED').length;

    // Deduct 5 points per unresolved active anomaly at mission conclusion
    reliabilityPoints = Math.max(0, reliabilityPoints - unresolvedAnomalies * 5);

    scoreBreakdown.push({
      category: 'SYSTEM_RELIABILITY',
      earnedPoints: reliabilityPoints,
      maxPoints: 20,
      details: `${resolvedAnomalies} anomalies resolved/mitigated, ${unresolvedAnomalies} unresolved anomalies.`,
    });

    if (unresolvedAnomalies > 0) {
      reasons.push(`${unresolvedAnomalies} mission anomalies remained active or unresolved.`);
    }

    // =========================================================================
    // 5. CATEGORY 4: STAGE MILESTONES (MAX 10 PTS)
    // =========================================================================
    const completedStages = input.stageHistory.filter((s) => s.status === 'COMPLETED').length;
    const stagePoints = Math.min(10, Math.round((completedStages / 10) * 10));

    scoreBreakdown.push({
      category: 'MISSION_OBJECTIVES',
      earnedPoints: stagePoints,
      maxPoints: 10,
      details: `Completed ${completedStages} of 10 flight lifecycle stages.`,
    });

    // =========================================================================
    // 6. FINAL SCORE & STATUS SYNTHESIS
    // =========================================================================
    const totalScore = Math.min(100, Math.max(0, sciencePoints + powerPoints + reliabilityPoints + stagePoints));

    let finalStatus: MissionOutcome = 'MISSION_SUCCESS';
    if (totalScore >= 75 && input.scienceDataDownlinkedMb > 0) {
      finalStatus = 'MISSION_SUCCESS';
      reasons.push('Primary flight milestones and Earth observation objectives satisfied.');
    } else if (totalScore >= 45) {
      finalStatus = 'PARTIAL_SUCCESS';
      reasons.push('Mission partially completed with degraded science return or engineering margins.');
    } else {
      finalStatus = 'CRITICAL_FAILURE';
      reasons.push('Mission failed to meet minimum threshold for scientific utility.');
    }

    return {
      missionId: input.missionId,
      successScore: totalScore,
      totalImagesCaptured: input.scienceImagesCaptured,
      scienceDataDownlinkedMb: Number(input.scienceDataDownlinkedMb.toFixed(2)),
      anomaliesResolved: resolvedAnomalies,
      finalStatus,
      elapsedTimeSeconds: input.elapsedTimeSeconds,
      orbitsCompleted: input.orbitsCompleted,
      minBatterySocPercent: Number(input.minBatterySocPercent.toFixed(1)),
      totalDataCollectedMb: Number(input.totalDataCollectedMb.toFixed(2)),
      scoreBreakdown,
      reasons,
      recommendations: recommendations.length > 0 ? recommendations : ['Spacecraft design is well-balanced for this orbital profile. Proceed to higher difficulty tiers.'],
      eventsEncountered: input.eventHistory,
    };
  }

  private static createFailureReport(
    input: EvaluationInput,
    reasons: string[],
    recommendations: string[],
    failureDetail: string
  ): MissionReport {
    return {
      missionId: input.missionId,
      successScore: 0,
      totalImagesCaptured: input.scienceImagesCaptured,
      scienceDataDownlinkedMb: Number(input.scienceDataDownlinkedMb.toFixed(2)),
      anomaliesResolved: 0,
      finalStatus: 'CRITICAL_FAILURE',
      elapsedTimeSeconds: input.elapsedTimeSeconds,
      orbitsCompleted: input.orbitsCompleted,
      minBatterySocPercent: Number(input.minBatterySocPercent.toFixed(1)),
      totalDataCollectedMb: Number(input.totalDataCollectedMb.toFixed(2)),
      scoreBreakdown: [
        {
          category: 'MISSION_OBJECTIVES',
          earnedPoints: 0,
          maxPoints: 100,
          details: `Mission terminated prematurely: ${failureDetail}`,
        },
      ],
      reasons,
      recommendations,
      eventsEncountered: input.eventHistory,
    };
  }
}
