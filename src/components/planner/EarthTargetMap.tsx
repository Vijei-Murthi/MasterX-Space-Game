import React from 'react';
import { ObservationTarget } from '../../types/planner';
import { Crosshair, MapPin, CheckCircle2, AlertTriangle, Globe } from 'lucide-react';

interface EarthTargetMapProps {
  targets: ObservationTarget[];
  selectedTargetIds: string[];
  onToggleTarget: (id: string) => void;
  maxTargets?: number;
}

export const EarthTargetMap: React.FC<EarthTargetMapProps> = ({
  targets,
  selectedTargetIds,
  onToggleTarget,
  maxTargets = 3,
}) => {
  return (
    <div className="space-y-6">
      {/* Target Capacity & Tactical Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#060c19]/80 backdrop-blur-md border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-950/80 border border-sky-800 flex items-center justify-center">
            <Globe size={18} className="text-sky-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
              GEOGRAPHIC SATELLITE TARGET SELECTION CONSOLE
            </h4>
            <p className="text-[11px] text-slate-400">
              Select up to {maxTargets} priority ground observation targets for orbital passes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-md font-mono text-xs">
            <span className="text-slate-400">ASSIGNED: </span>
            <span
              className={`font-bold ${
                selectedTargetIds.length === maxTargets ? 'text-emerald-400' : 'text-sky-400'
              }`}
            >
              {selectedTargetIds.length} / {maxTargets} SITES
            </span>
          </div>
        </div>
      </div>

      {/* Target Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {targets.map((target) => {
          const isSelected = selectedTargetIds.includes(target.id);
          const isMaxReached = selectedTargetIds.length >= maxTargets && !isSelected;

          return (
            <div
              key={target.id}
              onClick={() => {
                if (!isMaxReached) {
                  onToggleTarget(target.id);
                }
              }}
              className={`relative rounded-xl border p-4.5 transition-all duration-200 flex flex-col justify-between cursor-pointer select-none ${
                isSelected
                  ? 'bg-[#09152a] border-sky-400/80 shadow-lg shadow-sky-950/40 ring-1 ring-sky-400/40 translate-y-[-2px]'
                  : isMaxReached
                  ? 'bg-[#040812]/50 border-slate-800/60 opacity-60 cursor-not-allowed'
                  : 'bg-[#060c19]/75 border-slate-800/80 hover:border-slate-700 hover:bg-[#081224] hover:translate-y-[-1px]'
              }`}
            >
              {/* Top Row: Region & Threat Badge */}
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin
                    size={14}
                    className={`shrink-0 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`}
                  />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 truncate">
                    {target.region}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {target.threatLevel === 'Critical' && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-red-950/80 text-red-400 border border-red-900/60">
                      <AlertTriangle size={9} />
                      <span>CRITICAL</span>
                    </span>
                  )}
                  {target.threatLevel === 'Elevated' && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-950/80 text-amber-400 border border-amber-900/60">
                      <span>ELEVATED</span>
                    </span>
                  )}
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold'
                        : 'border-slate-700 text-transparent bg-slate-900/60'
                    }`}
                  >
                    <CheckCircle2 size={12} className={isSelected ? 'text-slate-950' : 'opacity-0'} />
                  </span>
                </div>
              </div>

              {/* Title & Coordinates */}
              <div className="mb-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-tight font-sans">
                  {target.name}
                </h4>
                <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-sky-400/90">
                  <Crosshair size={10} />
                  <span>{target.coordinates}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed mb-3.5">
                {target.description}
              </p>

              {/* Bottom Specs Footer */}
              <div className="pt-3 border-t border-slate-800/80 space-y-1.5 font-mono text-[10px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">COVERAGE:</span>
                  <span className="text-slate-200 font-medium">{target.coveragePattern}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">METRIC:</span>
                  <span className="text-emerald-400 font-semibold truncate max-w-[170px]" title={target.scientificMetric}>
                    {target.scientificMetric}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">SPECTRAL FOCUS:</span>
                  <span className="text-amber-400 font-medium">{target.spectralFocus}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EarthTargetMap;
