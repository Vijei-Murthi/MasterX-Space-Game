import React from 'react';
import SpacecraftMoonScene, { SubsystemHighlightType } from './SpacecraftMoonScene';
import { SelectedSpacecraftComponents } from '../../types/builder';

export type { SubsystemHighlightType };

interface CleanroomBayProps {
  selectedComponents: SelectedSpacecraftComponents;
  autoRotate?: boolean;
  highlightSubsystem?: SubsystemHighlightType;
  cameraDistance?: number;
  selectedPayloadId?: string;
  initialPreset?: 'default' | 'top' | 'bottom' | 'side';
}

/**
 * SpacecraftCleanroomScene (Compatibility Forwarder)
 * Seamlessly forwards to the enhanced, beautifully illuminated SpacecraftMoonScene.
 */
export const SpacecraftCleanroomScene: React.FC<CleanroomBayProps> = (props) => {
  return <SpacecraftMoonScene {...props} />;
};

export default SpacecraftCleanroomScene;
