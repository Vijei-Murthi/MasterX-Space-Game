import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import SatelliteScene from '../components/spacecraft/SatelliteScene';

interface HomePageProps {
  onOpenHowToPlay?: () => void;
  onOpenNewMission?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenHowToPlay,
}) => {
  const navigate = useNavigate();

  return (
    <>
      {/* 3D Realistic Earth & Orbiting Satellite Subsystem */}
      <SatelliteScene />

      {/* Hero UI Content (Left Aligned with Right Observation Corridor) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
        {/* LEFT COLUMN: HERO CONTENT (Strictly matching reference layout) */}
        <div className="lg:col-span-6 flex flex-col justify-center items-start text-left z-10 pt-2 lg:pt-0">
          {/* Category Pill / Accent Bar */}
          <div className="flex items-center gap-2.5 mb-5 sm:mb-6 select-none">
            <span
              className="w-[3px] h-[14px] bg-sky-500 rounded-xs"
              aria-hidden="true"
            />
            <span className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-slate-300 uppercase font-sans">
              SPACE MISSION DESIGN GAME
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] xl:text-[64px] font-black tracking-tight text-white uppercase leading-[1.06] mb-5 sm:mb-6 font-sans">
            BUILD YOUR MISSION.
            <br />
            EXPLORE EARTH.
          </h1>

          {/* Description */}
          <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-lg font-normal leading-relaxed mb-8 sm:mb-10">
            Design a CubeSat, balance your resources, and launch an Earth-observation mission.
          </p>

          {/* Actions Row */}
          <div className="flex flex-wrap items-center gap-6">
            {/* Primary Action Button -> Enters Mission Briefing */}
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/briefing')}
              className="font-bold"
            >
              START MISSION
            </Button>

            {/* Secondary Text Link */}
            <button
              onClick={onOpenHowToPlay}
              className="group relative inline-flex items-center text-sm font-medium text-slate-200 hover:text-white transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 rounded py-1"
            >
              <span className="underline underline-offset-8 decoration-sky-500/80 group-hover:decoration-sky-400 transition-colors">
                How to play
              </span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Dedicated Observation Corridor for Orbiting Satellite */}
        <div
          className="lg:col-span-6 min-h-[360px] sm:min-h-[440px] md:min-h-[500px] pointer-events-none select-none flex items-center justify-center"
          aria-hidden="true"
        />
      </div>
    </>
  );
};

export default HomePage;
