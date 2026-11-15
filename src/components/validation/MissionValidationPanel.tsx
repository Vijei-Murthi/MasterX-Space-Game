/**
 * MASTERX – SPACE MACHINE
 * Mission Validation Results Interface (Stage 09)
 * 
 * Displays multi-disciplinary engineering checks:
 * Mass budget, power balance, financial ceiling, payload/ADCS pointing stability,
 * downlink bandwidth, and launch vehicle envelope.
 * Powered by Member 2 validation rules (clearly marked DEMO DATA).
 */

import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Info,
} from 'lucide-react';
import { ValidationResult } from '../../types/engineering';

interface MissionValidationPanelProps {
  validation: ValidationResult;
  onProceedToSimulation?: () => void;
}

export const MissionValidationPanel: React.FC<MissionValidationPanelProps> = ({
  validation,
  onProceedToSimulation,
}) => {
  const checks = validation.checks || [];
  const errorCount = checks.filter((c) => c.status === 'FAIL').length;
  const warningCount = checks.filter((c) => c.status === 'WARNING').length;
  const passCount = checks.filter((c) => c.status === 'PASS').length;

  return (
    <div className="w-full bg-[#070d19]/95 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          {validation.isValid ? (
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <ShieldCheck className="text-emerald-400" size={24} />
            </div>
          ) : (
            <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl">
              <ShieldAlert className="text-rose-400" size={24} />
            </div>
          )}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-sans">
              FLIGHT READINESS & SUBSYSTEM VALIDATION AUDIT
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Overall Status:{' '}
              <strong className={validation.isValid ? 'text-emerald-400' : 'text-rose-400'}>
                {validation.isValid ? 'GO FOR LAUNCH & SIMULATION' : 'LAUNCH HOLD (CRITICAL CONFLICT DETECTED)'}
              </strong>
            </p>
          </div>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 bg-emerald-950/70 border border-emerald-800/80 rounded-full text-emerald-400 font-bold">
            {passCount} PASS
          </span>
          {warningCount > 0 && (
            <span className="px-2.5 py-1 bg-amber-950/70 border border-amber-800/80 rounded-full text-amber-300 font-bold">
              {warningCount} WARNING
            </span>
          )}
          {errorCount > 0 && (
            <span className="px-2.5 py-1 bg-rose-950/70 border border-rose-800/80 rounded-full text-rose-400 font-bold">
              {errorCount} FAIL
            </span>
          )}
        </div>
      </div>

      {/* Demo Notice */}
      {validation.isDemoData && (
        <div className="flex items-center gap-2 p-3 mb-5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-mono text-amber-300">
          <Info size={14} className="shrink-0" />
          <span>
            DEMO DATA: Rules calculated by Member 1 Adapter contract awaiting Member 2 engineering module in <code>src/modules/engineering/</code>.
          </span>
        </div>
      )}

      {/* Check Item Cards */}
      <div className="space-y-3">
        {checks.map((check) => {
          const isPass = check.status === 'PASS';
          const isWarning = check.status === 'WARNING';
          const isFail = check.status === 'FAIL';

          return (
            <div
              key={check.id}
              className={`p-4 rounded-xl border transition-all ${
                isFail
                  ? 'bg-rose-950/20 border-rose-900/50'
                  : isWarning
                  ? 'bg-amber-950/20 border-amber-900/40'
                  : 'bg-slate-900/40 border-slate-800/60'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  {isPass && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
                  {isWarning && <AlertTriangle size={16} className="text-amber-400 shrink-0" />}
                  {isFail && <XCircle size={16} className="text-rose-400 shrink-0" />}
                  <span className="text-xs sm:text-sm font-bold text-white font-sans">{check.title}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700">
                    {check.category}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  {check.metricCurrent && (
                    <span className="text-slate-300">
                      Actual: <strong className="text-white">{check.metricCurrent}</strong>
                    </span>
                  )}
                  {check.metricLimit && (
                    <span className="text-slate-500 hidden sm:inline">
                      ({check.metricLimit})
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isPass
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : isWarning
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {check.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans pl-6">
                {check.explanation}
              </p>

              {check.suggestedCorrection && (
                <div className="mt-2.5 ml-6 p-2.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs font-mono text-amber-300/90 flex items-start gap-2">
                  <ArrowRight size={13} className="shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    <strong className="text-amber-300">Suggested Action:</strong> {check.suggestedCorrection}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      {onProceedToSimulation && (
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-400 font-mono">
            {validation.isValid
              ? 'All primary engineering checks verified. Ready to proceed to flight simulation.'
              : 'Launch holds must be addressed or overridden to proceed with simulation.'}
          </p>

          <button
            onClick={onProceedToSimulation}
            disabled={!validation.isValid}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xl ${
              validation.isValid
                ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 ring-1 ring-sky-300/50'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            <span>PROCEED TO STAGE 06 // SIMULATION</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MissionValidationPanel;
