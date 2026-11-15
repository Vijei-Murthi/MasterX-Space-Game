/**
 * MASTERX – SPACE MACHINE
 * Telemetry Dashboard Component (Member 3)
 *
 * Real-time aerospace HUD presenting live Electrical Power (EPS),
 * orbital parameters, onboard payload storage, and RF communications status.
 */

import React from 'react';
import {
  Zap,
  Radio,
  HardDrive,
  Compass,
  Sun,
  Moon,
  AlertTriangle,
  Signal,
  Wrench,
} from 'lucide-react';
import type { TelemetryData } from '../types';

export interface TelemetryDashboardProps {
  telemetry: TelemetryData | null;
  onMitigateAnomaly?: (anomalyId: string) => void;
  className?: string;
}

export const TelemetryDashboard: React.FC<TelemetryDashboardProps> = ({
  telemetry,
  onMitigateAnomaly,
  className = '',
}) => {
  if (!telemetry) {
    return (
      <div className={`w-full p-8 bg-[#081020]/90 border border-slate-800/80 rounded-2xl text-center font-mono text-xs text-slate-500 ${className}`}>
        [STANDBY] Awaiting initial telemetry uplink...
      </div>
    );
  }

  // Battery status color helper
  const getBatteryColor = (soc: number) => {
    if (soc >= 50) return 'text-emerald-400 bg-emerald-500';
    if (soc >= 25) return 'text-amber-400 bg-amber-500';
    return 'text-red-400 bg-red-500';
  };

  const batteryColor = getBatteryColor(telemetry.batterySocPercent);
  const isNetPositive = telemetry.netPowerWatts >= 0;
  const storagePercent = Math.min(
    100,
    Math.round((telemetry.dataStoredMb / Math.max(1, telemetry.maxStorageMb)) * 100)
  );

  return (
    <div className={`w-full flex flex-col gap-3 font-sans select-none ${className}`}>
      
      {/* ===================================================================== */}
      {/* 1. TOP ANOMALY ALERT BANNER (If any anomalies active)                 */}
      {/* ===================================================================== */}
      {telemetry.activeAnomalies.length > 0 && (
        <div className="w-full p-3 bg-amber-950/70 border border-amber-800/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-lg animate-pulse">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
            <AlertTriangle size={15} className="text-amber-400 shrink-0" />
            <span className="font-bold">SYSTEM ANOMALY ACTIVE:</span>
            <span>{telemetry.activeAnomalies.join(' | ')}</span>
          </div>

          {onMitigateAnomaly && (
            <button
              onClick={() => onMitigateAnomaly(telemetry.activeAnomalies[0])}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Wrench size={12} /> MITIGATE
            </button>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. MAIN 4-COLUMN TELEMETRY GRID                                       */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* CARD 1: ELECTRICAL POWER SYSTEM (EPS) */}
        <div className="bg-[#081020]/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap size={13} className="text-sky-400" /> EPS POWER BUS
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              isNetPositive
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-900/60'
                : 'bg-amber-950/60 text-amber-300 border-amber-900/60'
            }`}>
              {isNetPositive ? `+${telemetry.netPowerWatts} W NET` : `${telemetry.netPowerWatts} W NET`}
            </span>
          </div>

          {/* Large Battery SOC Gauge */}
          <div className="my-2">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-3xl font-black text-white font-mono tracking-tight">
                {telemetry.batterySocPercent}%
              </span>
              <span className="text-xs font-mono text-slate-400">
                {telemetry.batteryStoredWh.toFixed(1)} / {telemetry.batteryCapacityWh} Wh
              </span>
            </div>

            {/* Battery Level Bar */}
            <div className="w-full h-2 bg-slate-900/90 rounded-full overflow-hidden border border-slate-800/60">
              <div
                className={`h-full transition-all duration-300 ${batteryColor.split(' ')[1]}`}
                style={{ width: `${telemetry.batterySocPercent}%` }}
              />
            </div>
          </div>

          {/* Solar Gen vs Power Draw */}
          <div className="pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-slate-500 block">SOLAR GEN:</span>
              <span className="text-sky-300 font-semibold">{telemetry.powerGenerationWatts} W</span>
            </div>
            <div>
              <span className="text-slate-500 block">BUS DRAW:</span>
              <span className="text-slate-200 font-semibold">{telemetry.powerDrawWatts} W</span>
            </div>
          </div>
        </div>

        {/* CARD 2: ORBITAL TRAJECTORY & ENVIRONMENT */}
        <div className="bg-[#081020]/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Compass size={13} className="text-amber-400" /> ORBIT REGIME
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${
              telemetry.isEclipse
                ? 'bg-indigo-950/60 text-indigo-300 border-indigo-900/60'
                : 'bg-amber-950/60 text-amber-300 border-amber-900/60'
            }`}>
              {telemetry.isEclipse ? <Moon size={11} /> : <Sun size={11} />}
              {telemetry.isEclipse ? 'UMBRA ECLIPSE' : 'DAYLIGHT'}
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-3xl font-black text-white font-mono tracking-tight">
                {telemetry.altitudeKm} <span className="text-sm font-normal text-slate-400">km</span>
              </span>
              <span className="text-xs font-mono text-amber-300 font-semibold">
                ORBIT #{telemetry.orbitsCompleted + 1}
              </span>
            </div>

            {/* Orbit Fraction Bar */}
            <div className="w-full h-2 bg-slate-900/90 rounded-full overflow-hidden border border-slate-800/60">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
                style={{ width: `${Math.round(telemetry.currentOrbitFraction * 100)}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-slate-500 block">SOLAR FLUX:</span>
              <span className="text-white font-semibold">{telemetry.solarFluxWm2} W/m²</span>
            </div>
            <div>
              <span className="text-slate-500 block">CHASSIS TEMP:</span>
              <span className="text-slate-200 font-semibold">{telemetry.thermalStatusC}°C</span>
            </div>
          </div>
        </div>

        {/* CARD 3: PAYLOAD & SCIENCE DATA */}
        <div className="bg-[#081020]/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <HardDrive size={13} className="text-purple-400" /> SCIENCE STORAGE
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              telemetry.imagingActive
                ? 'bg-purple-950/60 text-purple-300 border-purple-900/60 animate-pulse'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}>
              {telemetry.imagingActive ? 'IMAGING ACTIVE' : 'STANDBY'}
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-3xl font-black text-white font-mono tracking-tight">
                {telemetry.dataStoredMb.toFixed(0)} <span className="text-sm font-normal text-slate-400">MB</span>
              </span>
              <span className="text-xs font-mono text-purple-300 font-semibold">
                {telemetry.scienceImagesCaptured} FRAMES
              </span>
            </div>

            {/* Storage Utilization Bar */}
            <div className="w-full h-2 bg-slate-900/90 rounded-full overflow-hidden border border-slate-800/60">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-300"
                style={{ width: `${storagePercent}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-slate-500 block">STORAGE CAP:</span>
              <span className="text-slate-200 font-semibold">
                {(telemetry.maxStorageMb / 1024).toFixed(0)} GB
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">DOWNLINKED:</span>
              <span className="text-emerald-400 font-semibold">
                {telemetry.dataTransmittedMb.toFixed(1)} MB
              </span>
            </div>
          </div>
        </div>

        {/* CARD 4: COMMUNICATIONS & GROUND LINK */}
        <div className="bg-[#081020]/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Radio size={13} className="text-emerald-400" /> RF TELEMETRY LINK
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${
              telemetry.groundContactActive
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-900/60 animate-pulse'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}>
              <Signal size={11} />
              {telemetry.groundContactActive ? 'SVALBARD AOS' : 'SIGNAL LOS'}
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-3xl font-black text-white font-mono tracking-tight">
                {telemetry.downlinkRateMbps} <span className="text-sm font-normal text-slate-400">Mbps</span>
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                {telemetry.groundContactActive ? `LINK +${telemetry.linkBudgetDb} dB` : 'OUT OF CONE'}
              </span>
            </div>

            {/* Overall Spacecraft Health Bar */}
            <div className="w-full h-2 bg-slate-900/90 rounded-full overflow-hidden border border-slate-800/60">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all duration-300"
                style={{ width: `${telemetry.overallHealthPercent}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-slate-500 block">BUS HEALTH:</span>
              <span className="text-emerald-400 font-semibold">{telemetry.overallHealthPercent}%</span>
            </div>
            <div>
              <span className="text-slate-500 block">PAYLOAD HEALTH:</span>
              <span className="text-slate-200 font-semibold">{telemetry.instrumentHealthPercent}%</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default TelemetryDashboard;
