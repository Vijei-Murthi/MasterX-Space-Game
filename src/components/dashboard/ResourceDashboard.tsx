/**
 * MASTERX – SPACE MACHINE
 * Resource Dashboard Component (Stage 07)
 * 
 * Reusable presentation HUD displaying engineering resource balances:
 * Mass, Power, Energy Storage, Budget, Onboard Storage, Downlink Throughput.
 * Powered by Member 2 adapter contract (clearly marked DEMO DATA).
 */

import React from 'react';
import {
  Weight,
  Zap,
  Battery,
  DollarSign,
  HardDrive,
  Radio,
  Info,
} from 'lucide-react';
import { CalculatedMetrics } from '../../types/engineering';

interface ResourceDashboardProps {
  metrics: CalculatedMetrics;
  compact?: boolean;
  showBadge?: boolean;
}

export const ResourceDashboard: React.FC<ResourceDashboardProps> = ({
  metrics,
  compact = false,
  showBadge = true,
}) => {
  // Determine overall status colors and flags
  const isMassExceeded = metrics.totalMassKg > metrics.maxMassKg;
  const isPowerDeficit = metrics.netPowerWatts < 0;
  const isBudgetExceeded = metrics.remainingBudgetUSD < 0;

  const massStatus = isMassExceeded ? 'FAIL' : metrics.massMarginKg < 1.0 ? 'WARNING' : 'PASS';
  const powerStatus = isPowerDeficit ? 'FAIL' : metrics.netPowerWatts < 5.0 ? 'WARNING' : 'PASS';
  const budgetStatus = isBudgetExceeded ? 'FAIL' : 'PASS';

  if (compact) {
    return (
      <div className="w-full bg-[#081020]/90 border border-slate-800/90 rounded-xl px-4 py-3 backdrop-blur-md shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Mass */}
          <div className="flex items-center gap-2">
            <Weight size={14} className={massStatus === 'FAIL' ? 'text-rose-400' : 'text-slate-400'} />
            <span className="text-slate-400">MASS:</span>
            <span className={`font-bold ${massStatus === 'FAIL' ? 'text-rose-400' : 'text-white'}`}>
              {metrics.totalMassKg} / {metrics.maxMassKg} kg
            </span>
          </div>

          {/* Net Power */}
          <div className="flex items-center gap-2">
            <Zap size={14} className={powerStatus === 'FAIL' ? 'text-rose-400' : 'text-amber-400'} />
            <span className="text-slate-400">NET PWR:</span>
            <span className={`font-bold ${metrics.netPowerWatts >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {metrics.netPowerWatts >= 0 ? `+${metrics.netPowerWatts}` : metrics.netPowerWatts} W
            </span>
          </div>

          {/* Battery */}
          <div className="flex items-center gap-2">
            <Battery size={14} className="text-emerald-400" />
            <span className="text-slate-400">BATTERY:</span>
            <span className="font-bold text-white">{metrics.batteryCapacityWh} Wh</span>
          </div>

          {/* Remaining Budget */}
          <div className="flex items-center gap-2">
            <DollarSign size={14} className={budgetStatus === 'FAIL' ? 'text-rose-400' : 'text-emerald-400'} />
            <span className="text-slate-400">BUDGET REMAINING:</span>
            <span className={`font-bold ${budgetStatus === 'FAIL' ? 'text-rose-400' : 'text-emerald-400'}`}>
              ${(metrics.remainingBudgetUSD / 1000).toLocaleString()}k
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#070d19]/95 border border-slate-800/90 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl">
      {/* Header and Source Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-4 bg-sky-500 rounded-xs" />
          <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-sans">
            SPACECRAFT RESOURCE TELEMETRY & BALANCES
          </h3>
        </div>

        {showBadge && (
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono ${
              metrics.isDemoData
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
            }`}
          >
            <Info size={11} className={metrics.isDemoData ? 'text-amber-400' : 'text-emerald-400'} />
            <span>{metrics.dataSourceLabel}</span>
          </div>
        )}
      </div>

      {/* Grid of 6 Resource Metric Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. MASS BUDGET */}
        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Weight size={14} className="text-sky-400" /> TOTAL MASS
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                massStatus === 'PASS'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : massStatus === 'WARNING'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}
            >
              {massStatus}
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-bold font-mono text-white">{metrics.totalMassKg} kg</span>
            <span className="text-xs font-mono text-slate-400">Limit: {metrics.maxMassKg} kg</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                isMassExceeded ? 'bg-rose-500' : 'bg-sky-400'
              }`}
              style={{ width: `${Math.min(100, (metrics.totalMassKg / metrics.maxMassKg) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-2">
            Margin: <strong className={metrics.massMarginKg >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{metrics.massMarginKg} kg</strong>
          </span>
        </div>

        {/* 2. POWER GENERATION & DRAW */}
        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" /> DAYLIGHT POWER BALANCE
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                powerStatus === 'PASS'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : powerStatus === 'WARNING'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}
            >
              {powerStatus}
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className={`text-2xl font-bold font-mono ${metrics.netPowerWatts >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {metrics.netPowerWatts >= 0 ? `+${metrics.netPowerWatts}` : metrics.netPowerWatts} W
            </span>
            <span className="text-xs font-mono text-slate-400">Gen: {metrics.powerGeneratedWatts}W | Draw: {metrics.powerConsumedWatts}W</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${isPowerDeficit ? 'bg-rose-500' : 'bg-emerald-400'}`}
              style={{ width: `${Math.min(100, (metrics.powerConsumedWatts / Math.max(1, metrics.powerGeneratedWatts)) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-2">
            Status: {metrics.netPowerWatts >= 0 ? 'Positive Energy Harvest' : 'Deficit / Depleting'}
          </span>
        </div>

        {/* 3. BATTERY CAPACITY */}
        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Battery size={14} className="text-emerald-400" /> ENERGY STORAGE (ECLIPSE)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              PASS
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-bold font-mono text-white">{metrics.batteryCapacityWh} Wh</span>
            <span className="text-xs font-mono text-slate-400">Nominal 12.8V Bus</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400" style={{ width: '85%' }} />
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-2">
            Eclipse reserve: <strong className="text-white">~35 min at 15W draw</strong>
          </span>
        </div>

        {/* 4. FINANCIAL BUDGET */}
        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <DollarSign size={14} className="text-emerald-400" /> TOTAL BUDGET ALLOCATION
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                budgetStatus === 'PASS'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}
            >
              {budgetStatus}
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-bold font-mono text-white">
              ${(metrics.totalCostUSD / 1000000).toFixed(2)}M
            </span>
            <span className="text-xs font-mono text-slate-400">
              Ceiling: ${(metrics.maxBudgetUSD / 1000000).toFixed(2)}M
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${isBudgetExceeded ? 'bg-rose-500' : 'bg-emerald-400'}`}
              style={{ width: `${Math.min(100, (metrics.totalCostUSD / metrics.maxBudgetUSD) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-2">
            Remaining: <strong className={metrics.remainingBudgetUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              ${(metrics.remainingBudgetUSD / 1000).toLocaleString()}k
            </strong>
          </span>
        </div>

        {/* 5. DATA BUFFER & STORAGE */}
        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <HardDrive size={14} className="text-purple-400" /> DAILY SCIENTIFIC DATA
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              PASS
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-bold font-mono text-white">{metrics.dataGeneratedMbPerDay} MB/d</span>
            <span className="text-xs font-mono text-slate-400">Flash: {(metrics.storageCapacityMb / 1000).toFixed(0)} GB</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-400"
              style={{ width: `${Math.min(100, (metrics.dataGeneratedMbPerDay / metrics.storageCapacityMb) * 100 * 5)}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-2">
            Memory headroom: <strong className="text-white">{(metrics.remainingStorageMb / 1000).toFixed(1)} GB free</strong>
          </span>
        </div>

        {/* 6. COMMUNICATIONS THROUGHPUT */}
        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Radio size={14} className="text-sky-400" /> DOWNLINK CAPACITY
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              PASS
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-bold font-mono text-white">
              {metrics.downlinkBandwidthMbps >= 1.0
                ? `${metrics.downlinkBandwidthMbps.toFixed(1)} Mbps`
                : `${(metrics.downlinkBandwidthMbps * 1000).toFixed(1)} kbps`}
            </span>
            <span className="text-xs font-mono text-slate-400">Link Margin: +{metrics.linkMarginDb} dB</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-sky-400" style={{ width: metrics.downlinkBandwidthMbps >= 1.0 ? '80%' : '25%' }} />
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-2">
            RF Pipeline: <strong className="text-white">{metrics.downlinkBandwidthMbps >= 1.0 ? 'S-Band Directional' : 'UHF Omni'}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResourceDashboard;
