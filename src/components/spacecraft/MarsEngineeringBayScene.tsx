import React from 'react';
import SpacecraftMoonScene from './SpacecraftMoonScene';
import { SelectedSpacecraftComponents } from '../../types/builder';

interface MarsBayProps {
  selectedComponents: SelectedSpacecraftComponents;
  autoRotate?: boolean;
}

/**
 * MarsEngineeringBayScene (Backwards Compatibility Re-export)
 * Smoothly forwards to the enhanced Spacecraft Moon Environment Scene.
 */
export const MarsEngineeringBayScene: React.FC<MarsBayProps> = (props) => {
  return <SpacecraftMoonScene {...props} />;
};

export default MarsEngineeringBayScene;
