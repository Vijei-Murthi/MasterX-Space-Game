import {
  IllustrativeGameParameters,
  ScientificTarget,
  MissionDifficulty,
  ScientificTargetId,
  FlightParameterItem,
  EngineeringConstraintCheck,
} from '../types/briefing';

export const DIFFICULTY_PRESETS: Record<MissionDifficulty, IllustrativeGameParameters> = {
  easy: {
    difficulty: 'easy',
    difficultyLabel: 'EASY',
    difficultyRole: 'Explorer',
    difficultyDescription: 'Generous initial funding, expanded mass allowance, and relaxed power margins. Ideal for cadets learning orbital design.',
    budgetUSD: 2500000,
    maxMassKg: 12.0,
    minPowerWatts: 15.0,
    batteryReserveWh: 30.0,
    durationDays: 180,
    storageGB: 64,
    orbitName: 'Low Earth Orbit (LEO)',
    orbitAltitudeKm: 500,
    orbitInclinationDeg: 97.4,
  },
  normal: {
    difficulty: 'normal',
    difficultyLabel: 'NORMAL',
    difficultyRole: 'Engineer',
    difficultyDescription: 'Realistic balance of commercial CubeSat component costs, battery depth-of-discharge constraints, and standard SSO deployer limits.',
    budgetUSD: 1800000,
    maxMassKg: 8.0,
    minPowerWatts: 25.0,
    batteryReserveWh: 45.0,
    durationDays: 365,
    storageGB: 32,
    orbitName: 'Sun-Synchronous Orbit (SSO)',
    orbitAltitudeKm: 500,
    orbitInclinationDeg: 97.4,
  },
  hard: {
    difficulty: 'hard',
    difficultyLabel: 'HARD',
    difficultyRole: 'Mission Commander',
    difficultyDescription: 'Strict mass thresholds, high-efficiency radiation-hardened parts required, tight eclipse battery limits, and harsh thermal cycles.',
    budgetUSD: 1200000,
    maxMassKg: 4.5,
    minPowerWatts: 38.0,
    batteryReserveWh: 60.0,
    durationDays: 730,
    storageGB: 16,
    orbitName: 'Sun-Synchronous Orbit (SSO)',
    orbitAltitudeKm: 550,
    orbitInclinationDeg: 97.8,
  },
};

export const SCIENTIFIC_TARGETS: ScientificTarget[] = [
  {
    id: 'vegetation',
    title: 'Vegetation & Canopy Monitoring',
    category: 'Terrestrial Biosphere',
    description: 'Track agricultural yield health, deforestation vectors, and forest drought stress using Red and Near-Infrared surface reflectance.',
    payloadType: '4-Band Multispectral Imager',
    spectralBand: 'VIS / VNIR (450–865 nm)',
    accentColor: '#10b981', // Emerald / Biosphere
    observationFocus: 'Global Farmlands & Tropical Forests',
  },
  {
    id: 'coastal',
    title: 'Coastal & Marine Water Quality',
    category: 'Hydrosphere & Oceans',
    description: 'Monitor littoral sedimentation plumes, ocean chlorophyll concentration, algal blooms, and shallow coral reef thermal stress.',
    payloadType: 'High-SNR Coastal Ocean Radiometer',
    spectralBand: 'Cyan-to-NIR (400–750 nm)',
    accentColor: '#0284c7', // Ocean Blue
    observationFocus: 'Littoral Zones & Barrier Reefs',
  },
  {
    id: 'atmosphere',
    title: 'Cloud & Atmospheric Dynamics',
    category: 'Atmospheric Physics',
    description: 'Measure airborne wildfire aerosol optical depth, urban emissions plumes, and cyclone cloud-top temperatures during rapid intensification.',
    payloadType: 'Thermal IR & Cloud Polarimeter',
    spectralBand: 'SWIR / TIR (1.3–12.5 µm)',
    accentColor: '#d97706', // Jupiter Amber / Aerosols
    observationFocus: 'Atmospheric Columns & Storm Systems',
  },
];

/**
 * Returns the 10 official flight parameters computed dynamically from active briefing selections.
 */
export const getFlightParameters = (
  params: IllustrativeGameParameters,
  target: ScientificTarget
): FlightParameterItem[] => {
  return [
    {
      id: 'param-budget',
      num: '01',
      label: 'INITIAL BUDGET',
      value: `$${(params.budgetUSD / 1000000).toFixed(1)}M`,
      unit: 'USD CAP',
      category: 'FINANCIAL',
      hoverTooltip: 'Your component costs and launch procurement must remain strictly within funding limits.',
      meaning: 'Total financial capital allocated by the space agency for component procurement, cleanroom testing, and launch ride-share deployment.',
      whyItMatters: 'Space mission economics require disciplined component selection. Exceeding budget halts manufacturing and leads to mission cancellation before launch integration.',
      ifExceeded: 'Critical mission failure: Spacecraft cannot be completed or integrated into the launch deployer.',
      howToImprove: 'Select cost-effective standard components in Phase 02 or switch to Cadet/Explorer difficulty for expanded funding.',
    },
    {
      id: 'param-mass',
      num: '02',
      label: 'MAXIMUM SPACECRAFT MASS',
      value: `${params.maxMassKg.toFixed(1)} kg`,
      unit: 'DEPLOYER LIMIT',
      category: 'PHYSICAL',
      hoverTooltip: 'Your spacecraft must remain within the allowed launch deployer canister mass.',
      meaning: 'Maximum allowable wet mass determined by the standard CubeSat P-POD/Canister deployer mechanical safety envelope.',
      whyItMatters: 'Launch vehicles calculate orbital trajectories and stage separations down to fractions of a kilogram. Overweight satellites threaten rocket stability and cannot be certified.',
      ifExceeded: 'Disqualification from launch manifest; deployer springs fail to impart required release velocity.',
      howToImprove: 'Choose lightweight composite chassis structures (1U or 2U) and miniaturized solid-state avionics in Phase 02.',
    },
    {
      id: 'param-power',
      num: '03',
      label: 'MINIMUM POWER GENERATION',
      value: `≥ ${params.minPowerWatts} W`,
      unit: 'DAYLIGHT PEAK',
      category: 'POWER',
      hoverTooltip: 'Your instruments depend on sufficient generated electrical power.',
      meaning: 'Average electrical wattage generated by the solar photovoltaic array during orbital sunlit passes.',
      whyItMatters: 'The optical camera, flight computer, and radio transmitters consume continuous wattage. Solar yield must exceed payload power draw to recharge onboard batteries.',
      ifExceeded: 'Power deficit causes rapid battery depletion, forcing the spacecraft into brownout safe-mode during imaging swaths.',
      howToImprove: 'Equip high-efficiency articulated GaAs solar wings or reduce sensor imaging duty cycles during shadow passes.',
    },
    {
      id: 'param-battery',
      num: '04',
      label: 'BATTERY CAPACITY',
      value: `${params.batteryReserveWh} Wh`,
      unit: 'ECLIPSE BUFFER',
      category: 'POWER',
      hoverTooltip: 'Stored energy keeps the spacecraft operating during 35-minute Earth eclipse periods.',
      meaning: 'Total usable chemical energy stored in the onboard Lithium battery pack to sustain life-support heaters and basic telemetry in darkness.',
      whyItMatters: 'Every 90-minute low-Earth orbit includes approximately 35 minutes in Earth’s shadow with zero solar photon flux.',
      ifExceeded: 'Deep discharge (>60% Depth-of-Discharge) permanently degrades battery chemistry and risks sub-zero freezing of optical sensors.',
      howToImprove: 'Install a high-capacity LiFePO4 battery pack with autonomous bus heaters in Phase 02.',
    },
    {
      id: 'param-storage',
      num: '05',
      label: 'DATA STORAGE CAPACITY',
      value: `${params.storageGB} GB`,
      unit: 'RAD-HARD FLASH',
      category: 'DATA',
      hoverTooltip: 'Limited storage can cause observation data loss during extended passes.',
      meaning: 'Solid-state memory buffer available to store captured multispectral Earth imagery before reaching a ground station.',
      whyItMatters: 'Ground station passes occur only once or twice per orbit for 8 to 10 minutes. The satellite must queue gigabytes of raw raster frames until ground contact.',
      ifExceeded: 'Buffer overrun: New scientific captures are dropped unrecorded due to memory overflow.',
      howToImprove: 'Upgrade to high-bandwidth S-band transmitters or activate onboard hardware compression (CCSDS 122 standard).',
    },
    {
      id: 'param-lifetime',
      num: '06',
      label: 'MISSION LIFETIME',
      value: `${params.durationDays} d`,
      unit: 'OPERATIONAL LIFE',
      category: 'ORBITAL',
      hoverTooltip: 'Orbital altitude and component radiation tolerance dictate mission survival.',
      meaning: 'Designed active operational lifespan before orbital atmospheric drag decay or radiation degrades avionics.',
      whyItMatters: 'Comprehensive climate and vegetation monitoring requires continuous multi-seasonal data collection across agricultural growth cycles.',
      ifExceeded: 'Premature hardware failure ends the scientific campaign before establishing climatological trends.',
      howToImprove: 'Select radiation-tolerant dual-core flight computers and maintain orbit altitude at or above 500 km.',
    },
    {
      id: 'param-altitude',
      num: '07',
      label: 'ORBIT ALTITUDE',
      value: `${params.orbitAltitudeKm} km`,
      unit: 'LOW EARTH ORBIT',
      category: 'ORBITAL',
      hoverTooltip: 'Your selected orbit affects Earth observation coverage and image ground resolution.',
      meaning: 'Mean orbital distance above Earth’s surface in Low Earth Orbit (LEO).',
      whyItMatters: 'Altitude determines ground sample distance (GSD), atmospheric drag resistance, and the satellite’s field-of-view swath width.',
      ifExceeded: 'Lower altitudes (<400 km) suffer rapid drag de-orbit; higher altitudes (>700 km) experience intense trapped Van Allen radiation belts.',
      howToImprove: 'The 500 km baseline provides an optimal balance of ~5m optical resolution and 2-year orbital aerodynamic stability.',
    },
    {
      id: 'param-inclination',
      num: '08',
      label: 'ORBIT INCLINATION',
      value: `${params.orbitInclinationDeg}°`,
      unit: 'RETROGRADE SSO',
      category: 'ORBITAL',
      hoverTooltip: 'Inclination determines planetary latitude coverage and sun illumination stability.',
      meaning: 'The angular tilt of the satellite orbital plane relative to Earth’s equator.',
      whyItMatters: 'A 97.4° Sun-Synchronous Orbit (SSO) precesses at exactly the rate Earth circles the Sun (~0.9856°/day), crossing the equator at the identical local solar time on every pass.',
      ifExceeded: 'Non-synchronous orbits cause inconsistent shadows and varying sun angles, rendering agricultural multi-spectral comparison invalid.',
      howToImprove: 'Lock launch insertion trajectory to 97.4° for reliable planetary repeat coverage.',
    },
    {
      id: 'param-comms',
      num: '09',
      label: 'COMMUNICATION REQUIREMENTS',
      value: '2.5 Mbps',
      unit: 'S-BAND DOWNLINK',
      category: 'DATA',
      hoverTooltip: 'High-speed directional radio link required to transmit high-resolution imagery swaths.',
      meaning: 'Maximum radio frequency bandwidth for downlinking multispectral raster arrays to Earth stations.',
      whyItMatters: 'Multispectral imaging of coastal plumes and forests generates large data volumes. Low-speed basic radios cannot dump the queue during 8-minute ground passes.',
      ifExceeded: 'Data bottleneck: Telemetry queue takes days to offload, delaying environmental warnings.',
      howToImprove: 'Select a directional S-Band patch array and utilize autonomous ground station network pass scheduling.',
    },
    {
      id: 'param-throughput',
      num: '10',
      label: 'DATA GENERATION CAPACITY',
      value: '~120 MB / pass',
      unit: `${target.category.split(' ')[0].toUpperCase()} SWATH`,
      category: 'DATA',
      hoverTooltip: `Expected scientific payload throughput generated for ${target.title}.`,
      meaning: 'Estimated raw digital sensor output produced during optimal Earth surface illumination passes.',
      whyItMatters: 'Calibrated multispectral and thermal detectors produce dense pixel arrays per frame. Matching generation with onboard storage prevents data starvation or overload.',
      ifExceeded: 'Memory saturation if downlink capacity is uncoordinated.',
      howToImprove: 'Pair optical payload with real-time lossless wave-compression algorithms onboard.',
    },
  ];
};

/**
 * Returns the 7 core engineering constraint checks for the Mission Constraints HUD.
 */
export const getEngineeringConstraints = (
  params: IllustrativeGameParameters
): EngineeringConstraintCheck[] => {
  const isHard = params.difficulty === 'hard';

  return [
    {
      id: 'chk-budget',
      label: 'Budget Allocation Status',
      status: 'PASS',
      threshold: `Cap: $${(params.budgetUSD / 1000000).toFixed(1)}M`,
      metric: `$${(params.budgetUSD / 1000000).toFixed(1)}M Available`,
      description: 'Funding is sufficient for standard 1U–3U commercial component procurement and launch ride-share integration.',
    },
    {
      id: 'chk-mass',
      label: 'Deployer Mass Envelope',
      status: isHard ? 'WARNING' : 'PASS',
      threshold: `Limit: ${params.maxMassKg} kg`,
      metric: `${params.maxMassKg} kg Max Allowed`,
      description: isHard
        ? 'Strict 4.5 kg mass limit requires ultra-light structural composites and miniaturized avionics.'
        : 'Standard canister deployer mass envelope allows standard battery and attitude control suites.',
    },
    {
      id: 'chk-power',
      label: 'Daylight Power Balance',
      status: isHard ? 'WARNING' : 'PASS',
      threshold: `Min: ≥ ${params.minPowerWatts} W`,
      metric: `${params.minPowerWatts} W Target`,
      description: isHard
        ? 'High minimum power demands articulated triple-junction solar wings to maintain positive energy balance.'
        : 'Daylight solar collection exceeds average bus and optical payload consumption.',
    },
    {
      id: 'chk-battery',
      label: 'Eclipse Battery Reserve',
      status: 'PASS',
      threshold: `Reserve: ${params.batteryReserveWh} Wh`,
      metric: `${params.batteryReserveWh} Wh Usable`,
      description: 'Sufficient stored energy to sustain bus heaters, avionics, and telemetry through 35-minute orbital shadow.',
    },
    {
      id: 'chk-storage',
      label: 'Payload Storage Buffer',
      status: 'PASS',
      threshold: `Buffer: ${params.storageGB} GB`,
      metric: `${params.storageGB} GB Flash`,
      description: 'Buffer capacity safely stores up to 12 consecutive orbital passes without ground downlink contact.',
    },
    {
      id: 'chk-comms',
      label: 'Downlink Link Budget',
      status: 'PASS',
      threshold: 'Rate: ≥ 2.0 Mbps',
      metric: '2.5 Mbps S-Band',
      description: 'Ground station overflights achieve required signal-to-noise ratio for full scientific data dumps.',
    },
    {
      id: 'chk-orbit',
      label: 'SSO Orbit Alignment',
      status: 'PASS',
      threshold: 'Inclination: 97.4°',
      metric: `${params.orbitAltitudeKm} km @ 97.4°`,
      description: 'Sun-synchronous orbital track guarantees consistent solar illumination geometry across planetary imaging swaths.',
    },
  ];
};

/**
 * Returns a contextual tactical hint based on the selected target and difficulty.
 */
export const getEngineeringHint = (
  targetId: ScientificTargetId,
  difficulty: MissionDifficulty
): string => {
  if (difficulty === 'hard') {
    return 'Commander Alert: Strict 4.5 kg mass cap requires selecting a 1U or 2U chassis with lightweight LiFePO4 batteries and a high-efficiency articulated solar wing to ensure positive energy balance.';
  }

  switch (targetId) {
    case 'coastal':
      return 'Coastal & Ocean radiometry requires high signal-to-noise ratio. In Phase 02, equip precision 3-axis reaction wheels to achieve sub-arcminute pointing stability and prevent ocean imagery smear.';
    case 'vegetation':
      return 'Vegetation indices (NDVI) depend on precise Red and Near-Infrared reflectance. Maintain the 500 km Sun-Synchronous orbit so repeat passes over forest canopies occur under identical sun angles.';
    case 'atmosphere':
      return 'Thermal IR cloud sensors operate continuously and draw substantial wattage. Equip high-capacity batteries to avoid brownouts during the 35-minute orbital eclipse in darkness.';
    default:
      return 'Balance your power generation and payload duty cycles to prevent battery depletion during eclipse phases.';
  }
};
