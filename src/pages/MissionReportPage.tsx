/**
 * MASTERX – SPACE MACHINE
 * Stage 11: Final Mission Performance Report
 * 
 * Part 4 (Stage 11) Implementation:
 * Consumes Member 3's MissionReport contract:
 * Overall score, scientific return, power/budget efficiency, anomaly resolution,
 * and debrief recommendations.
 */

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  CheckCircle2,
  RotateCcw,
  Sliders,
  Info,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import UnifiedGameNav from '../components/navigation/UnifiedGameNav';
import UnifiedMissionGuideModal from '../components/navigation/UnifiedMissionGuideModal';
import { createMissionReport } from '../adapters/simulationAdapter';
import { MissionReport } from '../types/simulation';

export const MissionReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { mission, startNewMission } = useMission();
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Generate Report from Member 3 contract adapter
  const report = useMemo<MissionReport>(() => {
    return createMissionReport(mission);
  }, [mission]);

  const handleStartNewMission = () => {
    startNewMission();
    navigate('/briefing');
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030712] text-slate-100 flex flex-col justify-between overflow-x-hidden pt-20 pb-12">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-radial from-slate-900/40 via-[#030712] to-[#02040a]" />

      {/* Top Floating Navigation */}
      <UnifiedGameNav
        activeStage="06"
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Content Area */}
      <main className="relative z-10 max-w-5xl w-full mx-auto px-4 sm:px-8 space-y-8">
        
        {/* Header & Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-mono text-emerald-400 font-bold mb-2">
            <Trophy size={14} />
            <span>MISSION CAMPAIGN DEBRIEF</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase font-sans">
            MISSION PERFORMANCE REPORT
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-mono">
            Mission ID: <span className="text-slate-200">{report.missionId}</span> • Target: <span className="text-sky-300 uppercase">{mission.planner.objectiveId}</span>
          </p>
        </div>

        {/* Member 3 Integration Boundary Notice */}
        <div className="flex items-center justify-between p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-mono text-amber-300">
          <div className="flex items-center gap-2">
            <Info size={16} className="shrink-0" />
            <span>
              <strong>Member 3 Report Contract:</strong> Scoring and event aggregation interface conforming to <code>docs/integration-guide.md</code>.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-[10px] font-bold">
            DEMO SCORING ACTIVE
          </span>
        </div>

        {/* Executive Score Card */}
        <div className="p-6 sm:p-8 bg-[#081020]/95 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-xs font-mono font-bold">
                {report.finalStatus}
              </span>
              <span className="text-xs font-mono text-slate-400">CubeSat Earth Observation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-sans">
              NASA Earth Remote Sensing Campaign
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl font-sans">
              {report.executiveSummary}
            </p>
          </div>

          {/* Big Score Gauge */}
          <div className="shrink-0 flex flex-col items-center justify-center p-6 bg-slate-900/90 border border-slate-800 rounded-2xl w-44 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              COMPOSITE SCORE
            </span>
            <span className="text-5xl font-black font-mono text-emerald-400">
              {report.successScore}
            </span>
            <span className="text-xs font-mono text-slate-500 mt-1">/ 100 PTS</span>
          </div>
        </div>

        {/* 4 Score Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-left">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <span className="text-slate-400 text-xs block">SCIENTIFIC RETURN</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-sky-400">
                {report.scoreBreakdown.scientificValueScore}%
              </span>
              <span className="text-[11px] text-slate-500">{report.totalImagesCaptured} frames</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-sky-400" style={{ width: `${report.scoreBreakdown.scientificValueScore}%` }} />
            </div>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <span className="text-slate-400 text-xs block">RESOURCE EFFICIENCY</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-emerald-400">
                {report.scoreBreakdown.resourceEfficiencyScore}%
              </span>
              <span className="text-[11px] text-slate-500">Power surplus</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400" style={{ width: `${report.scoreBreakdown.resourceEfficiencyScore}%` }} />
            </div>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <span className="text-slate-400 text-xs block">BUDGET EFFICIENCY</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-amber-400">
                {report.scoreBreakdown.budgetEfficiencyScore}%
              </span>
              <span className="text-[11px] text-slate-500">Under ceiling</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400" style={{ width: `${report.scoreBreakdown.budgetEfficiencyScore}%` }} />
            </div>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <span className="text-slate-400 text-xs block">ORBITAL RELIABILITY</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-purple-400">
                {report.scoreBreakdown.orbitalReliabilityScore}%
              </span>
              <span className="text-[11px] text-slate-500">Zero anomalies</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-400" style={{ width: `${report.scoreBreakdown.orbitalReliabilityScore}%` }} />
            </div>
          </div>
        </div>

        {/* Engineering Recommendations */}
        <div className="p-6 bg-[#081020]/90 border border-slate-800 rounded-2xl text-left space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase font-sans">
              POST-FLIGHT ENGINEERING DEBRIEF RECOMMENDATIONS
            </h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300 font-sans list-disc list-inside">
            {report.recommendations.map((rec, i) => (
              <li key={i} className="leading-relaxed">
                {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <button
            onClick={() => navigate('/planner')}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-full text-xs font-mono text-slate-300 cursor-pointer transition-colors"
          >
            <Sliders size={14} />
            <span>REVISE SPACECRAFT DESIGN</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-full text-xs font-mono text-slate-300 cursor-pointer transition-colors"
            >
              <span>RETURN HOME</span>
            </button>

            <button
              onClick={handleStartNewMission}
              className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-bold text-xs uppercase rounded-full cursor-pointer transition-all shadow-xl shadow-sky-500/20"
            >
              <RotateCcw size={14} />
              <span>START NEW MISSION</span>
            </button>
          </div>
        </div>

      </main>

      {/* Mission Guide Modal */}
      <UnifiedMissionGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        selectedDifficulty={mission.briefing.difficulty}
        selectedTargetId={mission.briefing.targetId}
      />
    </div>
  );
};

export default MissionReportPage;
