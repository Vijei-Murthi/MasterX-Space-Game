import React from 'react';
import AppRoutes from './routes';
import { MissionProvider } from '../context/MissionContext';

export const App: React.FC = () => {
  return (
    <MissionProvider>
      <AppRoutes />
    </MissionProvider>
  );
};

export default App;
