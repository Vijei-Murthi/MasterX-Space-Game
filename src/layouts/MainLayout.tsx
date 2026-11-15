import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { Rocket, BookOpen, Compass, Save, Trash2, AlertCircle } from 'lucide-react';
import { useMission } from '../context/MissionContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const navigate = useNavigate();
  const {
    mission,
    hasSavedMission,
    savedDraftTimestamp,
    startNewMission,
    restoreSavedMission,
    resetMission,
  } = useMission();

  const closeModal = () => setActiveModal(null);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-[#030712] text-slate-100">
      {/* Ambient Space Underlay */}
      <div
        className="fixed inset-0 z-0 bg-[#030712] pointer-events-none select-none"
        aria-hidden="true"
      />

      {/* Header & Navigation */}
      <Navbar
        onOpenHowToPlay={() => setActiveModal('how-to-play')}
        onOpenNewMission={() => setActiveModal('new-mission')}
        onOpenContinue={() => setActiveModal('continue')}
        onOpenGuide={() => setActiveModal('guide')}
      />

      {/* Main Page Content */}
      <main className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl w-full mx-auto px-6 sm:px-12 lg:px-16 py-4 sm:py-6">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              // Pass modal triggers to child pages
              onOpenHowToPlay: () => setActiveModal('how-to-play'),
              onOpenNewMission: () => setActiveModal('new-mission'),
            } as Record<string, unknown>);
          }
          return child;
        })}
      </main>

      {/* Bottom Label (Strictly matching reference image) */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-6 sm:px-12 lg:px-16 pb-6 sm:pb-8 pt-2">
        <div className="flex items-center gap-2 select-none">
          <span className="w-[3px] h-[13px] bg-sky-500 rounded-xs" aria-hidden="true" />
          <p className="text-[11px] sm:text-xs font-semibold tracking-widest text-slate-300 uppercase font-sans">
            CUBESAT EARTH OBSERVATION <span className="mx-1 text-slate-500">•</span> SINGLE-PLAYER CAMPAIGN
          </p>
        </div>
      </footer>

      {/* MODAL 1: HOW TO PLAY */}
      <Modal
        isOpen={activeModal === 'how-to-play'}
        onClose={closeModal}
        title="HOW TO PLAY"
        subtitle="CubeSat Earth Observation Mission Briefing"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-300">
          <div className="flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded">
            <Compass className="text-sky-400 mt-0.5 shrink-0" size={18} />
            <div>
              <h4 className="font-semibold text-white">1. Design Your Spacecraft</h4>
              <p className="text-slate-400 mt-0.5">
                Select your CubeSat chassis (1U, 2U, 3U, or 6U), configure solar arrays, battery storage, onboard computer, communications antennae, and payload cameras.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded">
            <Rocket className="text-sky-400 mt-0.5 shrink-0" size={18} />
            <div>
              <h4 className="font-semibold text-white">2. Balance Critical Resources</h4>
              <p className="text-slate-400 mt-0.5">
                Ensure your total mass complies with launch vehicle limits and your solar generation keeps batteries charged throughout Earth eclipse periods.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded">
            <BookOpen className="text-sky-400 mt-0.5 shrink-0" size={18} />
            <div>
              <h4 className="font-semibold text-white">3. Launch & Observe Earth</h4>
              <p className="text-slate-400 mt-0.5">
                Deploy into Sun-Synchronous or Low Earth Orbit, track orbital telemetry, navigate space radiation anomalies, and capture high-resolution imagery.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              size="sm"
              onClick={() => {
                closeModal();
                navigate('/briefing');
              }}
            >
              START MISSION
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: NEW MISSION ENTRY POINT */}
      <Modal
        isOpen={activeModal === 'new-mission'}
        onClose={closeModal}
        title="NEW MISSION CONFIGURATION"
        subtitle="NASA Space Apps Challenge 2026 — Earth Observation"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-300">
          <p>
            You are initiating a new <strong className="text-white">CubeSat Earth Observation Mission</strong>.
          </p>
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded text-slate-300">
            <p className="text-xs text-sky-300 font-semibold uppercase tracking-wider mb-1">
              Engineering Module Integration
            </p>
            <p className="text-xs text-slate-400">
              The mission configuration and component catalogue are managed by <strong className="text-slate-200">Member 2 (Engineering & Mission Logic)</strong>.
            </p>
          </div>
          <p className="text-xs text-slate-400">
            Select an operational launch profile to proceed into the spacecraft design workbench:
          </p>
          <div className="grid grid-cols-1 gap-2 pt-1">
            <button
              onClick={() => {
                startNewMission({ difficulty: 'normal', targetId: 'coastal' });
                closeModal();
                navigate('/briefing');
              }}
              className="text-left p-3 rounded bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors flex items-center justify-between cursor-pointer"
            >
              <div>
                <p className="font-semibold text-white text-xs">Standard SSO (500 km Sun-Synchronous)</p>
                <p className="text-[11px] text-slate-400">Optimal lighting for multi-spectral Earth observation</p>
              </div>
              <span className="text-sky-400 text-xs font-semibold">Select →</span>
            </button>
            <button
              onClick={() => {
                startNewMission({ difficulty: 'hard', targetId: 'atmosphere' });
                closeModal();
                navigate('/briefing');
              }}
              className="text-left p-3 rounded bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors flex items-center justify-between cursor-pointer"
            >
              <div>
                <p className="font-semibold text-white text-xs">Polar Orbit (600 km)</p>
                <p className="text-[11px] text-slate-400">Complete planetary surface coverage</p>
              </div>
              <span className="text-sky-400 text-xs font-semibold">Select →</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: CONTINUE MISSION */}
      <Modal
        isOpen={activeModal === 'continue'}
        onClose={closeModal}
        title="CONTINUE SAVED MISSION"
        subtitle="Retrieve Saved Telemetry and Mission State"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-300">
          {hasSavedMission ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded">
                <Save className="text-sky-400 shrink-0" size={18} />
                <div className="text-left">
                  <p className="font-semibold text-white">{mission.missionName || 'CubeSat Earth Observation'}</p>
                  <p className="text-xs text-slate-400">
                    ID: {mission.missionId} • Stage: {mission.currentStage}
                  </p>
                  {savedDraftTimestamp && (
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Last Saved: {new Date(savedDraftTimestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-900/40 border border-slate-800 rounded text-left space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Objective:</span>
                  <span className="text-sky-300 uppercase font-mono">{mission.planner.objectiveId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chassis:</span>
                  <span className="text-white font-mono">{mission.spacecraft.structure.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Orbit:</span>
                  <span className="text-emerald-400 font-mono">{mission.orbitLaunch.selectedOrbitId.toUpperCase()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetMission();
                  }}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-mono cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Clear Saved Draft</span>
                </button>

                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      restoreSavedMission();
                      closeModal();
                      navigate('/briefing');
                    }}
                  >
                    Resume Mission
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="inline-flex p-3 bg-slate-900 rounded-full text-slate-500">
                <AlertCircle size={24} />
              </div>
              <h4 className="text-sm font-bold text-white">No Saved Mission Found</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                No active CubeSat mission draft was found in local storage. Start a new mission to begin.
              </p>
              <div className="pt-2 flex justify-center">
                <Button
                  size="sm"
                  onClick={() => {
                    startNewMission();
                    closeModal();
                    navigate('/briefing');
                  }}
                >
                  Start New Mission
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL 4: MISSION GUIDE */}
      <Modal
        isOpen={activeModal === 'guide'}
        onClose={closeModal}
        title="MISSION GUIDE & ARCHITECTURE"
        subtitle="NASA Space Apps Challenge 2026 Reference Manual"
        maxWidth="lg"
      >
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 max-h-[60vh] overflow-y-auto pr-1">
          <section>
            <h4 className="font-bold text-white text-sm mb-1">CubeSat Standard (1U to 6U)</h4>
            <p className="text-slate-400 text-xs">
              A standard 1U CubeSat measures 10×10×10 cm with a nominal mass of ~1.33 kg. Our mission leverages a 3U/6U high-capability Earth Observation satellite equipped with deployable solar arrays and multi-band optical sensors.
            </p>
          </section>
          <section className="pt-2 border-t border-slate-800">
            <h4 className="font-bold text-white text-sm mb-1">Subsystems & Balance</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs">
              <li><strong className="text-slate-200">EPS (Electric Power System):</strong> Balances solar generation vs battery discharge in eclipse.</li>
              <li><strong className="text-slate-200">ADCS:</strong> 3-axis reaction wheels and magnetorquers for precision Earth-pointing.</li>
              <li><strong className="text-slate-200">TCS (Thermal Control):</strong> Maintains instrument temperatures in extreme space conditions.</li>
              <li><strong className="text-slate-200">Payload:</strong> Earth-observation high-resolution camera.</li>
            </ul>
          </section>
          <section className="pt-2 border-t border-slate-800">
            <h4 className="font-bold text-white text-sm mb-1">Development Roles</h4>
            <p className="text-slate-400 text-xs">
              <strong className="text-sky-400">Member 1:</strong> Frontend UI & Integration • <strong className="text-sky-400">Member 2:</strong> Engineering & Mission Logic • <strong className="text-sky-400">Member 3:</strong> Simulation & Reports.
            </p>
          </section>
        </div>
      </Modal>
    </div>
  );
};

export default MainLayout;
