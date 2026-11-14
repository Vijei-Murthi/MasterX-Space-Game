import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import MissionBriefingPage from '../pages/MissionBriefingPage';
import SpacecraftBuilderPage from '../pages/SpacecraftBuilderPage';
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

      {/* 2. Interactive Mission Briefing Interface (Step 01 / 06) */}
      <Route path="/briefing" element={<MissionBriefingPage />} />
      <Route path="/new-mission" element={<Navigate to="/briefing" replace />} />

      {/* 3. Spacecraft Builder – Mars Engineering Bay (Step 02 / 06) */}
      <Route path="/planner" element={<SpacecraftBuilderPage />} />
      <Route path="/builder" element={<Navigate to="/planner" replace />} />

      {/* 4. Active Telemetry & Simulation State (Member 3 Integration Point) */}
      <Route
        path="/continue"
        element={
          <MainLayout>
            <GenericIntegrationPlaceholder
              title="Active Mission Telemetry & Saved State"
              leadRole="Member 3 – Simulation and Reports"
              description="This view will hydrate previous mission state, orbital telemetry streams, event logs, and operational commanding."
            />
          </MainLayout>
        }
      />

      {/* 5. Mission Guide Manual */}
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
