import React, { useRef, useState, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { SelectedSpacecraftComponents } from '../../types/builder';

export type SubsystemHighlightType =
  | 'structure'
  | 'power'
  | 'battery'
  | 'comms'
  | 'adcs'
  | 'computer'
  | 'thermal'
  | 'payload'
  | null;

export type CameraPresetView = 'default' | 'top' | 'bottom' | 'side';

interface SpacecraftMoonSceneProps {
  selectedComponents: SelectedSpacecraftComponents;
  autoRotate?: boolean;
  highlightSubsystem?: SubsystemHighlightType;
  cameraDistance?: number;
  initialPreset?: CameraPresetView;
  selectedPayloadId?: string;
  showLunarSurface?: boolean;
}

/**
 * Procedural Deep Space Starfield
 * 1,400 sharp, natural white and blue-white stars in the blackness of space.
 */
const DeepSpaceStarfield: React.FC = () => {
  const points = useMemo(() => {
    const starCount = 1400;
    const coords = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const radius = 70 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      coords[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      coords[i * 3 + 1] = Math.abs(radius * Math.cos(phi)) + 5; // Emphasize upper space hemisphere
      coords[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    return coords;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.65}
        color="#f1f5f9"
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
};

/**
 * Distant 3D Earth in the Lunar Sky (Earthrise view)
 * Uses high-res NASA Blue Marble texture and atmospheric limb glow shader.
 */
const DistantEarth: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const colorMap = useLoader(THREE.TextureLoader, '/assets/earth/earth_atmos_2048.jpg');

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.015;
    }
  });

  return (
    <group position={position}>
      {/* Solid Earth Sphere */}
      <mesh ref={earthRef} rotation={[0.2, 0.8, -0.1]}>
        <sphereGeometry args={[2.8, 36, 36]} />
        <meshStandardMaterial
          map={colorMap}
          roughness={0.7}
          metalness={0.1}
          emissive="#1e3a8a"
          emissiveIntensity={0.12}
        />
      </mesh>

      {/* Atmospheric Rim Halo Glow */}
      <mesh>
        <sphereGeometry args={[2.88, 36, 36]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.32}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

/**
 * 3D Curved Lunar Ground Staging Terrain
 * Detailed grey-silver lunar regolith with subtle crater ridges and concentric alignment markings.
 */
const LunarStagingSurface: React.FC<{ yPosition: number }> = ({ yPosition }) => {
  return (
    <group position={[0, yPosition, 0]}>
      {/* 1. Curved Lunar Regolith Ground Disc */}
      <mesh receiveShadow position={[0, -0.4, 0]}>
        <cylinderGeometry args={[5.2, 5.6, 0.8, 64]} />
        <meshStandardMaterial
          color="#475569"
          roughness={0.88}
          metalness={0.15}
        />
      </mesh>

      {/* 2. Concentric Lunar Exploration Calibration Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[2.4, 2.43, 64]} />
        <meshBasicMaterial color="#38bdf8" opacity={0.45} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[3.2, 3.22, 64]} />
        <meshBasicMaterial color="#94a3b8" opacity={0.3} transparent />
      </mesh>

      {/* 3. Cardinal Guidance Ticks */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <mesh
            key={i}
            position={[Math.cos(rad) * 2.8, 0.025, Math.sin(rad) * 2.8]}
            rotation={[-Math.PI / 2, 0, rad]}
          >
            <planeGeometry args={[0.16, 0.03]} />
            <meshBasicMaterial color="#38bdf8" opacity={0.7} transparent />
          </mesh>
        );
      })}
    </group>
  );
};

/**
 * Dynamic 3D CubeSat Model with High-Contrast Aerospace Materials
 * Guaranteed bright, colorful, clearly distinguishable components.
 * Subsystems visibly change and highlight based on player selection.
 */
export const DynamicCubeSat: React.FC<{
  selectedComponents: SelectedSpacecraftComponents;
  highlightSubsystem?: SubsystemHighlightType;
  selectedPayloadId?: string;
}> = ({ selectedComponents, highlightSubsystem = null, selectedPayloadId = 'payload-opt-hires' }) => {
  const solarTexture = useLoader(
    THREE.TextureLoader,
    '/assets/spacecraft/solar_cell_texture.png'
  );

  const reactionWheelsRef = useRef<THREE.Group>(null);
  const commPulseRef = useRef<THREE.Mesh>(null);
  const dataLedRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    // Reaction wheel continuous spin (ADCS active demonstration)
    if (reactionWheelsRef.current) {
      reactionWheelsRef.current.rotation.y += delta * 7.5;
    }
    // COMM RF transmission ring scale pulse
    if (commPulseRef.current) {
      const s = 1 + (Math.sin(state.clock.elapsedTime * 4.5) * 0.2 + 0.2);
      commPulseRef.current.scale.set(s, s, s);
    }
    // CDH telemetry LED blink
    if (dataLedRef.current) {
      const glow = Math.sin(state.clock.elapsedTime * 8) > 0 ? 0.9 : 0.2;
      (dataLedRef.current.material as THREE.MeshBasicMaterial).opacity = glow;
    }
  });

  // Calculate chassis height and centered positioning
  const h = useMemo(() => {
    switch (selectedComponents.structure) {
      case 'struct-1u':
        return 1.1;
      case 'struct-2u':
        return 1.9;
      case 'struct-3u':
      default:
        return 2.7;
    }
  }, [selectedComponents.structure]);

  const halfH = h / 2;
  const isHiEffPower = selectedComponents.power === 'power-hieff';
  const isHighGainComms = selectedComponents.comms === 'comms-highgain';
  const isAdvancedADCS = selectedComponents.adcs === 'adcs-advanced';
  const isHiCapBattery = selectedComponents.battery === 'battery-hicap';
  const isAdvancedComputer = selectedComponents.computer === 'comp-advanced';

  // Subsystem active highlight flags
  const isHighlightingStructure = highlightSubsystem === 'structure';
  const isHighlightingPower = highlightSubsystem === 'power';
  const isHighlightingBattery = highlightSubsystem === 'battery';
  const isHighlightingComms = highlightSubsystem === 'comms';
  const isHighlightingADCS = highlightSubsystem === 'adcs';
  const isHighlightingComputer = highlightSubsystem === 'computer';
  const isHighlightingThermal = highlightSubsystem === 'thermal';
  const isHighlightingPayload = highlightSubsystem === 'payload';

  return (
    // Centered at (0, 0, 0)
    <group position={[0, 0, 0]}>
      
      {/* ===================================================================== */}
      {/* 1. BUS / STRUCTURE: MAIN CHASSIS PANELS & HARD-ANODIZED RAILS        */}
      {/* ===================================================================== */}
      
      {/* Primary Aerospace Structural Core (Titanium / Graphite paneling) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.92, h, 0.92]} />
        <meshStandardMaterial
          color={
            isHighlightingStructure
              ? '#38bdf8'
              : isHighlightingThermal
              ? '#f59e0b'
              : '#334155'
          }
          emissive={
            isHighlightingStructure
              ? '#0284c7'
              : isHighlightingThermal
              ? '#d97706'
              : '#0f172a'
          }
          emissiveIntensity={
            isHighlightingStructure || isHighlightingThermal ? 0.6 : 0.15
          }
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Aerospace 6061-T6 Aluminum Corner Posts (Gleaming silver rails) */}
      {[
        [-0.47, -0.47],
        [0.47, -0.47],
        [-0.47, 0.47],
        [0.47, 0.47],
      ].map(([x, z], idx) => (
        <group key={`corner-rail-${idx}`} position={[x, 0, z]}>
          <mesh castShadow>
            <boxGeometry args={[0.07, h + 0.08, 0.07]} />
            <meshStandardMaterial
              color={isHighlightingStructure ? '#bae6fd' : '#f1f5f9'}
              metalness={0.88}
              roughness={0.15}
              emissive={isHighlightingStructure ? '#38bdf8' : '#000000'}
              emissiveIntensity={isHighlightingStructure ? 0.4 : 0}
            />
          </mesh>

          {/* Gold Anodized Corner Deployer Brackets */}
          <mesh position={[0, halfH + 0.02, 0]} castShadow>
            <boxGeometry args={[0.11, 0.08, 0.11]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.92} roughness={0.2} />
          </mesh>
          <mesh position={[0, -halfH - 0.02, 0]} castShadow>
            <boxGeometry args={[0.11, 0.08, 0.11]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.92} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Horizontal Framing Ribs */}
      {[-halfH, halfH].map((y, idx) => (
        <group key={`rib-${idx}`} position={[0, y, 0]}>
          <mesh position={[0, 0, -0.47]}>
            <boxGeometry args={[0.96, 0.06, 0.06]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.47]}>
            <boxGeometry args={[0.96, 0.06, 0.06]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[-0.47, 0, 0]}>
            <boxGeometry args={[0.06, 0.06, 0.96]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0.47, 0, 0]}>
            <boxGeometry args={[0.06, 0.06, 0.96]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.85} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* ===================================================================== */}
      {/* 2. EPS / POWER: SOLAR CELLS & ARTICULATED WINGS                       */}
      {/* ===================================================================== */}
      {isHiEffPower ? (
        // High-Efficiency Dual Articulated Deployable Wings
        <group>
          {/* Left Wing Assembly */}
          <group position={[-0.48, 0, 0]}>
            {/* Golden Hinge Cylinder */}
            <mesh position={[-0.06, 0, 0]} castShadow>
              <cylinderGeometry args={[0.035, 0.035, h * 0.75, 12]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* Inner Articulated Wing Panel */}
            <mesh position={[-0.72, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.25, h * 0.88, 0.03]} />
              <meshStandardMaterial
                color="#1d4ed8"
                map={solarTexture}
                metalness={0.65}
                roughness={0.2}
                emissive={isHighlightingPower ? '#38bdf8' : '#1e40af'}
                emissiveIntensity={isHighlightingPower ? 0.6 : 0.25}
              />
            </mesh>

            {/* Outer Articulated Wing Panel */}
            <mesh position={[-1.96, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.15, h * 0.85, 0.03]} />
              <meshStandardMaterial
                color="#1d4ed8"
                map={solarTexture}
                metalness={0.65}
                roughness={0.2}
                emissive={isHighlightingPower ? '#38bdf8' : '#1e40af'}
                emissiveIntensity={isHighlightingPower ? 0.6 : 0.25}
              />
            </mesh>

            {/* Golden Inter-panel Linkage */}
            <mesh position={[-1.37, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, h * 0.65, 8]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>

          {/* Right Wing Assembly */}
          <group position={[0.48, 0, 0]}>
            {/* Golden Hinge Cylinder */}
            <mesh position={[0.06, 0, 0]} castShadow>
              <cylinderGeometry args={[0.035, 0.035, h * 0.75, 12]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* Inner Articulated Wing Panel */}
            <mesh position={[0.72, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.25, h * 0.88, 0.03]} />
              <meshStandardMaterial
                color="#1d4ed8"
                map={solarTexture}
                metalness={0.65}
                roughness={0.2}
                emissive={isHighlightingPower ? '#38bdf8' : '#1e40af'}
                emissiveIntensity={isHighlightingPower ? 0.6 : 0.25}
              />
            </mesh>

            {/* Outer Articulated Wing Panel */}
            <mesh position={[1.96, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.15, h * 0.85, 0.03]} />
              <meshStandardMaterial
                color="#1d4ed8"
                map={solarTexture}
                metalness={0.65}
                roughness={0.2}
                emissive={isHighlightingPower ? '#38bdf8' : '#1e40af'}
                emissiveIntensity={isHighlightingPower ? 0.6 : 0.25}
              />
            </mesh>

            {/* Golden Inter-panel Linkage */}
            <mesh position={[1.37, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, h * 0.65, 8]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        </group>
      ) : (
        // Standard Body-Mounted Solar Panels Flush on 4 Chassis Faces (No protruding wings)
        <group>
          {/* Front Face Solar Panel */}
          <mesh position={[0, 0, 0.47]}>
            <boxGeometry args={[0.82, h * 0.85, 0.015]} />
            <meshStandardMaterial
              color="#2563eb"
              map={solarTexture}
              metalness={0.6}
              roughness={0.25}
              emissive={isHighlightingPower ? '#38bdf8' : '#1d4ed8'}
              emissiveIntensity={isHighlightingPower ? 0.55 : 0.2}
            />
          </mesh>

          {/* Back Face Solar Panel */}
          <mesh position={[0, 0, -0.47]}>
            <boxGeometry args={[0.82, h * 0.85, 0.015]} />
            <meshStandardMaterial
              color="#2563eb"
              map={solarTexture}
              metalness={0.6}
              roughness={0.25}
              emissive={isHighlightingPower ? '#38bdf8' : '#1d4ed8'}
              emissiveIntensity={isHighlightingPower ? 0.55 : 0.2}
            />
          </mesh>

          {/* Left Face Solar Panel */}
          <mesh position={[-0.47, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.82, h * 0.85, 0.015]} />
            <meshStandardMaterial
              color="#2563eb"
              map={solarTexture}
              metalness={0.6}
              roughness={0.25}
              emissive={isHighlightingPower ? '#38bdf8' : '#1d4ed8'}
              emissiveIntensity={isHighlightingPower ? 0.55 : 0.2}
            />
          </mesh>

          {/* Right Face Solar Panel */}
          <mesh position={[0.47, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.82, h * 0.85, 0.015]} />
            <meshStandardMaterial
              color="#2563eb"
              map={solarTexture}
              metalness={0.6}
              roughness={0.25}
              emissive={isHighlightingPower ? '#38bdf8' : '#1d4ed8'}
              emissiveIntensity={isHighlightingPower ? 0.55 : 0.2}
            />
          </mesh>
        </group>
      )}

      {/* ===================================================================== */}
      {/* 3. BATT / ENERGY STORAGE: VISIBLE BATTERY PACK IN MID-BAY DECK       */}
      {/* ===================================================================== */}
      <group position={[0, 0, 0]}>
        {isHiCapBattery ? (
          // 65 Wh LiFePO4 Heavy-Duty Prismatic Module
          <group position={[0, 0.05, 0]}>
            {/* Orange/Gold Thermal Casing */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.72, 0.32, 0.72]} />
              <meshStandardMaterial
                color={isHighlightingBattery ? '#10b981' : '#d97706'}
                emissive={isHighlightingBattery ? '#059669' : '#b45309'}
                emissiveIntensity={isHighlightingBattery ? 0.65 : 0.2}
                metalness={0.8}
                roughness={0.25}
              />
            </mesh>

            {/* Copper Terminals */}
            {[-0.24, 0.24].map((tx, idx) => (
              <mesh key={`terminal-${idx}`} position={[tx, 0.18, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 0.06, 12]} />
                <meshStandardMaterial color="#f97316" metalness={0.9} roughness={0.2} />
              </mesh>
            ))}

            {/* Pulsing Energy Storage Gauge */}
            <mesh position={[0, 0.17, 0.28]}>
              <planeGeometry args={[0.35, 0.04]} />
              <meshBasicMaterial color="#34d399" />
            </mesh>
          </group>
        ) : (
          // 30 Wh Standard Li-Ion Cylindrical Cell Bank (Teal/Silver Casing)
          <group position={[0, 0.05, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.65, 0.22, 0.65]} />
              <meshStandardMaterial
                color={isHighlightingBattery ? '#10b981' : '#0284c7'}
                emissive={isHighlightingBattery ? '#059669' : '#0369a1'}
                emissiveIntensity={isHighlightingBattery ? 0.6 : 0.2}
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>

            {/* Visible 18650 Cylindrical Cell Tops */}
            {[-0.18, 0, 0.18].map((cx, idx) =>
              [-0.15, 0.15].map((cz, jdx) => (
                <mesh key={`cell-${idx}-${jdx}`} position={[cx, 0.12, cz]}>
                  <cylinderGeometry args={[0.065, 0.065, 0.03, 16]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
                </mesh>
              ))
            )}
          </group>
        )}
      </group>

      {/* ===================================================================== */}
      {/* 4. COMM / COMMUNICATIONS: TOP ZENITH DECK ANTENNAS                   */}
      {/* ===================================================================== */}
      <group position={[0, halfH, 0]}>
        {isHighGainComms ? (
          // S-Band Phased Directional Patch Array (Zenith Top Face)
          <group position={[0, 0.04, 0]}>
            {/* White Ceramic Substrate */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.7, 0.08, 0.7]} />
              <meshStandardMaterial
                color={isHighlightingComms ? '#38bdf8' : '#e2e8f0'}
                emissive={isHighlightingComms ? '#0284c7' : '#000000'}
                emissiveIntensity={isHighlightingComms ? 0.6 : 0}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>

            {/* 2x2 Gold Radiating Patches */}
            {[-0.18, 0.18].map((px, idx) =>
              [-0.18, 0.18].map((pz, jdx) => (
                <mesh key={`patch-${idx}-${jdx}`} position={[px, 0.045, pz]}>
                  <boxGeometry args={[0.22, 0.015, 0.22]} />
                  <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.15} />
                </mesh>
              ))
            )}

            {/* Active RF Pulse Wavefront Ring */}
            <mesh ref={commPulseRef} position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.38, 0.44, 32]} />
              <meshBasicMaterial
                color={isHighlightingComms ? '#38bdf8' : '#60a5fa'}
                transparent
                opacity={isHighlightingComms ? 0.8 : 0.4}
              />
            </mesh>
          </group>
        ) : (
          // Deployable 4-Element UHF/VHF Flexible Tape Whip Antennas
          <group position={[0, 0.03, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.2, 0.22, 0.06, 16]} />
              <meshStandardMaterial color="#475569" metalness={0.7} />
            </mesh>

            {/* 4 Spring Tape Whips Deploying diagonally upward */}
            {[
              [0.16, 0.48, 0.16, 0.38, 0.38],
              [-0.16, 0.48, 0.16, 0.38, -0.38],
              [0.16, 0.48, -0.16, -0.38, 0.38],
              [-0.16, 0.48, -0.16, -0.38, -0.38],
            ].map(([x, y, z, rx, rz], idx) => (
              <mesh key={`whip-${idx}`} position={[x, y, z]} rotation={[rx, 0, rz]} castShadow>
                <cylinderGeometry args={[0.009, 0.009, 1.05, 8]} />
                <meshStandardMaterial
                  color={isHighlightingComms ? '#38bdf8' : '#e2e8f0'}
                  emissive={isHighlightingComms ? '#0284c7' : '#000000'}
                  emissiveIntensity={isHighlightingComms ? 0.7 : 0}
                  metalness={0.92}
                  roughness={0.1}
                />
              </mesh>
            ))}
          </group>
        )}
      </group>

      {/* ===================================================================== */}
      {/* 5. ADCS / ATTITUDE CONTROL: REACTION WHEELS & STAR TRACKER            */}
      {/* ===================================================================== */}
      <group position={[0, -0.2, 0.47]}>
        {isAdvancedADCS ? (
          // 3-Axis Precision Reaction Flywheels + Miniature Star Tracker
          <group>
            {/* Spinning Reaction Wheel Assembly */}
            <group ref={reactionWheelsRef} position={[0, 0, 0.06]}>
              {[-0.22, 0.22].map((wx, idx) => (
                <mesh key={`flywheel-${idx}`} position={[wx, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.16, 0.16, 0.07, 24]} />
                  <meshStandardMaterial
                    color={isHighlightingADCS ? '#38bdf8' : '#f59e0b'}
                    emissive={isHighlightingADCS ? '#0284c7' : '#78350f'}
                    emissiveIntensity={isHighlightingADCS ? 0.6 : 0.2}
                    metalness={0.92}
                    roughness={0.15}
                  />
                </mesh>
              ))}
            </group>

            {/* Autonomous Star Tracker Optical Lens Hood */}
            <mesh position={[0, 0.28, 0.09]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.11, 0.18, 16]} />
              <meshStandardMaterial
                color={isHighlightingADCS ? '#38bdf8' : '#0f172a'}
                emissive={isHighlightingADCS ? '#0284c7' : '#000000'}
                emissiveIntensity={isHighlightingADCS ? 0.5 : 0}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          </group>
        ) : (
          // Passive Magnetic Torquer Rods
          <group position={[0, 0, 0.04]}>
            {[-0.26, 0.26].map((tx, idx) => (
              <mesh key={`torquer-${idx}`} position={[tx, 0, 0]} castShadow>
                <cylinderGeometry args={[0.035, 0.035, h * 0.7, 12]} />
                <meshStandardMaterial
                  color={isHighlightingADCS ? '#38bdf8' : '#b45309'}
                  emissive={isHighlightingADCS ? '#0284c7' : '#78350f'}
                  emissiveIntensity={isHighlightingADCS ? 0.6 : 0.25}
                  metalness={0.85}
                  roughness={0.2}
                />
              </mesh>
            ))}
          </group>
        )}
      </group>

      {/* ===================================================================== */}
      {/* 6. CDH / ONBOARD COMPUTER: UPPER AVIONICS DECK                        */}
      {/* ===================================================================== */}
      <group position={[0, halfH - 0.45, 0]}>
        {/* Avionics Circuit Board Stack */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.74, 0.14, 0.74]} />
          <meshStandardMaterial
            color={
              isHighlightingComputer
                ? '#a855f7'
                : isAdvancedComputer
                ? '#6366f1'
                : '#059669'
            }
            emissive={
              isHighlightingComputer
                ? '#9333ea'
                : isAdvancedComputer
                ? '#4f46e5'
                : '#047857'
            }
            emissiveIntensity={isHighlightingComputer ? 0.7 : 0.25}
            metalness={0.65}
            roughness={0.3}
          />
        </mesh>

        {/* Ceramic Processor Package */}
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[0.26, 0.03, 0.26]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Blinking Telemetry Heartbeat LED */}
        <mesh ref={dataLedRef} position={[0.24, 0.08, 0.24]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* ===================================================================== */}
      {/* 7. SCIENTIFIC PAYLOAD: EARTH-FACING NADIR OPTICAL APERTURE DECK       */}
      {/* ===================================================================== */}
      <group position={[0, -halfH, 0]}>
        
        {/* Primary Mounting Flange Ring */}
        <mesh position={[0, -0.04, 0]} castShadow>
          <cylinderGeometry args={[0.34, 0.36, 0.08, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Hardware-Specific Instrument Geometry */}
        {selectedPayloadId === 'payload-opt-hires' && (
          // EO-CAM 100: Cassegrain High-Resolution Optical Barrel
          <group position={[0, -0.22, 0]}>
            {/* Long Protruding Optical Barrel */}
            <mesh castShadow>
              <cylinderGeometry args={[0.28, 0.32, 0.36, 32]} />
              <meshStandardMaterial
                color={isHighlightingPayload ? '#38bdf8' : '#0f172a'}
                emissive={isHighlightingPayload ? '#0284c7' : '#000000'}
                emissiveIntensity={isHighlightingPayload ? 0.6 : 0}
                metalness={0.88}
                roughness={0.15}
              />
            </mesh>

            {/* Multi-coated Optical Front Glass Element (Deep Cyan/Violet) */}
            <mesh position={[0, -0.185, 0]}>
              <cylinderGeometry args={[0.25, 0.25, 0.02, 32]} />
              <meshPhysicalMaterial
                color="#0284c7"
                roughness={0.08}
                transmission={0.88}
                reflectivity={0.95}
                emissive="#0369a1"
                emissiveIntensity={0.3}
              />
            </mesh>
          </group>
        )}

        {selectedPayloadId === 'payload-multispec' && (
          // SPECTRA-4: 4-Channel Multispectral Lens Cluster
          <group position={[0, -0.15, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.32, 0.34, 0.18, 24]} />
              <meshStandardMaterial color="#1e293b" metalness={0.85} />
            </mesh>
            {/* 4 Distinct Optical Color Filter Lenses */}
            {[
              [-0.11, -0.11, '#ef4444'], // Red
              [0.11, -0.11, '#22c55e'],  // Green
              [-0.11, 0.11, '#3b82f6'],  // Blue
              [0.11, 0.11, '#8b5cf6'],   // Near-IR
            ].map(([lx, lz, col], idx) => (
              <mesh key={`lens-${idx}`} position={[lx as number, -0.1, lz as number]}>
                <cylinderGeometry args={[0.075, 0.075, 0.04, 16]} />
                <meshStandardMaterial
                  color={col as string}
                  emissive={col as string}
                  emissiveIntensity={0.4}
                  metalness={0.7}
                  roughness={0.2}
                />
              </mesh>
            ))}
          </group>
        )}

        {selectedPayloadId === 'payload-hyperspec' && (
          // HYPER-ECO: Hyperspectral Imaging Spectrometer Entrance Slit
          <group position={[0, -0.16, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.55, 0.22, 0.45]} />
              <meshStandardMaterial
                color={isHighlightingPayload ? '#a855f7' : '#1e1b4b'}
                emissive={isHighlightingPayload ? '#9333ea' : '#312e81'}
                emissiveIntensity={isHighlightingPayload ? 0.65 : 0.2}
                metalness={0.85}
              />
            </mesh>
            {/* Golden Optical Slit Entrance */}
            <mesh position={[0, -0.115, 0]}>
              <boxGeometry args={[0.35, 0.02, 0.06]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.1} />
            </mesh>
          </group>
        )}

        {selectedPayloadId === 'payload-thermo-ir' && (
          // THERM-IR: Thermal Infrared Microbolometer Aperture
          <group position={[0, -0.16, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.26, 0.3, 0.2, 24]} />
              <meshStandardMaterial color="#451a03" metalness={0.8} />
            </mesh>
            {/* Germanium Crystal Amber Lens */}
            <mesh position={[0, -0.11, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.03, 24]} />
              <meshStandardMaterial
                color="#f59e0b"
                emissive="#d97706"
                emissiveIntensity={0.5}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          </group>
        )}
      </group>

    </group>
  );
};

export const SpacecraftMoonScene: React.FC<SpacecraftMoonSceneProps> = ({
  selectedComponents,
  autoRotate = true,
  highlightSubsystem = null,
  cameraDistance = 4.8,
  initialPreset = 'default',
  selectedPayloadId = 'payload-opt-hires',
  showLunarSurface = true,
}) => {
  const [internalRotate, setInternalRotate] = useState(autoRotate);
  const orbitRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    setInternalRotate(autoRotate);
  }, [autoRotate]);

  // Compute camera position based on preset view
  const defaultCameraPos = useMemo<[number, number, number]>(() => {
    switch (initialPreset) {
      case 'top':
        return [0.1, 4.8, 0.8]; // Zenith COMM view
      case 'bottom':
        return [2.8, -2.4, 3.8]; // Nadir optical payload view (upward angle!)
      case 'side':
        return [4.6, 0.6, 1.2]; // Clean lateral view
      case 'default':
      default:
        return [3.6, 1.8, cameraDistance]; // Ideal isometric space view
    }
  }, [initialPreset, cameraDistance]);

  const handleResetCamera = () => {
    if (orbitRef.current) {
      orbitRef.current.reset();
      orbitRef.current.target.set(0, 0, 0);
    }
  };

  const handleSetPreset = (preset: CameraPresetView) => {
    if (!orbitRef.current) return;
    switch (preset) {
      case 'top':
        orbitRef.current.object.position.set(0.1, 5.0, 0.8);
        break;
      case 'bottom':
        orbitRef.current.object.position.set(2.8, -2.4, 3.8);
        break;
      case 'side':
        orbitRef.current.object.position.set(4.6, 0.6, 1.2);
        break;
      case 'default':
      default:
        orbitRef.current.object.position.set(3.6, 1.8, cameraDistance);
        break;
    }
    orbitRef.current.target.set(0, 0, 0);
    orbitRef.current.update();
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      
      {/* ===================================================================== */}
      {/* HIGH-RES MOON ENVIRONMENT BACKDROP PLATE LAYER                         */}
      {/* ===================================================================== */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/assets/moon/lunar_surface_environment.jpg"
          alt="Lunar Surface Space Environment"
          className="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.08]"
        />
        {/* Soft atmospheric space vignette — keeps spacecraft in center focus */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/90 via-transparent to-[#020617]/70" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#030712]/15 to-[#020617]/75" />
      </div>

      {/* ===================================================================== */}
      {/* 3D WEBGL REACT THREE FIBER CANVAS                                     */}
      {/* ===================================================================== */}
      <div className="absolute inset-0 z-10">
        <Canvas
          className="w-full h-full"
          camera={{ position: defaultCameraPos, fov: 40 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
          }}
        >
          {/* ==================== 1. NATURAL SPACE LIGHTING ==================== */}
          {/* Direct Solar Radiation (Sun in Space: Crisp, bright, casting realistic shadows) */}
          <directionalLight
            position={[8, 11, 7]}
            intensity={2.8}
            color="#fffdf5"
            castShadow
          />

          {/* Lunar Regolith Albedo Bounce (Soft silver-grey hemisphere fill from below) */}
          <hemisphereLight args={['#f1f5f9', '#475569', 1.6]} />

          {/* Earthshine Fill Light (Subtle aerospace blue bounce from distant Earth) */}
          <directionalLight
            position={[-7, 5, -5]}
            intensity={1.3}
            color="#93c5fd"
          />

          {/* Rear Specular Rim Light (Separates satellite silhouette from deep space) */}
          <directionalLight
            position={[-4, -2, 5]}
            intensity={0.9}
            color="#cbd5e1"
          />

          {/* Base Ambient Illumination */}
          <ambientLight intensity={1.1} color="#334155" />

          {/* ==================== 2. 3D SCENE MESHES ==================== */}
          <Suspense fallback={null}>
            {/* Deep Space Stars */}
            <DeepSpaceStarfield />

            {/* Distant Earth in High Lunar Sky */}
            <DistantEarth position={[-16, 12, -26]} />

            {/* 3D Curved Lunar Ground Staging Surface */}
            {showLunarSurface && <LunarStagingSurface yPosition={-2.1} />}

            {/* Dynamic Centered CubeSat */}
            <DynamicCubeSat
              selectedComponents={selectedComponents}
              highlightSubsystem={highlightSubsystem}
              selectedPayloadId={selectedPayloadId}
            />

            {/* Orbit & Camera Controls (Smooth, 360° Spherical, No Clipping) */}
            <OrbitControls
              ref={orbitRef}
              enablePan={false}
              enableZoom={true}
              minDistance={2.0}
              maxDistance={11.0}
              minPolarAngle={0.08}
              maxPolarAngle={Math.PI - 0.08}
              autoRotate={internalRotate}
              autoRotateSpeed={1.2}
              enableDamping={true}
              dampingFactor={0.05}
              target={[0, 0, 0]}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* ===================================================================== */}
      {/* INTERACTIVE CAMERA HUD CONTROLS                                       */}
      {/* ===================================================================== */}
      <div className="absolute bottom-5 right-5 z-20 flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* Preset Angle Buttons */}
        <div className="hidden sm:flex items-center bg-[#060c18]/90 border border-slate-800/90 rounded-full p-1 backdrop-blur-md">
          <button
            onClick={() => handleSetPreset('default')}
            className="px-2.5 py-1 text-[10px] font-mono text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            title="Overview Angle"
          >
            ISO
          </button>
          <button
            onClick={() => handleSetPreset('top')}
            className="px-2.5 py-1 text-[10px] font-mono text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            title="View Top Zenith (COMM Antenna)"
          >
            TOP
          </button>
          <button
            onClick={() => handleSetPreset('bottom')}
            className="px-2.5 py-1 text-[10px] font-mono text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            title="View Bottom Nadir (Payload Optics)"
          >
            NADIR
          </button>
        </div>

        {/* Rotation Toggle */}
        <button
          onClick={() => setInternalRotate(!internalRotate)}
          className="px-3 py-1.5 bg-[#060c18]/90 hover:bg-[#0c1830] border border-slate-700/80 rounded-full text-[11px] font-mono text-slate-300 hover:text-white transition-all cursor-pointer shadow-xl backdrop-blur-md flex items-center gap-1.5"
          title="Toggle Turntable Rotation"
        >
          <span>{internalRotate ? '❚❚ PAUSE' : '▶ ROTATE'}</span>
        </button>

        {/* Reset Camera */}
        <button
          onClick={handleResetCamera}
          className="px-3 py-1.5 bg-[#060c18]/90 hover:bg-[#0c1830] border border-slate-700/80 rounded-full text-[11px] font-mono text-sky-400 hover:text-sky-300 transition-all cursor-pointer shadow-xl backdrop-blur-md flex items-center gap-1"
          title="Reset Camera Framing"
        >
          <span>⟲ RESET</span>
        </button>
      </div>

      {/* Lunar Environment Watermark */}
      <div className="absolute top-20 right-5 z-20 bg-[#060c18]/85 border border-slate-800/80 px-3.5 py-2 rounded-xl text-[10px] font-mono text-slate-400 backdrop-blur-md pointer-events-none hidden sm:block">
        <span className="text-sky-400 font-bold block uppercase">
          LUNAR ORBIT WORKBENCH
        </span>
        <span>DRAG TO ROTATE (360°) • SCROLL TO ZOOM</span>
      </div>

    </div>
  );
};

export default SpacecraftMoonScene;
