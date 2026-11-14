import React, { useRef, useState, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { SelectedSpacecraftComponents } from '../../types/builder';

interface MarsBayProps {
  selectedComponents: SelectedSpacecraftComponents;
  autoRotate?: boolean;
}

/**
 * Procedural Industrial Staging Turntable Platform.
 * Features an aerospace-grade rotary inspection deck with concentric calibration rings.
 */
const TurntablePlatform: React.FC<{ yPosition: number }> = ({ yPosition }) => {
  return (
    <group position={[0, yPosition, 0]}>
      {/* Heavy Rotary Base Deck */}
      <mesh receiveShadow position={[0, -0.15, 0]}>
        <cylinderGeometry args={[2.8, 3.1, 0.3, 48]} />
        <meshStandardMaterial
          color="#1e2430"
          metalness={0.8}
          roughness={0.4}
        />
      </mesh>

      {/* Titanium Upper Turntable Plate */}
      <mesh receiveShadow position={[0, 0.02, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 0.05, 48]} />
        <meshStandardMaterial
          color="#2d3748"
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>

      {/* Calibration Guideline Rings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[1.8, 1.83, 64]} />
        <meshBasicMaterial color="#d97706" opacity={0.6} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[2.3, 2.32, 64]} />
        <meshBasicMaterial color="#94a3b8" opacity={0.3} transparent />
      </mesh>

      {/* Industrial Mounting Cleats */}
      {[-1.2, 1.2].map((x, idx) => (
        <mesh key={idx} position={[x, 0.08, 0]} castShadow>
          <boxGeometry args={[0.2, 0.1, 0.4]} />
          <meshStandardMaterial color="#c2410c" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Dynamic 3D CubeSat Spacecraft Model.
 * Automatically adapts chassis geometry, solar wings, antenna array, and ADCS components
 * based on player selection in real time.
 */
const DynamicCubeSat: React.FC<{
  selectedComponents: SelectedSpacecraftComponents;
}> = ({ selectedComponents }) => {
  // Load solar photovoltaic cell texture
  const solarTexture = useLoader(
    THREE.TextureLoader,
    '/assets/spacecraft/solar_cell_texture.png'
  );

  // Compute chassis proportions based on structure choice
  const chassisConfig = useMemo(() => {
    switch (selectedComponents.structure) {
      case 'struct-1u':
        return { height: 1.0, width: 0.95, depth: 0.95, label: '1U' };
      case 'struct-2u':
        return { height: 1.8, width: 0.95, depth: 0.95, label: '2U' };
      case 'struct-3u':
      default:
        return { height: 2.6, width: 0.95, depth: 0.95, label: '3U' };
    }
  }, [selectedComponents.structure]);

  const h = chassisConfig.height;
  const halfH = h / 2;
  const isHiEffPower = selectedComponents.power === 'power-hieff';
  const isHighGainComms = selectedComponents.comms === 'comms-highgain';
  const isAdvancedADCS = selectedComponents.adcs === 'adcs-advanced';

  return (
    <group position={[0, halfH + 0.1, 0]}>
      {/* 1. Main CubeSat Chassis Bus */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[chassisConfig.width, h, chassisConfig.depth]} />
        <meshStandardMaterial
          color="#334155"
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* 2. 6061-T6 Aluminum Structural Posts along the 4 edges */}
      {[
        [-0.48, -0.48],
        [0.48, -0.48],
        [-0.48, 0.48],
        [0.48, 0.48],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.04, 0.04, h + 0.08, 12]} />
            <meshStandardMaterial
              color="#e2e8f0"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          {/* Gold Corner Rail Brackets */}
          <mesh position={[0, halfH, 0]} castShadow>
            <boxGeometry args={[0.12, 0.1, 0.12]} />
            <meshStandardMaterial
              color="#fbbf24"
              metalness={0.85}
              roughness={0.25}
            />
          </mesh>
          <mesh position={[0, -halfH, 0]} castShadow>
            <boxGeometry args={[0.12, 0.1, 0.12]} />
            <meshStandardMaterial
              color="#fbbf24"
              metalness={0.85}
              roughness={0.25}
            />
          </mesh>
        </group>
      ))}

      {/* 3. Nadir Optical Camera Assembly (Bottom Earth-Observation Face) */}
      <group position={[0, -halfH - 0.12, 0]}>
        {/* Optical Lens Barrel */}
        <mesh castShadow>
          <cylinderGeometry args={[0.26, 0.3, 0.24, 24]} />
          <meshStandardMaterial
            color="#0f172a"
            metalness={0.85}
            roughness={0.25}
          />
        </mesh>
        {/* Multi-coated optical glass aperture */}
        <mesh position={[0, -0.13, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.02, 24]} />
          <meshPhysicalMaterial
            color="#0284c7"
            roughness={0.1}
            transmission={0.85}
            reflectivity={0.9}
          />
        </mesh>
      </group>

      {/* 4. Solar Wings Subsystem */}
      {/* Left Wing */}
      <group position={[-0.48, 0, 0]}>
        {/* Hinge Mechanism */}
        <mesh position={[-0.08, 0, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, h * 0.7, 12]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Panel 1 */}
        <mesh position={[-0.75, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.3, h * 0.85, 0.03]} />
          <meshStandardMaterial
            color="#1e3a8a"
            map={solarTexture}
            metalness={0.5}
            roughness={0.25}
          />
        </mesh>

        {/* Extended Second Articulated Wing if High-Efficiency */}
        {isHiEffPower && (
          <group position={[-1.4, 0, 0]}>
            <mesh position={[-0.04, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, h * 0.6, 8]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[-0.65, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.2, h * 0.82, 0.025]} />
              <meshStandardMaterial
                color="#1e3a8a"
                map={solarTexture}
                metalness={0.5}
                roughness={0.25}
              />
            </mesh>
          </group>
        )}
      </group>

      {/* Right Wing */}
      <group position={[0.48, 0, 0]}>
        {/* Hinge Mechanism */}
        <mesh position={[0.08, 0, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, h * 0.7, 12]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Panel 1 */}
        <mesh position={[0.75, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.3, h * 0.85, 0.03]} />
          <meshStandardMaterial
            color="#1e3a8a"
            map={solarTexture}
            metalness={0.5}
            roughness={0.25}
          />
        </mesh>

        {/* Extended Second Articulated Wing if High-Efficiency */}
        {isHiEffPower && (
          <group position={[1.4, 0, 0]}>
            <mesh position={[0.04, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, h * 0.6, 8]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0.65, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.2, h * 0.82, 0.025]} />
              <meshStandardMaterial
                color="#1e3a8a"
                map={solarTexture}
                metalness={0.5}
                roughness={0.25}
              />
            </mesh>
          </group>
        )}
      </group>

      {/* 5. Communication Antenna Subsystem */}
      {isHighGainComms ? (
        /* High-Gain S-Band Steerable Dish Antenna on Zenith Deck */
        <group position={[0, halfH + 0.12, 0]}>
          {/* Gimbal Pedestal */}
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.14, 16]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Parabolic Dish Reflector */}
          <mesh position={[0, 0.18, 0]} rotation={[0.4, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.38, 0.05, 0.15, 24, 1, true]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.8} roughness={0.2} side={THREE.DoubleSide} />
          </mesh>
          {/* Central Feed Horn */}
          <mesh position={[0, 0.26, 0.05]} castShadow>
            <cylinderGeometry args={[0.02, 0.03, 0.12, 12]} />
            <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ) : (
        /* Basic Whip Antenna */
        <group position={[0.35, halfH, -0.35]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.03, 0.04, 0.08, 12]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.008, 0.01, 1.1, 8]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      )}

      {/* 6. Attitude Control (ADCS) Indicators */}
      {isAdvancedADCS && (
        <group position={[-0.32, halfH + 0.08, 0.28]}>
          {/* Miniature Star Tracker Optical Baffle */}
          <mesh castShadow rotation={[-0.3, -0.4, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 0.18, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Lens aperture */}
          <mesh position={[0, 0.1, 0]}>
            <circleGeometry args={[0.06, 16]} />
            <meshStandardMaterial color="#38bdf8" />
          </mesh>
        </group>
      )}

      {/* 7. Subsystem Bus Status & Avionics Heat Sink */}
      <group position={[0, 0, 0.49]}>
        {/* Heat Sink Fins */}
        {[-0.3, -0.15, 0, 0.15, 0.3].map((yOffset, i) => (
          <mesh key={i} position={[0, yOffset, 0.01]}>
            <boxGeometry args={[0.65, 0.02, 0.03]} />
            <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export const MarsEngineeringBayScene: React.FC<MarsBayProps> = ({
  selectedComponents,
  autoRotate = true,
}) => {
  const [webglSupported, setWebglSupported] = useState(true);
  const [internalRotate, setInternalRotate] = useState(autoRotate);
  const orbitRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    setInternalRotate(autoRotate);
  }, [autoRotate]);

  // Check WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebglSupported(false);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  const handleResetCamera = () => {
    if (orbitRef.current) {
      orbitRef.current.reset();
    }
  };

  if (!webglSupported) {
    return (
      <div className="w-full h-full relative flex items-center justify-center bg-[#0d0908]">
        <img
          src="/assets/mars/mars_engineering_bay.jpg"
          alt="Mars Engineering Bay"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
          <div className="bg-[#18110e]/90 p-4 rounded-lg border border-orange-950 text-slate-300">
            <p className="text-sm font-bold text-amber-400">3D ACCELERATION FALLBACK ACTIVE</p>
            <p className="text-xs text-slate-400 mt-1">Viewing static high-resolution CubeSat engineering specs.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* Mars Landscape Background Layer (View through observation window) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/assets/mars/mars_engineering_bay.jpg"
          alt="Mars Engineering Bay Background"
          className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.14]"
        />
        {/* Soft Industrial Window Reflections & Atmospheric Tint */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/90 via-[#18110e]/30 to-[#09090b]/80" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#18110e]/15 to-[#09090b]/75" />
      </div>

      {/* 3D React Three Fiber Canvas */}
      <div className="absolute inset-0 z-10">
        <Canvas
          className="w-full h-full"
          camera={{ position: [0, 1.2, 5.2], fov: 36 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
          }}
        >
          {/* Natural Industrial Lighting with Mars Planetary Illumination */}
          {/* 1. Warm Direct Sunlight from Martian Horizon */}
          <directionalLight
            position={[8, 10, 6]}
            intensity={3.2}
            color="#fff7ed"
            castShadow
          />

          {/* 2. Terracotta Martian Soil Bounce from below */}
          <directionalLight
            position={[-5, -4, -2]}
            intensity={1.5}
            color="#c2410c"
          />

          {/* 3. Cool Gantry Overhead Cleanroom Luminaire Fill */}
          <directionalLight
            position={[0, 8, 2]}
            intensity={1.2}
            color="#cbd5e1"
          />

          {/* 4. Ambient Base Light */}
          <ambientLight intensity={1.1} color="#3f2e27" />

          {/* 3D Scene Assembly */}
          <Suspense fallback={null}>
            {/* Staging Turntable Platform */}
            <TurntablePlatform yPosition={-1.5} />

            {/* Dynamic Spacecraft */}
            <group position={[0, -1.4, 0]}>
              <DynamicCubeSat selectedComponents={selectedComponents} />
            </group>

            {/* Orbit & Camera Controls */}
            <OrbitControls
              ref={orbitRef}
              enablePan={false}
              enableZoom={true}
              minDistance={2.6}
              maxDistance={8.5}
              minPolarAngle={0.2}
              maxPolarAngle={Math.PI / 2 + 0.05}
              autoRotate={internalRotate}
              autoRotateSpeed={1.0}
              enableDamping={true}
              dampingFactor={0.05}
              target={[0, -0.1, 0]}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Interactive Turntable & Camera HUD Controls Overlay */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
        <button
          onClick={() => setInternalRotate(!internalRotate)}
          className="px-3 py-1.5 bg-[#18110e]/90 hover:bg-[#271b16] border border-amber-900/70 rounded-full text-[11px] font-mono text-amber-300 hover:text-white transition-all cursor-pointer shadow-xl backdrop-blur-md flex items-center gap-1.5"
          title="Toggle Turntable Rotation"
        >
          <span>{internalRotate ? '❚❚ PAUSE TURNTABLE' : '▶ ROTATE TURNTABLE'}</span>
        </button>
        <button
          onClick={handleResetCamera}
          className="px-3 py-1.5 bg-[#18110e]/90 hover:bg-[#271b16] border border-slate-700/70 rounded-full text-[11px] font-mono text-slate-300 hover:text-white transition-all cursor-pointer shadow-xl backdrop-blur-md flex items-center gap-1"
          title="Reset Camera Angle"
        >
          <span>⟲ RESET CAMERA</span>
        </button>
      </div>

      {/* Quick Model Orientation Watermark */}
      <div className="absolute top-20 right-6 z-20 bg-[#18110e]/75 border border-amber-950/70 px-3.5 py-2 rounded-xl text-[10px] font-mono text-slate-400 backdrop-blur-md pointer-events-none hidden sm:block">
        <span className="text-amber-500 font-bold block">3D INTERACTIVE WORKSPACE</span>
        <span>DRAG TO ROTATE (360° ORBIT) • SCROLL TO ZOOM</span>
      </div>
    </div>
  );
};

export default MarsEngineeringBayScene;
