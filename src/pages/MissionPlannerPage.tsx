import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDown,
  CheckCircle2,
  ChevronRight,
  Sprout,
  Waves,
  Mountain,
  CloudRain,
  AlertTriangle,
} from 'lucide-react';

import {
  MissionObjectiveId,
  MissionObjective,
  ObservationPriorities,
  MissionDurationId,
  PlannerDifficultyId,
} from '../types/planner';
import {
  MISSION_OBJECTIVES,
  OBSERVATION_TARGETS,
  MISSION_DURATIONS,
  PLANNER_DIFFICULTIES,
} from '../data/plannerConfig';

import UnifiedGameNav from '../components/navigation/UnifiedGameNav';
import UnifiedMissionGuideModal from '../components/navigation/UnifiedMissionGuideModal';
import SatelliteScene from '../components/spacecraft/SatelliteScene';
import EarthTargetMap from '../components/planner/EarthTargetMap';
import PrioritySliders from '../components/planner/PrioritySliders';
import MissionSummaryDossier from '../components/planner/MissionSummaryDossier';
import { useMission } from '../context/MissionContext';

export const MissionPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { mission, updatePlanner } = useMission();

  // Navigation and Guide Modal State
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Active Mission Planning Choices (hydrated from shared state)
  const [selectedObjectiveId, setSelectedObjectiveId] =
    useState<MissionObjectiveId>(mission.planner.objectiveId || 'vegetation-agriculture');

  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>(
    mission.planner.selectedTargetIds.length > 0
      ? mission.planner.selectedTargetIds
      : ['target-midwest', 'target-amazon']
  );

  const [priorities, setPriorities] = useState<ObservationPriorities>({
    resolutionPriority: 3,
    frequencyPriority: 3,
    scienceDataPriority: 3,
    coveragePriority: 3,
  });

  const [selectedDurationId, setSelectedDurationId] =
    useState<MissionDurationId>('12-months');

  const [selectedDifficultyId, setSelectedDifficultyId] =
    useState<PlannerDifficultyId>('engineer');

  // Resolved Configuration Objects
  const selectedObjective = useMemo(() => {
    return (
      MISSION_OBJECTIVES.find((o) => o.id === selectedObjectiveId) ||
      MISSION_OBJECTIVES[0]
    );
  }, [selectedObjectiveId]);

  // Contextual targets for selected objective + fallback to all
  const filteredTargets = useMemo(() => {
    return OBSERVATION_TARGETS.filter((t) =>
      t.compatibleObjectives.includes(selectedObjectiveId)
    );
  }, [selectedObjectiveId]);

  const activeSelectedTargetObjects = useMemo(() => {
    return OBSERVATION_TARGETS.filter((t) =>
      selectedTargetIds.includes(t.id)
    );
  }, [selectedTargetIds]);

  const selectedDuration = useMemo(() => {
    return (
      MISSION_DURATIONS.find((d) => d.id === selectedDurationId) ||
      MISSION_DURATIONS[2]
    );
  }, [selectedDurationId]);

  const selectedDifficulty = useMemo(() => {
    return (
      PLANNER_DIFFICULTIES.find((d) => d.id === selectedDifficultyId) ||
      PLANNER_DIFFICULTIES[1]
    );
  }, [selectedDifficultyId]);

  // Scroll Navigator
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Toggle Target Selection (up to 3 targets)
  const handleToggleTarget = (targetId: string) => {
    setSelectedTargetIds((prev) => {
      if (prev.includes(targetId)) {
        return prev.filter((id) => id !== targetId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, targetId];
    });
  };

  // Objective Change Handler (auto-suggest default targets)
  const handleSelectObjective = (obj: MissionObjective) => {
    setSelectedObjectiveId(obj.id);
    if (obj.suggestedTargetIds && obj.suggestedTargetIds.length > 0) {
      setSelectedTargetIds(obj.suggestedTargetIds.slice(0, 2));
    }
  };

  // Confirm and Navigate to Spacecraft Builder
  const handleConfirmMission = () => {
    updatePlanner({
      objectiveId: selectedObjective.id,
      selectedTargetIds,
      priorities,
      durationDays: selectedDuration.months * 30,
    });

    navigate('/planner', {
      state: {
        difficulty: selectedDifficultyId,
        target: selectedObjective.id,
        targetTitle: selectedObjective.title,
        plannerConfig: {
          objective: selectedObjective,
          selectedTargets: activeSelectedTargetObjects,
          priorities,
          duration: selectedDuration,
          difficulty: selectedDifficulty,
        },
        params: {
          budgetUSD: selectedDifficulty.budgetUSD,
          maxMassKg: selectedDifficulty.maxMassKg,
          minPowerWatts: selectedDifficulty.powerMarginW,
          difficultyRole: selectedDifficulty.role,
        },
      },
    });
  };

  // Objective Icon Resolver
  const renderObjectiveIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case 'Sprout':
        return <Sprout size={24} style={{ color }} />;
      case 'Waves':
        return <Waves size={24} style={{ color }} />;
      case 'Mountain':
        return <Mountain size={24} style={{ color }} />;
      case 'CloudRain':
        return <CloudRain size={24} style={{ color }} />;
      case 'AlertTriangle':
      default:
        return <AlertTriangle size={24} style={{ color }} />;
    }
  };

  // Stage Waypoints for Sticky Rail
  const stages = [
    { id: 'section-intro', label: 'Intro', num: '00' },
    { id: 'section-objective', label: 'Objective', num: '01' },
    { id: 'section-targets', label: 'Targets', num: '02' },
    { id: 'section-priorities', label: 'Priorities', num: '03' },
    { id: 'section-duration', label: 'Duration', num: '04' },
    { id: 'section-difficulty', label: 'Difficulty', num: '05' },
    { id: 'section-dossier', label: 'Summary', num: '06' },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#030712] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* 1. TOP FLOATING UNIFIED NAVIGATION (SHARED HUD)                            */}
      {/* ========================================================================= */}
      <UnifiedGameNav
        activeStage="01"
        onOpenGuide={() => setIsGuideOpen(true)}
        missionState={{
          difficulty: selectedDifficultyId,
          target: selectedObjective.id,
        }}
      />

      {/* Floating Tactical Waypoint Rail (Desktop Right Side) */}
      <nav
        aria-label="Planning Stage Navigation"
        className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 flex-col gap-2.5 bg-[#060c19]/80 backdrop-blur-xl p-2.5 rounded-full border border-slate-800/80 shadow-2xl"
      >
        {stages.map((stg) => (
          <button
            key={stg.id}
            onClick={() => scrollToSection(stg.id)}
            className="group flex items-center justify-end gap-2 p-1.5 rounded-full hover:bg-slate-800/70 transition-all cursor-pointer"
            title={stg.label}
          >
            <span className="hidden group-hover:inline-block text-[10px] font-mono font-bold tracking-wider text-slate-300 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              {stg.num}. {stg.label}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700 group-hover:bg-sky-400 group-hover:scale-125 transition-all" />
          </button>
        ))}
      </nav>

      {/* ========================================================================= */}
      {/* SECTION A – MISSION PLANNING INTRODUCTION (HERO VIEWPORT)                 */}
      {/* ========================================================================= */}
      <section
        id="section-intro"
        className="relative min-h-screen w-full flex flex-col justify-between pt-24 pb-12 px-5 sm:px-8 max-w-7xl mx-auto z-20"
      >
        {/* Fullscreen 3D Earth Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <SatelliteScene />
          {/* Edge Scrims */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/70 via-[#030712]/30 to-[#030712]/90 pointer-events-none" />
        </div>

        {/* Intro Hero Content */}
        <div className="relative z-10 max-w-2xl mt-12 sm:mt-16 space-y-5">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#060c19]/85 backdrop-blur-md border border-sky-800/60 shadow-xl font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-sky-300 font-bold uppercase tracking-wider">
              MISSION PLANNING DECK // STAGE 01
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">500 KM SSO CAMPAIGN</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-[1.05] font-sans">
            DEFINE YOUR<br />
            EARTH OBSERVATION<br />
            MISSION
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl">
            Configure your scientific objectives, target geographic corridors, sensor priorities, and operational lifetime. Every choice establishes the architectural requirements for your CubeSat spacecraft.
          </p>

          {/* Quick Metrics Tag */}
          <div className="pt-2 flex flex-wrap items-center gap-3 font-mono text-xs text-slate-400">
            <span className="px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800">
              MISSION CLASS: <strong className="text-white">CUBESAT 1U–3U</strong>
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800">
              ORBIT: <strong className="text-white">SUN-SYNCHRONOUS LEO</strong>
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800">
              CYCLE: <strong className="text-emerald-400">94 MIN / ORBIT</strong>
            </span>
          </div>

          {/* Call to Action */}
          <div className="pt-4 flex items-center gap-4">
            <button
              onClick={() => scrollToSection('section-objective')}
              className="group flex items-center gap-3 px-6 py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold font-mono text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-sky-950/50 cursor-pointer"
            >
              <span>BEGIN MISSION CONFIGURATION</span>
              <ArrowDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>

        </div>

        {/* Scroll Indicator at bottom */}
        <div className="relative z-10 flex flex-col items-center justify-center pt-8">
          <button
            onClick={() => scrollToSection('section-objective')}
            className="group flex flex-col items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-sky-400 transition-colors cursor-pointer"
          >
            <span className="uppercase tracking-widest text-[11px] font-semibold">
              SCROLL TO CONFIGURE OBJECTIVE
            </span>
            <ArrowDown size={14} className="animate-bounce text-sky-400" />
          </button>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* SECTION B – SELECT SCIENTIFIC OBJECTIVE                                    */}
      {/* ========================================================================= */}
      <section
        id="section-objective"
        className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-8 py-20 border-t border-slate-800/80 space-y-10"
      >
        {/* Section Heading */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs text-sky-400 font-semibold tracking-wider uppercase">
            <span className="w-1.5 h-3 bg-sky-400 rounded-xs" />
            <span>STEP 01 OF 06 // SCIENTIFIC MANDATE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-sans tracking-tight">
            SELECT PRIMARY SCIENTIFIC OBJECTIVE
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Choose the Earth system domain your CubeSat is chartered to observe. This selection determines your spectral filter requirements, ground track geometry, and science payload options.
          </p>
        </div>

        {/* 5 Objective Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MISSION_OBJECTIVES.map((obj) => {
            const isSelected = obj.id === selectedObjectiveId;
            return (
              <div
                key={obj.id}
                onClick={() => handleSelectObjective(obj)}
                className={`relative rounded-2xl border p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#08152e] border-sky-400 shadow-2xl shadow-sky-950/60 ring-2 ring-sky-400/40 -translate-y-1.5'
                    : 'bg-[#060c19]/85 backdrop-blur-xl border-slate-800/90 hover:border-slate-700 hover:bg-[#091224] hover:-translate-y-1'
                }`}
              >
                {/* Header Row */}
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center border"
                      style={{
                        backgroundColor: `${obj.colorAccent}15`,
                        borderColor: `${obj.colorAccent}40`,
                      }}
                    >
                      {renderObjectiveIcon(obj.iconName, obj.colorAccent)}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase"
                        style={{
                          color: obj.colorAccent,
                          backgroundColor: `${obj.colorAccent}15`,
                          borderColor: `${obj.colorAccent}30`,
                        }}
                      >
                        {obj.badge}
                      </span>
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-sky-500 text-slate-950 border-sky-400'
                            : 'border-slate-700 bg-slate-900/60 text-transparent'
                        }`}
                      >
                        <CheckCircle2 size={14} className={isSelected ? 'text-slate-950' : 'opacity-0'} />
                      </span>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-lg font-black text-white uppercase font-sans tracking-tight mb-2">
                    {obj.title}
                  </h3>
                  <p className="text-xs text-sky-300/90 font-medium mb-3">
                    {obj.tagline}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {obj.description}
                  </p>
                </div>

                {/* Scientific Importance & Purpose */}
                <div className="pt-4 border-t border-slate-800/80 space-y-2.5 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-mono block text-[10px] uppercase">
                      WHY IT MATTERS:
                    </span>
                    <span className="text-slate-300 leading-snug">
                      {obj.scientificImportance}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-mono block text-[10px] uppercase">
                      EXAMPLE MISSION GOAL:
                    </span>
                    <span className="text-amber-300/90 leading-snug font-mono text-[10px]">
                      {obj.examplePurpose}
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-between font-mono text-[10px] text-slate-400">
                    <span>SENSOR TYPE:</span>
                    <span className="text-sky-300 font-semibold">{obj.suggestedSensor}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Section Advance Trigger */}
        <div className="pt-4 flex justify-end">
          <button
            onClick={() => scrollToSection('section-targets')}
            className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 hover:text-white transition-colors cursor-pointer py-2 px-4 rounded-lg hover:bg-slate-900"
          >
            <span>PROCEED TO TARGET REGIONS</span>
            <ChevronRight size={14} />
          </button>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* SECTION C – SELECT OBSERVATION TARGETS                                    */}
      {/* ========================================================================= */}
      <section
        id="section-targets"
        className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-8 py-20 border-t border-slate-800/80 space-y-8"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs text-sky-400 font-semibold tracking-wider uppercase">
            <span className="w-1.5 h-3 bg-sky-400 rounded-xs" />
            <span>STEP 02 OF 06 // OBSERVATION SITES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-sans tracking-tight">
            SELECT GROUND OBSERVATION TARGETS
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Assign up to 3 priority geographic test sites aligned with{' '}
            <strong className="text-white">{selectedObjective.title}</strong>. Your satellite will calibrate exposure and downlink buffers over these locations.
          </p>
        </div>

        {/* Earth Target Map Console Component */}
        <EarthTargetMap
          targets={filteredTargets}
          selectedTargetIds={selectedTargetIds}
          onToggleTarget={handleToggleTarget}
          maxTargets={3}
        />

        {/* Section Advance Trigger */}
        <div className="pt-4 flex justify-between items-center">
          <button
            onClick={() => scrollToSection('section-objective')}
            className="text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ← BACK TO OBJECTIVES
          </button>
          <button
            onClick={() => scrollToSection('section-priorities')}
            className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 hover:text-white transition-colors cursor-pointer py-2 px-4 rounded-lg hover:bg-slate-900"
          >
            <span>PROCEED TO SENSOR PRIORITIES</span>
            <ChevronRight size={14} />
          </button>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* SECTION D – OBSERVATION PRIORITIES                                        */}
      {/* ========================================================================= */}
      <section
        id="section-priorities"
        className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-8 py-20 border-t border-slate-800/80 space-y-8"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs text-sky-400 font-semibold tracking-wider uppercase">
            <span className="w-1.5 h-3 bg-sky-400 rounded-xs" />
            <span>STEP 03 OF 06 // MEASUREMENT PRIORITIES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-sans tracking-tight">
            CALIBRATE OBSERVATION & SENSOR PRIORITIES
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Adjust the operational tradeoffs between spatial resolution, revisit cadence, spectral band depth, and coverage footprint. Higher settings increase telemetry volume and power consumption.
          </p>
        </div>

        {/* Priority Sliders Component */}
        <PrioritySliders priorities={priorities} onChange={setPriorities} />

        {/* Section Advance Trigger */}
        <div className="pt-4 flex justify-between items-center">
          <button
            onClick={() => scrollToSection('section-targets')}
            className="text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ← BACK TO TARGETS
          </button>
          <button
            onClick={() => scrollToSection('section-duration')}
            className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 hover:text-white transition-colors cursor-pointer py-2 px-4 rounded-lg hover:bg-slate-900"
          >
            <span>PROCEED TO MISSION LIFETIME</span>
            <ChevronRight size={14} />
          </button>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* SECTION E – MISSION DURATION                                              */}
      {/* ========================================================================= */}
      <section
        id="section-duration"
        className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-8 py-20 border-t border-slate-800/80 space-y-8"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs text-sky-400 font-semibold tracking-wider uppercase">
            <span className="w-1.5 h-3 bg-sky-400 rounded-xs" />
            <span>STEP 04 OF 06 // OPERATIONAL LIFETIME</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-sans tracking-tight">
            SELECT MISSION DURATION & ORBITAL LIFESPAN
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Choose the expected operational duration in Low Earth Orbit. Longer missions generate more comprehensive science baselines but face cumulative cosmic radiation and battery thermal fatigue.
          </p>
        </div>

        {/* 4 Duration Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MISSION_DURATIONS.map((dur) => {
            const isSelected = dur.id === selectedDurationId;
            return (
              <div
                key={dur.id}
                onClick={() => setSelectedDurationId(dur.id)}
                className={`relative rounded-xl border p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#09152a] border-amber-400 shadow-xl shadow-amber-950/40 ring-1 ring-amber-400/40 -translate-y-1'
                    : 'bg-[#060c19]/80 border-slate-800 hover:border-slate-700 hover:bg-[#081224]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                      {dur.days} DAYS IN LEO
                    </span>
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                          : 'border-slate-700 bg-slate-900/60'
                      }`}
                    >
                      <CheckCircle2 size={12} className={isSelected ? 'text-slate-950' : 'opacity-0'} />
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white uppercase font-sans mb-1">
                    {dur.title}
                  </h4>
                  <p className="text-xs text-slate-300 font-medium mb-3">
                    {dur.subtitle}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {dur.gameTradeoffs}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-1.5 font-mono text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">RAD EXPOSURE:</span>
                    <span
                      className={
                        dur.radiationExposure === 'Low'
                          ? 'text-emerald-400'
                          : dur.radiationExposure === 'Moderate'
                          ? 'text-sky-300'
                          : 'text-amber-400'
                      }
                    >
                      {dur.radiationExposure}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">BATTERY CYCLES:</span>
                    <span className="text-slate-200">{dur.batteryCycles}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ORBIT DECAY:</span>
                    <span className="text-slate-200">{dur.orbitalDecayRisk}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Section Advance Trigger */}
        <div className="pt-4 flex justify-between items-center">
          <button
            onClick={() => scrollToSection('section-priorities')}
            className="text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ← BACK TO PRIORITIES
          </button>
          <button
            onClick={() => scrollToSection('section-difficulty')}
            className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 hover:text-white transition-colors cursor-pointer py-2 px-4 rounded-lg hover:bg-slate-900"
          >
            <span>PROCEED TO CONSTRAINT DIFFICULTY</span>
            <ChevronRight size={14} />
          </button>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* SECTION F – MISSION DIFFICULTY                                            */}
      {/* ========================================================================= */}
      <section
        id="section-difficulty"
        className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-8 py-20 border-t border-slate-800/80 space-y-8"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs text-sky-400 font-semibold tracking-wider uppercase">
            <span className="w-1.5 h-3 bg-sky-400 rounded-xs" />
            <span>STEP 05 OF 06 // AGENCY CONSTRAINTS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-sans tracking-tight">
            SELECT FLIGHT DIFFICULTY TIER
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Your flight agency difficulty sets the financial capital, maximum launch mass, and power margins available when you assemble components in the Spacecraft Builder.
          </p>
        </div>

        {/* 3 Difficulty Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANNER_DIFFICULTIES.map((diff) => {
            const isSelected = diff.id === selectedDifficultyId;
            return (
              <div
                key={diff.id}
                onClick={() => setSelectedDifficultyId(diff.id)}
                className={`relative rounded-2xl border p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#09152a] border-sky-400 shadow-2xl shadow-sky-950/60 ring-2 ring-sky-400/40 -translate-y-1'
                    : 'bg-[#060c19]/80 border-slate-800 hover:border-slate-700 hover:bg-[#081224]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded"
                      style={{
                        color: diff.color,
                        backgroundColor: `${diff.color}15`,
                        borderColor: `${diff.color}40`,
                      }}
                    >
                      {diff.label}
                    </span>
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        isSelected
                          ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold'
                          : 'border-slate-700 bg-slate-900/60'
                      }`}
                    >
                      <CheckCircle2 size={12} className={isSelected ? 'text-slate-950' : 'opacity-0'} />
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white uppercase font-sans mb-1">
                    {diff.role}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {diff.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center p-2 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400 text-[11px]">FUNDING CAP:</span>
                    <span className="text-emerald-400 font-bold">
                      ${(diff.budgetUSD / 1000000).toFixed(1)}M USD
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400 text-[11px]">MAX MASS:</span>
                    <span className="text-amber-400 font-bold">{diff.maxMassKg} kg</span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400 text-[11px]">MIN POWER MARGIN:</span>
                    <span className="text-sky-300 font-bold">≥ {diff.powerMarginW} W</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Section Advance Trigger */}
        <div className="pt-4 flex justify-between items-center">
          <button
            onClick={() => scrollToSection('section-duration')}
            className="text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ← BACK TO DURATION
          </button>
          <button
            onClick={() => scrollToSection('section-dossier')}
            className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 hover:text-white transition-colors cursor-pointer py-2 px-4 rounded-lg hover:bg-slate-900"
          >
            <span>REVIEW FINAL MISSION DOSSIER</span>
            <ChevronRight size={14} />
          </button>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* SECTION G – MISSION CONFIGURATION SUMMARY DOSSIER                          */}
      {/* ========================================================================= */}
      <section
        id="section-dossier"
        className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-8 py-20 border-t border-slate-800/80 space-y-8"
      >
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-sky-400 font-semibold tracking-wider uppercase">
            <span className="w-1.5 h-3 bg-sky-400 rounded-xs" />
            <span>FINAL STAGE // MISSION AUTHORIZATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase font-sans tracking-tight">
            MISSION PLANNING SUMMARY DOSSIER
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Review your configured Earth-observation mission parameters. Once confirmed, your flight envelope is locked and initialized in the Spacecraft Engineering Bay.
          </p>
        </div>

        {/* Dossier Component */}
        <MissionSummaryDossier
          objective={selectedObjective}
          selectedTargets={activeSelectedTargetObjects}
          priorities={priorities}
          duration={selectedDuration}
          difficulty={selectedDifficulty}
          onConfirm={handleConfirmMission}
          onRevise={() => scrollToSection('section-objective')}
        />

      </section>

      {/* Tactical Footer */}
      <footer className="relative z-20 w-full py-4 px-6 border-t border-slate-800/60 bg-[#02050e]/95 text-[10px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>NASA SPACE APPS CHALLENGE 2026 • MASTERX SYSTEM</span>
        <span>STAGE 01 // MISSION PLANNER ACTIVE • PRESERVING ARCHITECTURE CONTRACTS</span>
      </footer>

      {/* Operations Manual Modal */}
      <UnifiedMissionGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        selectedDifficulty={selectedDifficultyId === 'cadet' ? 'easy' : selectedDifficultyId === 'commander' ? 'hard' : 'normal'}
        selectedTargetId={selectedObjectiveId === 'vegetation-agriculture' ? 'vegetation' : selectedObjectiveId === 'ocean-observation' ? 'coastal' : 'atmosphere'}
      />

    </div>
  );
};

export default MissionPlannerPage;
