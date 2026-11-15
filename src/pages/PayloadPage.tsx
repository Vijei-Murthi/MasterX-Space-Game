/**
 * MASTERX – SPACE MACHINE
 * Stage 04: Scientific Payload Selection
 * 
 * Immersive game experience:
 * - 3D Cleanroom spacecraft visualization showcasing Earth-facing Nadir optics
 * - Scientific instrument cards with simulated observation swaths & spectral bands
 * - Objective alignment indicators
 * - Refactored, non-intrusive secondary integration notes
 * - Scroll-based educational remote sensing modules
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Layers,
  ArrowRight,
  ArrowLeft,
  Check,
  Info,
  Eye,
  Activity,
  Sun,
  Flame,
  BarChart3,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import UnifiedGameNav from '../components/navigation/UnifiedGameNav';
import UnifiedMissionGuideModal from '../components/navigation/UnifiedMissionGuideModal';
import ResourceDashboard from '../components/dashboard/ResourceDashboard';
import SpacecraftMoonScene from '../components/spacecraft/SpacecraftMoonScene';
import { PAYLOAD_CATALOGUE, calculateResourceMetrics, PayloadInstrument } from '../adapters/engineeringAdapter';

export const PayloadPage: React.FC = () => {
  const navigate = useNavigate();
  const { mission, updatePayload } = useMission();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [expandedDetailsId, setExpandedDetailsId] = useState<string | null>(null);

  // Live Metrics
  const metrics = useMemo(() => calculateResourceMetrics(mission), [mission]);

  const selectedPayload = useMemo<PayloadInstrument>(() => {
    return (
      PAYLOAD_CATALOGUE.find((p) => p.id === mission.payload.selectedPayloadId) ||
      PAYLOAD_CATALOGUE[0]
    );
  }, [mission.payload.selectedPayloadId]);

  const handleSelectPayload = (instrument: PayloadInstrument) => {
    updatePayload({ selectedPayloadId: instrument.id });
  };

  // Helper to get simulated observation swatch style & description
  const getObservationSample = (id: string) => {
    switch (id) {
      case 'payload-opt-hires':
        return {
          title: 'Simulated 2.5m GSD Visible / NIR Swath',
          gradient: 'from-sky-900/60 via-slate-800/80 to-emerald-900/40',
          metric: 'Ultra-High Sharpness • Urban Grid & Coastal Jetties',
          accent: 'text-sky-400',
        };
      case 'payload-multispec':
        return {
          title: 'Simulated 5-Band NDVI False-Color Swath',
          gradient: 'from-emerald-950/70 via-teal-900/60 to-blue-950/70',
          metric: 'Chlorophyll Absorption • Coastal Sediment Turbidity',
          accent: 'text-emerald-400',
        };
      case 'payload-hyperspec':
        return {
          title: 'Simulated 64-Band Continuous VNIR Spectral Swath',
          gradient: 'from-indigo-950/70 via-purple-900/60 to-slate-900/80',
          metric: 'Continuous Reflected Spectrum • Methane Plume Fingerprint',
          accent: 'text-purple-400',
        };
      case 'payload-thermo-ir':
        return {
          title: 'Simulated 8-14µm Thermal Infrared Radiance Swath',
          gradient: 'from-amber-950/70 via-rose-950/60 to-slate-900/80',
          metric: 'Day/Night Thermal Inertia • Sea Surface Temperature (SST)',
          accent: 'text-amber-400',
        };
      default:
        return {
          title: 'Simulated Earth Observation Swath',
          gradient: 'from-slate-900 to-slate-800',
          metric: 'Earth Optical Sweep',
          accent: 'text-sky-400',
        };
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030712] text-slate-100 flex flex-col justify-between overflow-x-hidden pt-20 pb-16">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-radial from-slate-900/40 via-[#030712] to-[#02040a]" />

      {/* Top Floating Navigation */}
      <UnifiedGameNav
        activeStage="04"
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. STAGE HEADER & NAVIGATION CONTROLS                                     */}
        {/* ========================================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-4 bg-sky-500 rounded-xs" />
              <span className="text-xs font-mono font-bold tracking-widest text-sky-400 uppercase">
                STAGE 04 // SCIENTIFIC INSTRUMENTATION & SENSORS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-sans">
              SELECT EARTH OBSERVATION PAYLOAD
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Equip your satellite with scientific sensors matched to your selected mission objective: <strong className="text-sky-300 uppercase">{mission.planner.objectiveId}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/subsystems')}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 rounded-full text-xs font-mono text-slate-300 transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>SUBSYSTEMS</span>
            </button>

            <button
              onClick={() => navigate('/orbit-launch')}
              className="flex items-center gap-2 px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-bold text-xs uppercase rounded-full transition-all cursor-pointer shadow-lg shadow-sky-500/20"
            >
              <span>PROCEED TO ORBIT & LAUNCH</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. LIVE RESOURCE HUD                                                      */}
        {/* ========================================================================= */}
        <ResourceDashboard metrics={metrics} compact={true} />

        {/* ========================================================================= */}
        {/* 3. HERO WORKSPACE: 3D OPTICAL APERTURE & INSTRUMENT CATALOGUE             */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT: 3D SPACECRAFT NADIR OPTICS VIEWPORT (5 cols on lg) */}
          <div className="lg:col-span-5 h-[420px] sm:h-[480px] lg:h-auto min-h-[420px] rounded-3xl overflow-hidden border border-slate-800/90 bg-[#081020]/90 shadow-2xl relative flex flex-col">
            <div className="w-full h-full relative">
              <SpacecraftMoonScene
                selectedComponents={mission.spacecraft}
                initialPreset="bottom"
                highlightSubsystem="payload"
                cameraDistance={4.2}
                autoRotate={false}
                selectedPayloadId={selectedPayload.id}
              />
            </div>

            {/* Active Sensor Callout Overlay */}
            <div className="absolute top-4 inset-x-4 pointer-events-none z-20 flex justify-center">
              <div className="px-3.5 py-1.5 bg-[#060c18]/90 backdrop-blur-md border border-sky-500/40 rounded-full flex items-center gap-2 text-[10px] font-mono shadow-xl">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-slate-400">NADIR SENSOR:</span>
                <strong className="text-white truncate max-w-[200px]">{selectedPayload.name}</strong>
              </div>
            </div>

            <div className="absolute bottom-4 inset-x-4 pointer-events-none z-20 flex justify-center">
              <div className="px-3 py-1 bg-[#060c18]/85 backdrop-blur-md border border-slate-800 rounded-lg text-[10px] font-mono text-slate-400 text-center shadow-lg">
                <span>Earth-facing lower deck telescope aperture actively aligned</span>
              </div>
            </div>
          </div>

          {/* RIGHT: SCIENTIFIC INSTRUMENT SELECTION LIST (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-4">
            {PAYLOAD_CATALOGUE.map((instrument) => {
              const isSelected = instrument.id === selectedPayload.id;
              const matchesObjective = instrument.primaryObjectiveMatch.includes(mission.planner.objectiveId);
              const sample = getObservationSample(instrument.id);
              const isDetailsOpen = expandedDetailsId === instrument.id;

              return (
                <div
                  key={instrument.id}
                  onClick={() => handleSelectPayload(instrument)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                    isSelected
                      ? 'bg-sky-950/30 border-sky-500 shadow-xl ring-1 ring-sky-500/40'
                      : 'bg-[#081020]/80 border-slate-800/90 hover:border-slate-700 hover:bg-[#0a1428]/90'
                  }`}
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-bold uppercase">
                            {instrument.volumeUnitsU}U FORM FACTOR
                          </span>
                          {matchesObjective && (
                            <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                              ★ OBJECTIVE MATCH
                            </span>
                          )}
                          {isSelected && (
                            <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                              <Check size={11} /> EQUIPPED ON SPACECRAFT
                            </span>
                          )}
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-white font-sans">{instrument.name}</h3>
                      </div>

                      <div className="text-right font-mono text-xs shrink-0">
                        <span className="text-emerald-400 font-bold block text-sm">
                          ${(instrument.costUSD / 1000).toLocaleString()}k
                        </span>
                        <span className="text-slate-400 text-[11px]">{instrument.massKg} kg</span>
                      </div>
                    </div>

                    {/* Scientific Purpose Description */}
                    <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3.5">
                      {instrument.description}
                    </p>

                    {/* Simulated Observation Imagery Swatch */}
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${sample.gradient} border border-slate-800 mb-3.5`}>
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-200 font-bold flex items-center gap-1.5">
                          <Eye size={13} className={sample.accent} />
                          {sample.title}
                        </span>
                        <span className="text-[10px] text-slate-400 hidden sm:inline">
                          Simulated Swath
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-300 mt-1">
                        {sample.metric}
                      </p>
                    </div>

                    {/* Optical Capabilities Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3.5 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60 text-[10px] font-mono">
                      <div>
                        <span className="text-slate-500 block uppercase">GROUND RESOLUTION</span>
                        <span className="text-sky-300 font-bold text-xs">{instrument.groundSamplingDistanceM} m / pixel</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase">DATA GENERATION</span>
                        <span className="text-slate-200 font-bold text-xs">{instrument.dataRateMbps} Mbps stream</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-slate-500 block uppercase">DUTY CYCLE</span>
                        <span className="text-slate-200 font-bold text-xs">{instrument.dutyCycleRecommendedPercent}% orbit time</span>
                      </div>
                    </div>

                    {/* Spectral Bands Pills */}
                    <div className="mb-3.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
                        SPECTRAL CHANNELS:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {instrument.spectralBands.map((band, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-slate-800/90 text-slate-300 rounded text-[10px] font-mono"
                          >
                            {band}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Refactored Clean Secondary Integration Note (Section 6) */}
                    <div className="mb-3.5 p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px] mb-1">
                        <Info size={13} className="text-sky-400 shrink-0" />
                        <span className="font-semibold uppercase tracking-wider text-slate-300">
                          Mission Integration Context
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-sans leading-relaxed pl-4.5">
                        {instrument.groundSamplingDistanceM <= 5.0
                          ? 'Narrow field-of-view catadioptric optics require sub-arcminute pointing precision from 3-axis reaction wheels to avoid ground motion smear.'
                          : 'Broad-swath sensor tolerant of coarse stabilization, generating manageable telemetry well suited for daily global coverage.'}
                      </p>
                    </div>

                    {/* Expandable Specifications Table */}
                    {instrument.specs && (
                      <div className="mb-3.5 text-left">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedDetailsId(isDetailsOpen ? null : instrument.id);
                          }}
                          className="text-[11px] font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>{isDetailsOpen ? '− Hide Optical Specs' : '+ View Technical Optical Parameters'}</span>
                        </button>
                        {isDetailsOpen && (
                          <div className="mt-2 p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1 text-[10px] font-mono text-slate-400">
                            {Object.entries(instrument.specs).map(([key, val]) => (
                              <div key={key} className="flex justify-between">
                                <span>{key}:</span>
                                <span className="text-slate-200 font-medium">{val}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer Action Row */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">
                      Power Draw: <strong className="text-white">{instrument.powerWatts} W</strong> ({instrument.dutyCycleRecommendedPercent}% duty)
                    </span>

                    <button
                      type="button"
                      className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all shadow-md ${
                        isSelected
                          ? 'bg-sky-500 text-slate-950 ring-1 ring-sky-300/50'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {isSelected ? 'EQUIPPED' : 'EQUIP INSTRUMENT'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 4. SCROLL-BASED EDUCATIONAL REMOTE SENSING MODULES (Section 7 Requirement) */}
        {/* ========================================================================= */}
        <section className="pt-10 border-t border-slate-800/80 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-4 bg-sky-500 rounded-xs" />
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase font-sans tracking-tight">
              EARTH OBSERVATION REMOTE SENSING PRINCIPLES
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Satellite instruments convert reflected photons into calibrated planetary datasets. Learn how spatial resolution, spectral absorption, and swath geometry affect mission yield.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
            
            {/* Guide 1: GSD */}
            <div className="p-5 bg-[#081020]/90 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-sky-400 mb-2 font-mono text-xs font-bold">
                  <Camera size={15} />
                  <span>01 // GROUND SAMPLING DISTANCE</span>
                </div>
                <h3 className="text-sm font-bold text-white font-sans">
                  Spatial Resolution vs Swath Tradeoff
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-2 font-sans">
                  Ground Sampling Distance (GSD) is the real-world distance represented by the center of two adjacent pixels. At 2.5m GSD, individual buildings and ships are discernible, but swath width narrows to 12.8 km, requiring multiple passes to cover large regions.
                </p>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60 text-[11px] font-mono text-slate-400">
                <span>Rule: Finer GSD increases focal length & data size</span>
              </div>
            </div>

            {/* Guide 2: Multispectral Bands */}
            <div className="p-5 bg-[#081020]/90 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 mb-2 font-mono text-xs font-bold">
                  <Layers size={15} />
                  <span>02 // SPECTRAL CHANNELS & NDVI</span>
                </div>
                <h3 className="text-sm font-bold text-white font-sans">
                  Chlorophyll-A & Red-Edge Reflectance
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-2 font-sans">
                  Healthy vegetation strongly absorbs visible red light while strongly reflecting near-infrared (NIR). By calculating the ratio NDVI = (NIR - Red) / (NIR + Red), satellites quantify crop yield, drought stress, and algal bloom spread across oceans.
                </p>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60 text-[11px] font-mono text-slate-400">
                <span>Equation: NDVI values range from -1.0 (water) to +1.0 (dense canopy)</span>
              </div>
            </div>

            {/* Guide 3: Hyperspectral Sounding */}
            <div className="p-5 bg-[#081020]/90 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-purple-400 mb-2 font-mono text-xs font-bold">
                  <Activity size={15} />
                  <span>03 // HYPERSPECTRAL SOUNDING</span>
                </div>
                <h3 className="text-sm font-bold text-white font-sans">
                  Continuous Atmospheric Fingerprints
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-2 font-sans">
                  Unlike multispectral cameras with 4 or 5 discrete filters, hyperspectral instruments split light into 64 contiguous narrow bands. This reveals chemical absorption signatures for atmospheric methane, sulfur dioxide volcanic emissions, and aerosol optical depth.
                </p>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60 text-[11px] font-mono text-slate-400">
                <span>Pipeline: High data volume requires onboard CCSDS compression</span>
              </div>
            </div>

            {/* Guide 4: Thermal IR */}
            <div className="p-5 bg-[#081020]/90 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-amber-400 mb-2 font-mono text-xs font-bold">
                  <Flame size={15} />
                  <span>04 // THERMAL INFRARED (8-14 µm)</span>
                </div>
                <h3 className="text-sm font-bold text-white font-sans">
                  Surface Radiance & Night Observations
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-2 font-sans">
                  Long-Wave Infrared (LWIR) microbolometers measure blackbody heat emissions from Earth's surface rather than reflected solar photons. This allows round-the-clock temperature retrieval during nighttime orbital passes, pinpointing wildfire perimeters and ocean thermal fronts.
                </p>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60 text-[11px] font-mono text-slate-400">
                <span>Capability: 24/7 day and night thermal mapping</span>
              </div>
            </div>

            {/* Guide 5: Duty Cycle & Power */}
            <div className="p-5 bg-[#081020]/90 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-rose-400 mb-2 font-mono text-xs font-bold">
                  <Sun size={15} />
                  <span>05 // OPERATIONAL DUTY CYCLE</span>
                </div>
                <h3 className="text-sm font-bold text-white font-sans">
                  Thermal Warm-Up & Power Rationing
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-2 font-sans">
                  High-resolution optical focal planes draw 8 to 15 Watts and generate localized heat. Satellites operate sensors on a 15% to 30% duty cycle, turning sensors on only when flying over high-priority geographical targets to preserve battery depth of discharge.
                </p>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60 text-[11px] font-mono text-slate-400">
                <span>Practice: Automated geolocation payload triggers</span>
              </div>
            </div>

            {/* Guide 6: Downlink Budget */}
            <div className="p-5 bg-[#081020]/90 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-teal-400 mb-2 font-mono text-xs font-bold">
                  <BarChart3 size={15} />
                  <span>06 // ONBOARD DATA MANAGEMENT</span>
                </div>
                <h3 className="text-sm font-bold text-white font-sans">
                  Raw Frames to Downlink Queue
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-2 font-sans">
                  A single 10-minute imaging pass produces up to 1.8 GB of raw binary pixel data. The onboard computer stores frames in radiation-hardened flash memory before downlinking to high-gain S-band ground stations during high-elevation overflights.
                </p>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60 text-[11px] font-mono text-slate-400">
                <span>Throughput: Up to 150 frames downlinked per polar pass</span>
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

export default PayloadPage;
