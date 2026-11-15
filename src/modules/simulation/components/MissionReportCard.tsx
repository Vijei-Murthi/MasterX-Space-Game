/**
 * MASTERX – SPACE MACHINE
 * Mission Report Card Component (Member 3)
 *
 * Visualizes the post-flight debriefing report with transparent scoring,
 * category breakdowns, flight statistics, and diagnostic engineering recommendations.
 */

import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Award,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import type { MissionReport, MissionOutcome } from '../types';

export interface MissionReportCardProps {
  report: MissionReport | null;
  onRestart?: () => void;
  onReviseDesign?: () => void;
  className?: string;
}

export const MissionReportCard: React.FC<MissionReportCardProps> = ({
  report,
  onRestart,
  onReviseDesign,
  className = '',
}) => {
  if (!report) {
    return (
      <div className={`w-full p-8 bg-[#081020]/90 border border-slate-800/80 rounded-2xl text-center font-mono text-xs text-slate-500 ${className}`}>
        [STANDBY] Awaiting final flight debrief report...
      </div>
    );
  }

  // Outcome styling helpers
  const getOutcomeDetails = (status: MissionOutcome) => {
    switch (status) {
      case 'MISSION_SUCCESS':
        return {
          label: 'MISSION SUCCESS',
          badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80',
          icon: <CheckCircle2 size={18} className="text-emerald-400" />,
          summary: 'Spacecraft achieved primary Earth observation and scientific downlink milestones.',
        };
      case 'PARTIAL_SUCCESS':
        return {
          label: 'PARTIAL MISSION SUCCESS',
          badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
          icon: <AlertTriangle size={18} className="text-amber-400" />,
          summary: 'Flight objectives partially completed with degraded science return or engineering reserves.',
        };
      case 'CRITICAL_FAILURE':
      default:
        return {
          label: 'MISSION TERMINATED / FAILURE',
          badgeColor: 'bg-red-950/80 text-red-300 border-red-800/80',
          icon: <XCircle size={18} className="text-red-400" />,
          summary: 'Spacecraft encountered catastrophic structural failure or electrical power bus collapse.',
        };
    }
  };

  const outcome = getOutcomeDetails(report.finalStatus);

  return (
    <div className={`w-full bg-[#081020]/95 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 text-slate-100 font-sans select-none ${className}`}>
      
      {/* ===================================================================== */}
      {/* 1. HEADER: OUTCOME BADGE & MISSION SCORE                              */}
      {/* ===================================================================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border shadow-md ${outcome.badgeColor}`}>
              {outcome.icon}
              {outcome.label}
            </span>
            <span className="text-xs font-mono text-slate-400">
              MISSION ID: {report.missionId}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-sans">
            FINAL FLIGHT DEBRIEF REPORT
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            {outcome.summary}
          </p>
        </div>

        {/* Large Score Ring / Readout */}
        <div className="flex flex-col items-end shrink-0 bg-[#060c19] border border-slate-800/80 px-6 py-4 rounded-2xl shadow-inner text-right">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            OVERALL MISSION SCORE
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
              report.successScore >= 75
                ? 'text-emerald-400'
                : report.successScore >= 45
                ? 'text-amber-400'
                : 'text-red-400'
            }`}>
              {report.successScore}
            </span>
            <span className="text-slate-500 font-mono text-sm">/ 100</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
            <Award size={12} className="text-sky-400" />
            {report.successScore >= 75 ? 'FLIGHT QUALIFIED' : 'EVALUATION INCOMPLETE'}
          </span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. FLIGHT TELEMETRY SUMMARY METRICS                                   */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl">
          <span className="text-[10px] text-slate-500 block uppercase">DOWNLINKED DATA</span>
          <span className="text-base font-bold text-sky-300">
            {report.scienceDataDownlinkedMb.toFixed(1)} <span className="text-xs font-normal text-slate-400">MB</span>
          </span>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl">
          <span className="text-[10px] text-slate-500 block uppercase">IMAGES CAPTURED</span>
          <span className="text-base font-bold text-purple-300">
            {report.totalImagesCaptured} <span className="text-xs font-normal text-slate-400">FRAMES</span>
          </span>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl">
          <span className="text-[10px] text-slate-500 block uppercase">MIN ECLIPSE SOC</span>
          <span className={`text-base font-bold ${
            report.minBatterySocPercent >= 30 ? 'text-emerald-300' : 'text-amber-400'
          }`}>
            {report.minBatterySocPercent.toFixed(1)}%
          </span>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl">
          <span className="text-[10px] text-slate-500 block uppercase">ANOMALIES RESOLVED</span>
          <span className="text-base font-bold text-emerald-400">
            {report.anomaliesResolved} <span className="text-xs font-normal text-slate-400">RESOLVED</span>
          </span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. SCORING BREAKDOWN ACROSS 4 CORE CATEGORIES                          */}
      {/* ===================================================================== */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 tracking-wider uppercase">
          <TrendingUp size={14} className="text-sky-400" />
          <span>TRANSPARENT SCORING BREAKDOWN</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.scoreBreakdown.map((cat, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-[#060c19] border border-slate-800/80 rounded-2xl flex flex-col justify-between gap-1.5"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold uppercase">{cat.category.replace('_', ' ')}</span>
                <span className="text-sky-400 font-bold">
                  {cat.earnedPoints} / {cat.maxPoints} PTS
                </span>
              </div>

              {/* Progress meter */}
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/40">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full"
                  style={{ width: `${Math.round((cat.earnedPoints / cat.maxPoints) * 100)}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-tight">
                {cat.details}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. REASONS & DIAGNOSTIC RECOMMENDATIONS                               */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        
        {/* Reasons */}
        <div className="p-4 bg-slate-900/50 border border-slate-800/70 rounded-2xl space-y-2">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
            FLIGHT OUTCOME FACTORS
          </span>
          <ul className="space-y-1.5 text-xs text-slate-400 font-mono">
            {report.reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-sky-400 select-none">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actionable Engineering Recommendations */}
        <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-2xl space-y-2">
          <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider block flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-400" />
            ENGINEERING RECOMMENDATIONS FOR NEXT ATTEMPT
          </span>
          <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
            {report.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-400 select-none">→</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* 5. ACTION BUTTONS                                                     */}
      {/* ===================================================================== */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
        {onRestart && (
          <button
            onClick={onRestart}
            className="px-5 py-2.5 rounded-full border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono font-semibold transition-colors cursor-pointer flex items-center gap-2"
          >
            <RotateCcw size={13} /> RE-RUN SIMULATION
          </button>
        )}

        {onReviseDesign && (
          <button
            onClick={onReviseDesign}
            className="px-6 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-mono font-bold transition-all shadow-lg hover:shadow-sky-500/20 cursor-pointer flex items-center gap-2"
          >
            REVISE SPACECRAFT DESIGN <ArrowRight size={14} />
          </button>
        )}
      </div>

    </div>
  );
};

export default MissionReportCard;
