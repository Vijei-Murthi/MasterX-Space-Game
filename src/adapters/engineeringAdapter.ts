/**
 * MASTERX – SPACE MACHINE
 * Engineering Integration Adapter (Member 2 Boundary)
 * Reference: docs/integration-guide.md
 * 
 * IMPORTANT TEAM COLLABORATION RULE:
 * Member 2 (Engineering Lead) owns the mathematical calculation engines:
 * mass margins, power balance, battery depth of discharge, launch vehicle compatibility, and validation rules.
 * 
 * This adapter provides a clean typed boundary for Member 1's UI components:
 * - When Member 2's `src/modules/engineering/` is integrated, replace these helper methods with their engine.
 * - Current fallback values are explicitly tagged as DEMO DATA.
 */

import {
  SpacecraftComponent,
  OrbitOption,
  LaunchVehicle,
  ValidationResult,
  CalculatedMetrics,
  ValidationCheckItem,
} from '../types/engineering';
import { MissionState } from '../types/mission';
import { COMPONENT_CATALOGUE } from '../data/builderCatalogue';

// ============================================================================
// 1. SCIENTIFIC PAYLOAD CATALOGUE (Illustrative Nanosat Instruments)
// ============================================================================
export interface PayloadInstrument extends SpacecraftComponent {
  primaryObjectiveMatch: string[];
  groundSamplingDistanceM: number;
  spectralBands: string[];
  dataRateMbps: number;
  dutyCycleRecommendedPercent: number;
}

export const PAYLOAD_CATALOGUE: PayloadInstrument[] = [
  {
    id: 'payload-opt-hires',
    name: 'EO-CAM 100 High-Res Optical Imager',
    subsystem: 'PAYLOAD',
    massKg: 1.4,
    powerWatts: 8.5,
    costUSD: 145000,
    volumeUnitsU: 1.2,
    groundSamplingDistanceM: 2.5,
    spectralBands: ['RGB (450-650 nm)', 'Near-IR (750-900 nm)'],
    dataRateMbps: 25.0,
    dutyCycleRecommendedPercent: 15,
    primaryObjectiveMatch: ['land-surface', 'disaster-flood'],
    description: 'High-magnification catadioptric telescope with CMOS focal plane array capable of 2.5 m Ground Sampling Distance (GSD). Ideal for urban infrastructure, flood extent mapping, and disaster damage assessment.',
    specs: {
      'Focal Length': '450 mm folded Cassegrain',
      'Aperture': '90 mm',
      'Detector Format': '4096 × 3072 pixel CMOS',
      'Swath Width': '12.8 km at 500 km SSO',
    },
  },
  {
    id: 'payload-multispec',
    name: 'SPECTRA-4 Multispectral Ocean & Flora Radiometer',
    subsystem: 'PAYLOAD',
    massKg: 1.1,
    powerWatts: 6.0,
    costUSD: 120000,
    volumeUnitsU: 1.0,
    groundSamplingDistanceM: 10.0,
    spectralBands: ['Blue 480nm', 'Green 560nm', 'Red 660nm', 'RedEdge 705nm', 'NIR 840nm'],
    dataRateMbps: 12.0,
    dutyCycleRecommendedPercent: 30,
    primaryObjectiveMatch: ['ocean-observation', 'vegetation-agriculture'],
    description: 'Calibrated 5-channel push-broom radiometer tailored for chlorophyll-A ocean color retrieval, coastal turbidity tracking, and NDVI agricultural health monitoring.',
    specs: {
      'Sensor Type': 'Linear CCD Push-Broom',
      'Spectral Resolution': '15 nm FWHM',
      'Radiometric Accuracy': '12-bit radiometric resolution',
      'Swath Width': '45 km at 500 km SSO',
    },
  },
  {
    id: 'payload-hyperspec',
    name: 'HYPER-ECO Hyperspectral Atmosphere & Land Sounder',
    subsystem: 'PAYLOAD',
    massKg: 1.9,
    powerWatts: 14.5,
    costUSD: 210000,
    volumeUnitsU: 1.8,
    groundSamplingDistanceM: 15.0,
    spectralBands: ['64 Contiguous Bands (400 – 1000 nm, 9nm step)'],
    dataRateMbps: 45.0,
    dutyCycleRecommendedPercent: 10,
    primaryObjectiveMatch: ['atmospheric-monitoring', 'vegetation-agriculture'],
    description: 'Continuous diffraction grating spectrometer capturing full continuous reflectance signatures. Detects methane plumes, aerosol optical depth, and greenhouse gas column concentrations.',
    specs: {
      'Spectral Range': '400 nm to 1000 nm (VNIR)',
      'Dispersion': 'Convex holographic grating',
      'Cooling': 'Active thermoelectric TEC cooler',
      'Swath Width': '20 km at 500 km SSO',
    },
  },
  {
    id: 'payload-thermo-ir',
    name: 'THERM-IR Microbolometer Surface Temperature Sensor',
    subsystem: 'PAYLOAD',
    massKg: 0.9,
    powerWatts: 5.2,
    costUSD: 98000,
    volumeUnitsU: 0.8,
    groundSamplingDistanceM: 25.0,
    spectralBands: ['Long-Wave Infrared (8.0 – 14.0 µm)'],
    dataRateMbps: 6.0,
    dutyCycleRecommendedPercent: 40,
    primaryObjectiveMatch: ['land-surface', 'disaster-flood', 'atmospheric-monitoring'],
    description: 'Uncooled microbolometer sensor array for day/night thermal inertia analysis, volcanic hotspot detection, sea-surface temperature anomalies, and wildfire perimeter monitoring.',
    specs: {
      'Detector': 'Uncooled Vanadium Oxide (VOx) Microbolometer',
      'NETD Sensitivity': '< 40 mK at f/1.0',
      'Pixel Pitch': '12 µm',
      'Swath Width': '35 km at 500 km SSO',
    },
  },
];

// ============================================================================
// 2. THERMAL CONTROL SUBSYSTEM (TCS) CATALOGUE
// ============================================================================
export const TCS_CATALOGUE: SpacecraftComponent[] = [
  {
    id: 'tcs-passive',
    name: 'Passive MLI Blankets & Radiator Plates',
    subsystem: 'TCS',
    massKg: 0.25,
    powerWatts: 0.0,
    costUSD: 22000,
    volumeUnitsU: 0.1,
    description: '15-layer aluminized Mylar Multi-Layer Insulation (MLI) blankets with an external optical solar reflector (OSR) radiator. Zero operational power consumption.',
    specs: {
      'Operating Temp': '-40°C to +85°C',
      'Power Draw': '0.0 W (Zero)',
      'Emissivity': '0.82 (radiator panel)',
    },
  },
  {
    id: 'tcs-active-strip',
    name: 'Active Thermostatic Strip Heaters + MLI',
    subsystem: 'TCS',
    massKg: 0.45,
    powerWatts: 3.5, // during eclipse cold soak
    costUSD: 48000,
    volumeUnitsU: 0.2,
    description: 'Autonomous Kapton resistive heaters with closed-loop thermistor feedback. Automatically maintains battery and camera optics above 0°C during 35-minute orbital eclipses.',
    specs: {
      'Operating Temp': '-20°C to +50°C (Controlled)',
      'Power Draw': '3.5 W during eclipse',
      'Control Mode': 'Dual redundant thermistor PID',
    },
  },
];

// ============================================================================
// 3. ORBIT CONFIGURATION OPTIONS
// ============================================================================
export const ORBIT_OPTIONS: OrbitOption[] = [
  {
    id: 'sso-500',
    name: '500 km Sun-Synchronous Orbit (SSO)',
    code: 'SSO-500',
    altitudeKm: 500,
    inclinationDeg: 97.4,
    periodMinutes: 94.6,
    eclipseDurationMinutes: 35.2,
    revisitDays: 3,
    scientificFitness: 'Optimal for Optical & Multispectral Earth Observation',
    advantages: [
      'Consistent 10:30 AM local solar time illumination prevents shadow distortion',
      'High solar array power generation stability',
      'Regular polar ground station passes (Svalbard, Troll)',
    ],
    description: 'The premier scientific orbit for Earth remote sensing. Constant solar lighting angle allows direct frame-to-frame comparisons of vegetation indices, urban change, and ice sheets.',
  },
  {
    id: 'leo-400',
    name: '400 km Low Earth Orbit (ISS Co-Orbit)',
    code: 'LEO-400',
    altitudeKm: 400,
    inclinationDeg: 51.6,
    periodMinutes: 92.5,
    eclipseDurationMinutes: 36.1,
    revisitDays: 2,
    scientificFitness: 'Optimal for Tropical & Mid-Latitude Observations',
    advantages: [
      'Lower launch vehicle insertion cost ($)',
      'Higher ground resolution due to 20% lower orbital altitude',
      'Frequent overflights of populated temperate zones',
    ],
    description: 'Mid-inclination orbit offering rapid repeat coverage over temperate regions and the equator. However, the varying solar angle changes shadowing and eclipse fractions continuously.',
  },
  {
    id: 'polar-600',
    name: '600 km True Polar Orbit',
    code: 'POLAR-600',
    altitudeKm: 600,
    inclinationDeg: 90.0,
    periodMinutes: 96.7,
    eclipseDurationMinutes: 34.8,
    revisitDays: 5,
    scientificFitness: 'Complete Global & Arctic/Antarctic Polar Coverage',
    advantages: [
      'True 100% planetary surface coverage including both geographical poles',
      'Lower atmospheric drag extends mission lifetime past 3 years',
      'Ideal for ice sheet mass balance and high-latitude climate monitoring',
    ],
    description: 'Overflies every latitude on Earth including the North and South poles. Extended mission lifetime due to thin thermosphere at 600 km, but requires higher radiation shielding.',
  },
  {
    id: 'equatorial-500',
    name: '500 km Low-Inclination Equatorial Orbit',
    code: 'EQ-500',
    altitudeKm: 500,
    inclinationDeg: 12.0,
    periodMinutes: 94.6,
    eclipseDurationMinutes: 35.0,
    revisitDays: 1,
    scientificFitness: 'Maximum Daily Revisit over Tropical Rain Forests & Oceans',
    advantages: [
      'Revisits tropical rainforests (Amazon, Congo, SE Asia) up to 8 times daily',
      'Bypasses South Atlantic Anomaly core, reducing radiation dose by 80%',
      'Ideal for coral reef bleaching and real-time maritime cyclone tracking',
    ],
    description: 'Specialized low-inclination path dedicated exclusively to the equatorial belt. Unmatched 2-hour revisit cadence for tropical weather, wildfire tracking, and ocean eddies.',
  },
];

// ============================================================================
// 4. LAUNCH VEHICLES
// ============================================================================
export const LAUNCH_VEHICLES: LaunchVehicle[] = [
  {
    id: 'falcon9-rideshare',
    name: 'Falcon 9 Transporter (Rideshare)',
    provider: 'SpaceX',
    maxPayloadKg: 250,
    targetOrbit: '500 km Sun-Synchronous (SSO)',
    costUSD: 275000,
    fairingDiameterMeters: 5.2,
    reliabilityScore: 0.99,
    description: 'Dedicated multi-satellite rideshare mission offering unmatched orbital injection accuracy and highly competitive cost-per-kilogram for standardized CubeSat dispensers.',
  },
  {
    id: 'electron-dedicated',
    name: 'Electron (Dedicated SmallSat Launch)',
    provider: 'Rocket Lab',
    maxPayloadKg: 45,
    targetOrbit: 'Custom LEO / SSO Insertion',
    costUSD: 1850000,
    fairingDiameterMeters: 1.2,
    reliabilityScore: 0.94,
    description: 'Bespoke orbital launcher capable of delivering your satellite directly to your exact requested orbital node and time-of-day without rideshare co-passenger compromises.',
  },
  {
    id: 'vega-c-piggyback',
    name: 'Vega-C SSMS (Secondary Payload Slot)',
    provider: 'Arianespace',
    maxPayloadKg: 180,
    targetOrbit: '600 km Polar & SSO',
    costUSD: 490000,
    fairingDiameterMeters: 2.6,
    reliabilityScore: 0.93,
    description: 'European small spacecraft mission service deploying from the Kourou Space Centre in French Guiana with optimal equatorial and polar launch corridors.',
  },
];

// ============================================================================
// 5. RESOURCE CALCULATION ADAPTER (Consumes Member 2 Contract)
// ============================================================================
export function calculateResourceMetrics(mission: MissionState): CalculatedMetrics {
  // Retrieve selected builder items
  const struct = COMPONENT_CATALOGUE.find((c) => c.id === mission.spacecraft.structure) || COMPONENT_CATALOGUE[2]; // 3U
  const power = COMPONENT_CATALOGUE.find((c) => c.id === mission.spacecraft.power) || COMPONENT_CATALOGUE[4];
  const battery = COMPONENT_CATALOGUE.find((c) => c.id === mission.spacecraft.battery) || COMPONENT_CATALOGUE[6];
  const comms = COMPONENT_CATALOGUE.find((c) => c.id === mission.spacecraft.comms) || COMPONENT_CATALOGUE[8];
  const adcs = COMPONENT_CATALOGUE.find((c) => c.id === mission.spacecraft.adcs) || COMPONENT_CATALOGUE[10];
  const comp = COMPONENT_CATALOGUE.find((c) => c.id === mission.spacecraft.computer) || COMPONENT_CATALOGUE[12];
  
  // Selected Payload
  const payload = PAYLOAD_CATALOGUE.find((p) => p.id === mission.payload.selectedPayloadId) || PAYLOAD_CATALOGUE[0];
  
  // Selected TCS
  const tcs = TCS_CATALOGUE.find((t) => t.id === mission.subsystems.tcsId) || TCS_CATALOGUE[0];

  // Selected Launch Vehicle
  const launch = LAUNCH_VEHICLES.find((l) => l.id === mission.orbitLaunch.selectedLaunchVehicleId) || LAUNCH_VEHICLES[0];

  // Aggregate Mass
  const busMassKg = struct.massKg + power.massKg + battery.massKg + comms.massKg + adcs.massKg + comp.massKg;
  const totalMassKg = Number((busMassKg + payload.massKg + tcs.massKg).toFixed(2));
  const maxMassKg = mission.briefing.maxMassKg || 12.0;
  const massMarginKg = Number((maxMassKg - totalMassKg).toFixed(2));

  // Power Calculations
  const powerGeneratedWatts = power.powerGenerationWatts || 38.0;
  const powerConsumedWatts = Number((
    (power.powerConsumptionWatts || 0) +
    (battery.powerConsumptionWatts || 1.0) +
    (comms.powerConsumptionWatts || 8.0) +
    (adcs.powerConsumptionWatts || 5.0) +
    (comp.powerConsumptionWatts || 4.0) +
    (payload.powerWatts || 8.0) +
    (tcs.powerWatts || 0)
  ).toFixed(1));
  const netPowerWatts = Number((powerGeneratedWatts - powerConsumedWatts).toFixed(1));
  const batteryCapacityWh = battery.storageCapacityWh || 65.0;

  // Financial Ledger
  const busCostUSD = struct.costUSD + power.costUSD + battery.costUSD + comms.costUSD + adcs.costUSD + comp.costUSD;
  const hardwareCostUSD = busCostUSD + payload.costUSD + tcs.costUSD;
  const totalCostUSD = hardwareCostUSD + launch.costUSD;
  const maxBudgetUSD = mission.briefing.budgetUSD || 2500000;
  const remainingBudgetUSD = maxBudgetUSD - totalCostUSD;

  // Scientific Data Ledger
  const rawMbPerCapture = 150;
  const capturesPerDay = mission.planner.selectedTargetIds.length > 0 ? mission.planner.selectedTargetIds.length * 4 : 8;
  const dataGeneratedMbPerDay = capturesPerDay * rawMbPerCapture;
  const storageCapacityMb = (comp.id === 'comp-advanced' ? 32000 : 16000); // 16GB or 32GB Flash
  const remainingStorageMb = storageCapacityMb - dataGeneratedMbPerDay;

  // Communications Link Margin
  const isHighGain = comms.id === 'comms-highgain';
  const downlinkBandwidthMbps = isHighGain ? 2.5 : 0.0096;
  const linkMarginDb = isHighGain ? 4.8 : 8.2;

  return {
    totalMassKg,
    maxMassKg,
    massMarginKg,
    powerGeneratedWatts,
    powerConsumedWatts,
    netPowerWatts,
    batteryCapacityWh,
    totalCostUSD,
    maxBudgetUSD,
    remainingBudgetUSD,
    dataGeneratedMbPerDay,
    storageCapacityMb,
    remainingStorageMb,
    downlinkBandwidthMbps,
    linkMarginDb,
    isDemoData: true,
    dataSourceLabel: 'DEMO DATA (Awaiting Member 2 Engineering Module)',
  };
}

// ============================================================================
// 6. VALIDATION ENGINE ADAPTER (Consumes Member 2 Validation Rules)
// ============================================================================
export function validateMissionDesign(mission: MissionState): ValidationResult {
  const metrics = calculateResourceMetrics(mission);
  const checks: ValidationCheckItem[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. MASS VALIDATION
  if (metrics.totalMassKg > metrics.maxMassKg) {
    const msg = `Total spacecraft mass (${metrics.totalMassKg} kg) exceeds launch envelope limit of ${metrics.maxMassKg} kg.`;
    errors.push(msg);
    checks.push({
      id: 'check-mass',
      category: 'MASS',
      title: 'Total Spacecraft Mass Limit',
      status: 'FAIL',
      metricCurrent: `${metrics.totalMassKg} kg`,
      metricLimit: `Max ${metrics.maxMassKg} kg`,
      explanation: msg,
      suggestedCorrection: 'Select a lighter chassis or downsize high-mass subsystem components.',
    });
  } else if (metrics.massMarginKg < 1.0) {
    const msg = `Mass margin is slim (${metrics.massMarginKg} kg remaining). Potential acoustic margin risk during launch.`;
    warnings.push(msg);
    checks.push({
      id: 'check-mass',
      category: 'MASS',
      title: 'Total Spacecraft Mass Limit',
      status: 'WARNING',
      metricCurrent: `${metrics.totalMassKg} kg`,
      metricLimit: `Max ${metrics.maxMassKg} kg`,
      explanation: msg,
      suggestedCorrection: 'Consider optimizing payload bracketry to recover at least 1.5 kg margin.',
    });
  } else {
    checks.push({
      id: 'check-mass',
      category: 'MASS',
      title: 'Total Spacecraft Mass Limit',
      status: 'PASS',
      metricCurrent: `${metrics.totalMassKg} kg`,
      metricLimit: `Max ${metrics.maxMassKg} kg`,
      explanation: `Spacecraft mass conforms with deployer canister specifications. Healthy ${metrics.massMarginKg} kg margin.`,
    });
  }

  // 2. POWER BALANCE VALIDATION
  if (metrics.netPowerWatts < 0) {
    const msg = `Daylight power deficit detected (${metrics.netPowerWatts} W). Battery will deplete progressively across consecutive orbits.`;
    errors.push(msg);
    checks.push({
      id: 'check-power',
      category: 'POWER',
      title: 'Daylight Power Balance',
      status: 'FAIL',
      metricCurrent: `${metrics.netPowerWatts} W net`,
      metricLimit: 'Min > 0.0 W',
      explanation: msg,
      suggestedCorrection: 'Upgrade to High-Efficiency Articulated Solar Wings or reduce continuous payload duty cycle.',
    });
  } else if (metrics.netPowerWatts < 5.0) {
    const msg = `Daylight power surplus is marginal (${metrics.netPowerWatts} W). Slower battery recharging during high beta angle seasons.`;
    warnings.push(msg);
    checks.push({
      id: 'check-power',
      category: 'POWER',
      title: 'Daylight Power Balance',
      status: 'WARNING',
      metricCurrent: `+${metrics.netPowerWatts} W surplus`,
      metricLimit: 'Recommended > +10.0 W',
      explanation: msg,
      suggestedCorrection: 'Schedule high-power transmitter downlinks strictly over ground station passes.',
    });
  } else {
    checks.push({
      id: 'check-power',
      category: 'POWER',
      title: 'Daylight Power Balance',
      status: 'PASS',
      metricCurrent: `+${metrics.netPowerWatts} W surplus`,
      metricLimit: 'Min > 0.0 W',
      explanation: `Solar panels generate robust power surplus (+${metrics.netPowerWatts} W) to fully recharge batteries before each eclipse pass.`,
    });
  }

  // 3. BUDGET ALLOCATION VALIDATION
  if (metrics.remainingBudgetUSD < 0) {
    const overage = Math.abs(metrics.remainingBudgetUSD);
    const msg = `Mission cost exceeds authorized agency budget by $${(overage / 1000).toLocaleString()}k.`;
    errors.push(msg);
    checks.push({
      id: 'check-budget',
      category: 'BUDGET',
      title: 'Authorized Agency Budget',
      status: 'FAIL',
      metricCurrent: `$${(metrics.totalCostUSD / 1000000).toFixed(2)}M`,
      metricLimit: `Max $${(metrics.maxBudgetUSD / 1000000).toFixed(2)}M`,
      explanation: msg,
      suggestedCorrection: 'Choose rideshare launch vehicle or swap premium rad-hard avionics for standard flight-proven hardware.',
    });
  } else {
    checks.push({
      id: 'check-budget',
      category: 'BUDGET',
      title: 'Authorized Agency Budget',
      status: 'PASS',
      metricCurrent: `$${(metrics.totalCostUSD / 1000000).toFixed(2)}M`,
      metricLimit: `Max $${(metrics.maxBudgetUSD / 1000000).toFixed(2)}M`,
      explanation: `All spacecraft subsystems and launch provider contracts are fully funded with $${(metrics.remainingBudgetUSD / 1000).toLocaleString()}k contingency reserve.`,
    });
  }

  // 4. ATTITUDE POINTING & PAYLOAD COMPATIBILITY
  const isHiResPayload = mission.payload.selectedPayloadId === 'payload-opt-hires';
  const hasPrecisionADCS = mission.spacecraft.adcs === 'adcs-advanced';
  if (isHiResPayload && !hasPrecisionADCS) {
    const msg = 'EO-CAM 100 optical telescope requires sub-arcminute pointing precision to avoid ground motion blur (7.6 km/s flight speed).';
    errors.push(msg);
    checks.push({
      id: 'check-adcs-compat',
      category: 'ORBIT',
      title: 'Payload / ADCS Pointing Stability',
      status: 'FAIL',
      metricCurrent: 'Magnetic Torquers (±5° coarse)',
      metricLimit: 'Reaction Wheels (±0.05°)',
      explanation: msg,
      suggestedCorrection: 'Upgrade ADCS to Precision 3-Axis Reaction Wheels + Star Tracker.',
    });
  } else {
    checks.push({
      id: 'check-adcs-compat',
      category: 'ORBIT',
      title: 'Payload / ADCS Pointing Stability',
      status: 'PASS',
      metricCurrent: hasPrecisionADCS ? 'Reaction Wheels (±0.05°)' : 'Compatible',
      metricLimit: '±0.05° required for high-res',
      explanation: 'Attitude control actuators satisfy target line-of-sight stabilization requirements during scientific sweeps.',
    });
  }

  // 5. TELEMETRY & DATA DOWNLINK CAPACITY
  const isHiDataRatePayload = mission.payload.selectedPayloadId === 'payload-opt-hires' || mission.payload.selectedPayloadId === 'payload-hyperspec';
  const hasHighGainComms = mission.spacecraft.comms === 'comms-highgain';
  if (isHiDataRatePayload && !hasHighGainComms) {
    const msg = 'Basic UHF whip antenna (9.6 kbps) cannot downlink multi-gigabyte scientific imagery before onboard memory buffer saturates.';
    warnings.push(msg);
    checks.push({
      id: 'check-comms-bandwidth',
      category: 'COMM',
      title: 'Data Downlink Throughput',
      status: 'WARNING',
      metricCurrent: '9.6 kbps (UHF whip)',
      metricLimit: '2.5 Mbps S-Band recommended',
      explanation: msg,
      suggestedCorrection: 'Upgrade communications to High-Gain S-Band Transmitter & Patch Array.',
    });
  } else {
    checks.push({
      id: 'check-comms-bandwidth',
      category: 'COMM',
      title: 'Data Downlink Throughput',
      status: 'PASS',
      metricCurrent: hasHighGainComms ? '2.5 Mbps (S-Band)' : '9.6 kbps',
      metricLimit: 'Sufficient for selected instruments',
      explanation: 'Ground station pass downlink pipeline supports planned daily scientific capture volume without storage overflow.',
    });
  }

  // 6. LAUNCH VEHICLE MASS CAPACITY
  const launch = LAUNCH_VEHICLES.find((l) => l.id === mission.orbitLaunch.selectedLaunchVehicleId) || LAUNCH_VEHICLES[0];
  if (metrics.totalMassKg > launch.maxPayloadKg) {
    const msg = `Spacecraft mass (${metrics.totalMassKg} kg) exceeds dispenser envelope on ${launch.name} (${launch.maxPayloadKg} kg).`;
    errors.push(msg);
    checks.push({
      id: 'check-launch-compat',
      category: 'LAUNCH',
      title: 'Launch Vehicle Dispenser Capacity',
      status: 'FAIL',
      metricCurrent: `${metrics.totalMassKg} kg`,
      metricLimit: `${launch.maxPayloadKg} kg limit`,
      explanation: msg,
      suggestedCorrection: `Select a launch provider with larger dispenser payload rating, such as Falcon 9 Rideshare.`,
    });
  } else {
    checks.push({
      id: 'check-launch-compat',
      category: 'LAUNCH',
      title: 'Launch Vehicle Dispenser Capacity',
      status: 'PASS',
      metricCurrent: `${metrics.totalMassKg} kg`,
      metricLimit: `${launch.maxPayloadKg} kg limit`,
      explanation: `Spacecraft structural dimensions and wet mass fit cleanly inside ${launch.provider} ${launch.name} deployer canister.`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    checks,
    isDemoData: true,
  };
}
