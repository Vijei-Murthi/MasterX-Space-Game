import React from 'react';
import { Link } from 'react-router-dom';

interface MasterXLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withLink?: boolean;
}

const sizeClasses: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'h-6 sm:h-7',
  md: 'h-7 sm:h-8',
  lg: 'h-9 sm:h-10',
  xl: 'h-11 sm:h-12',
};

/**
 * MASTERX Reusable Global Logo Component
 * Strict Requirement: Always uses original transparent PNG emblem with preserved typography,
 * blue curved orbital mark, and natural proportions.
 */
export const MasterXLogo: React.FC<MasterXLogoProps> = ({
  size = 'md',
  className = '',
  withLink = false,
}) => {
  const imgElement = (
    <img
      src="/assets/masterx-logo.png"
      alt="MASTERX — Space Machine"
      className={`${sizeClasses[size]} w-auto object-contain select-none ${className}`}
      loading="eager"
      decoding="async"
    />
  );

  if (withLink) {
    return (
      <Link
        to="/"
        className="inline-flex items-center outline-none focus-visible:ring-1 focus-visible:ring-sky-400 rounded-sm group transition-opacity hover:opacity-90"
        title="Return to MASTERX Home"
      >
        {imgElement}
      </Link>
    );
  }

  return imgElement;
};

export default MasterXLogo;
