/**
 * MASTERX – SPACE MACHINE
 * Stage 06: Mission Simulation & Telemetry HUD
 * 
 * Part 4 (Stage 10) Implementation:
 * Live orbital telemetry stream, eclipse transitions, data collection buffer,
 * battery state-of-charge curve, and mission event log.
 * Powered by Member 3 simulation contract (clearly marked DEMO DATA).
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  Sun,
  Moon,
  Battery,
  HardDrive,
  Radio,
  Activity,
  Globe,
  ArrowRight,
  ArrowLeft,
  Info,
  FileText,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import UnifiedGameNav from '../components/navigation/UnifiedGameNav';
import UnifiedMissionGuideModal from '../components/navigation/UnifiedMissionGuideModal';
import {
  createInitialSimulationState,
  advanceSimulationStep,
} from '../adapters/simulationAdapter';
import { SimulationState, SimulationEvent } from '../types/simulation';

export const SimulationPage: React.FC = () => {
  const navigate = useNavigate();
  const { mission } = useMission();
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Simulation execution state
  const [isRunning, setIsRunning] = useState(true);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 5x, 10x
  const [simState, setSimState] = useState<SimulationState>(() =>
    createInitialSimulationState(mission)
  );
  const [eventLog, setEventLog] = useState<SimulationEvent[]>([
    {
      id: 'init-01',
      timestampSeconds: 0,
      type: 'GROUND_PASS',
      description: 'P-POD Canister Deployer release verified. CubeSat solar arrays deployed.',
      impact: { deployStatus: 1 },
    },
  ]);

  // Simulation step timer
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSimState((prev) => {
        const stepSec = 30 * simSpeed;
        const { nextState, newEvents } = advanceSimulationStep(prev, mission, stepSec);

        if (newEvents.length > 0) {
          setEventLog((log) => [...newEvents, ...log].slice(0, 30));
        }

        return nextState;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, simSpeed, mission]);

  const handleResetSim = () => {
    setSimState(createInitialSimulationState(mission));
    setEventLog([
      {
        id: `reset-${Date.now()}`,
        timestampSeconds: 0,
        type: 'GROUND_PASS',
        description: 'Simulation telemetry clock reset to T+00:00:00.',
        impact: {},
      },
    ]);
  };

  const formatElapsedTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `T+${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030712] text-slate-100 flex flex-col justify-between overflow-x-hidden pt-20 pb-12">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-radial from-slate-900/40 via-[#030712] to-[#02040a]" />

      {/* Top Floating Navigation */}
      <UnifiedGameNav
        activeStage="06"
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-8 space-y-6">
        
        {/* Stage Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-4 bg-sky-500 rounded-xs" />
              <span className="text-xs font-mono font-bold tracking-widest text-sky-400 uppercase">
                STAGE 06 // ACTIVE ORBITAL TELEMETRY & SIMULATION
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-sans">
              REAL-TIME ORBITAL OPERATIONS CONSOLE
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Monitor onboard telemetry, battery state of charge during Earth eclipse shadow, and autonomous scientific payload imaging sweeps.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/orbit-launch')}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 rounded-full text-xs font-mono text-slate-300 transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>ORBIT & LAUNCH</span>
            </button>

            <button
              onClick={() => navigate('/report')}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs uppercase rounded-full transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <FileText size={14} />
              <span>MISSION REPORT</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Member 3 Integration Boundary Notice */}
        <div className="flex items-center justify-between p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-mono text-amber-300">
          <div className="flex items-center gap-2">
            <Info size={16} className="shrink-0" />
            <span>
              <strong>Member 3 Simulation Boundary:</strong> This telemetry console visualizes the contract in <code>docs/integration-guide.md</code> awaiting the full physics solver in <code>src/modules/simulation/</code>.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-[10px] font-bold">
            DEMO TELEMETRY ACTIVE
          </span>
        </div>

        {/* Playback Controls & Mission Clock Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#081020]/95 border border-slate-800/90 rounded-2xl backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-bold text-xs cursor-pointer shadow-md"
            >
              {isRunning ? <Pause size={14} /> : <Play size={14} />}
              <span>{isRunning ? 'PAUSE' : 'RESUME'}</span>
            </button>

            {/* Sim Speeds */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 font-mono text-xs">
              {[1, 5, 10].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSimSpeed(spd)}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    simSpeed === spd
                      ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Reset */}
            <button
              onClick={handleResetSim}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
              title="Reset simulation telemetry clock"
            >
              <RotateCcw size={13} />
              <span>RESET</span>
            </button>
          </div>

          {/* Mission Clocks */}
          <div className="flex items-center gap-6 font-mono text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">MISSION TIME</span>
              <span className="text-white font-bold text-sm tracking-wider">
                {formatElapsedTime(simState.missionElapsedTimeSeconds)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ORBIT NUMBER</span>
              <span className="text-sky-400 font-bold text-sm">
                Orbit #{simState.orbitNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ORBIT FRACTION</span>
              <span className="text-emerald-400 font-bold text-sm">
                {(simState.currentOrbitFraction * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Orbit Progress Timeline Bar */}
        <div className="p-4 bg-[#081020]/90 border border-slate-800/80 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-2">
              <Globe size={14} className="text-sky-400" /> ORBITAL CYCLE PROGRESS
            </span>
            <span className="text-slate-300 flex items-center gap-1.5">
              {simState.isEclipse ? (
                <>
                  <Moon size={13} className="text-indigo-400 animate-pulse" />
                  <span className="text-indigo-300 font-bold">UMBRA (EARTH ECLIPSE)</span>
                </>
              ) : (
                <>
                  <Sun size={13} className="text-amber-400 animate-spin" />
                  <span className="text-amber-300 font-bold">SUNLIT REGIME (DAYLIGHT)</span>
                </>
              )}
            </span>
          </div>

          <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            {/* Daylight zone 0 to 60% */}
            <div className="absolute left-0 top-0 bottom-0 w-[60%] bg-amber-500/20" title="Sunlit Zone" />
            {/* Eclipse zone 60% to 97% */}
            <div className="absolute left-[60%] top-0 bottom-0 w-[37%] bg-indigo-900/60" title="Earth Eclipse Shadow" />
            {/* Active pointer */}
            <div
              className="absolute top-0 bottom-0 w-2 bg-sky-400 shadow-md shadow-sky-400/80 transition-all rounded-full"
              style={{ left: `${Math.min(99, simState.currentOrbitFraction * 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>0% (Node)</span>
            <span>60% (Eclipse Entry)</span>
            <span>97% (Eclipse Exit)</span>
            <span>100% (Revolution Complete)</span>
          </div>
        </div>

        {/* 4 Telemetry HUD Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          {/* Card 1: Battery SOC */}
          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Battery size={14} className={simState.batterySocPercent > 60 ? 'text-emerald-400' : 'text-amber-400'} />
                BATTERY SOC
              </span>
              <span className="text-white font-bold">{simState.batterySocPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  simState.batterySocPercent > 60 ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
                style={{ width: `${simState.batterySocPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              {simState.isEclipse ? 'Discharging at ~15W' : 'Recharging solar flux'}
            </p>
          </div>

          {/* Card 2: Solar Photon Flux */}
          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sun size={14} className="text-amber-400" />
                SOLAR FLUX
              </span>
              <span className="text-white font-bold">{simState.solarFluxWm2} W/m²</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all"
                style={{ width: simState.isEclipse ? '0%' : '100%' }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              {simState.isEclipse ? 'Solar array offline in shadow' : 'AM0 space constant illumination'}
            </p>
          </div>

          {/* Card 3: Scientific Data Collected */}
          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <HardDrive size={14} className="text-purple-400" />
                SCIENCE DATA
              </span>
              <span className="text-white font-bold">{simState.dataCollectedMb} MB</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-400 transition-all"
                style={{ width: `${Math.min(100, (simState.dataCollectedMb / 1000) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Payload: {mission.payload.selectedPayloadId}
            </p>
          </div>

          {/* Card 4: Sub-Satellite Ground Track */}
          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Activity size={14} className="text-sky-400" />
                SUB-SATELLITE
              </span>
              <span className="text-sky-300 font-bold">{simState.orbitalVelocityKmS} km/s</span>
            </div>
            <div className="text-[11px] text-slate-300 space-y-0.5">
              <div>Lat: <strong className="text-white">{simState.subSatelliteLatitude}°</strong></div>
              <div>Lon: <strong className="text-white">{simState.subSatelliteLongitude}°</strong></div>
            </div>
            <p className="text-[11px] text-slate-400">
              Alt: {simState.altitudeKm} km LEO
            </p>
          </div>
        </div>

        {/* Live Mission Events Console Log */}
        <div className="p-5 bg-[#081020]/95 border border-slate-800/90 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Radio size={16} className="text-sky-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white uppercase font-sans">
                LIVE ORBITAL TELEMETRY & EVENT STREAM
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">Showing last {eventLog.length} events</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-xs pr-2">
            {eventLog.map((evt) => (
              <div
                key={evt.id}
                className="p-2.5 bg-slate-900/60 border border-slate-800/60 rounded-xl flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-sky-400 font-bold">
                    {evt.type}
                  </span>
                  <span className="text-slate-300">{evt.description}</span>
                </div>
                <span className="text-slate-500 text-[11px] shrink-0">
                  {formatElapsedTime(evt.timestampSeconds)}
                </span>
              </div>
            ))}
          </div>
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

export default SimulationPage;
