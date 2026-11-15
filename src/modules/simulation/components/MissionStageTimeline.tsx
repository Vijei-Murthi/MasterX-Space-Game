/**
 * MASTERX – SPACE MACHINE
 * Mission Stage Timeline Component (Member 3)
 *
 * Visualizes the 10 flight lifecycle stages in an aerospace-grade horizontal
 * stepper with live progress percentage and completion indicators.
 */

import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Rocket,
  Radio,
  Camera,
  Zap,
  Layers,
  Compass,
  Check,
} from 'lucide-react';
import type { MissionStage, StageExecutionStatus } from '../types';
import { MISSION_STAGES } from '../stageManager';

export interface MissionStageTimelineProps {
  currentStage: MissionStage;
  stageProgressPercent: number;
  stageStatus?: StageExecutionStatus;
  className?: string;
}

export const MissionStageTimeline: React.FC<MissionStageTimelineProps> = ({
  currentStage,
  stageProgressPercent,
  stageStatus = 'IN_PROGRESS',
  className = '',
}) => {
  const currentStageIndex = MISSION_STAGES.findIndex((s) => s.id === currentStage);
  const activeIndex = currentStageIndex >= 0 ? currentStageIndex : 0;

  // Resolves category icon per stage
  const getStageIcon = (stageId: MissionStage, _isCurrent: boolean, _isPast: boolean) => {
    switch (stageId) {
      case 'LAUNCH_PREP':
        return <Clock size={12} />;
      case 'LAUNCH':
        return <Rocket size={12} />;
      case 'DEPLOYMENT':
        return <Layers size={12} />;
      case 'ORBIT_INSERTION':
        return <Compass size={12} />;
      case 'SYSTEM_ACTIVATION':
        return <Zap size={12} />;
      case 'SCIENTIFIC_OBSERVATION':
      case 'DATA_COLLECTION':
        return <Camera size={12} />;
      case 'GROUND_COMMUNICATION':
      case 'DATA_TRANSMISSION':
        return <Radio size={12} />;
      case 'MISSION_COMPLETE':
      default:
        return <CheckCircle2 size={12} />;
    }
  };

  return (
    <div className={`w-full bg-[#081020]/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 shadow-xl select-none ${className}`}>
      
      {/* Header Info */}
      <div className="flex items-center justify-between mb-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-3.5 bg-sky-500 rounded-xs" />
          <span className="text-white font-bold tracking-wider uppercase font-sans">
            MISSION FLIGHT LIFECYCLE
          </span>
          <span className="text-slate-500 text-[11px]">
            STAGE {activeIndex + 1} OF 10
          </span>
        </div>

        <div className="flex items-center gap-2">
          {stageStatus === 'FAILED' ? (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-900/60 font-semibold text-[11px]">
              <XCircle size={12} /> STAGE FAILED
            </span>
          ) : stageStatus === 'COMPLETED' ? (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-900/60 font-semibold text-[11px]">
              <Check size={12} /> MISSION COMPLETED
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-950/80 text-sky-300 border border-sky-800/60 font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              {stageProgressPercent}% IN PROGRESS
            </span>
          )}
        </div>
      </div>

      {/* Live Stage Progress Bar */}
      <div className="relative w-full h-1.5 bg-slate-900/90 rounded-full overflow-hidden mb-4 border border-slate-800/60">
        <div
          className={`h-full transition-all duration-300 ${
            stageStatus === 'FAILED'
              ? 'bg-red-500'
              : stageStatus === 'COMPLETED'
              ? 'bg-emerald-500'
              : 'bg-gradient-to-r from-sky-500 to-sky-400'
          }`}
          style={{
            width: `${Math.min(
              100,
              Math.max(0, ((activeIndex + stageProgressPercent / 100) / MISSION_STAGES.length) * 100)
            )}%`,
          }}
        />
      </div>

      {/* Horizontal 10-Stage Bubble Stepper */}
      <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5 sm:gap-2">
        {MISSION_STAGES.map((def, idx) => {
          const isPast = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          let bubbleStyle = 'bg-slate-900/60 text-slate-500 border-slate-800/40 opacity-70';
          if (isPast) {
            bubbleStyle = 'bg-emerald-950/50 text-emerald-400 border-emerald-900/60 shadow-sm';
          } else if (isCurrent) {
            if (stageStatus === 'FAILED') {
              bubbleStyle = 'bg-red-950/80 text-red-300 border-red-700/80 ring-1 ring-red-500/40';
            } else {
              bubbleStyle = 'bg-sky-500 text-slate-950 font-bold border-sky-300/80 ring-1 ring-sky-300/50 shadow-lg scale-[1.03]';
            }
          }

          return (
            <div
              key={def.id}
              className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${bubbleStyle}`}
              title={`${def.order}. ${def.displayName}: ${def.description}`}
            >
              <div className="flex items-center gap-1 text-[10px] font-mono mb-1">
                {isPast ? (
                  <Check size={11} className="text-emerald-400" />
                ) : isCurrent && stageStatus === 'FAILED' ? (
                  <AlertTriangle size={11} className="text-red-300" />
                ) : (
                  getStageIcon(def.id, isCurrent, isPast)
                )}
                <span>{def.order < 10 ? `0${def.order}` : def.order}</span>
              </div>

              <span
                className={`text-[10px] leading-tight truncate w-full ${
                  isCurrent ? 'font-bold' : 'font-medium'
                }`}
              >
                {def.displayName}
              </span>

              {isCurrent && stageStatus === 'IN_PROGRESS' && (
                <div className="mt-1 w-full bg-slate-900/40 h-1 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-950 transition-all duration-200"
                    style={{ width: `${stageProgressPercent}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default MissionStageTimeline;
