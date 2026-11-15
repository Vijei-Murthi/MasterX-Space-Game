import React from 'react';
import { ObservationPriorities } from '../../types/planner';
import {
  PRIORITY_LABELS,
  calculatePriorityTradeoffs,
} from '../../data/plannerConfig';
import {
  Database,
  Zap,
  Weight,
  HardDrive,
  Radio,
  Info,
  Sparkles,
} from 'lucide-react';

interface PrioritySlidersProps {
  priorities: ObservationPriorities;
  onChange: (updated: ObservationPriorities) => void;
}

export const PrioritySliders: React.FC<PrioritySlidersProps> = ({
  priorities,
  onChange,
}) => {
  const tradeoffs = calculatePriorityTradeoffs(priorities);

  const handleSliderChange = (
    key: keyof ObservationPriorities,
    value: number
  ) => {
    onChange({
      ...priorities,
      [key]: value,
    });
  };

  const getPriorityNote = (
    list: { level: number; label: string; note: string }[],
    current: number
  ) => {
    return list.find((item) => item.level === current) || list[0];
  };

  const resInfo = getPriorityNote(PRIORITY_LABELS.resolution, priorities.resolutionPriority);
  const freqInfo = getPriorityNote(PRIORITY_LABELS.frequency, priorities.frequencyPriority);
  const dataInfo = getPriorityNote(PRIORITY_LABELS.scienceData, priorities.scienceDataPriority);
  const covInfo = getPriorityNote(PRIORITY_LABELS.coverage, priorities.coveragePriority);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ========================================================================= */}
      {/* 1. INTERACTIVE SLIDERS COLUMN (8 cols)                                   */}
      {/* ========================================================================= */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* SLIDER 1: IMAGE RESOLUTION PRIORITY */}
        <div className="p-5 bg-[#060c19]/80 backdrop-blur-md border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <label className="text-xs font-bold text-white uppercase tracking-wider font-sans">
                1. IMAGE RESOLUTION PRIORITY
              </label>
            </div>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-sky-950/80 text-sky-300 border border-sky-800">
              {resInfo.label}
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={priorities.resolutionPriority}
            onChange={(e) =>
              handleSliderChange('resolutionPriority', parseInt(e.target.value))
            }
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-none"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Level 1: 30m Swath</span>
            <span>Level 3: 10m Standard</span>
            <span>Level 5: 1.2m Sub-Meter</span>
          </div>

          <p className="text-xs text-slate-300 bg-[#040812]/50 p-2.5 rounded border border-slate-800/80 leading-relaxed">
            <span className="text-sky-400 font-semibold font-mono text-[11px] block mb-0.5">
              MISSION CONSEQUENCE:
            </span>
            {resInfo.note}
          </p>
        </div>

        {/* SLIDER 2: OBSERVATION FREQUENCY */}
        <div className="p-5 bg-[#060c19]/80 backdrop-blur-md border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <label className="text-xs font-bold text-white uppercase tracking-wider font-sans">
                2. OBSERVATION REVISIT CADENCE
              </label>
            </div>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800">
              {freqInfo.label}
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={priorities.frequencyPriority}
            onChange={(e) =>
              handleSliderChange('frequencyPriority', parseInt(e.target.value))
            }
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Level 1: 14 Days</span>
            <span>Level 3: Every 72h</span>
            <span>Level 5: Sub-Daily</span>
          </div>

          <p className="text-xs text-slate-300 bg-[#040812]/50 p-2.5 rounded border border-slate-800/80 leading-relaxed">
            <span className="text-amber-400 font-semibold font-mono text-[11px] block mb-0.5">
              MISSION CONSEQUENCE:
            </span>
            {freqInfo.note}
          </p>
        </div>

        {/* SLIDER 3: SCIENTIFIC DATA PRIORITY */}
        <div className="p-5 bg-[#060c19]/80 backdrop-blur-md border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <label className="text-xs font-bold text-white uppercase tracking-wider font-sans">
                3. SCIENTIFIC SPECTRAL DEPTH
              </label>
            </div>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
              {dataInfo.label}
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={priorities.scienceDataPriority}
            onChange={(e) =>
              handleSliderChange('scienceDataPriority', parseInt(e.target.value))
            }
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Level 1: 3-Band RGB</span>
            <span>Level 3: 8-Band RedEdge</span>
            <span>Level 5: 64-Band Cube</span>
          </div>

          <p className="text-xs text-slate-300 bg-[#040812]/50 p-2.5 rounded border border-slate-800/80 leading-relaxed">
            <span className="text-emerald-400 font-semibold font-mono text-[11px] block mb-0.5">
              MISSION CONSEQUENCE:
            </span>
            {dataInfo.note}
          </p>
        </div>

        {/* SLIDER 4: GEOGRAPHIC COVERAGE PRIORITY */}
        <div className="p-5 bg-[#060c19]/80 backdrop-blur-md border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <label className="text-xs font-bold text-white uppercase tracking-wider font-sans">
                4. GEOGRAPHIC COVERAGE AREA
              </label>
            </div>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-800">
              {covInfo.label}
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={priorities.coveragePriority}
            onChange={(e) =>
              handleSliderChange('coveragePriority', parseInt(e.target.value))
            }
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400 focus:outline-none"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Level 1: 500 km² Target</span>
            <span>Level 3: Continental Strip</span>
            <span>Level 5: Planetary Scan</span>
          </div>

          <p className="text-xs text-slate-300 bg-[#040812]/50 p-2.5 rounded border border-slate-800/80 leading-relaxed">
            <span className="text-purple-400 font-semibold font-mono text-[11px] block mb-0.5">
              MISSION CONSEQUENCE:
            </span>
            {covInfo.note}
          </p>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. REAL-TIME TRADEOFF FEEDBACK HUD (5 cols)                                */}
      {/* ========================================================================= */}
      <div className="lg:col-span-5 sticky top-24 space-y-4">
        <div className="p-5 bg-[#081020]/90 backdrop-blur-xl border border-sky-900/60 rounded-2xl shadow-2xl space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-sky-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
                ESTIMATED OPERATIONAL BURDEN
              </h4>
            </div>
            <span className="text-[10px] font-mono text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
              LIVE METRICS
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            As you increase resolution and observation frequency, your satellite demands more electrical power, larger flash memory, and heavier optics:
          </p>

          {/* Metric Cards */}
          <div className="space-y-2.5 font-mono text-xs">
            
            {/* Daily Data Generation */}
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database size={15} className="text-sky-400" />
                <span className="text-slate-300 text-[11px]">Daily Data Volume:</span>
              </div>
              <span className="font-bold text-sky-300">
                {tradeoffs.dataVolMB > 1000
                  ? `${(tradeoffs.dataVolMB / 1024).toFixed(2)} GB/day`
                  : `${tradeoffs.dataVolMB} MB/day`}
              </span>
            </div>

            {/* Daytime Power Draw */}
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Zap size={15} className="text-amber-400" />
                <span className="text-slate-300 text-[11px]">Sensor Power Draw:</span>
              </div>
              <span className="font-bold text-amber-300">
                ~{tradeoffs.powerWatts} Watts
              </span>
            </div>

            {/* Estimated Optics Mass */}
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Weight size={15} className="text-emerald-400" />
                <span className="text-slate-300 text-[11px]">Payload Optics Mass:</span>
              </div>
              <span className="font-bold text-emerald-300">
                ~{tradeoffs.opticsMassKg} kg
              </span>
            </div>

            {/* Recommended Storage Buffer */}
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HardDrive size={15} className="text-purple-400" />
                <span className="text-slate-300 text-[11px]">Recommended Flash Storage:</span>
              </div>
              <span className="font-bold text-purple-300">
                ≥ {tradeoffs.storageRecommendationGB} GB
              </span>
            </div>

            {/* Ground Station Contact Pass */}
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Radio size={15} className="text-slate-400" />
                <span className="text-slate-300 text-[11px]">Downlink Time / Contact:</span>
              </div>
              <span className="font-bold text-slate-200">
                ~{tradeoffs.downlinkMins} mins/pass
              </span>
            </div>

          </div>

          {/* Educational Disclaimer */}
          <div className="p-3 bg-[#050b16] border border-slate-800/80 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-400 leading-snug">
            <Info size={14} className="text-sky-400 shrink-0 mt-0.5" />
            <span>
              Illustrative game planning estimates. Spacecraft chassis sizing, solar panel surface area, and battery depth-of-discharge are assembled in the Spacecraft Builder.
            </span>
          </div>

        </div>
      </div>

    </div>
  );
};

export default PrioritySliders;
