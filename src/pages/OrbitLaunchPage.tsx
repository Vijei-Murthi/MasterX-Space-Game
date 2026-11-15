/**
 * MASTERX – SPACE MACHINE
 * Stage 05: Orbit & Launch Selection + Flight Readiness Validation
 * 
 * Part 4 (Stage 8 & Stage 9) Implementation:
 * Choose orbital insertion corridor and commercial launch vehicle.
 * Validates mission design against Member 2 engineering constraints.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Rocket,
  Check,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import UnifiedGameNav from '../components/navigation/UnifiedGameNav';
import UnifiedMissionGuideModal from '../components/navigation/UnifiedMissionGuideModal';
import ResourceDashboard from '../components/dashboard/ResourceDashboard';
import MissionValidationPanel from '../components/validation/MissionValidationPanel';
import {
  ORBIT_OPTIONS,
  LAUNCH_VEHICLES,
  calculateResourceMetrics,
  validateMissionDesign,
} from '../adapters/engineeringAdapter';
import { OrbitOption, LaunchVehicle } from '../types/engineering';

export const OrbitLaunchPage: React.FC = () => {
  const navigate = useNavigate();
  const { mission, updateOrbitLaunch } = useMission();
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Live Metrics & Validation
  const metrics = useMemo(() => calculateResourceMetrics(mission), [mission]);
  const validation = useMemo(() => validateMissionDesign(mission), [mission]);

  const selectedOrbit = useMemo<OrbitOption>(() => {
    return (
      ORBIT_OPTIONS.find((o) => o.id === mission.orbitLaunch.selectedOrbitId) ||
      ORBIT_OPTIONS[0]
    );
  }, [mission.orbitLaunch.selectedOrbitId]);

  const selectedLaunch = useMemo<LaunchVehicle>(() => {
    return (
      LAUNCH_VEHICLES.find((l) => l.id === mission.orbitLaunch.selectedLaunchVehicleId) ||
      LAUNCH_VEHICLES[0]
    );
  }, [mission.orbitLaunch.selectedLaunchVehicleId]);

  const handleSelectOrbit = (orbit: OrbitOption) => {
    updateOrbitLaunch({ selectedOrbitId: orbit.id });
  };

  const handleSelectLaunch = (launch: LaunchVehicle) => {
    updateOrbitLaunch({ selectedLaunchVehicleId: launch.id });
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030712] text-slate-100 flex flex-col justify-between overflow-x-hidden pt-20 pb-12">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-radial from-slate-900/40 via-[#030712] to-[#02040a]" />

      {/* Top Floating Navigation */}
      <UnifiedGameNav
        activeStage="05"
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-8 space-y-8">
        
        {/* Stage Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-4 bg-sky-500 rounded-xs" />
              <span className="text-xs font-mono font-bold tracking-widest text-sky-400 uppercase">
                STAGE 05 // ORBITAL INSERTION & LAUNCH VEHICLE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-sans">
              FLIGHT ORBIT REGIME & LAUNCH INTEGRATION
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Match target orbital mechanics with commercial launch capacity. Verify mission constraints before proceeding to orbital simulation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/payload')}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 rounded-full text-xs font-mono text-slate-300 transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>PAYLOAD</span>
            </button>

            <button
              onClick={() => navigate('/simulation')}
              className="flex items-center gap-2 px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-bold text-xs uppercase rounded-full transition-all cursor-pointer shadow-lg shadow-sky-500/20"
            >
              <span>PROCEED TO SIMULATION</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Live Resource Balance HUD */}
        <ResourceDashboard metrics={metrics} compact={true} />

        {/* SECTION 1: ORBIT CONFIGURATION */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="text-sky-400" size={18} />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider font-sans">
              1. SELECT OPERATIONAL ORBIT REGIME
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ORBIT_OPTIONS.map((orbit) => {
              const isSelected = orbit.id === selectedOrbit.id;

              return (
                <div
                  key={orbit.id}
                  onClick={() => handleSelectOrbit(orbit)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                    isSelected
                      ? 'bg-sky-950/30 border-sky-500 shadow-xl ring-1 ring-sky-500/40'
                      : 'bg-[#081020]/80 border-slate-800 hover:border-slate-700 hover:bg-[#0a1428]/90'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-bold uppercase">
                          {orbit.code}
                        </span>
                        <h3 className="text-base font-bold text-white font-sans mt-1">{orbit.name}</h3>
                      </div>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                          <Check size={11} /> SELECTED
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
                      {orbit.description}
                    </p>

                    {/* Orbital Mechanics Pill Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-3 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60 text-[10px] font-mono">
                      <div>
                        <span className="text-slate-500 block">ALTITUDE</span>
                        <span className="text-white font-bold">{orbit.altitudeKm} km</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">INCLINATION</span>
                        <span className="text-white font-bold">{orbit.inclinationDeg}°</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">PERIOD / ECLIPSE</span>
                        <span className="text-white font-bold">{orbit.periodMinutes}m / {orbit.eclipseDurationMinutes}m</span>
                      </div>
                    </div>

                    {/* Scientific Fitness Badge */}
                    <p className="text-[11px] font-mono text-sky-300 bg-sky-950/40 p-2 rounded-lg border border-sky-900/40 mb-3">
                      <strong>Observation Fitness:</strong> {orbit.scientificFitness}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Revisit Cadence: {orbit.revisitDays} day(s)</span>
                    <button
                      type="button"
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                        isSelected ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isSelected ? 'ORBIT LOCKED' : 'SELECT ORBIT'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: LAUNCH VEHICLE */}
        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <Rocket className="text-sky-400" size={18} />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider font-sans">
              2. SELECT COMMERCIAL LAUNCH VEHICLE
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {LAUNCH_VEHICLES.map((launch) => {
              const isSelected = launch.id === selectedLaunch.id;

              return (
                <div
                  key={launch.id}
                  onClick={() => handleSelectLaunch(launch)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                    isSelected
                      ? 'bg-sky-950/30 border-sky-500 shadow-xl ring-1 ring-sky-500/40'
                      : 'bg-[#081020]/80 border-slate-800 hover:border-slate-700 hover:bg-[#0a1428]/90'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold uppercase">
                          {launch.provider}
                        </span>
                        <h3 className="text-base font-bold text-white font-sans mt-1">{launch.name}</h3>
                      </div>
                      <span className="text-emerald-400 font-mono font-bold text-xs">
                        ${(launch.costUSD / 1000).toLocaleString()}k
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
                      {launch.description}
                    </p>

                    <div className="space-y-1.5 mb-3 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60 text-[10px] font-mono text-slate-400">
                      <div className="flex justify-between">
                        <span>Max Payload Envelope:</span>
                        <span className="text-white font-bold">{launch.maxPayloadKg} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fairing Diameter:</span>
                        <span className="text-white font-bold">{launch.fairingDiameterMeters} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Flight Reliability:</span>
                        <span className="text-emerald-400 font-bold">{(launch.reliabilityScore * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{launch.targetOrbit}</span>
                    <button
                      type="button"
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                        isSelected ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isSelected ? 'ASSIGNED' : 'ASSIGN'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: FLIGHT READINESS & VALIDATION AUDIT (Stage 9) */}
        <div className="pt-4 border-t border-slate-800/80">
          <MissionValidationPanel
            validation={validation}
            onProceedToSimulation={() => navigate('/simulation')}
          />
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

export default OrbitLaunchPage;
