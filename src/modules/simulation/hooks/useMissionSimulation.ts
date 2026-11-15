/**
 * MASTERX – SPACE MACHINE
 * React Mission Simulation Controller Hook (Member 3)
 *
 * Drives the headless SimulationEngine inside React components at a smooth 10 Hz rate.
 * Exposes playback controls (play, pause, step, speed multiplier, reset),
 * live telemetry subscriptions, and final report generation.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { SimulationEngine } from '../simulationEngine';
import type {
  SimulationInput,
  SimulationState,
  TelemetryData,
  MissionReport,
} from '../types';

export interface UseMissionSimulationOptions {
  autoPlay?: boolean;
  tickRateHz?: number; // Default 10 Hz (100ms interval)
  timeStepSeconds?: number; // Base simulation time per tick (default 1.0s)
}

export interface UseMissionSimulationReturn {
  // Engine State
  isRunning: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  failureReason: string | undefined;
  speedMultiplier: number;

  // Real-time Telemetry & Data
  telemetry: TelemetryData | null;
  telemetryHistory: TelemetryData[];
  state: SimulationState | null;
  report: MissionReport | null;

  // Playback Controls
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  step: (deltaSeconds?: number) => void;
  setSpeed: (multiplier: number) => void;
  reset: () => void;
  mitigateEvent: (eventId: string, log?: string) => boolean;
}

export function useMissionSimulation(
  input: SimulationInput | null,
  options: UseMissionSimulationOptions = {}
): UseMissionSimulationReturn {
  const {
    autoPlay = false,
    tickRateHz = 10,
    timeStepSeconds = 1.0,
  } = options;

  const [isRunning, setIsRunning] = useState<boolean>(autoPlay);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryData[]>([]);
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [report, setReport] = useState<MissionReport | null>(null);

  // Engine instance ref to maintain continuity across React re-renders
  const engineRef = useRef<SimulationEngine | null>(null);
  const timerRef = useRef<number | null>(null);

  // Initialize engine whenever input changes
  useEffect(() => {
    if (!input) {
      engineRef.current = null;
      setTelemetry(null);
      setTelemetryHistory([]);
      setSimState(null);
      setReport(null);
      setIsRunning(false);
      return;
    }

    try {
      const engine = new SimulationEngine(input);
      engineRef.current = engine;
      setTelemetry(engine.getTelemetry());
      setTelemetryHistory(engine.getTelemetryHistory());
      setSimState(engine.getState());
      setReport(null);
      setIsRunning(autoPlay);
    } catch (err) {
      console.error('Failed to initialize SimulationEngine:', err);
      engineRef.current = null;
    }

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [input, autoPlay]);

  // Advance simulation by a single step
  const executeTick = useCallback((stepSec: number) => {
    const engine = engineRef.current;
    if (!engine) return;

    if (engine.isFinished()) {
      setIsRunning(false);
      setReport(engine.getMissionReport());
      setTelemetry(engine.getTelemetry());
      setSimState(engine.getState());
      return;
    }

    const newTelemetry = engine.tick(stepSec);
    setTelemetry(newTelemetry);
    setTelemetryHistory(engine.getTelemetryHistory());
    setSimState(engine.getState());

    if (engine.isFinished()) {
      setIsRunning(false);
      setReport(engine.getMissionReport());
    }
  }, []);

  // Main simulation timer loop
  useEffect(() => {
    if (!isRunning || !engineRef.current) {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const intervalMs = Math.max(20, Math.floor(1000 / tickRateHz));
    const effectiveStep = timeStepSeconds * speedMultiplier;

    timerRef.current = window.setInterval(() => {
      executeTick(effectiveStep);
    }, intervalMs);

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, tickRateHz, timeStepSeconds, speedMultiplier, executeTick]);

  // Controls
  const play = useCallback(() => {
    if (!engineRef.current || engineRef.current.isFinished()) return;
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isRunning) {
      pause();
    } else {
      play();
    }
  }, [isRunning, play, pause]);

  const step = useCallback((deltaSeconds?: number) => {
    pause();
    const dt = deltaSeconds !== undefined ? deltaSeconds : timeStepSeconds;
    executeTick(dt);
  }, [pause, executeTick, timeStepSeconds]);

  const setSpeed = useCallback((multiplier: number) => {
    setSpeedMultiplier(Math.max(0.5, Math.min(20, multiplier)));
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    if (engineRef.current) {
      engineRef.current.reset();
      setTelemetry(engineRef.current.getTelemetry());
      setTelemetryHistory(engineRef.current.getTelemetryHistory());
      setSimState(engineRef.current.getState());
      setReport(null);
    }
  }, []);

  const mitigateEvent = useCallback((eventId: string, log?: string): boolean => {
    if (!engineRef.current) return false;
    const success = engineRef.current.mitigateEvent(eventId, log);
    if (success) {
      setTelemetry(engineRef.current.getTelemetry());
      setSimState(engineRef.current.getState());
    }
    return success;
  }, []);

  const isCompleted = simState?.isCompleted ?? false;
  const isFailed = simState?.isFailed ?? false;
  const failureReason = simState?.failureReason;

  return {
    isRunning,
    isCompleted,
    isFailed,
    failureReason,
    speedMultiplier,
    telemetry,
    telemetryHistory,
    state: simState,
    report,
    play,
    pause,
    togglePlay,
    step,
    setSpeed,
    reset,
    mitigateEvent,
  };
}
