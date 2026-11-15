/**
 * MASTERX – SPACE MACHINE
 * Unified Mission Context & Local Persistence Store
 * 
 * Part 5 Implementation:
 * Manages game state across all 6 stages:
 * 01 Briefing -> 02 Spacecraft -> 03 Subsystems -> 04 Payload -> 05 Orbit & Launch -> 06 Simulation.
 * Auto-persists drafts to localStorage under 'masterx_mission_draft_v1'.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  MissionState,
  MissionContextType,
  BriefingState,
  PlannerState,
  SubsystemsState,
  PayloadState,
  OrbitLaunchState,
  StageNum,
} from '../types/mission';
import { SelectedSpacecraftComponents } from '../types/builder';
import { DEFAULT_SELECTED_COMPONENTS } from '../data/builderCatalogue';
import { DIFFICULTY_PRESETS } from '../data/briefingConfig';

const STORAGE_KEY = 'masterx_mission_draft_v1';
const CURRENT_SCHEMA_VERSION = 1;

/**
 * Produces a default fresh mission configuration
 */
export function createDefaultMissionState(): MissionState {
  const timestamp = new Date().toISOString();
  const defaultDifficulty = 'normal';
  const defaultTargetId = 'coastal';
  const preset = DIFFICULTY_PRESETS[defaultDifficulty];

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    missionId: `mission_${Date.now()}`,
    missionName: 'CubeSat Earth Observation',
    createdAt: timestamp,
    lastUpdated: timestamp,
    currentStage: '01',
    briefing: {
      difficulty: defaultDifficulty,
      targetId: defaultTargetId,
      budgetUSD: preset.budgetUSD,
      maxMassKg: preset.maxMassKg,
      batteryReserveWh: preset.batteryReserveWh,
      minPowerWatts: preset.minPowerWatts,
    },
    planner: {
      objectiveId: 'ocean-observation',
      selectedTargetIds: ['target-midwest', 'target-amazon'],
      priorities: {
        resolutionPriority: 4,
        frequencyPriority: 3,
        scienceDataPriority: 4,
        coveragePriority: 3,
      },
      durationDays: 365,
      revisitFrequencyHours: 24,
      resolutionGsdMeters: 5.0,
    },
    spacecraft: { ...DEFAULT_SELECTED_COMPONENTS },
    subsystems: {
      structureId: DEFAULT_SELECTED_COMPONENTS.structure,
      epsId: DEFAULT_SELECTED_COMPONENTS.power,
      batteryId: DEFAULT_SELECTED_COMPONENTS.battery,
      commId: DEFAULT_SELECTED_COMPONENTS.comms,
      adcsId: DEFAULT_SELECTED_COMPONENTS.adcs,
      cdhId: DEFAULT_SELECTED_COMPONENTS.computer,
      tcsId: 'tcs-passive',
    },
    payload: {
      selectedPayloadId: 'payload-opt-hires',
      targetSpectrum: 'multispectral',
      dutyCyclePercent: 20,
    },
    orbitLaunch: {
      selectedOrbitId: 'sso-500',
      selectedLaunchVehicleId: 'falcon9-rideshare',
    },
  };
}

/**
 * Safely reads saved draft from browser localStorage
 */
function loadSavedMissionFromStorage(): MissionState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.schemaVersion !== CURRENT_SCHEMA_VERSION) {
      console.warn('[MASTERX State] Draft schema version mismatch. Discarding obsolete draft.');
      return null;
    }
    return parsed as MissionState;
  } catch (err) {
    console.error('[MASTERX State] Failed to read saved mission from storage:', err);
    return null;
  }
}

/**
 * Safely writes mission state to browser localStorage
 */
function saveMissionToStorage(state: MissionState): boolean {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (err) {
    console.error('[MASTERX State] Storage write failed (quota exceeded or storage disabled):', err);
    return false;
  }
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export const MissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state: prefer saved draft if valid, otherwise create default fresh state
  const [mission, setMission] = useState<MissionState>(() => {
    const saved = loadSavedMissionFromStorage();
    return saved || createDefaultMissionState();
  });

  const [hasSavedDraft, setHasSavedDraft] = useState<boolean>(() => {
    return !!loadSavedMissionFromStorage();
  });

  // Whenever mission state changes, automatically persist to storage
  useEffect(() => {
    const success = saveMissionToStorage(mission);
    if (success) {
      setHasSavedDraft(true);
    }
  }, [mission]);

  // 1. Start Fresh Mission
  const startNewMission = useCallback((initialBriefing?: Partial<BriefingState>) => {
    const fresh = createDefaultMissionState();
    if (initialBriefing) {
      fresh.briefing = { ...fresh.briefing, ...initialBriefing };
    }
    setMission(fresh);
    saveMissionToStorage(fresh);
    setHasSavedDraft(true);
  }, []);

  // 2. Restore Saved Draft
  const restoreSavedMission = useCallback((): boolean => {
    const saved = loadSavedMissionFromStorage();
    if (saved) {
      setMission(saved);
      return true;
    }
    return false;
  }, []);

  // 3. Reset Mission
  const resetMission = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('[MASTERX State] Could not clear storage item:', err);
    }
    const fresh = createDefaultMissionState();
    setMission(fresh);
    setHasSavedDraft(false);
  }, []);

  // 4. Updaters
  const updateBriefing = useCallback((updates: Partial<BriefingState>) => {
    setMission((prev) => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      briefing: { ...prev.briefing, ...updates },
    }));
  }, []);

  const updatePlanner = useCallback((updates: Partial<PlannerState>) => {
    setMission((prev) => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      planner: { ...prev.planner, ...updates },
    }));
  }, []);

  const updateSpacecraft = useCallback((components: Partial<SelectedSpacecraftComponents>) => {
    setMission((prev) => {
      const updatedBus = { ...prev.spacecraft, ...components };
      return {
        ...prev,
        lastUpdated: new Date().toISOString(),
        spacecraft: updatedBus,
        // sync to subsystems state
        subsystems: {
          ...prev.subsystems,
          structureId: updatedBus.structure,
          epsId: updatedBus.power,
          batteryId: updatedBus.battery,
          commId: updatedBus.comms,
          adcsId: updatedBus.adcs,
          cdhId: updatedBus.computer,
        },
      };
    });
  }, []);

  const updateSubsystems = useCallback((updates: Partial<SubsystemsState>) => {
    setMission((prev) => {
      const updatedSubsystems = { ...prev.subsystems, ...updates };
      // sync matching bus fields to spacecraft
      return {
        ...prev,
        lastUpdated: new Date().toISOString(),
        subsystems: updatedSubsystems,
        spacecraft: {
          ...prev.spacecraft,
          structure: updatedSubsystems.structureId || prev.spacecraft.structure,
          power: updatedSubsystems.epsId || prev.spacecraft.power,
          battery: updatedSubsystems.batteryId || prev.spacecraft.battery,
          comms: updatedSubsystems.commId || prev.spacecraft.comms,
          adcs: updatedSubsystems.adcsId || prev.spacecraft.adcs,
          computer: updatedSubsystems.cdhId || prev.spacecraft.computer,
        },
      };
    });
  }, []);

  const updatePayload = useCallback((updates: Partial<PayloadState>) => {
    setMission((prev) => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      payload: { ...prev.payload, ...updates },
    }));
  }, []);

  const updateOrbitLaunch = useCallback((updates: Partial<OrbitLaunchState>) => {
    setMission((prev) => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      orbitLaunch: { ...prev.orbitLaunch, ...updates },
    }));
  }, []);

  const setCurrentStage = useCallback((stage: StageNum) => {
    setMission((prev) => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      currentStage: stage,
    }));
  }, []);

  const savedDraftTimestamp = useMemo(() => {
    return hasSavedDraft ? mission.lastUpdated : null;
  }, [hasSavedDraft, mission.lastUpdated]);

  const value = useMemo<MissionContextType>(
    () => ({
      mission,
      hasSavedMission: hasSavedDraft,
      savedDraftTimestamp,
      startNewMission,
      restoreSavedMission,
      resetMission,
      updateBriefing,
      updatePlanner,
      updateSpacecraft,
      updateSubsystems,
      updatePayload,
      updateOrbitLaunch,
      setCurrentStage,
    }),
    [
      mission,
      hasSavedDraft,
      savedDraftTimestamp,
      startNewMission,
      restoreSavedMission,
      resetMission,
      updateBriefing,
      updatePlanner,
      updateSpacecraft,
      updateSubsystems,
      updatePayload,
      updateOrbitLaunch,
      setCurrentStage,
    ]
  );

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
};

export const useMission = (): MissionContextType => {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMission must be used within a <MissionProvider>');
  }
  return context;
};

export default MissionContext;
