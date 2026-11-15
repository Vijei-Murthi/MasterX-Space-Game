import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  X,
  ChevronDown,
  ChevronRight,
  Info,
  DollarSign,
  Weight,
  Zap,
  Battery,
  HardDrive,
  Clock,
  Radio,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import {
  DIFFICULTY_PRESETS,
  SCIENTIFIC_TARGETS,
  getFlightParameters,
  getEngineeringConstraints,
  getEngineeringHint,
} from '../data/briefingConfig';
import {
  MissionDifficulty,
  ScientificTargetId,
  FlightParameterItem,
} from '../types/briefing';
import SatelliteScene from '../components/spacecraft/SatelliteScene';
import Button from '../components/ui/Button';
import UnifiedGameNav from '../components/navigation/UnifiedGameNav';
import UnifiedMissionGuideModal from '../components/navigation/UnifiedMissionGuideModal';
import EarthToMarsCinematicTransition from '../components/cinematic/EarthToMarsCinematicTransition';
import { useMission } from '../context/MissionContext';

/**
 * Lightweight scroll intersection hook that triggers once when a section enters the viewport.
 * Prevents jittery re-triggering during small scroll adjustments.
 */
function useScrollIntersection(threshold = 0.12) {
  const [hasEntered, setHasEntered] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasEntered || !elementRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [hasEntered, threshold]);

  return [elementRef, hasEntered] as const;
}

export const MissionBriefingPage: React.FC = () => {
  const navigate = useNavigate();
  const { mission, updateBriefing } = useMission();

  // Active game choices (hydrated from shared state)
  const [selectedDifficulty, setSelectedDifficulty] = useState<MissionDifficulty>(
    mission.briefing.difficulty || 'normal'
  );
  const [selectedTargetId, setSelectedTargetId] = useState<ScientificTargetId>(
    mission.briefing.targetId || 'coastal'
  );
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Interactive parameter inspection modal state
  const [inspectedParam, setInspectedParam] = useState<FlightParameterItem | null>(null);

  // Scroll entrance animation observers
  const [paramsSectionRef, paramsEntered] = useScrollIntersection(0.08);
  const [constraintsSectionRef, constraintsEntered] = useScrollIntersection(0.1);
  const [challengeSectionRef, challengeEntered] = useScrollIntersection(0.12);

  const currentParams = DIFFICULTY_PRESETS[selectedDifficulty];
  const currentTarget = SCIENTIFIC_TARGETS.find((t) => t.id === selectedTargetId) || SCIENTIFIC_TARGETS[0];

  // Dynamic parameters and checks computed from active choices
  const flightParameters = useMemo(() => {
    return getFlightParameters(currentParams, currentTarget);
  }, [currentParams, currentTarget]);

  const engineeringConstraints = useMemo(() => {
    return getEngineeringConstraints(currentParams);
  }, [currentParams]);

  const engineeringHint = useMemo(() => {
    return getEngineeringHint(selectedTargetId, selectedDifficulty);
  }, [selectedTargetId, selectedDifficulty]);

  const handleBeginMission = () => {
    setIsTransitioning(true);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Parameter Icon Resolver
  const getParamIcon = (id: string) => {
    switch (id) {
      case 'param-budget':
        return <DollarSign size={14} className="text-emerald-400" />;
      case 'param-mass':
        return <Weight size={14} className="text-amber-400" />;
      case 'param-power':
        return <Zap size={14} className="text-sky-400" />;
      case 'param-battery':
        return <Battery size={14} className="text-indigo-400" />;
      case 'param-storage':
        return <HardDrive size={14} className="text-purple-400" />;
      case 'param-lifetime':
        return <Clock size={14} className="text-slate-300" />;
      case 'param-altitude':
      case 'param-inclination':
        return <Compass size={14} className="text-amber-300" />;
      case 'param-comms':
        return <Radio size={14} className="text-sky-300" />;
      case 'param-throughput':
      default:
        return <BarChart3 size={14} className="text-emerald-300" />;
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030712] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* 1. CINEMATIC 3D BACKGROUND (Live 3D Earth & Orbiting CubeSat in Space)     */}
      {/* ========================================================================= */}
      <SatelliteScene />

      {/* Subtle edge scrims — keeps Earth and spacecraft visually dominant */}
      <div className="fixed top-0 inset-x-0 h-24 bg-gradient-to-b from-[#030712]/70 via-[#030712]/20 to-transparent pointer-events-none z-[1]" />
      <div className="fixed bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#030712]/80 via-[#030712]/25 to-transparent pointer-events-none z-[1]" />
      <div className="fixed top-0 bottom-0 left-0 w-80 sm:w-96 bg-gradient-to-r from-[#030712]/45 via-[#030712]/15 to-transparent pointer-events-none z-[1]" />

      {/* ========================================================================= */}
      {/* 2. UNIFIED FLOATING HUD NAVIGATION (EXCALIDRAW SPECIFICATION)              */}
      {/* ========================================================================= */}
      <UnifiedGameNav
        activeStage="01"
        onOpenGuide={() => setIsGuideOpen(true)}
        missionState={{
          difficulty: selectedDifficulty,
          target: selectedTargetId,
          params: currentParams,
        }}
      />

      {/* ========================================================================= */}
      {/* 3. HERO VIEWPORT: MISSION IDENTITY & STAGING INTERFACE                     */}
      {/* ========================================================================= */}
      <section className="relative z-20 min-h-screen w-full max-w-7xl mx-auto px-5 sm:px-8 pt-24 pb-8 flex flex-col justify-between">
        
        {/* Upper HUD Row: Left Staging Deck & Right Minimal Telemetry */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
          
          {/* ==================== LEFT HUD: MISSION IDENTITY & CONTROLS ==================== */}
          <div className="w-full lg:w-[410px] shrink-0 bg-[#060c19]/80 backdrop-blur-md border border-slate-800/80 rounded-xl p-5 shadow-2xl space-y-4">
            
            {/* Mission Designation Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                <span className="text-[11px] font-mono tracking-widest text-sky-400 uppercase font-semibold">
                  MISSION 01 • CUBESAT PROGRAM
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                500 KM SSO
              </span>
            </div>

            {/* Mission Title & Short Objective */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase leading-none font-sans">
                CUBESAT EARTH<br />OBSERVATION
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                Design and deploy a CubeSat to observe Earth's changing environment.
              </p>
            </div>

            {/* Interactive Observation Target Selector */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400 uppercase tracking-wider">OBSERVATION TARGET:</span>
                <span className="text-sky-400 font-semibold">{currentTarget.category}</span>
              </div>

              <div className="space-y-1.5">
                {SCIENTIFIC_TARGETS.map((target) => {
                  const isSelected = target.id === selectedTargetId;
                  return (
                    <button
                      key={target.id}
                      onClick={() => setSelectedTargetId(target.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer border flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-900/95 border-sky-400 text-white shadow-md ring-1 ring-sky-500/30'
                          : 'bg-slate-950/60 border-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isSelected ? 'bg-sky-400' : 'bg-slate-700'
                          }`}
                        />
                        <div className="truncate">
                          <div className="text-xs font-semibold text-slate-100 truncate">
                            {target.title}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 truncate">
                            {target.payloadType}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase shrink-0 border ml-2 ${
                          isSelected
                            ? 'bg-sky-500/20 text-sky-300 border-sky-400/40 font-bold'
                            : 'bg-slate-900/60 text-slate-500 border-slate-800'
                        }`}
                      >
                        {isSelected ? 'ACTIVE' : 'SELECT'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Difficulty Switcher */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                <span>DIFFICULTY TIER:</span>
                <span className="text-white font-bold">{currentParams.difficultyRole}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['easy', 'normal', 'hard'] as MissionDifficulty[]).map((diff) => {
                  const preset = DIFFICULTY_PRESETS[diff];
                  const isSelected = selectedDifficulty === diff;
                  return (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`py-2 px-1 text-center rounded transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-sky-500/20 border-sky-400 text-white font-bold shadow-sm'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="text-[11px] font-bold uppercase">{preset.difficultyLabel}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        ${(preset.budgetUSD / 1000000).toFixed(1)}M
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Solid Action Button */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleBeginMission}
                className="w-full flex items-center justify-center gap-2 py-3 font-bold tracking-wider shadow-lg"
              >
                <span>INITIALIZE SPACECRAFT DESIGN</span>
                <ArrowRight size={15} />
              </Button>
            </div>

          </div>

          {/* ==================== RIGHT HUD: MINIMAL TACTICAL TELEMETRY ==================== */}
          <div className="hidden lg:flex flex-col items-end gap-3 text-right pointer-events-none select-none">
            {/* Live Orbit Status Card */}
            <div className="bg-[#060c19]/75 backdrop-blur-xl border border-slate-800/80 rounded-xl px-4 py-3 shadow-2xl space-y-1.5 max-w-xs">
              <div className="flex items-center justify-end gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono tracking-wider text-emerald-400 uppercase font-bold">
                  ORBITAL TELEMETRY ACTIVE
                </span>
              </div>
              <div className="text-xs font-bold text-white uppercase font-sans">
                500 KM SUN-SYNCHRONOUS
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Real-time orbit propagation around Earth. Solar illumination calibrated for optical sensors.
              </p>
            </div>

            {/* Scientific Target Card */}
            <div className="bg-[#060c19]/75 backdrop-blur-xl border border-slate-800/80 rounded-xl px-4 py-2.5 shadow-2xl font-mono text-[11px] space-y-1 max-w-xs text-left">
              <div className="flex items-center justify-between text-slate-400">
                <span>TARGET SENSOR:</span>
                <span className="text-sky-300 font-semibold">{currentTarget.spectralBand}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>REVISIT FREQUENCY:</span>
                <span className="text-amber-400 font-semibold">14 ORBITS / DAY</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>COMM LINK:</span>
                <span className="text-emerald-400 font-semibold">S-BAND CARRIER LOCK</span>
              </div>
            </div>
          </div>

        </div>

        {/* Lower Viewport: Scroll Invitation Prompt */}
        <div className="pt-8 pb-3 flex flex-col items-center justify-center">
          <button
            onClick={() => scrollToSection('flight-parameters')}
            className="group flex flex-col items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-sky-400 transition-colors cursor-pointer"
          >
            <span className="tracking-widest uppercase text-[11px] font-semibold flex items-center gap-1.5">
              <span>EXPLORE FLIGHT PARAMETERS & ENGINEERING CONSTRAINTS</span>
              <ChevronDown size={14} className="animate-bounce text-sky-400" />
            </span>
            <span className="text-[10px] text-slate-500 font-sans">
              Scroll down to inspect all 10 spacecraft requirements
            </span>
          </button>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION: FLIGHT PARAMETERS (FULL-WIDTH BELOW-THE-FOLD HUD)             */}
      {/* ========================================================================= */}
      <section
        id="flight-parameters"
        ref={paramsSectionRef}
        className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-8 py-12 border-t border-slate-800/60"
      >
        {/* Section Heading with entrance fade */}
        <div
          className={`space-y-1.5 mb-8 transition-all duration-700 ease-out ${
            paramsEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-xs bg-sky-500" />
            <span className="text-[11px] font-mono tracking-widest text-sky-400 uppercase font-semibold">
              MISSION SYSTEM CONSTRAINTS // STEP 01
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-sans">
                FLIGHT PARAMETERS
              </h2>
              <p className="text-slate-300 text-sm mt-1 max-w-xl">
                Your spacecraft mission constraints — configured for{' '}
                <strong className="text-white font-semibold">
                  {currentParams.difficultyLabel} ({currentParams.difficultyRole})
                </strong>{' '}
                tier and targeting{' '}
                <strong className="text-sky-300 font-semibold">{currentTarget.title}</strong>.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-[#060c19]/90 px-3 py-1.5 rounded-md border border-slate-800">
              <Sparkles size={13} className="text-sky-400" />
              <span>CLICK ANY PARAMETER FOR ENGINEERING ANALYSIS</span>
            </div>
          </div>
        </div>

        {/* 10 Interactive Parameter Cards Grid with Staggered Entrance & Gaming Hover */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {flightParameters.map((param, idx) => {
            return (
              <div
                key={param.id}
                onClick={() => setInspectedParam(param)}
                style={{
                  transitionDelay: `${idx * 40}ms`,
                }}
                className={`group relative p-4 rounded-xl border bg-[#060c19]/80 backdrop-blur-md cursor-pointer transition-all duration-300 ease-out flex flex-col justify-between ${
                  paramsEntered
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-6'
                } hover:-translate-y-1.5 hover:bg-[#0c1830]/95 hover:border-sky-500/60 hover:shadow-xl border-slate-800/80`}
              >
                {/* Top Label & Icon */}
                <div>
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      #{param.num}
                    </span>
                    <div className="w-6 h-6 rounded flex items-center justify-center bg-slate-900 border border-slate-800 group-hover:border-sky-500/40 transition-colors">
                      {getParamIcon(param.id)}
                    </div>
                  </div>
                  
                  <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400 block font-semibold">
                    {param.label}
                  </span>

                  {/* Primary Metric Value */}
                  <div className="mt-2 mb-1">
                    <span className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight group-hover:text-sky-300 transition-colors">
                      {param.value}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">
                      {param.unit}
                    </span>
                  </div>
                </div>

                {/* Contextual Gaming Tooltip / Subtitle on Hover */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/70 text-[11px] text-slate-400 leading-snug group-hover:text-slate-200 transition-colors">
                  <p className="line-clamp-2">
                    {param.hoverTooltip}
                  </p>
                  <span className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-sky-400 opacity-80 group-hover:opacity-100 font-semibold">
                    <span>INSPECT SPEC</span>
                    <ChevronRight size={11} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 5. SECTION: MISSION ENGINEERING CONSTRAINTS (PASS / WARNING / FAIL)       */}
      {/* ========================================================================= */}
      <section
        ref={constraintsSectionRef}
        className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-8 py-10"
      >
        <div
          className={`space-y-1 mb-6 transition-all duration-700 ease-out ${
            constraintsEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-xs bg-amber-500" />
            <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase font-semibold">
              SYSTEM VALIDATION CRITERIA
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white uppercase font-sans">
            MISSION ENGINEERING CONSTRAINTS
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm">
            Core flight readiness checks evaluated against the selected orbital insertion and deployer envelope.
          </p>
        </div>

        {/* 7 Constraint Cards List */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 transition-all duration-700 delay-100 ease-out ${
            constraintsEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {engineeringConstraints.map((chk) => {
            const isPass = chk.status === 'PASS';
            const isWarning = chk.status === 'WARNING';

            return (
              <div
                key={chk.id}
                className="p-4 rounded-xl border bg-[#060c19]/80 backdrop-blur-md border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white font-mono uppercase">
                      {chk.label}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                        isPass
                          ? 'bg-emerald-950/70 border-emerald-800 text-emerald-400'
                          : isWarning
                          ? 'bg-amber-950/70 border-amber-800 text-amber-400'
                          : 'bg-red-950/70 border-red-800 text-red-400'
                      }`}
                    >
                      {chk.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {chk.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">{chk.threshold}</span>
                  <span className="text-sky-300 font-semibold">{chk.metric}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SECTION: ENGINEERING CHALLENGE (GAMEPLAY FEEDBACK & MISSION GOAL)     */}
      {/* ========================================================================= */}
      <section
        ref={challengeSectionRef}
        className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-8 py-10"
      >
        <div
          className={`p-6 sm:p-8 rounded-2xl border bg-[#070e1e]/90 backdrop-blur-md border-sky-900/60 shadow-2xl transition-all duration-700 ease-out ${
            challengeEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  MISSION OBJECTIVE CHALLENGE
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white uppercase font-sans leading-tight">
                CAN YOU CONFIGURE A CUBESAT THAT SURVIVES 500 KM SUN-SYNCHRONOUS ORBIT?
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                Your spacecraft must remain strictly within the{' '}
                <strong className="text-amber-400 font-mono font-semibold">
                  {currentParams.maxMassKg} kg
                </strong>{' '}
                mass limit and{' '}
                <strong className="text-emerald-400 font-mono font-semibold">
                  ${(currentParams.budgetUSD / 1000000).toFixed(1)}M
                </strong>{' '}
                budget cap, while generating at least{' '}
                <strong className="text-sky-300 font-mono font-semibold">
                  {currentParams.minPowerWatts}W
                </strong>{' '}
                of daylight power to operate its{' '}
                <strong className="text-white font-semibold">{currentTarget.title}</strong>{' '}
                payload.
              </p>

              {/* Tactical Hint */}
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-start gap-2.5 text-xs text-slate-300">
                <Info size={16} className="text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-mono block text-[11px] mb-0.5">
                    TACTICAL ENGINEERING HINT:
                  </strong>
                  <span>{engineeringHint}</span>
                </div>
              </div>
            </div>

            {/* Right: Challenge Progress Metric & CTA */}
            <div className="w-full lg:w-auto shrink-0 flex flex-col items-center lg:items-end gap-3 p-5 bg-[#040812]/90 border border-slate-800 rounded-xl">
              <div className="text-center lg:text-right font-mono">
                <span className="text-[10px] text-slate-400 uppercase block">
                  CONSTRAINTS SATISFIED:
                </span>
                <span className="text-2xl font-black text-emerald-400">
                  {selectedDifficulty === 'hard' ? '5 / 7 PASS' : '7 / 7 PASS'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {selectedDifficulty === 'hard' ? '2 TIGHT TOLERANCE WARNINGS' : 'ALL BASELINES NOMINAL'}
                </span>
              </div>

              {/* Mini visual indicator bar */}
              <div className="w-full sm:w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: selectedDifficulty === 'hard' ? '75%' : '100%' }}
                />
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleBeginMission}
                className="w-full sm:w-auto flex items-center justify-center gap-2 font-bold uppercase tracking-wider py-3 px-6 shadow-xl"
              >
                <span>ENTER SPACECRAFT BUILDER</span>
                <ArrowRight size={15} />
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. PARAMETER DETAIL MODAL (CLICK-TO-EXPAND AEROSPACE ANALYSIS)             */}
      {/* ========================================================================= */}
      {inspectedParam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#070e1e] border border-slate-700/80 rounded-2xl shadow-2xl p-6 space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-slate-900 border border-slate-700 flex items-center justify-center">
                  {getParamIcon(inspectedParam.id)}
                </div>
                <div>
                  <span className="text-[10px] font-mono text-sky-400 font-bold block uppercase tracking-wider">
                    PARAMETER SPECIFICATION #{inspectedParam.num}
                  </span>
                  <h3 className="text-base font-bold text-white uppercase font-sans">
                    {inspectedParam.label}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setInspectedParam(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close parameter inspection"
              >
                <X size={16} />
              </button>
            </div>

            {/* Value Readout Tag */}
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between font-mono">
              <span className="text-xs text-slate-400">CONFIGURED VALUE:</span>
              <div className="text-right">
                <span className="text-xl font-black text-white">{inspectedParam.value}</span>
                <span className="text-[10px] text-slate-500 ml-1.5 uppercase">{inspectedParam.unit}</span>
              </div>
            </div>

            {/* 4 Detailed Breakdown Sections */}
            <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed max-h-[380px] overflow-y-auto pr-1">
              
              <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
                <strong className="text-white font-mono block text-[11px] mb-1">
                  1. WHAT THIS PARAMETER MEANS:
                </strong>
                <p className="text-slate-300">{inspectedParam.meaning}</p>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
                <strong className="text-sky-300 font-mono block text-[11px] mb-1">
                  2. WHY IT MATTERS FOR EARTH OBSERVATION:
                </strong>
                <p className="text-slate-300">{inspectedParam.whyItMatters}</p>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
                <strong className="text-amber-400 font-mono block text-[11px] mb-1">
                  3. WHAT HAPPENS IF EXCEEDED:
                </strong>
                <p className="text-slate-300">{inspectedParam.ifExceeded}</p>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
                <strong className="text-emerald-400 font-mono block text-[11px] mb-1">
                  4. HOW TO OPTIMIZE IN PHASE 02:
                </strong>
                <p className="text-slate-300">{inspectedParam.howToImprove}</p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">
                CATEGORY: {inspectedParam.category} • NASA STANDARDS COMPLIANT
              </span>
              <button
                onClick={() => setInspectedParam(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer"
              >
                CLOSE INSPECTION
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Subtle bottom ticker */}
      <footer className="relative z-20 w-full py-2 px-6 border-t border-slate-800/40 bg-[#02050e]/90 text-[10px] font-mono text-slate-500 flex justify-between">
        <span>NASA SPACE APPS CHALLENGE 2026 • MASTERX SYSTEM</span>
        <span>STAGE 01 / 06 BRIEFING COMPLETE • READY FOR CHASSIS DESIGN</span>
      </footer>

      {/* ========================================================================= */}
      {/* 5. UNIFIED MISSION OPERATIONS GUIDE MODAL                                 */}
      {/* ========================================================================= */}
      <UnifiedMissionGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        selectedDifficulty={selectedDifficulty}
        selectedTargetId={selectedTargetId}
      />

      {/* ========================================================================= */}
      {/* 6. CINEMATIC 3D EARTH-TO-MARS TRANSITION SEQUENCE                         */}
      {/* ========================================================================= */}
      {isTransitioning && (
        <EarthToMarsCinematicTransition
          onComplete={() => {
            updateBriefing({
              difficulty: selectedDifficulty,
              targetId: selectedTargetId,
              budgetUSD: currentParams.budgetUSD,
              maxMassKg: currentParams.maxMassKg,
              batteryReserveWh: currentParams.batteryReserveWh,
              minPowerWatts: currentParams.minPowerWatts,
            });

            navigate('/planner', {
              state: {
                difficulty: selectedDifficulty,
                target: selectedTargetId,
                params: currentParams,
              },
            });
          }}
          targetName={currentTarget.title}
          difficultyLabel={currentParams.difficultyLabel}
        />
      )}

    </div>
  );
};

export default MissionBriefingPage;