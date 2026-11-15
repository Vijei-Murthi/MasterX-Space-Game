import React from 'react';
import {
  MissionObjective,
  ObservationTarget,
  ObservationPriorities,
  MissionDurationOption,
  PlannerDifficultyOption,
} from '../../types/planner';
import { calculatePriorityTradeoffs } from '../../data/plannerConfig';
import {
  FileText,
  Target,
  MapPin,
  Clock,
  DollarSign,
  Weight,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import Button from '../ui/Button';

interface MissionSummaryDossierProps {
  objective: MissionObjective;
  selectedTargets: ObservationTarget[];
  priorities: ObservationPriorities;
  duration: MissionDurationOption;
  difficulty: PlannerDifficultyOption;
  onConfirm: () => void;
  onRevise: () => void;
}

export const MissionSummaryDossier: React.FC<MissionSummaryDossierProps> = ({
  objective,
  selectedTargets,
  priorities,
  duration,
  difficulty,
  onConfirm,
  onRevise,
}) => {
  const tradeoffs = calculatePriorityTradeoffs(priorities);

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#070e1d]/90 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
      
      {/* Dossier Tactical Banner Header */}
      <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center">
            <FileText size={16} className="text-sky-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase font-bold block">
              MASTERX FLIGHT OPERATIONS • MISSION DOSSIER #01
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white uppercase font-sans">
              OFFICIAL CUBESAT EARTH-OBSERVATION FLIGHT PLAN
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-[11px]">
          <span className="text-slate-400">STATUS:</span>
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 font-bold">
            <CheckCircle2 size={11} />
            <span>VALIDATED FOR ENGINEERING</span>
          </span>
        </div>
      </div>

      {/* Dossier Body Grid */}
      <div className="p-6 sm:p-8 space-y-6">
        
        {/* ROW 1: Objective & Difficulty Constraints */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Selected Objective Card */}
          <div className="p-5 bg-[#050b16] border border-slate-800/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                PRIMARY OBJECTIVE
              </span>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase"
                style={{
                  color: objective.colorAccent,
                  backgroundColor: `${objective.colorAccent}15`,
                  borderColor: `${objective.colorAccent}40`,
                }}
              >
                {objective.badge}
              </span>
            </div>

            <div>
              <h4 className="text-base font-black text-white uppercase font-sans">
                {objective.title}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {objective.tagline}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/70 font-mono text-[11px] text-slate-400 space-y-1">
              <div>
                <span className="text-slate-500">Spectral Band: </span>
                <span className="text-slate-200">{objective.primaryBands}</span>
              </div>
              <div>
                <span className="text-slate-500">Suggested Payload: </span>
                <span className="text-sky-300">{objective.suggestedSensor}</span>
              </div>
            </div>
          </div>

          {/* Difficulty & Agency Constraints Card */}
          <div className="p-5 bg-[#050b16] border border-slate-800/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                FLIGHT AGENCY CONSTRAINTS TIER
              </span>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase"
                style={{
                  color: difficulty.color,
                  backgroundColor: `${difficulty.color}15`,
                  borderColor: `${difficulty.color}40`,
                }}
              >
                {difficulty.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono mb-1">
                  <DollarSign size={12} className="text-emerald-400" />
                  <span>TOTAL BUDGET</span>
                </div>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  ${(difficulty.budgetUSD / 1000000).toFixed(1)}M
                </span>
              </div>

              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono mb-1">
                  <Weight size={12} className="text-amber-400" />
                  <span>MASS ENVELOPE</span>
                </div>
                <span className="text-lg font-black text-amber-400 font-mono">
                  {difficulty.maxMassKg} kg
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 leading-snug">
              {difficulty.description}
            </div>
          </div>

        </div>

        {/* ROW 2: Selected Targets & Mission Lifetime */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Selected Observation Targets */}
          <div className="p-5 bg-[#050b16] border border-slate-800/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                ASSIGNED GROUND TRACK TARGETS ({selectedTargets.length})
              </span>
              <Target size={14} className="text-sky-400" />
            </div>

            {selectedTargets.length === 0 ? (
              <p className="text-xs text-amber-400/80 font-mono py-2">
                No targets selected. Default regional grid will be assigned.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedTargets.map((target, idx) => (
                  <div
                    key={target.id}
                    className="p-2.5 bg-slate-900/70 border border-slate-800 rounded-lg flex items-center justify-between font-mono text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sky-400 font-bold text-[10px]">0{idx + 1}.</span>
                      <div className="truncate">
                        <span className="text-white font-semibold block truncate">
                          {target.name}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {target.coordinates} • {target.coveragePattern}
                        </span>
                      </div>
                    </div>
                    <MapPin size={12} className="text-slate-500 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mission Lifetime & Solar Cycle */}
          <div className="p-5 bg-[#050b16] border border-slate-800/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                MISSION LIFETIME & ORBIT
              </span>
              <Clock size={14} className="text-amber-400" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-white uppercase font-sans">
                {duration.title}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {duration.subtitle}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/70 grid grid-cols-2 gap-2 font-mono text-[10px]">
              <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                <span className="text-slate-500 block">BATTERY CYCLES</span>
                <span className="text-slate-200 font-semibold">{duration.batteryCycles}</span>
              </div>
              <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                <span className="text-slate-500 block">RAD EXPOSURE</span>
                <span className="text-amber-300 font-semibold">{duration.radiationExposure}</span>
              </div>
            </div>
          </div>

        </div>

        {/* ROW 3: Calibrated Priorities & Telemetry Impact */}
        <div className="p-5 bg-[#050b16] border border-slate-800/80 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              CALIBRATED OBSERVATION PRIORITIES
            </span>
            <span className="text-[10px] font-mono text-sky-400">
              EST. DAILY VOLUME: {tradeoffs.dataVolMB > 1000 ? `${(tradeoffs.dataVolMB / 1024).toFixed(2)} GB` : `${tradeoffs.dataVolMB} MB`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">RESOLUTION:</span>
                <span className="text-sky-300 font-bold">L{priorities.resolutionPriority} / 5</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-400 rounded-full"
                  style={{ width: `${(priorities.resolutionPriority / 5) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">REVISIT CADENCE:</span>
                <span className="text-amber-300 font-bold">L{priorities.frequencyPriority} / 5</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${(priorities.frequencyPriority / 5) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">SPECTRAL DEPTH:</span>
                <span className="text-emerald-300 font-bold">L{priorities.scienceDataPriority} / 5</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${(priorities.scienceDataPriority / 5) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">COVERAGE AREA:</span>
                <span className="text-purple-300 font-bold">L{priorities.coveragePriority} / 5</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-400 rounded-full"
                  style={{ width: `${(priorities.coveragePriority / 5) * 100}%` }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={onRevise}
            className="text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer py-2 px-3 rounded hover:bg-slate-900"
          >
            ← REVISE MISSION PLANNING
          </button>

          <Button
            variant="primary"
            size="lg"
            onClick={onConfirm}
            className="w-full sm:w-auto flex items-center justify-center gap-3 py-3.5 px-8 font-black uppercase tracking-wider text-xs sm:text-sm shadow-xl"
          >
            <span>CONFIRM MISSION PLAN & INITIALIZE SPACECRAFT</span>
            <ArrowRight size={16} />
          </Button>
        </div>

      </div>

    </div>
  );
};

export default MissionSummaryDossier;
