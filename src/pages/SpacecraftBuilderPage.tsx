import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Compass,
  CheckCircle2,
  Box,
  Zap,
  Battery,
  Radio,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  Sliders,
  DollarSign,
  Weight,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import {
  COMPONENT_CATEGORIES,
  COMPONENT_CATALOGUE,
  DEFAULT_SELECTED_COMPONENTS,
} from '../data/builderCatalogue';
import {
  ComponentCategory,
  SelectedSpacecraftComponents,
  SpacecraftComponent,
} from '../types/builder';
import SpacecraftMoonScene from '../components/spacecraft/SpacecraftMoonScene';
import Button from '../components/ui/Button';
import UnifiedGameNav from '../components/navigation/UnifiedGameNav';
import UnifiedMissionGuideModal from '../components/navigation/UnifiedMissionGuideModal';
import { useMission } from '../context/MissionContext';

/**
 * Lightweight scroll intersection hook that triggers once when a section enters the viewport.
 */
function useScrollIntersection(threshold = 0.1) {
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

export const SpacecraftBuilderPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mission, updateSpacecraft } = useMission();

  // Retrieve Briefing handoff state (difficulty, target, budget/mass limits)
  const briefingState = (location.state || {}) as {
    difficulty?: string;
    target?: string;
    params?: {
      budgetUSD?: number;
      maxMassKg?: number;
      minPowerWatts?: number;
      difficultyRole?: string;
      batteryReserveWh?: number;
    };
  };

  // Base constraints from Briefing / Shared State (with defaults if entered directly)
  const budgetCapUSD = briefingState.params?.budgetUSD || mission.briefing.budgetUSD || 1800000;
  const massLimitKg = briefingState.params?.maxMassKg || mission.briefing.maxMassKg || 8.0;
  const targetLabel = (briefingState.target || mission.briefing.targetId || 'COASTAL WATERS').toUpperCase();

  // Active player component selections (hydrated from shared state)
  const [selectedComponents, setSelectedComponents] = useState<SelectedSpacecraftComponents>(
    mission.spacecraft || DEFAULT_SELECTED_COMPONENTS
  );

  // Active category tab in the selection deck
  const [activeCategory, setActiveCategory] = useState<ComponentCategory>('structure');

  // Currently inspected component for the details panel
  const [inspectedComponentId, setInspectedComponentId] = useState<string>(
    DEFAULT_SELECTED_COMPONENTS.structure
  );

  // Expandable educational deep-dive state
  const [isEducationExpanded, setIsEducationExpanded] = useState<boolean>(true);

  // Floating catalogue collapse state (allows full 3D view)
  const [isCatalogueOpen, setIsCatalogueOpen] = useState<boolean>(true);

  // Single Mission Guide modal state
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Stage gate modal state (for Phase 03 handoff)
  const [isStageGateOpen, setIsStageGateOpen] = useState<boolean>(false);

  // Scroll entrance observers
  const [telemetrySectionRef, telemetryEntered] = useScrollIntersection(0.08);
  const [parametersSectionRef, parametersEntered] = useScrollIntersection(0.08);
  const [inspectionSectionRef, inspectionEntered] = useScrollIntersection(0.08);

  // Lookup selected component objects
  const selectedComponentObjects = useMemo(() => {
    return Object.entries(selectedComponents).map(([cat, compId]) => {
      return (
        COMPONENT_CATALOGUE.find((c) => c.id === compId) ||
        COMPONENT_CATALOGUE.find((c) => c.category === cat)!
      );
    });
  }, [selectedComponents]);

  // Real-time engineering totals calculation
  const resourceTotals = useMemo(() => {
    let totalMass = 0;
    let totalCost = 0;
    let totalPowerGen = 0;
    let totalPowerDraw = 0;
    let batteryWh = 45;

    selectedComponentObjects.forEach((comp) => {
      totalMass += comp.massKg;
      totalCost += comp.costUSD;
      totalPowerGen += comp.powerGenerationWatts;
      totalPowerDraw += comp.powerConsumptionWatts;
      if (comp.storageCapacityWh) {
        batteryWh = comp.storageCapacityWh;
      }
    });

    const remainingBudget = budgetCapUSD - totalCost;
    const netPower = totalPowerGen - totalPowerDraw;

    return {
      totalMassKg: Number(totalMass.toFixed(2)),
      maxMassKg: massLimitKg,
      totalCostUSD: totalCost,
      budgetUSD: budgetCapUSD,
      remainingBudgetUSD: remainingBudget,
      totalPowerGenWatts: totalPowerGen,
      totalPowerDrawWatts: totalPowerDraw,
      netPowerWatts: Number(netPower.toFixed(1)),
      batteryCapacityWh: batteryWh,
      isMassValid: totalMass <= massLimitKg,
      isBudgetValid: remainingBudget >= 0,
      isPowerValid: netPower > 0,
    };
  }, [selectedComponentObjects, budgetCapUSD, massLimitKg]);

  // The component to display in the Subsystem Inspection panel
  const inspectedComponent: SpacecraftComponent = useMemo(() => {
    return (
      COMPONENT_CATALOGUE.find((c) => c.id === inspectedComponentId) ||
      COMPONENT_CATALOGUE[0]
    );
  }, [inspectedComponentId]);

  // Handler to select/replace a component in a category
  const handleSelectComponent = (comp: SpacecraftComponent) => {
    setSelectedComponents((prev) => ({
      ...prev,
      [comp.category]: comp.id,
    }));
    updateSpacecraft({ [comp.category]: comp.id });
    setInspectedComponentId(comp.id);
  };

  // Category Icon Resolver
  const getCategoryIcon = (catId: ComponentCategory) => {
    switch (catId) {
      case 'structure':
        return <Box size={14} />;
      case 'power':
        return <Zap size={14} />;
      case 'battery':
        return <Battery size={14} />;
      case 'comms':
        return <Radio size={14} />;
      case 'adcs':
        return <Compass size={14} />;
      case 'computer':
        return <Cpu size={14} />;
      default:
        return <Layers size={14} />;
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen w-full bg-[#09090b] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* 1. TOP FLOATING NAVIGATION (EXACT EXCALIDRAW SKETCH SPECIFICATION)        */}
      {/* ========================================================================= */}
      <UnifiedGameNav
        activeStage="02"
        onOpenGuide={() => setIsGuideOpen(true)}
        missionState={briefingState}
      />

      {/* ========================================================================= */}
      {/* 2. MAIN 3D SPACECRAFT WORKSPACE (HERO VIEWPORT)                           */}
      {/* ========================================================================= */}
      <section className="relative h-screen min-h-[720px] w-full flex overflow-hidden">
        
        {/* Full-Viewport 3D Spacecraft Moon Scene */}
        <div className="absolute inset-0 z-0 w-full h-full">
          <SpacecraftMoonScene
            selectedComponents={selectedComponents}
            autoRotate={true}
            cameraDistance={4.8}
            selectedPayloadId="payload-opt-hires"
          />
        </div>

        {/* Floating Collapsible Engineering Bay Catalogue (Left Workspace Area) */}
        <div className="absolute top-20 left-4 sm:left-8 z-30 pointer-events-auto">
          {isCatalogueOpen ? (
            <div className="w-[350px] sm:w-[380px] max-h-[calc(100vh-140px)] flex flex-col bg-[#120e0e]/90 backdrop-blur-2xl border border-orange-950/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-left-4 duration-200">
              
              {/* Catalogue Header */}
              <div className="px-4 py-3 bg-[#1a1210] border-b border-orange-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders size={14} className="text-amber-500" />
                  <span className="text-xs font-bold tracking-wider text-white uppercase font-sans">
                    CLEANROOM COMPONENT CATALOGUE
                  </span>
                </div>
                <button
                  onClick={() => setIsCatalogueOpen(false)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
                  title="Collapse Catalogue to maximize 3D view"
                >
                  <ChevronLeft size={12} />
                  <span>COLLAPSE</span>
                </button>
              </div>

              {/* 6 Category Navigation Tabs */}
              <div className="grid grid-cols-3 bg-[#0d0908] border-b border-orange-950 text-[10px] font-mono">
                {COMPONENT_CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setInspectedComponentId(selectedComponents[cat.id]);
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2 px-1 text-center transition-all cursor-pointer border-b-2 border-r border-orange-950/50 ${
                        isActive
                          ? 'bg-[#221612] text-amber-400 font-bold border-b-amber-500'
                          : 'text-stone-400 hover:text-white hover:bg-stone-900/40 border-b-transparent'
                      }`}
                    >
                      {getCategoryIcon(cat.id)}
                      <span className="truncate">{cat.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Component Cards List */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2.5 max-h-[50vh]">
                <div className="text-[10px] font-mono text-stone-400 flex justify-between items-center px-1">
                  <span className="uppercase">{activeCategory.toUpperCase()} MODULES:</span>
                  <span className="text-amber-500">CLICK TO INSTALL</span>
                </div>

                {COMPONENT_CATALOGUE.filter((c) => c.category === activeCategory).map((comp) => {
                  const isSelected = selectedComponents[activeCategory] === comp.id;

                  return (
                    <div
                      key={comp.id}
                      onClick={() => handleSelectComponent(comp)}
                      className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer text-left space-y-2 ${
                        isSelected
                          ? 'bg-[#221612]/95 border-amber-500 text-white shadow-lg ring-1 ring-amber-500/30'
                          : 'bg-[#120d0b]/70 border-stone-800/80 text-stone-400 hover:bg-[#18110e] hover:border-stone-700'
                      }`}
                    >
                      {/* Title & Radio Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">
                            {comp.name}
                          </div>
                          <p className="text-[11px] text-stone-400 line-clamp-2 mt-0.5 leading-snug">
                            {comp.shortDescription}
                          </p>
                        </div>
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase shrink-0 border ${
                            isSelected
                              ? 'bg-amber-600 text-slate-950 border-amber-500 font-bold'
                              : 'bg-stone-900 text-stone-500 border-stone-800'
                          }`}
                        >
                          {isSelected ? 'INSTALLED' : 'EQUIP'}
                        </span>
                      </div>

                      {/* Compact Metric Badges */}
                      <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono pt-1 border-t border-stone-800/60">
                        <div className="bg-[#0b0807] px-1.5 py-1 rounded text-center">
                          <span className="text-stone-500 block text-[9px]">MASS</span>
                          <span className="text-amber-400 font-semibold">{comp.massKg} kg</span>
                        </div>
                        <div className="bg-[#0b0807] px-1.5 py-1 rounded text-center">
                          <span className="text-stone-500 block text-[9px]">COST</span>
                          <span className="text-emerald-400 font-semibold">${(comp.costUSD / 1000).toFixed(0)}k</span>
                        </div>
                        <div className="bg-[#0b0807] px-1.5 py-1 rounded text-center">
                          <span className="text-stone-500 block text-[9px]">POWER</span>
                          <span className={`font-semibold ${comp.powerGenerationWatts > 0 ? 'text-sky-300' : 'text-stone-300'}`}>
                            {comp.powerGenerationWatts > 0
                              ? `+${comp.powerGenerationWatts}W`
                              : comp.powerConsumptionWatts > 0
                              ? `-${comp.powerConsumptionWatts}W`
                              : '0 W'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Catalogue Footer Summary */}
              <div className="p-2.5 bg-[#0f0b0a] border-t border-orange-950 text-[10px] font-mono text-stone-400 flex items-center justify-between">
                <span>6/6 MODULES CONFIGURED</span>
                <span className="text-emerald-400 font-semibold">BUS INTEGRATED</span>
              </div>

            </div>
          ) : (
            /* Minimized Catalogue Floating Pill */
            <button
              onClick={() => setIsCatalogueOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#120e0e]/90 hover:bg-[#221612] border border-amber-900/70 hover:border-amber-500 rounded-full text-xs font-mono text-amber-400 hover:text-white transition-all cursor-pointer shadow-2xl backdrop-blur-xl"
            >
              <Sliders size={14} />
              <span>OPEN CATALOGUE (6/6 INSTALLED)</span>
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        {/* Scroll Invitation Indicator at bottom of initial viewport */}
        <div className="absolute bottom-6 inset-x-0 z-20 flex justify-center pointer-events-none">
          <button
            onClick={() => scrollToSection('telemetry-section')}
            className="pointer-events-auto group flex flex-col items-center gap-1 px-4 py-2 bg-[#120e0e]/80 hover:bg-[#1a1210] border border-orange-950/70 hover:border-amber-600/60 rounded-full text-xs font-mono text-stone-400 hover:text-white transition-all backdrop-blur-md shadow-2xl cursor-pointer"
          >
            <span className="tracking-widest uppercase text-[10px] font-semibold flex items-center gap-1.5">
              <span>SCROLL FOR TELEMETRY & SUBSYSTEM INSPECTION</span>
              <ChevronDown size={13} className="animate-bounce text-amber-400" />
            </span>
          </button>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION A – SPACECRAFT TELEMETRY (BELOW THE FOLD)                      */}
      {/* ========================================================================= */}
      <section
        id="telemetry-section"
        ref={telemetrySectionRef}
        className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-8 py-16 border-t border-orange-950/60"
      >
        <div
          className={`space-y-1.5 mb-8 transition-all duration-700 ease-out ${
            telemetryEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase font-semibold">
              SECTION A // FLIGHT TELEMETRY
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-sans">
            SPACECRAFT TELEMETRY
          </h2>
          <p className="text-stone-300 text-sm max-w-xl">
            Live engineering telemetry computed dynamically from your installed CubeSat bus components.
          </p>
        </div>

        {/* 9 Medium-Sized Animated Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
          
          {/* 1. Total Mass / Maximum Mass */}
          <div
            className={`p-5 rounded-2xl border bg-[#140e0c]/85 backdrop-blur-md border-orange-950/70 hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300 shadow-xl flex flex-col justify-between ${
              telemetryEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <div>
              <div className="flex justify-between items-center text-stone-400 text-xs mb-1">
                <span className="flex items-center gap-1.5">
                  <Weight size={13} className="text-amber-400" />
                  <span>TOTAL SPACECRAFT MASS</span>
                </span>
                <span className={`font-bold ${resourceTotals.isMassValid ? 'text-emerald-400' : 'text-red-400'}`}>
                  {resourceTotals.isMassValid ? 'WITHIN LIMIT' : 'EXCEEDED'}
                </span>
              </div>
              <div className="text-3xl font-black text-white mt-2">
                {resourceTotals.totalMassKg}{' '}
                <span className="text-base font-normal text-stone-400">/ {resourceTotals.maxMassKg} kg</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-800/60">
              <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    resourceTotals.isMassValid ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, (resourceTotals.totalMassKg / resourceTotals.maxMassKg) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-stone-400 mt-1.5 block">
                Margin: {(resourceTotals.maxMassKg - resourceTotals.totalMassKg).toFixed(2)} kg remaining
              </span>
            </div>
          </div>

          {/* 2. Total Budget / Remaining Budget */}
          <div
            className={`p-5 rounded-2xl border bg-[#140e0c]/85 backdrop-blur-md border-orange-950/70 hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-300 shadow-xl flex flex-col justify-between ${
              telemetryEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '50ms' }}
          >
            <div>
              <div className="flex justify-between items-center text-stone-400 text-xs mb-1">
                <span className="flex items-center gap-1.5">
                  <DollarSign size={13} className="text-emerald-400" />
                  <span>REMAINING BUDGET</span>
                </span>
                <span className={`font-bold ${resourceTotals.isBudgetValid ? 'text-emerald-400' : 'text-red-400'}`}>
                  {resourceTotals.isBudgetValid ? 'FUNDED' : 'DEFICIT'}
                </span>
              </div>
              <div className="text-3xl font-black text-emerald-400 mt-2">
                ${(resourceTotals.remainingBudgetUSD / 1000000).toFixed(2)}M{' '}
                <span className="text-base font-normal text-stone-400">/ ${(resourceTotals.budgetUSD / 1000000).toFixed(1)}M</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-800/60">
              <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, (resourceTotals.remainingBudgetUSD / resourceTotals.budgetUSD) * 100)
                    )}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-stone-400 mt-1.5 block">
                Total Bus Hardware Cost: ${(resourceTotals.totalCostUSD / 1000).toFixed(0)}k
              </span>
            </div>
          </div>

          {/* 3. Power Generation */}
          <div
            className={`p-5 rounded-2xl border bg-[#140e0c]/85 backdrop-blur-md border-orange-950/70 hover:border-sky-500/50 hover:-translate-y-1 transition-all duration-300 shadow-xl flex flex-col justify-between ${
              telemetryEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <div>
              <div className="flex justify-between items-center text-stone-400 text-xs mb-1">
                <span className="flex items-center gap-1.5">
                  <Zap size={13} className="text-sky-400" />
                  <span>DAYLIGHT POWER GENERATION</span>
                </span>
                <span className="text-sky-400 font-bold">SOLAR YIELD</span>
              </div>
              <div className="text-3xl font-black text-sky-300 mt-2">
                +{resourceTotals.totalPowerGenWatts} W
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-800/60 text-[10px] text-stone-400">
              <span>Array Type: {selectedComponents.power === 'power-hieff' ? 'Triple-Junction GaAs Articulated Wings' : 'Silicon Body-Mounted Panels'}</span>
            </div>
          </div>

          {/* 4. Power Consumption */}
          <div
            className={`p-5 rounded-2xl border bg-[#140e0c]/85 backdrop-blur-md border-orange-950/70 hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300 shadow-xl flex flex-col justify-between ${
              telemetryEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '150ms' }}
          >
            <div>
              <div className="flex justify-between items-center text-stone-400 text-xs mb-1">
                <span className="flex items-center gap-1.5">
                  <Zap size={13} className="text-amber-400" />
                  <span>SUBSYSTEMS CONSUMPTION</span>
                </span>
                <span className="text-amber-400 font-bold">ACTIVE DRAW</span>
              </div>
              <div className="text-3xl font-black text-amber-300 mt-2">
                -{resourceTotals.totalPowerDrawWatts} W
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-800/60 text-[10px] text-stone-400">
              <span>Cumulative continuous draw from OBC, ADCS, COMM, and sensor thermal heaters</span>
            </div>
          </div>

          {/* 5. Power Balance */}
          <div
            className={`p-5 rounded-2xl border bg-[#140e0c]/85 backdrop-blur-md border-orange-950/70 hover:border-sky-500/50 hover:-translate-y-1 transition-all duration-300 shadow-xl flex flex-col justify-between ${
              telemetryEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <div>
              <div className="flex justify-between items-center text-stone-400 text-xs mb-1">
                <span className="flex items-center gap-1.5">
                  <Zap size={13} className="text-sky-400" />
                  <span>NET POWER BALANCE</span>
                </span>
                <span className={`font-bold ${resourceTotals.isPowerValid ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {resourceTotals.isPowerValid ? 'SURPLUS' : 'DEFICIT'}
                </span>
              </div>
              <div className="text-3xl font-black text-white mt-2">
                +{resourceTotals.netPowerWatts} W
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-800/60 text-[10px] text-stone-400">
              <span>Net daylight margin charges battery pack to 100% state-of-charge</span>
            </div>
          </div>

          {/* 6. Battery Capacity */}
          <div
            className={`p-5 rounded-2xl border bg-[#140e0c]/85 backdrop-blur-md border-orange-950/70 hover:border-indigo-500/50 hover:-translate-y-1 transition-all duration-300 shadow-xl flex flex-col justify-between ${
              telemetryEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '250ms' }}
          >
            <div>
              <div className="flex justify-between items-center text-stone-400 text-xs mb-1">
                <span className="flex items-center gap-1.5">
                  <Battery size={13} className="text-indigo-400" />
                  <span>BATTERY CAPACITY</span>
                </span>
                <span className="text-indigo-400 font-bold">ECLIPSE READY</span>
              </div>
              <div className="text-3xl font-black text-indigo-300 mt-2">
                {resourceTotals.batteryCapacityWh} Wh
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-800/60 text-[10px] text-stone-400">
              <span>Sustains 35-minute Earth shadow pass with DoD below 40%</span>
            </div>
          </div>

          {/* 7. Data Storage */}
          <div
            className={`p-5 rounded-2xl border bg-[#140e0c]/85 backdrop-blur-md border-orange-950/70 hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300 shadow-xl flex flex-col justify-between ${
              telemetryEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <div>
              <div className="flex justify-between items-center text-stone-400 text-xs mb-1">
                <span className="text-purple-400 font-bold">STORAGE BUFFER</span>
                <span className="text-slate-400">RAD-HARD</span>
              </div>
              <div className="text-3xl font-black text-purple-300 mt-2">
                32 GB
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-800/60 text-[10px] text-stone-400">
              <span>Holds up to 10 orbits of raw multispectral Earth imagery swaths</span>
            </div>
          </div>

          {/* 8. Orbit Altitude */}
          <div
            className={`p-5 rounded-2xl border bg-[#140e0c]/85 backdrop-blur-md border-orange-950/70 hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300 shadow-xl flex flex-col justify-between ${
              telemetryEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '350ms' }}
          >
            <div>
              <div className="flex justify-between items-center text-stone-400 text-xs mb-1">
                <span className="text-amber-400 font-bold">ORBIT REGIME</span>
                <span className="text-slate-400">500 KM LEO</span>
              </div>
              <div className="text-3xl font-black text-amber-300 mt-2">
                500 km <span className="text-base font-normal text-stone-400">SSO</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-800/60 text-[10px] text-stone-400">
              <span>97.4° Sun-Synchronous retro inclination for constant solar illumination</span>
            </div>
          </div>

          {/* 9. Mission Lifetime */}
          <div
            className={`p-5 rounded-2xl border bg-[#140e0c]/85 backdrop-blur-md border-orange-950/70 hover:border-slate-500/50 hover:-translate-y-1 transition-all duration-300 shadow-xl flex flex-col justify-between ${
              telemetryEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            <div>
              <div className="flex justify-between items-center text-stone-400 text-xs mb-1">
                <span className="text-slate-400 font-bold">OPERATIONAL LIFE</span>
                <span className="text-emerald-400 font-bold">TARGET MET</span>
              </div>
              <div className="text-3xl font-black text-slate-200 mt-2">
                365 Days
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-800/60 text-[10px] text-stone-400">
              <span>Sufficient duration for full multi-seasonal Earth observation campaign</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION B – ENGINEERING PARAMETERS & VALIDATION MATRIX                 */}
      {/* ========================================================================= */}
      <section
        ref={parametersSectionRef}
        className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-8 py-14"
      >
        <div
          className={`space-y-1.5 mb-8 transition-all duration-700 ease-out ${
            parametersEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase font-semibold">
              SECTION B // LAUNCH & FLIGHT VALIDATION
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-sans">
            ENGINEERING VALIDATION PARAMETERS
          </h2>
          <p className="text-stone-300 text-sm max-w-xl">
            Detailed validation matrix evaluating your configured CubeSat bus against 500 km SSO launch constraints.
          </p>
        </div>

        {/* 5 Engineering Validation Rows */}
        <div
          className={`divide-y divide-orange-950/80 bg-[#120e0e]/85 backdrop-blur-xl border border-orange-950/80 rounded-2xl overflow-hidden shadow-2xl transition-all duration-700 ${
            parametersEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {[
            {
              title: 'Canister Deployer Mass Compatibility',
              status: resourceTotals.isMassValid ? 'PASS' : 'FAIL',
              value: `${resourceTotals.totalMassKg} kg / ${resourceTotals.maxMassKg} kg`,
              desc: 'Total wet mass conforms to launch ride-share envelope. P-POD deployer springs impart certified release velocity.',
            },
            {
              title: 'Solar Daylight Energy Margin',
              status: resourceTotals.isPowerValid ? 'PASS' : 'WARNING',
              value: `+${resourceTotals.netPowerWatts} W Daylight Surplus`,
              desc: 'Photovoltaic arrays generate sufficient surplus over bus load to recharge battery cells during sunlit pass.',
            },
            {
              title: '35-Minute Eclipse Depth-of-Discharge (DoD)',
              status: 'PASS',
              value: '< 35% DoD Nominal',
              desc: 'Stored energy sustains bus heaters and payload standby throughout the dark orbital shadow without damaging cell chemistry.',
            },
            {
              title: 'Scientific Telemetry Downlink Throughput',
              status: selectedComponents.comms === 'comms-highgain' ? 'PASS' : 'WARNING',
              value: selectedComponents.comms === 'comms-highgain' ? '2.5 Mbps S-Band' : '9.6 kbps UHF/VHF',
              desc: selectedComponents.comms === 'comms-highgain'
                ? 'High-speed directional link allows dumping 100+ raw multispectral frames per 8-minute ground pass.'
                : 'Basic whip antenna limits downlink speed; consider high-gain S-band patch array for faster imagery offload.',
            },
            {
              title: 'Attitude Stabilization & Nadir Pointing Stability',
              status: selectedComponents.adcs === 'adcs-advanced' ? 'PASS' : 'WARNING',
              value: selectedComponents.adcs === 'adcs-advanced' ? '±0.05° Arcminute' : '±5.0° Coarse',
              desc: selectedComponents.adcs === 'adcs-advanced'
                ? '3-axis momentum wheels and autonomous star tracker prevent image smear at 7.6 km/s orbital velocity.'
                : 'Coarse magnetic torquer rods provide basic alignment; fine optical imaging may experience motion blur.',
            },
          ].map((check, i) => (
            <div key={i} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#1a1210]/50 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white font-sans">{check.title}</h4>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                      check.status === 'PASS'
                        ? 'bg-emerald-950/70 border-emerald-800 text-emerald-400'
                        : check.status === 'WARNING'
                        ? 'bg-amber-950/70 border-amber-800 text-amber-400'
                        : 'bg-red-950/70 border-red-800 text-red-400'
                    }`}
                  >
                    {check.status}
                  </span>
                </div>
                <p className="text-xs text-stone-400">{check.desc}</p>
              </div>
              <div className="shrink-0 font-mono text-xs font-bold text-amber-400 bg-[#090605] px-3 py-1.5 rounded-lg border border-orange-950/70">
                {check.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SECTION C – SUBSYSTEM INSPECTION (MOVED BELOW WORKSPACE)                */}
      {/* ========================================================================= */}
      <section
        ref={inspectionSectionRef}
        className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-8 py-14"
      >
        <div
          className={`space-y-1.5 mb-8 transition-all duration-700 ease-out ${
            inspectionEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="text-[11px] font-mono tracking-widest text-sky-400 uppercase font-semibold">
              SECTION C // COMPONENT BREAKDOWN
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-sans">
            SUBSYSTEM INSPECTION
          </h2>
          <p className="text-stone-300 text-sm max-w-xl">
            Inspect detailed engineering specs, aerospace certifications, and educational context for any installed module.
          </p>
        </div>

        {/* Component Selector Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {COMPONENT_CATEGORIES.map((cat) => {
            const installedCompId = selectedComponents[cat.id];
            const installedComp = COMPONENT_CATALOGUE.find((c) => c.id === installedCompId)!;
            const isInspected = inspectedComponent.category === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setInspectedComponentId(installedCompId)}
                className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer border flex items-center gap-2 ${
                  isInspected
                    ? 'bg-amber-600 text-slate-950 font-bold border-amber-500 shadow-md scale-[1.02]'
                    : 'bg-[#140e0c]/80 text-stone-400 border-orange-950/80 hover:text-white hover:bg-[#1a1210]'
                }`}
              >
                {getCategoryIcon(cat.id)}
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-75 font-sans">({installedComp.name.split(' ')[0]})</span>
              </button>
            );
          })}
        </div>

        {/* Detailed Inspection Panel Container */}
        <div
          className={`p-6 sm:p-8 rounded-2xl border bg-[#120e0e]/90 backdrop-blur-xl border-orange-950/80 shadow-2xl space-y-6 transition-all duration-700 ${
            inspectionEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-orange-950">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase bg-amber-950/70 text-amber-400 px-2 py-0.5 rounded border border-amber-900/60">
                  {inspectedComponent.category.toUpperCase()} MODULE
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  <span>INSTALLED ON SPACECRAFT BUS</span>
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-sans">
                {inspectedComponent.name}
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
                {inspectedComponent.shortDescription}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
              <div className="bg-[#090605] p-3 rounded-xl border border-orange-950 text-center min-w-[90px]">
                <span className="text-[10px] text-stone-500 block">MASS</span>
                <span className="text-base font-bold text-amber-400">{inspectedComponent.massKg} kg</span>
              </div>
              <div className="bg-[#090605] p-3 rounded-xl border border-orange-950 text-center min-w-[90px]">
                <span className="text-[10px] text-stone-500 block">COST</span>
                <span className="text-base font-bold text-emerald-400">${(inspectedComponent.costUSD / 1000).toFixed(0)}k</span>
              </div>
              <div className="bg-[#090605] p-3 rounded-xl border border-orange-950 text-center min-w-[90px]">
                <span className="text-[10px] text-stone-500 block">POWER</span>
                <span className="text-base font-bold text-sky-300">
                  {inspectedComponent.powerGenerationWatts > 0
                    ? `+${inspectedComponent.powerGenerationWatts}W`
                    : inspectedComponent.powerConsumptionWatts > 0
                    ? `-${inspectedComponent.powerConsumptionWatts}W`
                    : '0 W'}
                </span>
              </div>
            </div>
          </div>

          {/* Technical Specifications Grid */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400 mb-3 font-semibold">
              TECHNICAL SPECIFICATIONS & AEROSPACE CERTIFICATION:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 bg-[#090605] rounded-xl border border-orange-950">
                <span className="text-[10px] text-stone-500 block">DIMENSIONS</span>
                <span className="text-white font-semibold">{inspectedComponent.dimensions}</span>
              </div>
              <div className="p-3 bg-[#090605] rounded-xl border border-orange-950">
                <span className="text-[10px] text-stone-500 block">COMPATIBILITY NOTE</span>
                <span className="text-amber-300 text-[11px] font-semibold">{inspectedComponent.compatibilityNote}</span>
              </div>
              {inspectedComponent.specsSummary.map((spec, i) => (
                <div key={i} className="p-3 bg-[#090605] rounded-xl border border-orange-950">
                  <span className="text-[10px] text-stone-500 block">{spec.label.toUpperCase()}</span>
                  <span className="text-stone-200 font-semibold">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expandable Educational Deep Dive */}
          <div className="pt-2">
            <button
              onClick={() => setIsEducationExpanded(!isEducationExpanded)}
              className="w-full flex items-center justify-between p-3 bg-[#1a1210] hover:bg-[#241915] rounded-xl border border-orange-950 text-left transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <Compass size={14} />
                <span>EDUCATIONAL ENGINEERING CONTEXT (EARTH OBSERVATION IMPACT)</span>
              </span>
              {isEducationExpanded ? <ChevronUp size={15} className="text-stone-400" /> : <ChevronDown size={15} />}
            </button>

            {isEducationExpanded && (
              <div className="p-4 bg-[#090605] border border-t-0 border-orange-950 rounded-b-xl text-xs text-stone-300 leading-relaxed space-y-2 animate-in fade-in duration-150">
                <p>{inspectedComponent.educationalDeepDive}</p>
                <div className="p-2.5 bg-[#18110e] rounded-lg text-[11px] font-mono text-stone-400">
                  <strong className="text-white block mb-0.5">Scientific Relevance to {targetLabel}:</strong>
                  Directly impacts the signal quality, thermal resilience, and downlink speed needed to capture environmental change.
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SECTION D – NEXT MISSION STAGE (CONTINUE TO SUBSYSTEMS)                 */}
      {/* ========================================================================= */}
      <section className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="p-8 sm:p-10 rounded-3xl border bg-gradient-to-r from-[#140e0c]/95 via-[#1a1210]/95 to-[#140e0c]/95 backdrop-blur-2xl border-orange-950/80 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[11px] font-mono text-amber-400 uppercase tracking-widest font-semibold">
                STAGE 02 // SPACECRAFT DESIGN COMPLETE
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase font-sans">
              READY FOR STAGE 03: SUBSYSTEMS INTEGRATION
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
              All 6 baseline modules have been verified and configured. Proceed to detailed Electrical Power System (EPS) wiring, ADCS sensor tuning, and thermal cycle analysis.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsStageGateOpen(true)}
            className="shrink-0 flex items-center justify-center gap-3 py-4 px-8 font-black uppercase tracking-wider text-slate-950 bg-amber-500 hover:bg-amber-400 border border-amber-300 shadow-2xl text-sm"
          >
            <span>CONTINUE TO SUBSYSTEMS</span>
            <ArrowRight size={18} />
          </Button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. UNIFIED MISSION OPERATIONS GUIDE MODAL                                 */}
      {/* ========================================================================= */}
      <UnifiedMissionGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        selectedDifficulty={(briefingState.difficulty as any) || 'normal'}
        selectedTargetId={(briefingState.target as any) || 'coastal'}
      />

      {/* ========================================================================= */}
      {/* 8. STAGE GATE MODAL (CONFIRMING READINESS FOR PHASE 03)                   */}
      {/* ========================================================================= */}
      {isStageGateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#140e0c] border border-amber-900/80 rounded-2xl shadow-2xl p-6 space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-orange-950">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <h3 className="text-sm font-bold tracking-wider text-white uppercase font-sans">
                  STAGE GATE: 03 SUBSYSTEMS INTEGRATION
                </h3>
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-900">
                MEMBER 2 WORKBENCH
              </span>
            </div>

            {/* Summary */}
            <div className="space-y-3 text-xs text-stone-300 leading-relaxed">
              <div className="p-3 bg-[#1c1310] border border-orange-950 rounded-xl space-y-1">
                <p className="font-semibold text-white">
                  Spacecraft Configuration Locked & Validated!
                </p>
                <p className="text-stone-400">
                  All 6 core modules have been assigned to the CubeSat bus. Your design is ready for Electrical Power System wiring and thermal cycle simulation.
                </p>
              </div>

              {/* Design Readout */}
              <div className="p-3 bg-[#0d0908] border border-orange-950 rounded-xl font-mono text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-500">BUS CONFIGURATION:</span>
                  <span className="text-white font-semibold">
                    {selectedComponents.structure.toUpperCase()} ({resourceTotals.totalMassKg} kg)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">NET POWER BALANCE:</span>
                  <span className="text-sky-300 font-semibold">
                    +{resourceTotals.netPowerWatts} W Daylight Surplus
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">BUDGET EXPEDITION:</span>
                  <span className="text-emerald-400 font-semibold">
                    ${(resourceTotals.remainingBudgetUSD / 1000000).toFixed(2)}M Remaining
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">ORBIT REGIME:</span>
                  <span className="text-amber-400 font-semibold">
                    500 km Sun-Synchronous (97.4°)
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-950/40 border border-emerald-900/40 rounded-lg text-[11px] text-emerald-300 flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                <span>
                  Spacecraft bus structure locked. Ready to configure electrical, RF, and thermal subsystems.
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-orange-950 flex items-center justify-between gap-3">
              <button
                onClick={() => setIsStageGateOpen(false)}
                className="px-4 py-2 text-xs font-mono text-stone-400 hover:text-white transition-colors cursor-pointer hover:bg-stone-900 rounded-full"
              >
                ← REVISE BUS
              </button>

              <button
                onClick={() => {
                  setIsStageGateOpen(false);
                  navigate('/subsystems');
                }}
                className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-bold text-xs uppercase rounded-full transition-colors cursor-pointer shadow-lg"
              >
                PROCEED TO SUBSYSTEMS →
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Subtle bottom scanline ticker */}
      <footer className="relative z-20 w-full py-2 px-6 border-t border-orange-950/60 bg-[#090605]/95 text-[10px] font-mono text-stone-500 flex justify-between">
        <span>NASA SPACE APPS CHALLENGE 2026 • MASTERX SYSTEM</span>
        <span>STAGE 02 // SPACECRAFT BUS WORKBENCH ACTIVE</span>
      </footer>

    </div>
  );
};

export default SpacecraftBuilderPage;