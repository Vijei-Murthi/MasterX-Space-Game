import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HelpCircle, Home, Lock, Check } from 'lucide-react';

export type StageNum = '01' | '02' | '03' | '04' | '05' | '06';

interface UnifiedGameNavProps {
  activeStage: StageNum;
  onOpenGuide: () => void;
  missionState?: any;
}

export const UnifiedGameNav: React.FC<UnifiedGameNavProps> = ({
  activeStage,
  onOpenGuide,
  missionState,
}) => {
  const navigate = useNavigate();

  const stages = [
    { num: '01', name: 'Briefing', path: '/briefing' },
    { num: '02', name: 'Spacecraft', path: '/planner' },
    { num: '03', name: 'Subsystems', path: '' },
    { num: '04', name: 'Payload', path: '' },
    { num: '05', name: 'Orbit & Launch', path: '' },
    { num: '06', name: 'Simulation', path: '' },
  ];

  const handleStageClick = (stage: typeof stages[0]) => {
    if (!stage.path) return;
    if (stage.num === activeStage) return;

    // Navigate with preserved mission configuration
    navigate(stage.path, {
      state: missionState,
    });
  };

  return (
    <nav className="fixed top-4 inset-x-4 sm:inset-x-8 z-40 flex items-center justify-between pointer-events-none select-none">
      
      {/* ========================================================================= */}
      {/* 1. TOP-LEFT: ORIGINAL MASTERX PNG LOGO IN FLOATING PILL                   */}
      {/* ========================================================================= */}
      <div className="pointer-events-auto flex items-center px-4 py-2 bg-[#060c19]/80 backdrop-blur-xl border border-slate-800/80 rounded-full shadow-2xl hover:border-sky-500/50 transition-all">
        <Link
          to="/"
          className="flex items-center gap-2 group outline-none"
          title="Return to Space Machine Home"
        >
          <img
            src="/assets/masterx-logo.png"
            alt="MASTERX — SPACE MACHINE"
            className="h-6 sm:h-7 w-auto object-contain"
          />
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP-CENTER: SIX FLOATING IPHONE-STYLE NAVIGATION BUBBLES               */}
      {/* ========================================================================= */}
      <div className="pointer-events-auto flex items-center p-1.5 bg-[#081020]/85 backdrop-blur-2xl border border-slate-800/80 rounded-full shadow-2xl space-x-1 sm:space-x-1.5 max-w-[85vw] sm:max-w-none overflow-x-auto">
        {stages.map((stage) => {
          const isActive = stage.num === activeStage;
          const isCompleted = Number(stage.num) < Number(activeStage);
          const isLocked = Number(stage.num) > Number(activeStage);

          if (isActive) {
            return (
              <div
                key={stage.num}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider bg-sky-500 text-slate-950 font-bold shadow-lg ring-1 ring-sky-300/50 scale-[1.03] transition-all"
              >
                <span>{stage.num}</span>
                <span className="hidden md:inline font-sans">{stage.name}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse ml-0.5" />
              </div>
            );
          }

          if (isCompleted) {
            return (
              <button
                key={stage.num}
                onClick={() => handleStageClick(stage)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-900/50 cursor-pointer shadow-sm hover:scale-[1.03]"
                title={`Return to ${stage.name}`}
              >
                <span className="font-bold">{stage.num}</span>
                <span className="hidden md:inline font-sans">{stage.name}</span>
                <Check size={11} className="text-emerald-400 ml-0.5" />
              </button>
            );
          }

          return (
            <div
              key={stage.num}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono tracking-wider bg-slate-900/50 text-slate-500 border border-slate-800/40 select-none opacity-60"
              title={`${stage.name} (Locked)`}
            >
              <span>{stage.num}</span>
              <span className="hidden md:inline font-sans">{stage.name}</span>
              {isLocked && <Lock size={10} className="text-slate-600 ml-0.5" />}
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. TOP-RIGHT: SINGLE MISSION GUIDE BUTTON & HOME BUTTON                   */}
      {/* ========================================================================= */}
      <div className="pointer-events-auto flex items-center space-x-2">
        {/* Single Mission Guide Button */}
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#060c19]/80 backdrop-blur-xl border border-slate-800/80 hover:border-sky-400/60 rounded-full text-sky-400 hover:text-white transition-all shadow-xl cursor-pointer text-xs font-mono uppercase"
          title="Open Mission Guide Manual"
        >
          <HelpCircle size={14} className="text-sky-400" />
          <span className="hidden sm:inline">GUIDE</span>
        </button>

        {/* Home Button */}
        <Link
          to="/"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#060c19]/80 backdrop-blur-xl border border-slate-800/80 hover:border-slate-600 rounded-full text-slate-300 hover:text-white transition-all shadow-xl cursor-pointer text-xs font-mono uppercase"
          title="Return to Space Machine Home"
        >
          <Home size={14} className="text-slate-400" />
          <span className="hidden sm:inline">HOME</span>
        </Link>
      </div>

    </nav>
  );
};

export default UnifiedGameNav;
