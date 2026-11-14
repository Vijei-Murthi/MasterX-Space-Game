import React, { useState } from 'react';
import {
  Compass,
  X,
  Target,
  Sliders,
  Layers,
  Shield,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { DIFFICULTY_PRESETS, SCIENTIFIC_TARGETS } from '../../data/briefingConfig';
import { MissionDifficulty, ScientificTargetId } from '../../types/briefing';

interface MissionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDifficulty?: MissionDifficulty;
  selectedTargetId?: ScientificTargetId;
}

type GuideTab = 'objective' | 'difficulty' | 'targets' | 'constraints' | 'rules';

export const UnifiedMissionGuideModal: React.FC<MissionGuideModalProps> = ({
  isOpen,
  onClose,
  selectedDifficulty = 'normal',
  selectedTargetId = 'coastal',
}) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('objective');
  const currentParams = DIFFICULTY_PRESETS[selectedDifficulty] || DIFFICULTY_PRESETS.normal;
  const currentTarget =
    SCIENTIFIC_TARGETS.find((t) => t.id === selectedTargetId) || SCIENTIFIC_TARGETS[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#081020]/95 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-950/80 border border-sky-800 flex items-center justify-center">
              <Compass size={16} className="text-sky-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-sky-400 font-bold block uppercase tracking-wider">
                MASTERX OPERATIONS MANUAL
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white uppercase font-sans">
                MISSION PLANNING & FLIGHT GUIDE
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Mission Guide"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tactical Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-[#060c18] overflow-x-auto text-xs font-mono">
          {[
            { id: 'objective', label: '1. Objective', icon: Target },
            { id: 'difficulty', label: '2. Difficulty', icon: Sliders },
            { id: 'targets', label: '3. Science Target', icon: Layers },
            { id: 'constraints', label: '4. Constraints', icon: Shield },
            { id: 'rules', label: '5. Flight Rules', icon: FileText },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as GuideTab)}
                className={`flex items-center gap-1.5 px-4 py-3 transition-colors cursor-pointer border-r border-slate-800/80 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0c1830] text-sky-300 font-bold border-b-2 border-b-sky-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-sky-400' : 'text-slate-500'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto text-xs text-slate-300 leading-relaxed space-y-3.5">
          
          {/* TAB 1: OBJECTIVE */}
          {activeTab === 'objective' && (
            <div className="space-y-3.5">
              <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
                <h4 className="font-semibold text-white text-sm">
                  CubeSat Earth Observation Directive
                </h4>
                <p className="text-slate-300">
                  Your objective is to design a standard nanosatellite (1U to 3U) equipped with calibrated optical instruments to monitor environmental change, vegetation health, and climate dynamics from low Earth orbit.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <span className="text-slate-500 block text-[10px] uppercase">SUCCESS CRITERIA</span>
                  <span className="font-bold text-white text-sm">≥ 100 multispectral frames</span>
                  <p className="text-slate-400 mt-1 text-[11px] font-sans">
                    Capture and downlink calibrated imagery across scheduled ground station passes.
                  </p>
                </div>
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <span className="text-slate-500 block text-[10px] uppercase">ECLIPSE SURVIVAL</span>
                  <span className="font-bold text-white text-sm">35 min orbital shadow</span>
                  <p className="text-slate-400 mt-1 text-[11px] font-sans">
                    Maintain battery reserve and internal heaters throughout darkness with &lt; 40% DoD.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DIFFICULTY */}
          {activeTab === 'difficulty' && (
            <div className="space-y-3.5">
              <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white uppercase text-sm font-sans">
                    ACTIVE TIER: {currentParams.difficultyLabel} ({currentParams.difficultyRole})
                  </span>
                  <span className="text-sky-400 font-mono font-bold text-xs">
                    ${(currentParams.budgetUSD / 1000000).toFixed(1)}M USD CAP
                  </span>
                </div>
                <p className="text-slate-300 text-xs">{currentParams.difficultyDescription}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                {(['easy', 'normal', 'hard'] as MissionDifficulty[]).map((d) => {
                  const p = DIFFICULTY_PRESETS[d];
                  const isCurrent = currentParams.difficulty === d;
                  return (
                    <div
                      key={d}
                      className={`p-2.5 rounded-xl border ${
                        isCurrent
                          ? 'bg-sky-500/20 border-sky-400 text-white'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="font-bold block uppercase">{p.difficultyLabel}</span>
                      <span className="text-sky-300 font-bold block mt-1">${(p.budgetUSD / 1000000).toFixed(1)}M</span>
                      <span className="text-slate-500 text-[10px] block mt-0.5">{p.maxMassKg} kg mass limit</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: TARGET DETAILS */}
          {activeTab === 'targets' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{currentTarget.title}</h4>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    {currentTarget.category}
                  </span>
                </div>
                <p className="text-slate-300 text-xs mt-1">{currentTarget.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-2.5 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">PAYLOAD TYPE</span>
                  <span className="text-white font-semibold">{currentTarget.payloadType}</span>
                </div>
                <div className="p-2.5 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">SPECTRAL SENSITIVITY</span>
                  <span className="text-sky-300 font-semibold">{currentTarget.spectralBand}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONSTRAINTS */}
          {activeTab === 'constraints' && (
            <div className="space-y-3 font-mono text-xs">
              <p className="text-slate-400 font-sans text-xs">
                These flight rules govern your spacecraft design decisions in Stage 02:
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl flex justify-between">
                  <span className="text-slate-400">Launch Cost Cap:</span>
                  <span className="text-emerald-400 font-bold">${(currentParams.budgetUSD / 1000000).toFixed(1)}M</span>
                </div>
                <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl flex justify-between">
                  <span className="text-slate-400">Deployer Mass Limit:</span>
                  <span className="text-amber-400 font-bold">{currentParams.maxMassKg} kg</span>
                </div>
                <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl flex justify-between">
                  <span className="text-slate-400">Daylight Power Min:</span>
                  <span className="text-sky-300 font-bold">≥ {currentParams.minPowerWatts} W</span>
                </div>
                <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl flex justify-between">
                  <span className="text-slate-400">Battery Reserve:</span>
                  <span className="text-white font-bold">{currentParams.batteryReserveWh} Wh</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FLIGHT RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <strong className="text-white block mb-0.5">Rule 1: Sun-Synchronous Ground Track (SSO)</strong>
                <p className="text-slate-400 text-[11px]">
                  Orbiting at 500 km altitude with a 97.4° retrograde inclination ensures that repeat passes over Earth occur at identical local solar time, guaranteeing constant sun angles for scientific comparison.
                </p>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <strong className="text-white block mb-0.5">Rule 2: Extreme Thermal Cycling</strong>
                <p className="text-slate-400 text-[11px]">
                  The spacecraft cycles from -40°C in shadow to +80°C in direct solar exposure every 90 minutes. Adequate thermal dissipation and bus strip heaters are mandatory.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>NASA SPACE APPS CHALLENGE 2026</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-slate-950 font-bold font-mono text-xs uppercase rounded-full transition-colors cursor-pointer"
          >
            CLOSE MANUAL
          </button>
        </div>

      </div>
    </div>
  );
};

export default UnifiedMissionGuideModal;
