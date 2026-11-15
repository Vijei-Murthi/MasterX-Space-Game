import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import MissionBriefingPage from '../pages/MissionBriefingPage';
import SpacecraftBuilderPage from '../pages/SpacecraftBuilderPage';
import MissionPlannerPage from '../pages/MissionPlannerPage';
import SubsystemsPage from '../pages/SubsystemsPage';
import PayloadPage from '../pages/PayloadPage';
import OrbitLaunchPage from '../pages/OrbitLaunchPage';
import SimulationPage from '../pages/SimulationPage';
import MissionReportPage from '../pages/MissionReportPage';
import Button from '../components/ui/Button';

const GenericIntegrationPlaceholder: React.FC<{
  title: string;
  leadRole: string;
  description: string;
}> = ({ title, leadRole, description }) => {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto p-8 bg-[#0b1222]/90 border border-slate-800 rounded-lg text-left shadow-xl my-auto">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1.5 h-4 bg-sky-500 rounded-xs" />
        <h2 className="text-xl font-bold text-white uppercase tracking-wider font-sans">
          {title}
        </h2>
      </div>
      <p className="text-xs text-sky-400 font-semibold tracking-wide uppercase mb-3">
        Assigned: {leadRole}
      </p>
      <p className="text-sm text-slate-300 leading-relaxed mb-6">
        {description}
      </p>
      <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded text-xs text-slate-400 font-mono mb-6">
        <p className="text-slate-300 font-semibold mb-1">Contract Status: Ready for integration</p>
        <p>• Clean route mount ready</p>
        <p>• State hydration interfaces defined</p>
        <p>• Preserves 3-member separation of concerns</p>
      </div>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Main Homepage with Cinematic 3D Earth & Orbiting Satellite */}
      <Route
        path="/"
        element={
          <MainLayout>
            <HomePage />
          </MainLayout>
        }
      />

      {/* 2. Stage 01: Interactive Mission Briefing Interface */}
      <Route path="/briefing" element={<MissionBriefingPage />} />
      <Route path="/new-mission" element={<Navigate to="/briefing" replace />} />

      {/* 2b. Stage 01 Extended: Interactive Mission Planner (Gaming-Oriented Scroll Configuration) */}
      <Route path="/mission-planner" element={<MissionPlannerPage />} />
      <Route path="/plan" element={<Navigate to="/mission-planner" replace />} />

      {/* 3. Stage 02: Spacecraft Builder – Mars Engineering Bay */}
      <Route path="/planner" element={<SpacecraftBuilderPage />} />
      <Route path="/builder" element={<Navigate to="/planner" replace />} />
      <Route path="/spacecraft" element={<Navigate to="/planner" replace />} />

      {/* 4. Stage 03: Subsystems Workbench */}
      <Route path="/subsystems" element={<SubsystemsPage />} />

      {/* 5. Stage 04: Scientific Payload Selection */}
      <Route path="/payload" element={<PayloadPage />} />

      {/* 6. Stage 05: Orbit & Launch Selection + Flight Readiness Validation */}
      <Route path="/orbit-launch" element={<OrbitLaunchPage />} />
      <Route path="/launch" element={<Navigate to="/orbit-launch" replace />} />

      {/* 7. Stage 06: Simulation & Telemetry Runner */}
      <Route path="/simulation" element={<SimulationPage />} />
      <Route path="/continue" element={<Navigate to="/simulation" replace />} />

      {/* 8. Mission Report & Debrief */}
      <Route path="/report" element={<MissionReportPage />} />
      <Route path="/debrief" element={<Navigate to="/report" replace />} />

      {/* 9. Mission Guide Manual */}
      <Route
        path="/guide"
        element={
          <MainLayout>
            <GenericIntegrationPlaceholder
              title="Mission Operations & CubeSat Engineering Manual"
              leadRole="Team Technical Guide"
              description="Comprehensive documentation on NASA CubeSat standards, Earth observation optical sensors, orbital mechanics, and thermal-power balance."
            />
          </MainLayout>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
