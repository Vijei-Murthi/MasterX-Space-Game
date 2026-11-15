import type { MissionState } from '../../types/mission';
import type { CalculatedMetrics, EngineeringComponentSpec, EngineeringResult, ValidationCheckItem, ValidationStatus } from '../../types/engineering';
import { ENGINEERING_COMPONENT_CATALOGUE, LAUNCH_VEHICLES, ORBIT_OPTIONS, PAYLOAD_CATALOGUE, TCS_CATALOGUE } from './catalogue';

const round = (value: number, places = 2) => Number(value.toFixed(places));

/** Deterministic engineering estimates using the repository's illustrative game catalogue. */
export function evaluateEngineering(mission: MissionState): EngineeringResult {
  const ids = [
    mission.spacecraft.structure, mission.spacecraft.power, mission.spacecraft.battery,
    mission.spacecraft.comms, mission.spacecraft.adcs, mission.spacecraft.computer,
  ];
  const selected = ids.map((id) => ENGINEERING_COMPONENT_CATALOGUE.find((item) => item.id === id));
  const payload = PAYLOAD_CATALOGUE.find((item) => item.id === mission.payload.selectedPayloadId);
  const thermal = TCS_CATALOGUE.find((item) => item.id === mission.subsystems.tcsId);
  const orbit = ORBIT_OPTIONS.find((item) => item.id === mission.orbitLaunch.selectedOrbitId);
  const launch = LAUNCH_VEHICLES.find((item) => item.id === mission.orbitLaunch.selectedLaunchVehicleId);
  const installed: EngineeringComponentSpec[] = [...selected.filter((item): item is EngineeringComponentSpec => !!item), ...(payload ? [payload] : []), ...(thermal ? [thermal] : [])];
  const power = selected[1];
  const battery = selected[2];
  const comms = selected[3];
  const computer = selected[5];
  const payloadDuty = Math.max(0, Math.min(100, mission.payload.dutyCyclePercent ?? payload?.dutyCyclePercent ?? 0));
  const imagingDataRateMbPerSec = payload?.imagingDataRateMbPerSec ?? 0;
  // Mbps is megabits/second; divide by eight to report megabytes/day.
  const dataGeneratedMbPerDay = round(imagingDataRateMbPerSec * 3600 * 24 * (payloadDuty / 100) / 8, 1);
  const storageCapacityMb = computer?.id === 'comp-advanced' ? 32000 : computer?.id === 'comp-standard' ? 16000 : 0;
  const downlinkBandwidthMbps = comms?.id === 'comms-highgain' ? 2.5 : comms?.id === 'comms-basic' ? 0.0096 : 0;
  // Illustrative daily ground access window: one 8-minute pass.
  const dailyDownlinkMb = downlinkBandwidthMbps * 60;
  const metrics: CalculatedMetrics = {
    totalMassKg: round(installed.reduce((sum, item) => sum + item.massKg, 0)),
    maxMassKg: mission.briefing.maxMassKg,
    massMarginKg: round(mission.briefing.maxMassKg - installed.reduce((sum, item) => sum + item.massKg, 0)),
    powerGeneratedWatts: round(power?.powerGenerationWatts ?? 0, 1),
    powerConsumedWatts: round(installed.reduce((sum, item) => sum + (item.powerConsumptionWatts ?? item.powerWatts ?? 0), 0), 1),
    netPowerWatts: 0,
    batteryCapacityWh: battery?.batteryCapacityWh ?? 0,
    totalCostUSD: installed.reduce((sum, item) => sum + item.costUSD, 0) + (launch?.costUSD ?? 0),
    maxBudgetUSD: mission.briefing.budgetUSD,
    remainingBudgetUSD: 0,
    dataGeneratedMbPerDay,
    storageCapacityMb,
    remainingStorageMb: round(storageCapacityMb - dataGeneratedMbPerDay, 1),
    downlinkBandwidthMbps,
    linkMarginDb: downlinkBandwidthMbps > 0 ? (downlinkBandwidthMbps >= 2 ? 4.8 : 8.2) : 0,
    isDemoData: false,
    dataSourceLabel: 'MASTERX illustrative engineering catalogue; game assumptions, not certified aerospace specifications.',
    orbitAltitudeKm: orbit?.altitudeKm ?? 0,
    imagingDataRateMbPerSec,
  };
  metrics.netPowerWatts = round(metrics.powerGeneratedWatts - metrics.powerConsumedWatts, 1);
  metrics.remainingBudgetUSD = mission.briefing.budgetUSD - metrics.totalCostUSD;

  const checks: ValidationCheckItem[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const add = (category: ValidationCheckItem['category'], title: string, status: ValidationStatus, explanation: string, suggestedCorrection?: string, current?: string, limit?: string) => {
    const check: ValidationCheckItem = { id: `engineering-${category.toLowerCase()}-${checks.length + 1}`, category, title, status, explanation, suggestedCorrection, metricCurrent: current, metricLimit: limit };
    checks.push(check);
    if (status === 'FAIL') errors.push(explanation);
    if (status === 'WARNING') warnings.push(explanation);
  };
  const missing = (name: string) => `Select a valid ${name} from the engineering catalogue before evaluating the mission.`;

  if (selected.some((item) => !item)) add('MASS', 'Required spacecraft components', 'PENDING', missing('component'), 'Choose valid component IDs in all six spacecraft categories.');
  const massStatus: ValidationStatus = metrics.totalMassKg > metrics.maxMassKg ? 'FAIL' : metrics.massMarginKg < 1 ? 'WARNING' : 'PASS';
  add('MASS', 'Spacecraft mass limit', massStatus, massStatus === 'FAIL' ? `Spacecraft mass ${metrics.totalMassKg} kg exceeds the ${metrics.maxMassKg} kg mission limit.` : `Spacecraft mass is ${metrics.totalMassKg} kg against a ${metrics.maxMassKg} kg limit (${metrics.massMarginKg} kg margin).`, 'Select a lighter structure or reduce payload and subsystem mass.', `${metrics.totalMassKg} kg`, `≤ ${metrics.maxMassKg} kg`);

  const powerStatus: ValidationStatus = metrics.netPowerWatts < 0 ? 'FAIL' : metrics.netPowerWatts < mission.briefing.minPowerWatts ? 'WARNING' : 'PASS';
  add('POWER', 'Daylight power balance', powerStatus, powerStatus === 'FAIL' ? `Power draw exceeds generation by ${Math.abs(metrics.netPowerWatts)} W.` : `Net power is ${metrics.netPowerWatts} W; mission minimum is ${mission.briefing.minPowerWatts} W.`, 'Use the higher-output solar wings or reduce payload, radio, and heater duty cycles.', `${metrics.netPowerWatts} W net`, `≥ ${mission.briefing.minPowerWatts} W`);
  const eclipseNeedWh = metrics.powerConsumedWatts * ((orbit?.eclipseDurationMinutes ?? 35) / 60);
  const batteryStatus: ValidationStatus = !battery ? 'PENDING' : metrics.batteryCapacityWh < eclipseNeedWh ? 'FAIL' : metrics.batteryCapacityWh < mission.briefing.batteryReserveWh ? 'WARNING' : 'PASS';
  add('POWER', 'Eclipse battery reserve', batteryStatus, batteryStatus === 'FAIL' ? `Battery capacity ${metrics.batteryCapacityWh} Wh is below the estimated ${round(eclipseNeedWh)} Wh eclipse load.` : `Battery capacity ${metrics.batteryCapacityWh} Wh; briefing reserve target ${mission.briefing.batteryReserveWh} Wh.`, 'Select a higher-capacity battery or lower eclipse loads.', `${metrics.batteryCapacityWh} Wh`, `≥ ${mission.briefing.batteryReserveWh} Wh`);

  const budgetStatus: ValidationStatus = metrics.remainingBudgetUSD < 0 ? 'FAIL' : 'PASS';
  add('BUDGET', 'Mission budget', budgetStatus, budgetStatus === 'FAIL' ? `Selected hardware and launch cost exceed the budget by $${Math.abs(metrics.remainingBudgetUSD).toLocaleString()}.` : `$${metrics.totalCostUSD.toLocaleString()} total against $${metrics.maxBudgetUSD.toLocaleString()} budget.`, 'Choose lower-cost subsystems or a rideshare launch option.', `$${metrics.totalCostUSD.toLocaleString()}`, `≤ $${metrics.maxBudgetUSD.toLocaleString()}`);

  const storageStatus: ValidationStatus = !computer ? 'PENDING' : metrics.dataGeneratedMbPerDay > storageCapacityMb ? 'FAIL' : metrics.remainingStorageMb < 0.2 * storageCapacityMb ? 'WARNING' : 'PASS';
  add('STORAGE', 'Daily data and onboard storage', storageStatus, storageStatus === 'FAIL' ? `Estimated daily generation ${metrics.dataGeneratedMbPerDay} MB exceeds ${storageCapacityMb} MB onboard storage.` : `${metrics.dataGeneratedMbPerDay} MB/day estimated against ${storageCapacityMb} MB capacity.`, 'Reduce imaging duty cycle or select a larger storage option.', `${metrics.dataGeneratedMbPerDay} MB/day`, `${storageCapacityMb} MB`);
  const commStatus: ValidationStatus = !comms ? 'PENDING' : dataGeneratedMbPerDay > dailyDownlinkMb ? 'WARNING' : 'PASS';
  add('COMM', 'Communications and downlink', commStatus, commStatus === 'WARNING' ? `Estimated generation (${dataGeneratedMbPerDay} MB/day) exceeds illustrative 8-minute daily downlink capacity (${round(dailyDownlinkMb)} MB/day).` : `Downlink is ${downlinkBandwidthMbps} Mbps; estimated daily generation is ${dataGeneratedMbPerDay} MB.`, 'Select S-band high-gain communications or reduce daily imaging volume.', `${downlinkBandwidthMbps} Mbps`, 'Capacity matched to daily data');

  if (!orbit) add('ORBIT', 'Orbit selection', 'PENDING', missing('orbit'), 'Select a supported orbit option.');
  else add('ORBIT', 'Orbit selection', 'PASS', `${orbit.name}: ${orbit.altitudeKm} km altitude and ${orbit.inclinationDeg}° inclination.`, undefined, `${orbit.altitudeKm} km`, 'Supported orbit');
  if (!launch) add('LAUNCH', 'Launch vehicle selection', 'PENDING', missing('launch vehicle'), 'Select a supported launch vehicle.');
  else {
    const orbitCompatible = launch.targetOrbit.includes('Custom') || (orbit?.code === 'SSO-500' && launch.targetOrbit.includes('SSO')) || (orbit?.code === 'POLAR-600' && launch.targetOrbit.includes('600 km')) || (orbit?.code === 'POLAR-600' && launch.targetOrbit.includes('SSO'));
    const launchStatus: ValidationStatus = metrics.totalMassKg > launch.maxPayloadKg || !orbitCompatible ? 'FAIL' : 'PASS';
    add('LAUNCH', 'Launch mass and orbit compatibility', launchStatus, launchStatus === 'FAIL' ? `Selected launch vehicle does not match the selected orbit or mass (${metrics.totalMassKg} kg / ${launch.maxPayloadKg} kg).` : `${launch.name} supports the selected orbit and spacecraft mass.`, 'Select a launch provider whose stated target orbit includes the selected orbit and whose mass limit is sufficient.', `${metrics.totalMassKg} kg; ${orbit?.code ?? 'unknown orbit'}`, `≤ ${launch.maxPayloadKg} kg; compatible orbit`);
  }
  if (!thermal) add('THERMAL', 'Thermal control selection', 'PENDING', missing('thermal control subsystem'), 'Select a supported TCS component.');
  else add('THERMAL', 'Thermal control selection', 'PASS', `${thermal.name} is selected. Thermal performance is not modeled beyond catalogue assumptions.`);

  if (payload && mission.payload.selectedPayloadId === 'payload-opt-hires' && mission.spacecraft.adcs !== 'adcs-advanced') {
    add('ORBIT', 'Payload pointing compatibility', 'FAIL', 'The high-resolution optical payload is paired with coarse magnetic-torquer pointing in the illustrative catalogue.', 'Select the precision reaction-wheel and star-tracker ADCS or choose a payload with less demanding pointing needs.');
  }

  const validation = { isValid: errors.length === 0 && !checks.some((check) => check.status === 'PENDING'), errors, warnings, checks, isDemoData: false };
  const resourceState = { powerBalanceWatts: metrics.netPowerWatts, batteryCapacityWh: metrics.batteryCapacityWh, massMarginKg: metrics.massMarginKg, linkBudgetDb: metrics.linkMarginDb, isDemoData: false };
  return { metrics, validation, resourceState };
}
