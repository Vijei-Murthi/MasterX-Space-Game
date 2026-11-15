/**
 * MASTERX – SPACE MACHINE
 * Stage 03: Subsystems & Avionics Interactive Workbench
 * 
 * Immersive game experience:
 * - 3D Cleanroom Spacecraft visualization with active subsystem highlighting
 * - Interactive hardware configuration: BUS, EPS, BATT, COMM, ADCS, CDH, TCS
 * - Live power & mass resource balancing
 * - Refactored, non-intrusive secondary integration notes
 * - Scroll-based visual educational modules
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Zap,
  Battery,
  Radio,
  Compass,
  Cpu,
  Shield,
  ArrowRight,
  ArrowLeft,
  Check,
  Info,
  Sun,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import UnifiedGameNav from '../components/navigation/UnifiedGameNav';
import UnifiedMissionGuideModal from '../components/navigation/UnifiedMissionGuideModal';
import ResourceDashboard from '../components/dashboard/ResourceDashboard';
import SpacecraftMoonScene from '../components/spacecraft/SpacecraftMoonScene';
import { COMPONENT_CATALOGUE } from '../data/builderCatalogue';
import { TCS_CATALOGUE, calculateResourceMetrics } from '../adapters/engineeringAdapter';
import { SpacecraftComponent } from '../types/builder';

type SubsystemTab = 'structure' | 'power' | 'battery' | 'comms' | 'adcs' | 'computer' | 'thermal';

export const SubsystemsPage: React.FC = () => {
  const navigate = useNavigate();
  const { mission, updateSpacecraft, updateSubsystems } = useMission();
  const [activeTab, setActiveTab] = useState<SubsystemTab>('power');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [expandedDeepDiveId, setExpandedDeepDiveId] = useState<string | null>(null);

  // Live Metrics
  const metrics = useMemo(() => calculateResourceMetrics(mission), [mission]);

  // Tab definitions
  const tabs: {
    id: SubsystemTab;
    label: string;
    code: string;
    highlightLabel: string;
    icon: React.FC<{ size?: number; className?: string }>;
  }[] = [
    { id: 'structure', label: 'Structure & Chassis', code: 'BUS', highlightLabel: 'ALUMINUM 6061-T6 CHASSIS & MOUNTING RAILS', icon: Box },
    { id: 'power', label: 'Solar Generation', code: 'EPS', highlightLabel: 'PHOTOVOLTAIC SOLAR ARRAYS & WINGS', icon: Zap },
    { id: 'battery', label: 'Energy Storage', code: 'BATT', highlightLabel: 'INTERNAL CHEMICAL BATTERY COMPARTMENT', icon: Battery },
    { id: 'comms', label: 'Communications', code: 'COMM', highlightLabel: 'RF ANTENNA & TRANSCEIVER SUITE', icon: Radio },
    { id: 'adcs', label: 'Attitude Determination', code: 'ADCS', highlightLabel: '3-AXIS REACTION WHEELS & SENSORS', icon: Compass },
    { id: 'computer', label: 'Onboard Computer', code: 'CDH', highlightLabel: 'FLIGHT COMPUTER & DATA BUS', icon: Cpu },
    { id: 'thermal', label: 'Thermal Control', code: 'TCS', highlightLabel: 'MLI BLANKETS & RADIATOR PANELS', icon: Shield },
  ];

  // Retrieve components for current tab
  const currentOptions = useMemo<SpacecraftComponent[]>(() => {
    if (activeTab === 'thermal') {
      return TCS_CATALOGUE as unknown as SpacecraftComponent[];
    }
    return COMPONENT_CATALOGUE.filter((c) => c.category === activeTab);
  }, [activeTab]);

  // Determine currently selected component ID for active tab
  const selectedComponentId = useMemo(() => {
    switch (activeTab) {
      case 'structure':
        return mission.spacecraft.structure;
      case 'power':
        return mission.spacecraft.power;
      case 'battery':
        return mission.spacecraft.battery;
      case 'comms':
        return mission.spacecraft.comms;
      case 'adcs':
        return mission.spacecraft.adcs;
      case 'computer':
        return mission.spacecraft.computer;
      case 'thermal':
        return mission.subsystems.tcsId;
      default:
        return '';
    }
  }, [activeTab, mission.spacecraft, mission.subsystems]);

  const handleSelectComponent = (comp: SpacecraftComponent) => {
    if (activeTab === 'thermal') {
      updateSubsystems({ tcsId: comp.id });
    } else {
      updateSpacecraft({ [activeTab]: comp.id });
    }
  };

  const activeTabInfo = tabs.find((t) => t.id === activeTab) || tabs[1];

  return (
    <div className="relative min-h-screen w-full bg-[#030712] text-slate-100 flex flex-col justify-between overflow-x-hidden pt-20 pb-16">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-radial from-slate-900/40 via-[#030712] to-[#02040a]" />

      {/* Top Floating Navigation */}
      <UnifiedGameNav
        activeStage="03"
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Content Container */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. STAGE HEADER & ACTIONS                                                 */}
        {/* ========================================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-4 bg-sky-500 rounded-xs" />
              <span className="text-xs font-mono font-bold tracking-widest text-sky-400 uppercase">
                STAGE 03 // SPACECRAFT SUBSYSTEMS & AVIONICS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-sans">
              INTEGRATE SPACECRAFT SUBSYSTEMS
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Inspect your CubeSat in 3D, select core avionics, and watch components install directly onto the spacecraft frame.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/planner')}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 rounded-full text-xs font-mono text-slate-300 transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>SPACECRAFT BAY</span>
            </button>

            <button
              onClick={() => navigate('/payload')}
              className="flex items-center gap-2 px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-bold text-xs uppercase rounded-full transition-all cursor-pointer shadow-lg shadow-sky-500/20"
            >
              <span>PROCEED TO PAYLOAD</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. LIVE RESOURCE HUD                                                      */}
        {/* ========================================================================= */}
        <ResourceDashboard metrics={metrics} compact={true} />

        {/* ========================================================================= */}
        {/* 3. INTERACTIVE 3D WORKBENCH & HARDWARE SELECTOR (HERO WORKSPACE)           */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT: 3D SPACECRAFT CLEANROOM VIEWER (5 cols on lg) */}
          <div className="lg:col-span-5 h-[420px] sm:h-[480px] lg:h-auto min-h-[420px] rounded-3xl overflow-hidden border border-slate-800/90 bg-[#081020]/90 shadow-2xl relative flex flex-col">
            
            {/* 3D Scene Viewport */}
            <div className="w-full h-full relative">
              <SpacecraftMoonScene
                selectedComponents={mission.spacecraft}
                highlightSubsystem={activeTab}
                cameraDistance={4.5}
                autoRotate={false}
                selectedPayloadId={mission.payload.selectedPayloadId}
              />
            </div>

            {/* Active Subsystem Highlight Banner Overlay */}
            <div className="absolute top-4 inset-x-4 pointer-events-none z-20 flex justify-center">
              <div className="px-3.5 py-1.5 bg-[#060c18]/90 backdrop-blur-md border border-sky-500/40 rounded-full flex items-center gap-2 text-[10px] font-mono shadow-xl">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-slate-400">INSPECTING:</span>
                <strong className="text-white">{activeTabInfo.code} • {activeTabInfo.label}</strong>
              </div>
            </div>

            {/* Bottom Subsystem Placement Hint */}
            <div className="absolute bottom-4 inset-x-4 pointer-events-none z-20 flex justify-center">
              <div className="px-3 py-1 bg-[#060c18]/85 backdrop-blur-md border border-slate-800 rounded-lg text-[10px] font-mono text-slate-400 text-center shadow-lg">
                <span>{activeTabInfo.highlightLabel}</span>
              </div>
            </div>

          </div>

          {/* RIGHT: SUBSYSTEM SELECTION & COMPONENT DECK (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            
            {/* Subsystem Category Navigation Tabs (Cleaned of white scrollbars) */}
            <div
              className="flex items-center gap-2 p-1.5 bg-[#081020]/90 border border-slate-800/90 rounded-2xl overflow-x-auto no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20 scale-[1.02]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-slate-950' : 'text-sky-400'} />
                    <span>{tab.code}</span>
                  </button>
                );
              })}
            </div>

            {/* Component Cards for Selected Subsystem */}
            <div className="space-y-4 flex-1">
              {currentOptions.map((comp) => {
                const isSelected = comp.id === selectedComponentId;
                const isDeepDiveOpen = expandedDeepDiveId === comp.id;

                return (
                  <div
                    key={comp.id}
                    onClick={() => handleSelectComponent(comp)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                      isSelected
                        ? 'bg-sky-950/30 border-sky-500 shadow-xl ring-1 ring-sky-500/40'
                        : 'bg-[#081020]/80 border-slate-800/90 hover:border-slate-700 hover:bg-[#0a1428]/90'
                    }`}
                  >
                    <div>
                      {/* Top Header: Subsystem Tag + Title + Cost/Mass */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-bold uppercase">
                              {comp.category?.toUpperCase() || 'AVIONICS'}
                            </span>
                            {isSelected && (
                              <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                                <Check size={11} /> INSTALLED ON SPACECRAFT
                              </span>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-white font-sans">{comp.name}</h3>
                        </div>

                        <div className="text-right font-mono text-xs shrink-0">
                          <span className="text-emerald-400 font-bold block text-sm">
                            ${(comp.costUSD / 1000).toLocaleString()}k
                          </span>
                          <span className="text-slate-400 text-[11px]">{comp.massKg} kg</span>
                        </div>
                      </div>

                      {/* Short Description */}
                      <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3.5">
                        {comp.shortDescription || (comp as unknown as { description?: string }).description}
                      </p>

                      {/* Specs Pill Matrix */}
                      {comp.specsSummary && comp.specsSummary.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3.5 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60 text-[10px] font-mono">
                          {comp.specsSummary.map((spec, i) => (
                            <div key={i} className="flex flex-col">
                              <span className="text-slate-500 uppercase tracking-wider">{spec.label}</span>
                              <span className="text-slate-200 font-bold truncate mt-0.5">{spec.value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Clean Secondary Integration Note (Section 6 Requirement) */}
                      {comp.compatibilityNote && (
                        <div className="mb-3.5 p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px] mb-1">
                            <Info size={13} className="text-sky-400 shrink-0" />
                            <span className="font-semibold uppercase tracking-wider text-slate-300">
                              System Integration Context
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 font-sans leading-relaxed pl-4.5">
                            {comp.compatibilityNote}
                          </p>
                        </div>
                      )}

                      {/* Optional Expandable Deep Dive */}
                      {comp.educationalDeepDive && (
                        <div className="mb-3.5 text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedDeepDiveId(isDeepDiveOpen ? null : comp.id);
                            }}
                            className="text-[11px] font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>{isDeepDiveOpen ? '− Hide Engineering Details' : '+ Read Aerospace Deep Dive'}</span>
                          </button>
                          {isDeepDiveOpen && (
                            <div className="mt-2 p-3 bg-slate-900/70 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed font-sans">
                              {comp.educationalDeepDive}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Action Row */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">
                        Power:{' '}
                        <strong className="text-white">
                          {comp.powerGenerationWatts
                            ? `+${comp.powerGenerationWatts}W yield`
                            : `-${comp.powerConsumptionWatts || (comp as unknown as { powerWatts?: number }).powerWatts || 0}W draw`}
                        </strong>
                      </span>

                      <button
                        type="button"
                        className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all shadow-md ${
                          isSelected
                            ? 'bg-sky-500 text-slate-950 ring-1 ring-sky-300/50'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        {isSelected ? 'INSTALLED' : 'INSTALL HARDWARE'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* 4. SCROLL-BASED EDUCATIONAL LEARNING MODULES (Section 5.4 Requirement)    */}
        {/* ========================================================================= */}
        <section className="pt-10 border-t border-slate-800/80 space-y-6">
          
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-4 bg-sky-500 rounded-xs" />
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase font-sans tracking-tight">
              SPACECRAFT SUBSYSTEMS ENGINEERING MANUAL
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            CubeSat subsystems operate as an interdependent closed ecosystem. Learn how orbital physics, solar geometry, and radio communications dictate mission success.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
            
            {/* Module 1: EPS Power */}
            <div className="p-5 bg-[#081020]/90 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-amber-400 mb-2 font-mono text-xs font-bold">
                  <Sun size={15} />
                  <span>01 // ELECTRICAL POWER SYSTEM</span>
                </div>
                <h3 className="text-sm font-bold text-white font-sans">
                  Solar Harvest & Eclipse Cycles
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-2 font-sans">
                  In a 500 km Low Earth Orbit, a satellite travels into Earth's shadow for roughly 35 minutes every 95-minute revolution. Solar cells must generate enough surplus during the 60 minutes of daylight to fully recharge the batteries.
                </p>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60 text-[11px] font-mono text-slate-400">
                <span>Rule: P_net = P_solar - P_draw &gt; 0 in sunlight</span>
              </div>
            </div>

            {/* Module 2: Battery Storage */}
            <div className="p-5 bg-[#081020]/90 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 mb-2 font-mono text-xs font-bold">
                  <Battery size={15} />
                  <span>02 // ENERGY STORAGE (BATT)</span>
                </div>
                <h3 className="text-sm font-bold text-white font-sans">
                  Depth of Discharge & Thermal Health
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-2 font-sans">
                  Discharging batteries below 50% capacity accelerates chemical degradation across thousands of thermal cycles. During the cold soak of eclipse, thermostatic strip heaters keep cells above 0°C to prevent internal resistance spikes.
                </p>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60 text-[11px] font-mono text-slate-400">
                <span>Target: DoD &lt; 40% across 5,000+ orbits</span>
              </div>
            </div>

            {/* Module 3: Communications */}
            <div className="p-5 bg-[#081020]/90 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-sky-400 mb-2 font-mono text-xs font-bold">
                  <Radio size={15} />
                  <span>03 // COMMUNICATIONS (COMM)</span>
                </div>
                <h3 className="text-sm font-bold text-white font-sans">
                  S-Band Pipeline & Link Margin
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-2 font-sans">
                  While UHF whips provide omnidirectional telemetry for safe-mode detumbling, downlinking gigabyte-scale Earth imagery requires high-speed directional S-band transmitters (2.5 Mbps) during 8-minute ground passes over Svalbard or NASA NEN stations.
                </p>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60 text-[11px] font-mono text-slate-400">
                <span>Metric: Target RF link margin &ge; +3.0 dB</span>
              </div>
            </div>

            {/* Module 4: ADCS Pointing */}
            <div className="p-5 bg-[#081020]/90 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 mb-2 font-mono text-xs font-bold">
                  <Compass size={15} />
                  <span>04 // ATTITUDE CONTROL (ADCS)</span>
                </div>
                <h3 className="text-sm font-bold text-white font-sans">
                  Reaction Wheels & Nadir Pointing
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-2 font-sans">
                  Flying at 7.6 km/s, camera optics require sub-arcminute pointing precision (±0.05°) to avoid motion blur. 3-axis reaction wheels spin up to 6,000 RPM, while magnetic torquers interact with Earth's geomagnetic field to dump excess momentum.
                </p>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60 text-[11px] font-mono text-slate-400">
                <span>Requirement: High-res sensors require wheels</span>
              </div>
            </div>

            {/* Module 5: Onboard Computing */}
            <div className="p-5 bg-[#081020]/90 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-purple-400 mb-2 font-mono text-xs font-bold">
                  <Cpu size={15} />
                  <span>05 // COMMAND & DATA (CDH)</span>
                </div>
                <h3 className="text-sm font-bold text-white font-sans">
                  Radiation Hardening & Memory EDAC
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-2 font-sans">
                  Space radiation in the South Atlantic Anomaly triggers Single Event Upsets (SEUs)—bit flips in memory. Dual-core lockstep CPUs and Error Detection and Correction (EDAC) ensure housekeeping tasks and payload capture sequences never freeze.
                </p>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60 text-[11px] font-mono text-slate-400">
                <span>Architecture: MRAM + CCSDS Image ASIC</span>
              </div>
            </div>

            {/* Module 6: Thermal Management */}
            <div className="p-5 bg-[#081020]/90 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-rose-400 mb-2 font-mono text-xs font-bold">
                  <Shield size={15} />
                  <span>06 // THERMAL CONTROL (TCS)</span>
                </div>
                <h3 className="text-sm font-bold text-white font-sans">
                  MLI Insulation & Cold Soaks
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-2 font-sans">
                  External surfaces swing between -100°C in eclipse and +120°C in direct solar radiation. Multi-layer insulation (MLI) blankets reflect infrared radiation while radiator panels reject heat from optical sensors into deep space.
                </p>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60 text-[11px] font-mono text-slate-400">
                <span>Envelope: Internal avionics held at 0°C to +35°C</span>
              </div>
            </div>

          </div>

        </section>

      </main>

      {/* Operations Manual Modal */}
      <UnifiedMissionGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        selectedDifficulty={mission.briefing.difficulty}
        selectedTargetId={mission.briefing.targetId}
      />
    </div>
  );
};

export default SubsystemsPage;
