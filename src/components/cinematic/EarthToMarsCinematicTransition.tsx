import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { FastForward, Rocket, Compass, Radio } from 'lucide-react';

interface TransitionProps {
  onComplete: () => void;
  targetName?: string;
  difficultyLabel?: string;
}

/**
 * Animated High-Velocity Warp Starfield.
 * Simulates deep space travel with stars streaming rapidly past the camera.
 */
const DeepSpaceWarpStars: React.FC<{ progress: number }> = ({ progress }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 1500;

  const [positions, initialZ] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const zInit = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = -Math.random() * 80;
      zInit[i] = pos[i * 3 + 2];
    }
    return [pos, zInit];
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    // Warp speed peaks during interplanetary cruise phase (progress 0.25 to 0.7)
    const warpFactor =
      progress > 0.2 && progress < 0.7
        ? 1.0 + Math.sin(((progress - 0.2) / 0.5) * Math.PI) * 4.5
        : 1.0;
    const speed = delta * 35 * warpFactor;

    for (let i = 0; i < count; i++) {
      array[i * 3 + 2] += speed;
      if (array[i * 3 + 2] > 10) {
        array[i * 3 + 2] = initialZ[i] - 30;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.65}
        color="#f8fafc"
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
};

/**
 * 3D Earth Sphere that recedes into the distance during TMI burn.
 */
const RecedingEarth: React.FC<{ progress: number }> = ({ progress }) => {
  const earthRef = useRef<THREE.Group>(null);
  const [colorMap, normalMap] = useLoader(THREE.TextureLoader, [
    '/assets/earth/earth_atmos_2048.jpg',
    '/assets/earth/earth_normal_2048.jpg',
  ]);

  useFrame(() => {
    if (!earthRef.current) return;
    // Earth starts close (z = -3, y = -3) and recedes far back into space (z = -60)
    const t = Math.min(1.0, progress / 0.5); // Finishes receding by 50% progress
    const easeT = Math.pow(t, 2.2);

    earthRef.current.position.z = -3.0 - easeT * 60;
    earthRef.current.position.y = -2.8 - easeT * 10;
    earthRef.current.position.x = -easeT * 15;
    earthRef.current.scale.setScalar(Math.max(0.01, 1.0 - easeT * 0.88));
    earthRef.current.rotation.y += 0.002;
  });

  return (
    <group ref={earthRef} position={[0, -2.8, -3]}>
      <mesh receiveShadow castShadow>
        <sphereGeometry args={[3.8, 64, 64]} />
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>
      {/* Atmospheric Halo */}
      <mesh>
        <sphereGeometry args={[3.88, 48, 48]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={Math.max(0, 0.45 * (1 - progress * 2))}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

/**
 * 3D Mars Sphere that appears and expands during approach and aerocapture.
 */
const ApproachingMars: React.FC<{ progress: number }> = ({ progress }) => {
  const marsRef = useRef<THREE.Group>(null);
  const marsTexture = useLoader(THREE.TextureLoader, '/assets/mars/mars_2048.jpg');

  useFrame(() => {
    if (!marsRef.current) return;
    // Mars appears after progress 0.5 and moves closer from z = -80 to z = -4.5
    if (progress < 0.45) {
      marsRef.current.visible = false;
      return;
    }

    marsRef.current.visible = true;
    const t = (progress - 0.45) / 0.55; // 0 to 1
    const easeT = 1.0 - Math.pow(1.0 - t, 2.5);

    marsRef.current.position.z = -70 + easeT * 64; // Reaches z = -6
    marsRef.current.position.y = -6.0 + easeT * 3.2; // Rises into view
    marsRef.current.position.x = 8.0 - easeT * 6.5;
    marsRef.current.scale.setScalar(0.1 + easeT * 0.95);
    marsRef.current.rotation.y += 0.003;
  });

  return (
    <group ref={marsRef} position={[8, -6, -70]} visible={false}>
      <mesh receiveShadow castShadow>
        <sphereGeometry args={[3.5, 64, 64]} />
        <meshStandardMaterial
          map={marsTexture}
          roughness={0.7}
          metalness={0.15}
        />
      </mesh>
      {/* Dusty Terracotta Atmospheric Rim Glow */}
      <mesh>
        <sphereGeometry args={[3.58, 48, 48]} />
        <meshBasicMaterial
          color="#ea580c"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

/**
 * 3D Departing Spacecraft with Glowing Rocket / Ion Thruster Plume.
 */
const CruiseSpacecraft: React.FC<{ progress: number }> = ({ progress }) => {
  const craftRef = useRef<THREE.Group>(null);
  const plumeRef = useRef<THREE.Mesh>(null);
  const solarTexture = useLoader(
    THREE.TextureLoader,
    '/assets/spacecraft/solar_cell_texture.png'
  );

  useFrame((state) => {
    if (!craftRef.current) return;
    const time = state.clock.getElapsedTime();

    // Cinematic Spacecraft Trajectory:
    // Starts near Earth, pitches forward, accelerates, then re-orients for Mars retrograde capture
    if (progress < 0.45) {
      // Phase 1: Earth Departure & Acceleration
      const t = progress / 0.45;
      craftRef.current.position.set(
        Math.sin(t * Math.PI) * 0.8,
        0.2 + t * 0.8,
        1.5 - t * 4.5
      );
      craftRef.current.rotation.x = 0.2 + Math.sin(t * Math.PI) * 0.25;
      craftRef.current.rotation.y = 0.4 + t * 0.4;
      craftRef.current.rotation.z = -0.15 + Math.sin(t * Math.PI) * 0.1;
    } else {
      // Phase 2: Mars Approach & Retrograde Attitude Adjustment
      const t = (progress - 0.45) / 0.55;
      craftRef.current.position.set(
        0.5 - t * 0.7,
        1.0 - t * 0.6,
        -3.0 + t * 2.5
      );
      // Pitch backward for retrograde deceleration into Mars orbit
      craftRef.current.rotation.x = 0.45 - t * 0.6;
      craftRef.current.rotation.y = 0.8 + t * 0.8;
      craftRef.current.rotation.z = -0.05 + Math.sin(time * 0.5) * 0.04;
    }

    // Rocket thruster plume flicker
    if (plumeRef.current) {
      const flicker = 0.85 + Math.sin(time * 28) * 0.2;
      plumeRef.current.scale.set(flicker, flicker * 1.2, flicker);
    }
  });

  return (
    <group ref={craftRef} scale={0.55}>
      {/* Main Bus */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.9, 1.8, 0.9]} />
        <meshStandardMaterial color="#334155" metalness={0.65} roughness={0.3} />
      </mesh>

      {/* Aluminum Corner Rails */}
      {[-0.46, 0.46].map((x, i) =>
        [-0.46, 0.46].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, 0, z]}>
            <cylinderGeometry args={[0.035, 0.035, 1.88, 12]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
          </mesh>
        ))
      )}

      {/* Solar Wings */}
      {[-1, 1].map((dir, i) => (
        <group key={i} position={[dir * 0.46, 0, 0]}>
          <mesh position={[dir * 0.8, 0, 0]} castShadow>
            <boxGeometry args={[1.5, 1.5, 0.03]} />
            <meshStandardMaterial
              color="#1e3a8a"
              map={solarTexture}
              metalness={0.5}
              roughness={0.25}
            />
          </mesh>
        </group>
      ))}

      {/* High-Gain Dish Antenna */}
      <group position={[0, 0.98, 0]}>
        <mesh rotation={[0.4, 0.3, 0]}>
          <cylinderGeometry args={[0.35, 0.05, 0.12, 24, 1, true]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.8} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* High-Thrust Rocket Engine Nozzle & Glowing Plasma Plume */}
      <group position={[0, -0.98, 0]}>
        <mesh>
          <cylinderGeometry args={[0.2, 0.28, 0.25, 24]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Engine Exhaust Flame / Ion Jet Cone */}
        <mesh ref={plumeRef} position={[0, -0.45, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.26, 0.9, 24]} />
          <meshBasicMaterial
            color={progress > 0.45 ? '#ea580c' : '#38bdf8'}
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Internal Core Hot Spot */}
        <pointLight
          position={[0, -0.3, 0]}
          intensity={progress > 0.45 ? 4.5 : 5.0}
          color={progress > 0.45 ? '#f97316' : '#60a5fa'}
          distance={4}
        />
      </group>
    </group>
  );
};

export const EarthToMarsCinematicTransition: React.FC<TransitionProps> = ({
  onComplete,
  targetName = 'Coastal & Marine Water Quality',
  difficultyLabel = 'NORMAL',
}) => {
  const [progress, setProgress] = useState(0); // 0.0 to 1.0
  const durationMs = 6500; // 6.5s cinematic sequence
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let animId: number;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const p = Math.min(1.0, elapsed / durationMs);
      setProgress(p);

      if (p < 1.0) {
        animId = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [onComplete]);

  // Current Scene Subtitle & Phase Description
  const currentSceneInfo = useMemo(() => {
    if (progress < 0.25) {
      return {
        phase: 'SCENE 1 // EARTH MISSION DEPARTURE',
        title: 'TRANS-MARS INJECTION (TMI) IGNITION',
        detail: 'Escaping Low Earth Orbit • Main Thruster at 100% Throttle',
        velocity: '11.2 km/s (Escape Velocity)',
      };
    }
    if (progress < 0.65) {
      return {
        phase: 'SCENE 2 // INTERPLANETARY CRUISE',
        title: 'DEEP SPACE HELIOCENTRIC TRANSFER',
        detail: `En route to Mars Staging Deck • Payload: ${targetName}`,
        velocity: '32.8 km/s (Heliocentric Transfer)',
      };
    }
    if (progress < 0.88) {
      return {
        phase: 'SCENE 3 // MARS APPROACH & AEROCAPTURE',
        title: 'AREOCENTRIC ORBITAL INSERTION',
        detail: 'Mars Gravity Capture Confirmed • Retrograde Deceleration Vector',
        velocity: '5.4 km/s (Mars Capture)',
      };
    }
    return {
      phase: 'SCENE 4 // MARS STAGING FACILITY',
      title: 'DOCKING: MARS ENGINEERING BAY',
      detail: 'Deploying Rotary Workstation Turntable • Chassis Staging Active',
      velocity: '0.8 km/s (Landing Corridor)',
    };
  }, [progress, targetName]);

  return (
    <div className="fixed inset-0 z-50 bg-[#030712] text-white select-none overflow-hidden animate-in fade-in duration-300">
      
      {/* 3D WebGL Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas
          className="w-full h-full"
          camera={{ position: [0, 0, 7.5], fov: 42 }}
          gl={{
            alpha: false,
            antialias: true,
            powerPreference: 'high-performance',
          }}
        >
          {/* Deep Space Warp Stars */}
          <DeepSpaceWarpStars progress={progress} />

          {/* Dynamic Cosmic Lighting: Shifts from Earth Blue to Mars Terracotta */}
          <ambientLight
            intensity={0.9}
            color={progress > 0.45 ? '#431407' : '#0f172a'}
          />
          <directionalLight
            position={[10, 8, 8]}
            intensity={3.2}
            color={progress > 0.45 ? '#fed7aa' : '#ffffff'}
          />
          <directionalLight
            position={[-8, -5, -4]}
            intensity={1.2}
            color={progress > 0.45 ? '#c2410c' : '#38bdf8'}
          />

          <Suspense fallback={null}>
            {/* 1. Receding Earth */}
            <RecedingEarth progress={progress} />

            {/* 2. Approaching Mars */}
            <ApproachingMars progress={progress} />

            {/* 3. Traveling Spacecraft with Plasma Thruster */}
            <CruiseSpacecraft progress={progress} />
          </Suspense>
        </Canvas>
      </div>

      {/* Screen Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-radial from-transparent via-[#030712]/30 to-[#030712]/80 z-10" />

      {/* ========================================================================= */}
      {/* CINEMATIC MISSION HUD OVERLAYS                                            */}
      {/* ========================================================================= */}
      
      {/* Top Banner: Mission Status Readout */}
      <div className="absolute top-20 inset-x-0 z-20 flex justify-center px-6">
        <div className="bg-[#060c19]/80 backdrop-blur-xl border border-sky-900/60 rounded-full px-5 py-2 shadow-2xl flex items-center gap-3 font-mono text-xs text-slate-300">
          <Rocket size={15} className="text-sky-400 animate-pulse" />
          <span className="font-bold text-white uppercase">{currentSceneInfo.phase}</span>
          <span className="text-slate-600">•</span>
          <span className="text-sky-300">{currentSceneInfo.velocity}</span>
        </div>
      </div>

      {/* Center Cinematic Announcement Banner */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center text-center px-6">
        <div className="bg-[#030712]/60 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-800/80 shadow-2xl max-w-xl">
          <span className="text-[11px] font-mono tracking-widest text-sky-400 font-bold block uppercase mb-1">
            MASTERX • INTERPLANETARY STAGING
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-sans tracking-tight">
            {currentSceneInfo.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 font-sans">
            {currentSceneInfo.detail}
          </p>
        </div>
      </div>

      {/* Bottom Telemetry Bar & Progress Indicator */}
      <div className="absolute bottom-8 inset-x-6 sm:inset-x-12 z-20 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left: Transfer Progress Bar */}
        <div className="w-full sm:w-80 bg-[#060c19]/85 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-3 shadow-2xl font-mono text-xs">
          <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1.5 uppercase">
            <span>TRANSIT PROGRESS</span>
            <span className="text-sky-400 font-bold">{Math.round(progress * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-150 ${
                progress > 0.45 ? 'bg-amber-500' : 'bg-sky-500'
              }`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block mt-1.5 truncate">
            {progress > 0.45 ? 'INGRESS: MARS ATMOSPHERIC CORRIDOR' : 'EGRESS: GEOMAGNETIC SHADOW ESCAPE'}
          </span>
        </div>

        {/* Center: Mission Profile */}
        <div className="hidden lg:flex items-center gap-3 bg-[#060c19]/80 backdrop-blur-md px-4 py-2.5 rounded-full border border-slate-800 font-mono text-xs text-slate-300">
          <Compass size={14} className="text-sky-400" />
          <span>TIER: <strong className="text-white">{difficultyLabel}</strong></span>
          <span className="text-slate-600">•</span>
          <Radio size={14} className="text-emerald-400" />
          <span>TELEMETRY: <strong className="text-emerald-400">CARRIER LOCK</strong></span>
        </div>

        {/* Right: Skip Button */}
        <button
          onClick={onComplete}
          className="group flex items-center gap-2 px-5 py-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-sky-400 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-slate-200 hover:text-white transition-all shadow-2xl cursor-pointer"
        >
          <span>SKIP TRANSITION</span>
          <FastForward size={14} className="text-sky-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

      </div>

    </div>
  );
};

export default EarthToMarsCinematicTransition;
