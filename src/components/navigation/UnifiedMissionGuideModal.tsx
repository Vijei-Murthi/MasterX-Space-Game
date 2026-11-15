import React, { useState, useMemo } from 'react';
import {
  Compass,
  X,
  Search,
  BookOpen,
  Box,
  Zap,
  Globe,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MissionDifficulty, ScientificTargetId } from '../../types/briefing';

interface MissionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDifficulty?: MissionDifficulty;
  selectedTargetId?: ScientificTargetId;
}

type EncyclopediaCategory = 'all' | 'basics' | 'subsystems' | 'payload' | 'orbits' | 'glossary';

interface EncyclopediaArticle {
  id: string;
  category: 'basics' | 'subsystems' | 'payload' | 'orbits' | 'glossary';
  title: string;
  badge: string;
  summary: string;
  content: string;
  bulletPoints?: string[];
}

const ENCYCLOPEDIA_ARTICLES: EncyclopediaArticle[] = [
  {
    id: 'enc-01-cubesat-standard',
    category: 'basics',
    title: 'CubeSat Standard (1U to 6U)',
    badge: 'FORM FACTOR',
    summary: 'Standardized nanosatellite architecture originating from Cal Poly & Stanford in 1999.',
    content:
      'A single CubeSat unit (1U) measures exactly 10 × 10 × 11.35 cm with a standard mass limit of ~1.33 kg. Standardized deployer canisters (P-POD, Rail dispensers) allow satellites to safely rideshare on orbital launchers.',
    bulletPoints: [
      '1U: Technology demonstrators and educational beacons (~1 kg)',
      '3U: Industry standard for high-resolution remote sensing constellations (~4 kg)',
      '6U/12U: Deep-space interplanetary exploration and hyperspectral imaging',
    ],
  },
  {
    id: 'enc-02-eps-power',
    category: 'subsystems',
    title: 'Electrical Power System (EPS)',
    badge: 'POWER GENERATION',
    summary: 'Solar arrays, maximum power point tracking (MPPT), and bus voltage regulation.',
    content:
      'The EPS captures sunlight through body-mounted or deployable articulated gallium arsenide (GaAs) photovoltaic arrays. It regulates internal bus voltages (typically 3.3V, 5V, 12V, and unregulated battery bus).',
    bulletPoints: [
      'Body-mounted arrays: Zero deployment failure risk; lower average power yield (~18W)',
      'Deployable wings: Triple-junction cells yielding up to 38W with burn-wire release springs',
      'Power balance must satisfy: Daylight harvest > Continuous load + Eclipse reserve charge',
    ],
  },
  {
    id: 'enc-03-batteries',
    category: 'subsystems',
    title: 'Chemical Energy Storage (BATT)',
    badge: 'ENERGY STORAGE',
    summary: 'Lithium-Ion and LiFePO4 chemistry surviving 35-minute orbital eclipse shadows.',
    content:
      'In Low Earth Orbit, a CubeSat passes through Earth eclipse umbra for roughly 35 minutes out of every 95-minute orbit. Batteries provide uninterrupted power to avionics and heaters.',
    bulletPoints: [
      'Depth of Discharge (DoD): Kept under 40% to achieve 5,000+ thermal charge cycles',
      'Thermal heaters: Autonomous Kapton strips prevent lithium plating below 0°C',
    ],
  },
  {
    id: 'enc-04-communications',
    category: 'subsystems',
    title: 'RF Communications & Telemetry (COMM)',
    badge: 'TRANSCEIVERS & ANTENNAS',
    summary: 'UHF/VHF housekeeping beacons and high-speed directional S-band Earth imagery downlink.',
    content:
      'CubeSats employ dual-tier radio architectures: omnidirectional whip antennas for initial detumbling and emergency recovery, and directional planar patch arrays for megabit-per-second scientific downlink.',
    bulletPoints: [
      'UHF (437 MHz): 9.6 kbps omnidirectional TT&C telemetry pipe',
      'S-Band (2.2 GHz): 2.5 Mbps directional downlink to ground stations during 8-minute passes',
      'Link budget: Accounts for free space path loss, atmospheric attenuation, and receiver sensitivity',
    ],
  },
  {
    id: 'enc-05-adcs',
    category: 'subsystems',
    title: 'Attitude Determination & Control (ADCS)',
    badge: 'STABILIZATION & ORIENTATION',
    summary: 'Reaction wheels, magnetic torquers, and star trackers for sub-arcminute pointing precision.',
    content:
      'High-resolution Earth observation requires the spacecraft to point its optical telescope nadir (directly towards Earth) with high stability while moving at 7.6 km/s.',
    bulletPoints: [
      'Reaction wheels: Micro-flywheels spinning up to 6,000 RPM imparting precise restorative torque',
      'Magnetic torquers: Solid-state coils interacting with Earth’s magnetic field to desaturate wheels',
      'Star tracker: Autonomous miniature CMOS camera identifying constellations for celestial fix',
    ],
  },
  {
    id: 'enc-06-payloads',
    category: 'payload',
    title: 'Scientific Observation Instruments',
    badge: 'REMOTE SENSING',
    summary: 'High-resolution visible cameras, multispectral push-brooms, and thermal infrared sensors.',
    content:
      'Scientific payloads collect planetary surface data across visible, near-infrared, and thermal spectra. Performance is characterized by Ground Sampling Distance (GSD) and swath coverage.',
    bulletPoints: [
      'Ground Sampling Distance (GSD): 2.5m GSD resolves roads and vessels; 10m captures agricultural parcels',
      'Multispectral ratio: NDVI compares Red vs Near-IR reflectance to quantify plant vigor',
      'Hyperspectral sounding: 64 continuous bands detect atmospheric methane and greenhouse gas plumes',
    ],
  },
  {
    id: 'enc-07-orbits',
    category: 'orbits',
    title: 'Orbital Regimes & Launch Insertion',
    badge: 'ASTRODYNAMICS',
    summary: 'Sun-Synchronous Orbits (SSO), Keplerian parameters, and commercial deployer dispensers.',
    content:
      'The choice of orbit determines lighting angles, eclipse duration, and ground revisit frequency. Sun-Synchronous Orbit (SSO) at 500 km provides constant solar illumination for uniform optical imaging.',
    bulletPoints: [
      '500 km SSO (97.4° inclination): Constant 10:30 AM local solar time; optimal for optical remote sensing',
      '400 km LEO (51.6° inclination): Low launch cost; frequent overflights of temperate zones',
      'Falcon 9 & Electron: Commercial rideshares utilizing standard canister deployers',
    ],
  },
  {
    id: 'enc-08-glossary',
    category: 'glossary',
    title: 'Aerospace Engineering Glossary',
    badge: 'TERMINOLOGY',
    summary: 'Core NASA and aerospace abbreviations used across MASTERX.',
    content:
      'Standardized aerospace definitions to assist players in interpreting engineering telemetry.',
    bulletPoints: [
      'DoD (Depth of Discharge): Percentage of total battery capacity consumed during discharge',
      'GSD (Ground Sampling Distance): Pixel footprint size on Earth surface',
      'MPPT (Maximum Power Point Tracking): Electronic circuit optimizing solar cell wattage extraction',
      'Nadir: Direction pointing directly downward toward the center of the Earth',
      'SEU (Single Event Upset): Cosmic-ray bit flip in onboard avionics memory',
      'Umbra: Region of total shadow where the Earth completely blocks the solar disc',
    ],
  },
];

export const UnifiedMissionGuideModal: React.FC<MissionGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<EncyclopediaCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>('enc-01-cubesat-standard');

  const categories: { id: EncyclopediaCategory; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'all', label: 'All Topics', icon: BookOpen },
    { id: 'basics', label: 'CubeSat Basics', icon: Box },
    { id: 'subsystems', label: 'Subsystems & EPS', icon: Zap },
    { id: 'payload', label: 'Payloads & Optics', icon: Layers },
    { id: 'orbits', label: 'Orbits & Launch', icon: Globe },
    { id: 'glossary', label: 'Aerospace Glossary', icon: Shield },
  ];

  // Filtered articles based on search query and category
  const filteredArticles = useMemo(() => {
    return ENCYCLOPEDIA_ARTICLES.filter((article) => {
      const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        article.title.toLowerCase().includes(q) ||
        article.summary.toLowerCase().includes(q) ||
        article.content.toLowerCase().includes(q) ||
        (article.bulletPoints && article.bulletPoints.some((b) => b.toLowerCase().includes(q)));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#081020]/95 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header Banner */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-950/80 border border-sky-800 flex items-center justify-center">
              <Compass size={18} className="text-sky-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-sky-400 font-bold block uppercase tracking-wider">
                MASTERX TECHNICAL ENCYCLOPEDIA
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white uppercase font-sans">
                AEROSPACE OPERATIONS & CUBESAT MANUAL
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Operations Manual"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Search Bar */}
        <div className="px-6 py-3 bg-[#060c18] border-b border-slate-800">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search encyclopedia topics (e.g. Solar, EPS, Reaction Wheels, S-Band, GSD, Orbit)..."
              className="w-full pl-9 pr-8 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/80 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills (no white scrollbars) */}
        <div className="flex px-6 py-2.5 bg-[#070e1c] border-b border-slate-800/80 gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon size={12} className={isActive ? 'text-slate-950' : 'text-sky-400'} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Topic Articles Accordion Container */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1 custom-scrollbar">
          {filteredArticles.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <BookOpen size={28} className="text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-400 font-sans">No matching topics found</p>
              <p className="text-xs text-slate-500 font-mono">
                Try searching for "power", "reaction wheels", "GSD", "antenna", or clear your filter.
              </p>
            </div>
          ) : (
            filteredArticles.map((article) => {
              const isExpanded = expandedArticleId === article.id;

              return (
                <div
                  key={article.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden transition-all text-left"
                >
                  {/* Article Accordion Header */}
                  <button
                    type="button"
                    onClick={() => setExpandedArticleId(isExpanded ? null : article.id)}
                    className="w-full p-4 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-slate-800/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-bold uppercase">
                          {article.badge}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-white font-sans">
                        {article.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-sans mt-0.5">
                        {article.summary}
                      </p>
                    </div>

                    <div className="shrink-0 p-1 rounded-lg bg-slate-800/60 text-slate-400">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {/* Expanded Article Body */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-800/70 text-xs text-slate-300 space-y-3 font-sans leading-relaxed">
                      <p>{article.content}</p>

                      {article.bulletPoints && article.bulletPoints.length > 0 && (
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5 font-mono text-[11px]">
                          <span className="text-slate-500 uppercase tracking-wider block text-[10px]">
                            KEY ENGINEERING TAKEAWAYS:
                          </span>
                          <ul className="space-y-1 text-slate-300 list-disc list-inside">
                            {article.bulletPoints.map((bp, i) => (
                              <li key={i}>{bp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#060c18] border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>MASTERX ENCYCLOPEDIA // EXPANDABLE REFERENCE ARCHITECTURE</span>
          <span>{filteredArticles.length} TOPICS AVAILABLE</span>
        </div>

      </div>
    </div>
  );
};

export default UnifiedMissionGuideModal;
