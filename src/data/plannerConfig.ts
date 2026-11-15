import {
  MissionObjective,
  ObservationTarget,
  MissionDurationOption,
  PlannerDifficultyOption,
  ObservationPriorities,
} from '../types/planner';

/**
 * 5 Core Scientific Objectives for CubeSat Earth Observation Game
 */
export const MISSION_OBJECTIVES: MissionObjective[] = [
  {
    id: 'vegetation-agriculture',
    title: 'Vegetation & Agriculture Monitoring',
    shortName: 'Biosphere & Crops',
    tagline: 'Track planetary crop vigor, food security, and forest canopy health.',
    description:
      'Utilize calibrated multispectral optical imaging in Red and Near-Infrared bands to compute Normalized Difference Vegetation Index (NDVI) and detect drought-induced moisture deficits.',
    scientificImportance:
      'Crucial for forecasting global crop yield shortfalls, detecting early-stage agricultural droughts, and mapping tropical deforestation vectors.',
    examplePurpose:
      'Estimate soybean and wheat biomass across major agricultural belts and alert humanitarian agencies to emerging crop failures.',
    primaryBands: 'Red (660 nm) & Near-Infrared (860 nm) VNIR',
    suggestedSensor: 'High-SNR 4-Band Pushbroom Imager',
    colorAccent: '#10b981', // Emerald
    badge: 'BIOSPHERE MISSION',
    iconName: 'Sprout',
    suggestedTargetIds: ['target-midwest', 'target-amazon', 'target-gangetic'],
  },
  {
    id: 'ocean-observation',
    title: 'Ocean & Coastal Water Observation',
    shortName: 'Hydrosphere & Coasts',
    tagline: 'Monitor ocean phytoplankton color, coastal sedimentation, and coral reef stress.',
    description:
      'Measure visible light backscattered from marine upper-layers to calculate chlorophyll-a concentrations, marine algal blooms, and riverine sediment transport into vulnerable estuaries.',
    scientificImportance:
      'Oceans absorb over 90% of excess planetary heat. Monitoring marine ecology and coastal sediment dynamics is vital for coastal erosion defenses and fishery management.',
    examplePurpose:
      'Detect toxic cyanobacteria blooms in coastal bays before aquaculture contamination and monitor turbidity around coral reef barrier systems.',
    primaryBands: 'Coastal Blue (443 nm), Green (560 nm), Red (665 nm)',
    suggestedSensor: 'Wide-Swath Littoral Ocean Radiometer',
    colorAccent: '#0284c7', // Ocean Blue
    badge: 'HYDROSPHERE MISSION',
    iconName: 'Waves',
    suggestedTargetIds: ['target-barrier-reef', 'target-gulf-mexico', 'target-mediterranean'],
  },
  {
    id: 'land-surface',
    title: 'Land Surface & Geomorphology Monitoring',
    shortName: 'Geosphere & Land',
    tagline: 'Observe tectonic fault slippage, urban expansion, and desertification fringes.',
    description:
      'Collect repeat optical and shortwave infrared passes to map land use conversion, soil mineral composition, glacial retreat lines, and surface geologic deformations.',
    scientificImportance:
      'Provides high-resolution baseline basemaps to measure desert encroachment, tectonic rift activity, and metropolitan urban heat island expansion.',
    examplePurpose:
      'Survey dryland desertification boundaries along the African Sahel and measure seasonal mountain glacier retreat in the Himalayas.',
    primaryBands: 'Visible (RGB), Shortwave Infrared (SWIR 1.6 µm)',
    suggestedSensor: 'High-Resolution Stereoscopic Land Imager',
    colorAccent: '#d97706', // Earth Amber
    badge: 'GEOSPHERE MISSION',
    iconName: 'Mountain',
    suggestedTargetIds: ['target-sahel', 'target-himalayas', 'target-tokyo-corridor'],
  },
  {
    id: 'atmospheric-monitoring',
    title: 'Atmospheric Physics & Emission Monitoring',
    shortName: 'Atmosphere & Clouds',
    tagline: 'Measure airborne wildfire aerosols, methane emissions, and storm convective clouds.',
    description:
      'Observe sunlight absorption by greenhouse gases and particulate scattering across thermal and shortwave bands to quantify aerosol optical thickness and storm top heights.',
    scientificImportance:
      'Atmospheric circulation governs planetary weather extremes. Nanosatellite thermal monitoring fills observation gaps between large weather satellites.',
    examplePurpose:
      'Quantify industrial emissions plumes over manufacturing hubs and track wildfire smoke trajectories across continental airspace.',
    primaryBands: 'Shortwave IR (2.3 µm) & Thermal IR (10.8 µm)',
    suggestedSensor: 'Micro-Spectrometer & Thermal IR Bolometer',
    colorAccent: '#6366f1', // Indigo / Atmosphere
    badge: 'ATMOSPHERE MISSION',
    iconName: 'CloudRain',
    suggestedTargetIds: ['target-sahara-plume', 'target-industrial-megacity', 'target-pacific-storm'],
  },
  {
    id: 'disaster-flood',
    title: 'Disaster Rapid Response & Flood Monitoring',
    shortName: 'Disaster Assessment',
    tagline: 'Deliver rapid imaging during catastrophic floods, tsunamis, and wildfire events.',
    description:
      'Prioritize rapid observation revisit frequency over extreme spectral resolution to provide emergency civil defense authorities with inundated land perimeters and active fire fronts.',
    scientificImportance:
      'Rapid-response satellite mapping saves lives by identifying washed-out transport links, submerged settlements, and evacuation bottlenecks within hours of disaster onset.',
    examplePurpose:
      'Generate flood inundation perimeter maps for disaster response coordinators within 4 hours of a cyclone landfall.',
    primaryBands: 'High-Contrast NIR & Panchromatic (450–800 nm)',
    suggestedSensor: 'Agile Pointing Fast-Framing Camera',
    colorAccent: '#ef4444', // Warning Coral / Crimson
    badge: 'RAPID RESPONSE MISSION',
    iconName: 'AlertTriangle',
    suggestedTargetIds: ['target-bengal-delta', 'target-california-fire', 'target-pacific-fault'],
  },
];

/**
 * Geographic Observation Targets
 */
export const OBSERVATION_TARGETS: ObservationTarget[] = [
  // Agriculture & Biosphere
  {
    id: 'target-midwest',
    name: 'Midwestern US Grain Belt',
    region: 'North America (Iowa / Illinois)',
    coordinates: '41.8781° N, 93.0977° W',
    description: 'High-yield commercial corn and soybean intensive crop zone. Key baseline for continental NDVI vegetation indices.',
    scientificMetric: 'Canopy Chlorophyll Index (CCI) & Soil Moisture Deficit',
    coveragePattern: 'Grid Mosaic',
    compatibleObjectives: ['vegetation-agriculture', 'land-surface'],
    spectralFocus: 'Red Edge / Near-Infrared',
  },
  {
    id: 'target-amazon',
    name: 'Amazon Rainforest Trans-Basin',
    region: 'South America (Pará / Mato Grosso)',
    coordinates: '3.4653° S, 62.2159° W',
    description: 'Dense tropical rainforest canopy with active frontier clearings. Vital for global carbon sink quantification.',
    scientificMetric: 'Deforestation Rate (km²/week) & Canopy Biomass Density',
    coveragePattern: 'Continuous Swath',
    compatibleObjectives: ['vegetation-agriculture', 'land-surface', 'disaster-flood'],
    spectralFocus: 'VNIR Moisture Index',
    threatLevel: 'Elevated',
  },
  {
    id: 'target-gangetic',
    name: 'Indo-Gangetic Agricultural Plains',
    region: 'South Asia (Punjab / Uttar Pradesh)',
    coordinates: '26.8467° N, 80.9462° E',
    description: 'Intensively cultivated double-crop rice-wheat rotation serving over 400 million citizens. Vulnerable to heatwaves.',
    scientificMetric: 'Crop Evapotranspiration & Post-Monsoon Soil Moisture',
    coveragePattern: 'Grid Mosaic',
    compatibleObjectives: ['vegetation-agriculture', 'disaster-flood'],
    spectralFocus: 'Visible / Red Edge',
  },

  // Oceans & Marine
  {
    id: 'target-barrier-reef',
    name: 'Great Barrier Reef Marine Park',
    region: 'Australasia (Coral Sea / Queensland)',
    coordinates: '18.2871° S, 147.6992° E',
    description: 'World’s largest coral reef structure. High vulnerability to marine heatwaves and river sediment runoff.',
    scientificMetric: 'Coral Bleaching Thermal Index & Water Turbidity',
    coveragePattern: 'Rapid Littoral Strip',
    compatibleObjectives: ['ocean-observation', 'disaster-flood'],
    spectralFocus: 'Cyan Water Penetration (480 nm)',
    threatLevel: 'Critical',
  },
  {
    id: 'target-gulf-mexico',
    name: 'Mississippi Delta & Gulf Shelf',
    region: 'Gulf of Mexico (Louisiana Coast)',
    coordinates: '29.1522° N, 89.2514° W',
    description: 'Nutrient-rich river outflow producing seasonal hypoxia dead-zones and extensive sediment plume dispersion.',
    scientificMetric: 'Suspended Sediment Volume & Algal Chlorophyll Bloom Density',
    coveragePattern: 'Continuous Swath',
    compatibleObjectives: ['ocean-observation', 'land-surface'],
    spectralFocus: 'Cyan-to-Red Radiance',
  },
  {
    id: 'target-mediterranean',
    name: 'Western Mediterranean Basin',
    region: 'Southern Europe (Balearic Sea)',
    coordinates: '39.0000° N, 2.5000° E',
    description: 'Semi-enclosed sea experiencing heightened surface temperatures, maritime shipping emissions, and coastal tourism pressures.',
    scientificMetric: 'Sea Surface Temperature Anomalies & Littoral Plastics Drift',
    coveragePattern: 'Continuous Swath',
    compatibleObjectives: ['ocean-observation', 'atmospheric-monitoring'],
    spectralFocus: 'Thermal / Visible Ocean Color',
  },

  // Land & Geosphere
  {
    id: 'target-sahel',
    name: 'Sahelian Desertification Transition Zone',
    region: 'Sub-Saharan Africa (Niger / Mali)',
    coordinates: '14.5000° N, 2.0000° E',
    description: 'Fragile semi-arid ecotone where the Sahara desert expands southward into scrubland during prolonged drought cycles.',
    scientificMetric: 'Vegetation Cover Fraction & Dune Migration Velocity',
    coveragePattern: 'Continuous Swath',
    compatibleObjectives: ['land-surface', 'vegetation-agriculture'],
    spectralFocus: 'SWIR Mineral Absorption',
    threatLevel: 'Elevated',
  },
  {
    id: 'target-himalayas',
    name: 'Himalayan Glacial Headwaters',
    region: 'Central Asia (Nepal / Tibet)',
    coordinates: '27.9881° N, 86.9250° E',
    description: 'Mountain glacier storage feeding ten major Asian river basins. Rapidly forming unstable proglacial lakes.',
    scientificMetric: 'Glacial Lake Outburst Flood (GLOF) Risk & Snowline Elevation',
    coveragePattern: 'Pinpoint Target',
    compatibleObjectives: ['land-surface', 'disaster-flood'],
    spectralFocus: 'Snow Index / Panchromatic',
    threatLevel: 'Elevated',
  },
  {
    id: 'target-tokyo-corridor',
    name: 'Greater Tokyo Metropolitan Plain',
    region: 'East Asia (Kanto Basin, Japan)',
    coordinates: '35.6762° N, 139.6503° E',
    description: 'World’s most populous metropolitan area with high surface reflectivity, urban heat islands, and seismic vulnerability.',
    scientificMetric: 'Urban Impervious Surface Ratio & Night/Day Thermal Delta',
    coveragePattern: 'Grid Mosaic',
    compatibleObjectives: ['land-surface', 'atmospheric-monitoring'],
    spectralFocus: 'Thermal IR & High-Res Panchromatic',
  },

  // Atmosphere & Disasters
  {
    id: 'target-sahara-plume',
    name: 'Saharan Trans-Atlantic Dust Highway',
    region: 'West Africa to Atlantic (Cape Verde)',
    coordinates: '16.0000° N, 24.0000° W',
    description: 'Massive seasonal mineral dust plumes blown from the Bodélé Depression across the Atlantic, influencing hurricane development.',
    scientificMetric: 'Aerosol Optical Depth (AOD) & Particulate Height Layering',
    coveragePattern: 'Continuous Swath',
    compatibleObjectives: ['atmospheric-monitoring', 'ocean-observation'],
    spectralFocus: 'Blue / Deep UV Aerosol Scattering',
  },
  {
    id: 'target-industrial-megacity',
    name: 'Pearl River Delta Industrial Belt',
    region: 'East Asia (Guangdong, China)',
    coordinates: '22.8000° N, 113.3000° E',
    description: 'Dense cluster of manufacturing facilities, port logistics, and power stations generating localized aerosol loading.',
    scientificMetric: 'Nitrogen Dioxide Absorption & Industrial Heat Signatures',
    coveragePattern: 'Grid Mosaic',
    compatibleObjectives: ['atmospheric-monitoring', 'disaster-flood'],
    spectralFocus: 'Shortwave Absorption & Thermal',
  },
  {
    id: 'target-bengal-delta',
    name: 'Ganges-Brahmaputra Flood Delta',
    region: 'South Asia (Bangladesh Coast)',
    coordinates: '22.5000° N, 89.8000° E',
    description: 'Low-lying river delta inhabited by over 100 million people, subject to severe monsoon inundation and cyclone storm surges.',
    scientificMetric: 'Surface Water Inundation Extent & Evacuation Route Integrity',
    coveragePattern: 'Rapid Littoral Strip',
    compatibleObjectives: ['disaster-flood', 'ocean-observation'],
    spectralFocus: 'High-Contrast Water Index (MNDWI)',
    threatLevel: 'Critical',
  },
  {
    id: 'target-california-fire',
    name: 'Sierra Nevada Wildfire Corridor',
    region: 'North America (Northern California)',
    coordinates: '39.5000° N, 121.5000° W',
    description: 'Drought-stressed conifer forest subject to extreme seasonal Santa Ana wind-driven wildfire ignitions.',
    scientificMetric: 'Burn Scar Perimeter & Active Thermal Fire Radiative Power (MW)',
    coveragePattern: 'Pinpoint Target',
    compatibleObjectives: ['disaster-flood', 'vegetation-agriculture', 'atmospheric-monitoring'],
    spectralFocus: 'Mid-Wave Thermal IR (3.9 µm)',
    threatLevel: 'Critical',
  },
];

/**
 * Mission Duration Options
 */
export const MISSION_DURATIONS: MissionDurationOption[] = [
  {
    id: '3-months',
    months: 3,
    days: 90,
    title: '3 Months: Technology Demonstration',
    subtitle: 'Rapid Proof-of-Concept in LEO',
    gameTradeoffs:
      'Minimal radiation exposure and low component degradation. Fits low budgets but provides only one seasonal snapshot with limited repeat passes.',
    radiationExposure: 'Low',
    batteryCycles: '~1,350 charge cycles',
    scienceYield: 'Baseline functional validation (~150 high-priority image frames)',
    orbitalDecayRisk: 'Negligible',
  },
  {
    id: '6-months',
    months: 6,
    days: 180,
    title: '6 Months: Primary Science Survey',
    subtitle: 'Standard Single-Season Campaign',
    gameTradeoffs:
      'Balanced operational lifespan. Captures wet-to-dry seasonal transitions while keeping battery depth-of-discharge within safe commercial thresholds.',
    radiationExposure: 'Moderate',
    batteryCycles: '~2,700 charge cycles',
    scienceYield: 'Substantial regional survey (~400 calibrated spectral passes)',
    orbitalDecayRisk: 'Low',
  },
  {
    id: '12-months',
    months: 12,
    days: 365,
    title: '12 Months: Full Annual Earth Cycle',
    subtitle: 'Comprehensive 4-Season Climate Baseline',
    gameTradeoffs:
      'Captures an entire agricultural year and seasonal sea surface changes. Demands higher battery reserve margin and high-grade solar cells to counter cell degradation.',
    radiationExposure: 'High',
    batteryCycles: '~5,400 charge cycles',
    scienceYield: 'Complete annual climatic record (> 1,000 multi-spectral frames)',
    orbitalDecayRisk: 'Moderate',
  },
  {
    id: '24-months',
    months: 24,
    days: 730,
    title: '24 Months: Multi-Year Climate Record',
    subtitle: 'Long-Term Environmental Observatory',
    gameTradeoffs:
      'Produces high-value peer-reviewed climate data comparing consecutive annual baselines. Requires radiation-hardened electronics, thermal paint longevity, and aerodynamic drag mitigation.',
    radiationExposure: 'Severe',
    batteryCycles: '~10,800 charge cycles',
    scienceYield: 'Multi-year environmental time series (> 2,500 scientific datasets)',
    orbitalDecayRisk: 'High',
  },
];

/**
 * 3 Mission Constraint Difficulty Tiers (Aligned with Briefing & Builder)
 */
export const PLANNER_DIFFICULTIES: PlannerDifficultyOption[] = [
  {
    id: 'cadet',
    label: 'CADET',
    role: 'Explorer Flight Program',
    description:
      'Generous funding margin and relaxed mass allowance. Perfect for cadets learning Earth observation orbit geometry and payload trade-offs.',
    budgetUSD: 2500000,
    maxMassKg: 12.0,
    powerMarginW: 15.0,
    complexityLevel: 'Relaxed Constraints',
    color: '#38bdf8', // Sky Blue
  },
  {
    id: 'engineer',
    label: 'ENGINEER',
    role: 'Mission Systems Specialist',
    description:
      'Balanced commercial CubeSat economics. Realistic mass allocations, battery depth-of-discharge constraints, and standard Sun-Synchronous deployer limits.',
    budgetUSD: 1800000,
    maxMassKg: 8.0,
    powerMarginW: 25.0,
    complexityLevel: 'Standard Aerospace Margins',
    color: '#d97706', // Amber / Gold
  },
  {
    id: 'commander',
    label: 'COMMANDER',
    role: 'Flight Operations Director',
    description:
      'Strict mass envelope and compressed budget. Demands high-efficiency radiation-hardened components, tight eclipse power budgets, and rigorous downlink scheduling.',
    budgetUSD: 1200000,
    maxMassKg: 4.5,
    powerMarginW: 38.0,
    complexityLevel: 'Severe Hardened Limits',
    color: '#ef4444', // Red
  },
];

/**
 * Helper to compute educational planning estimates from active priority settings
 */
export const calculatePriorityTradeoffs = (priorities: ObservationPriorities) => {
  const { resolutionPriority, frequencyPriority, scienceDataPriority, coveragePriority } = priorities;

  // Daily Data Volume Estimate
  const baseVolumeMB = 80;
  const dataVolMB = Math.round(
    baseVolumeMB +
      resolutionPriority * 140 +
      scienceDataPriority * 180 +
      coveragePriority * 90 +
      frequencyPriority * 110
  );

  // Power Draw Burden
  const powerWatts = 8 + resolutionPriority * 4.5 + frequencyPriority * 3.5 + scienceDataPriority * 5.0;

  // Mass Impact Estimate
  const opticsMassKg = (0.4 + resolutionPriority * 0.45 + scienceDataPriority * 0.35).toFixed(1);

  // Storage Buffer Recommendation
  let storageRecommendationGB = 16;
  if (dataVolMB > 800) storageRecommendationGB = 32;
  if (dataVolMB > 1400) storageRecommendationGB = 64;
  if (dataVolMB > 2200) storageRecommendationGB = 128;

  // Downlink Minutes Required (assuming standard 2.5 Mbps S-Band pass)
  const downlinkMins = Math.round(dataVolMB / (2.5 * 7.5)); // rough estimate

  return {
    dataVolMB,
    powerWatts: Math.round(powerWatts),
    opticsMassKg,
    storageRecommendationGB,
    downlinkMins: Math.max(4, downlinkMins),
  };
};

export const PRIORITY_LABELS = {
  resolution: [
    { level: 1, label: '30m Multi-Spectral', note: 'Broad-brush regional survey. Minimal optical payload mass.' },
    { level: 2, label: '15m Medium Detail', note: 'Standard agricultural field and river corridor imaging.' },
    { level: 3, label: '10m Enhanced Detail', note: 'Sentinel-2 equivalent. Ideal balance of coverage and detail.' },
    { level: 4, label: '3.0m High Resolution', note: 'Detailed urban structure, road networks, and vessel tracking.' },
    { level: 5, label: '1.2m Sub-Meter Optic', note: 'Maximum aperture telescope. Heavy optical assembly and telemetry.' },
  ],
  frequency: [
    { level: 1, label: 'Bi-Weekly (14 Days)', note: 'Low reaction wheel wear. Ample battery recharge time between passes.' },
    { level: 2, label: 'Weekly (7 Days)', note: 'Standard agricultural growth and ocean current monitoring cadence.' },
    { level: 3, label: 'Every 72 Hours', note: 'Frequent repeat imaging for active flood zones and wildfire fronts.' },
    { level: 4, label: 'Daily (24 Hours)', note: 'Demands agile slewing. Higher battery DoD (Depth-of-Discharge).' },
    { level: 5, label: 'Sub-Daily (< 12 Hours)', note: 'Constellation-mode pacing. Intense battery cycles & ADCS duty cycle.' },
  ],
  scienceData: [
    { level: 1, label: '3-Band True Color (RGB)', note: 'Standard visual imaging. Light telemetry downlinks.' },
    { level: 2, label: '4-Band VNIR (RGB + NIR)', note: 'Required for basic NDVI vegetation health and water clarity.' },
    { level: 3, label: '8-Band Multispectral', note: 'Red-Edge and coastal bands for specialized scientific monitoring.' },
    { level: 4, label: '16-Band High-SNR Swath', note: 'Pinpoint mineral absorption and aerosol particle scattering.' },
    { level: 5, label: '64-Band Hyperspectral Cube', note: 'Exhaustive spectral signature. Massive onboard data volume.' },
  ],
  coverage: [
    { level: 1, label: 'Targeted Point (500 km²)', note: 'Focus on calibrated ground sites. Small memory buffer.' },
    { level: 2, label: 'Regional Swath (5,000 km²)', note: 'Covers entire river valleys and island groups in single pass.' },
    { level: 3, label: 'Continental Strip (25,000 km²)', note: 'Long continuous image strips across national landmasses.' },
    { level: 4, label: 'Global Littoral & Maritime', note: 'Broad coastal shelf observation with high duty cycle.' },
    { level: 5, label: 'Planetary Scanning', note: 'Maximal area coverage requiring continuous daytime imaging.' },
  ],
};
