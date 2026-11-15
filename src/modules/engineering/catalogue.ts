import { COMPONENT_CATALOGUE } from '../../data/builderCatalogue';
import type { EngineeringComponentSpec, LaunchVehicle, OrbitOption } from '../../types/engineering';

/** Project game assumptions only; not certified or official aerospace specifications. */
const subsystemByCategory = {
  structure: 'STRUCTURE', power: 'EPS', battery: 'EPS', comms: 'COMM', adcs: 'ADCS', computer: 'CDH',
} as const;

export const ENGINEERING_COMPONENT_CATALOGUE: EngineeringComponentSpec[] = COMPONENT_CATALOGUE.map((item) => ({
  id: item.id,
  name: item.name,
  subsystem: subsystemByCategory[item.category],
  category: subsystemByCategory[item.category],
  massKg: item.massKg,
  powerWatts: item.powerConsumptionWatts,
  powerGenerationWatts: item.powerGenerationWatts,
  powerConsumptionWatts: item.powerConsumptionWatts,
  costUSD: item.costUSD,
  volumeUnitsU: item.category === 'structure' ? Number(item.id.split('-')[1].replace('u', '')) : 0,
  batteryCapacityWh: item.storageCapacityWh,
  description: item.shortDescription,
  specs: Object.fromEntries(item.specsSummary.map((spec) => [spec.label, spec.value])),
}));

export const PAYLOAD_CATALOGUE: EngineeringComponentSpec[] = [
  { id: 'payload-opt-hires', name: 'EO-CAM 100 High-Res Optical Imager', subsystem: 'PAYLOAD', category: 'PAYLOAD', massKg: 1.4, powerWatts: 8.5, powerConsumptionWatts: 8.5, costUSD: 145000, volumeUnitsU: 1.2, imagingDataRateMbPerSec: 25, dutyCyclePercent: 15, description: 'Illustrative high-resolution optical imager.' },
  { id: 'payload-multispec', name: 'SPECTRA-4 Multispectral Ocean & Flora Radiometer', subsystem: 'PAYLOAD', category: 'PAYLOAD', massKg: 1.1, powerWatts: 6, powerConsumptionWatts: 6, costUSD: 120000, volumeUnitsU: 1, imagingDataRateMbPerSec: 12, dutyCyclePercent: 30, description: 'Illustrative multispectral radiometer.' },
  { id: 'payload-hyperspec', name: 'HYPER-ECO Hyperspectral Atmosphere & Land Sounder', subsystem: 'PAYLOAD', category: 'PAYLOAD', massKg: 1.9, powerWatts: 14.5, powerConsumptionWatts: 14.5, costUSD: 210000, volumeUnitsU: 1.8, imagingDataRateMbPerSec: 45, dutyCyclePercent: 10, description: 'Illustrative hyperspectral sounder.' },
  { id: 'payload-thermo-ir', name: 'THERM-IR Microbolometer Surface Temperature Sensor', subsystem: 'PAYLOAD', category: 'PAYLOAD', massKg: 0.9, powerWatts: 5.2, powerConsumptionWatts: 5.2, costUSD: 98000, volumeUnitsU: 0.8, imagingDataRateMbPerSec: 6, dutyCyclePercent: 40, description: 'Illustrative thermal infrared sensor.' },
];

export const TCS_CATALOGUE: EngineeringComponentSpec[] = [
  { id: 'tcs-passive', name: 'Passive MLI Blankets & Radiator Plates', subsystem: 'TCS', category: 'TCS', massKg: 0.25, powerWatts: 0, powerConsumptionWatts: 0, costUSD: 22000, volumeUnitsU: 0.1, description: 'Illustrative passive thermal control.' },
  { id: 'tcs-active-strip', name: 'Active Thermostatic Strip Heaters + MLI', subsystem: 'TCS', category: 'TCS', massKg: 0.45, powerWatts: 3.5, powerConsumptionWatts: 3.5, costUSD: 48000, volumeUnitsU: 0.2, description: 'Illustrative thermostat and heater system.' },
];

export const ORBIT_OPTIONS: OrbitOption[] = [
  { id: 'sso-500', name: '500 km Sun-Synchronous Orbit (SSO)', code: 'SSO-500', altitudeKm: 500, inclinationDeg: 97.4, periodMinutes: 94.6, eclipseDurationMinutes: 35.2, revisitDays: 3, scientificFitness: 'Optical and multispectral Earth observation', advantages: ['Consistent illumination', 'Regular polar passes'], description: 'Illustrative SSO option.' },
  { id: 'leo-400', name: '400 km Low Earth Orbit (ISS Co-Orbit)', code: 'LEO-400', altitudeKm: 400, inclinationDeg: 51.6, periodMinutes: 92.5, eclipseDurationMinutes: 36.1, revisitDays: 2, scientificFitness: 'Tropical and mid-latitude observations', advantages: ['Lower altitude'], description: 'Illustrative mid-inclination LEO option.' },
  { id: 'polar-600', name: '600 km True Polar Orbit', code: 'POLAR-600', altitudeKm: 600, inclinationDeg: 90, periodMinutes: 96.7, eclipseDurationMinutes: 34.8, revisitDays: 5, scientificFitness: 'Global polar coverage', advantages: ['Polar coverage'], description: 'Illustrative polar orbit option.' },
  { id: 'equatorial-500', name: '500 km Low-Inclination Equatorial Orbit', code: 'EQ-500', altitudeKm: 500, inclinationDeg: 12, periodMinutes: 94.6, eclipseDurationMinutes: 35, revisitDays: 1, scientificFitness: 'Equatorial coverage', advantages: ['Frequent equatorial passes'], description: 'Illustrative equatorial orbit option.' },
];

export const LAUNCH_VEHICLES: LaunchVehicle[] = [
  { id: 'falcon9-rideshare', name: 'Falcon 9 Transporter (Rideshare)', provider: 'SpaceX', maxPayloadKg: 250, targetOrbit: '500 km Sun-Synchronous (SSO)', costUSD: 275000, fairingDiameterMeters: 5.2, reliabilityScore: 0.99, description: 'Illustrative rideshare option.' },
  { id: 'electron-dedicated', name: 'Electron (Dedicated SmallSat Launch)', provider: 'Rocket Lab', maxPayloadKg: 45, targetOrbit: 'Custom LEO / SSO Insertion', costUSD: 1850000, fairingDiameterMeters: 1.2, reliabilityScore: 0.94, description: 'Illustrative dedicated launch option.' },
  { id: 'vega-c-piggyback', name: 'Vega-C SSMS (Secondary Payload Slot)', provider: 'Arianespace', maxPayloadKg: 180, targetOrbit: '600 km Polar & SSO', costUSD: 490000, fairingDiameterMeters: 2.6, reliabilityScore: 0.93, description: 'Illustrative secondary payload option.' },
];
