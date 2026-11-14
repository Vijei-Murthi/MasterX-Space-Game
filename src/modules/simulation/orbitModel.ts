/**
 * MASTERX – SPACE MACHINE
 * Simplified Orbit Model (Member 3)
 *
 * Provides analytical orbital timing, daylight/eclipse cycles, and ground station
 * pass windows for the mission simulation.
 *
 * SIMPLIFIED GAME ASSUMPTIONS (Not NASA-grade orbital propagator):
 * 1. Circular Low Earth Orbit (LEO) approximation around a spherical Earth.
 * 2. Standard gravitational parameter: mu = 398600.4418 km^3/s^2.
 * 3. Earth equatorial radius: R_E = 6378.137 km.
 * 4. Keplerian two-body circular period: T = 2 * pi * sqrt(r^3 / mu).
 * 5. Cylindrical Earth shadow model with ~35-37% eclipse fraction for nominal 500 km SSO.
 * 6. Ground station network pass window: modeled as an ~10 minute contact arc per 95 min orbit.
 */

export interface OrbitState {
  elapsedSeconds: number;
  periodSeconds: number;
  orbitsCompleted: number;
  orbitFraction: number; // 0.0 to 1.0 within current revolution
  isEclipse: boolean;
  solarFluxWm2: number; // 0 in eclipse, ~1361 in full daylight
  groundContactActive: boolean;
  linkBudgetDb: number;
  elevationAngleDeg: number;
}

export class OrbitModel {
  // Physical Constants (Game-standardized values)
  public static readonly EARTH_RADIUS_KM = 6378.137;
  public static readonly STANDARD_MU = 398600.4418; // km^3 / s^2
  public static readonly SOLAR_CONSTANT_WM2 = 1361.0; // W/m^2 at 1 AU

  private altitudeKm: number;
  private inclinationDeg: number;
  private orbitalPeriodSeconds: number;
  private eclipseFraction: number;
  private groundPassFractionStart: number;
  private groundPassFractionEnd: number;

  constructor(altitudeKm: number = 500, inclinationDeg: number = 97.4) {
    this.altitudeKm = Math.max(200, Math.min(2000, altitudeKm));
    this.inclinationDeg = inclinationDeg;

    // Calculate circular Keplerian orbital period
    const r = OrbitModel.EARTH_RADIUS_KM + this.altitudeKm;
    this.orbitalPeriodSeconds = 2 * Math.PI * Math.sqrt(Math.pow(r, 3) / OrbitModel.STANDARD_MU);

    // Simplified eclipse geometry:
    // Cylindrical shadow fraction f ~ (1 / pi) * arcsin(R_E / r)
    // For 500 km LEO, arcsin(6378 / 6878) ~ 68° = 1.187 rad -> 1.187 / pi ~ 0.378 (37.8%)
    const angularShadowHalf = Math.asin(OrbitModel.EARTH_RADIUS_KM / r);
    this.eclipseFraction = Number(((angularShadowHalf / Math.PI)).toFixed(4));

    // Ground station pass window:
    // Modeled as a single high-latitude tracking pass (e.g. Svalbard / Fairbanks)
    // Occurring between 75% and 86% of each revolution (approx 10.5 minutes for a 95 min orbit)
    this.groundPassFractionStart = 0.74;
    this.groundPassFractionEnd = 0.85;
  }

  /**
   * Returns the orbital period in seconds
   */
  public getOrbitalPeriodSeconds(): number {
    return this.orbitalPeriodSeconds;
  }

  /**
   * Returns the orbital period in minutes
   */
  public getOrbitalPeriodMinutes(): number {
    return Number((this.orbitalPeriodSeconds / 60).toFixed(2));
  }

  /**
   * Returns the approximate eclipse duration in seconds per orbit
   */
  public getEclipseDurationSeconds(): number {
    return this.orbitalPeriodSeconds * this.eclipseFraction;
  }

  /**
   * Evaluates the orbital and environmental state at a given mission elapsed time.
   */
  public evaluateAt(elapsedSeconds: number): OrbitState {
    const period = this.orbitalPeriodSeconds;
    const orbitsCompleted = Math.floor(elapsedSeconds / period);
    const orbitFraction = (elapsedSeconds % period) / period;

    // Eclipse modeling:
    // Spacecraft is in shadow when orbitFraction is in the eclipse window [0.0, eclipseFraction]
    const isEclipse = orbitFraction <= this.eclipseFraction;

    // Penumbra transition modeling: smooth 15-second gradient at entry and exit
    let solarFlux = OrbitModel.SOLAR_CONSTANT_WM2;
    if (isEclipse) {
      solarFlux = 0;
    } else {
      const exitTimeIntoDaylight = (orbitFraction - this.eclipseFraction) * period;
      if (exitTimeIntoDaylight < 15) {
        // Exiting shadow (sunrise)
        solarFlux = (exitTimeIntoDaylight / 15) * OrbitModel.SOLAR_CONSTANT_WM2;
      }
    }

    // Ground station pass modeling:
    const isWithinGroundArc =
      orbitFraction >= this.groundPassFractionStart &&
      orbitFraction <= this.groundPassFractionEnd;

    let elevationAngleDeg = 0;
    let linkBudgetDb = 0;

    if (isWithinGroundArc) {
      // Calculate normalized pass progress (0.0 to 1.0)
      const passArc = this.groundPassFractionEnd - this.groundPassFractionStart;
      const passProgress = (orbitFraction - this.groundPassFractionStart) / passArc;

      // Parabolic elevation profile peaking at 70° max elevation
      elevationAngleDeg = Math.sin(passProgress * Math.PI) * 70;

      // Typical CubeSat link margin: 3 dB at horizon up to 11 dB at zenith
      linkBudgetDb = 3.0 + (elevationAngleDeg / 70) * 8.0;
    }

    return {
      elapsedSeconds,
      periodSeconds: period,
      orbitsCompleted,
      orbitFraction: Number(orbitFraction.toFixed(4)),
      isEclipse,
      solarFluxWm2: Number(solarFlux.toFixed(1)),
      groundContactActive: isWithinGroundArc,
      linkBudgetDb: Number(linkBudgetDb.toFixed(1)),
      elevationAngleDeg: Number(elevationAngleDeg.toFixed(1)),
    };
  }
}
