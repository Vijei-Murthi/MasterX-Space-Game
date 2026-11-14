import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

interface SatelliteProps {
  reducedMotion?: boolean;
}

/**
 * Procedural Starfield background.
 * Places 1200 subtle, natural white and blue-white stars in deep space.
 */
const DeepSpaceStarfield: React.FC = () => {
  const points = useMemo(() => {
    const starCount = 1200;
    const coords = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      // Distribute in a hemisphere/sphere far away in space
      const radius = 60 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      coords[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      coords[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      coords[i * 3 + 2] = -Math.abs(radius * Math.cos(phi)) - 5; // Behind the camera plane
    }
    return coords;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[points, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.65}
        color="#e2e8f0"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

/**
 * Realistic 3D Earth Component.
 * - Spherical Earth using NASA 2048x1024 Blue Marble surface texture
 * - Normal map for terrain elevation and cloud depth
 * - Glowing atmospheric limb halo via Fresnel shader
 * - Extremely slow, natural planetary rotation
 */
const RealisticEarth: React.FC<{
  position: [number, number, number];
  radius: number;
  reducedMotion: boolean;
}> = ({ position, radius, reducedMotion }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  // Load NASA Earth textures
  const [colorMap, normalMap] = useLoader(THREE.TextureLoader, [
    '/assets/earth/earth_atmos_2048.jpg',
    '/assets/earth/earth_normal_2048.jpg',
  ]);

  // Atmosphere rim shader (creates the authentic blue limb glow)
  const atmosphereShader = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float rim = 1.0 - max(0.0, dot(vNormal, viewDir));
          float intensity = pow(rim, 2.8) * 1.6;
          // Soft aerospace cyan-blue atmosphere color
          vec3 atmosColor = vec3(0.24, 0.65, 0.98);
          gl_FragColor = vec4(atmosColor, intensity);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.005;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.0065;
    }
  });

  return (
    <group position={position}>
      {/* 1. Main Solid Earth Sphere */}
      <mesh
        ref={earthRef}
        rotation={[0.2, 1.2, -0.1]}
        receiveShadow
        castShadow
      >
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.85, 0.85)}
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>

      {/* 2. Atmospheric Limb Halo Sphere (slightly larger) */}
      <mesh>
        <sphereGeometry args={[radius * 1.025, 64, 64]} />
        <primitive object={atmosphereShader} attach="material" />
      </mesh>
    </group>
  );
};

/**
 * Realistic CubeSat Spacecraft Mesh.
 * Guaranteed visible, high-contrast PBR materials:
 * - Gleaming aerospace 6061-T6 aluminum rails & gold corner brackets
 * - Dark blue photovoltaic solar panels with visible cell grid texture
 * - Scientific camera barrel with multi-coated glass lens
 * - Communications whip antenna
 */
const CubeSatSpacecraft: React.FC = () => {
  // Load photovoltaic solar cell texture
  const solarTexture = useLoader(
    THREE.TextureLoader,
    '/assets/spacecraft/solar_cell_texture.png'
  );

  return (
    <group>
      {/* 1. Main CubeSat Chassis Bus (Titanium/Graphite paneling) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.9, 1.6, 0.9]} />
        <meshStandardMaterial
          color="#334155"
          metalness={0.45}
          roughness={0.4}
        />
      </mesh>

      {/* 2. Aerospace Aluminum 6061-T6 Corner Rails (Gleaming silver) */}
      {[-0.46, 0.46].map((x) =>
        [-0.46, 0.46].map((z) => (
          <mesh key={`post-${x}-${z}`} position={[x, 0, z]}>
            <boxGeometry args={[0.07, 1.64, 0.07]} />
            <meshStandardMaterial
              color="#e2e8f0"
              metalness={0.7}
              roughness={0.25}
            />
          </mesh>
        ))
      )}

      {/* Horizontal Framing Rails */}
      {[-0.81, 0.81].map((y) => (
        <group key={`frame-${y}`} position={[0, y, 0]}>
          <mesh position={[0, 0, -0.46]}>
            <boxGeometry args={[0.94, 0.07, 0.07]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.7} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0, 0.46]}>
            <boxGeometry args={[0.94, 0.07, 0.07]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.7} roughness={0.25} />
          </mesh>
          <mesh position={[-0.46, 0, 0]}>
            <boxGeometry args={[0.07, 0.07, 0.94]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.7} roughness={0.25} />
          </mesh>
          <mesh position={[0.46, 0, 0]}>
            <boxGeometry args={[0.07, 0.07, 0.94]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.7} roughness={0.25} />
          </mesh>
        </group>
      ))}

      {/* Gold Anodized Corner Brackets */}
      {[-0.47, 0.47].map((x) =>
        [-0.82, 0.82].map((y) =>
          [-0.47, 0.47].map((z) => (
            <mesh key={`gold-bracket-${x}-${y}-${z}`} position={[x, y, z]}>
              <boxGeometry args={[0.08, 0.08, 0.08]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
            </mesh>
          ))
        )
      )}

      {/* 3. Dual Extended Photovoltaic Solar Array Wings */}
      {/* Left Wing */}
      <group position={[-0.49, 0, 0]}>
        {/* Gold Hinge */}
        <mesh position={[-0.06, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 1.4, 12]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.75} roughness={0.3} />
        </mesh>
        {/* 3 articulated solar panels */}
        {[0, 1, 2].map((i) => {
          const w = 0.85;
          const px = -0.12 - i * (w + 0.04) - w / 2;
          return (
            <group key={`l-panel-${i}`} position={[px, 0, 0]}>
              {/* Honeycomb substrate */}
              <mesh>
                <boxGeometry args={[w, 1.4, 0.025]} />
                <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.4} />
              </mesh>
              {/* Front Solar Cell Grid with texture */}
              <mesh position={[0, 0, 0.016]}>
                <boxGeometry args={[w - 0.03, 1.34, 0.01]} />
                <meshStandardMaterial
                  map={solarTexture}
                  color="#3b82f6"
                  metalness={0.5}
                  roughness={0.2}
                  emissive="#1d4ed8"
                  emissiveIntensity={0.15}
                />
              </mesh>
              {/* Gold Inter-panel hinge */}
              {i < 2 && (
                <mesh position={[-w / 2 - 0.02, 0, 0]}>
                  <cylinderGeometry args={[0.025, 0.025, 1.1, 8]} />
                  <meshStandardMaterial color="#f59e0b" metalness={0.75} roughness={0.3} />
                </mesh>
              )}
            </group>
          );
        })}
      </group>

      {/* Right Wing */}
      <group position={[0.49, 0, 0]}>
        {/* Gold Hinge */}
        <mesh position={[0.06, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 1.4, 12]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.75} roughness={0.3} />
        </mesh>
        {[0, 1, 2].map((i) => {
          const w = 0.85;
          const px = 0.12 + i * (w + 0.04) + w / 2;
          return (
            <group key={`r-panel-${i}`} position={[px, 0, 0]}>
              <mesh>
                <boxGeometry args={[w, 1.4, 0.025]} />
                <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.4} />
              </mesh>
              <mesh position={[0, 0, 0.016]}>
                <boxGeometry args={[w - 0.03, 1.34, 0.01]} />
                <meshStandardMaterial
                  map={solarTexture}
                  color="#3b82f6"
                  metalness={0.5}
                  roughness={0.2}
                  emissive="#1d4ed8"
                  emissiveIntensity={0.15}
                />
              </mesh>
              {i < 2 && (
                <mesh position={[w / 2 + 0.02, 0, 0]}>
                  <cylinderGeometry args={[0.025, 0.025, 1.1, 8]} />
                  <meshStandardMaterial color="#f59e0b" metalness={0.75} roughness={0.3} />
                </mesh>
              )}
            </group>
          );
        })}
      </group>

      {/* 4. Earth Observation Optical Payload (Camera Barrel & Lens) */}
      <group position={[0, -0.3, 0.46]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.35, 0.22, 28]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.11, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.03, 28]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.02, 28]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            metalness={0.1}
            roughness={0.05}
            transmission={0.8}
            ior={1.5}
            reflectivity={0.95}
          />
        </mesh>
      </group>

      {/* 5. Telemetry Antenna Mast */}
      <group position={[0.22, 0.82, -0.15]}>
        <mesh>
          <cylinderGeometry args={[0.04, 0.05, 0.08, 12]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.75} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.01, 0.015, 1.4, 8]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.6} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
};

/**
 * Orbital Trajectory Controller around 3D Earth.
 * - Genuine orbital revolution around Earth's 3D center
 * - Inclined orbital plane (~35 deg inclination)
 * - Traverses from front of Earth to rear
 * - Natural 3D occlusion behind the solid spherical Earth
 * - Smooth attitude orientation (Earth-pointing nadir camera)
 */
const OrbitingSatelliteController: React.FC<{
  earthCenter: [number, number, number];
  orbitalRadius: number;
  reducedMotion: boolean;
}> = ({ earthCenter, orbitalRadius, reducedMotion }) => {
  const satelliteGroupRef = useRef<THREE.Group>(null);
  const orbitalAngle = useRef(0.4); // Start at optimal visible showcase quadrant

  // Reusable vectors to eliminate GC in animation loop
  const vPos = useRef(new THREE.Vector3());
  const vEarth = useRef(new THREE.Vector3(...earthCenter));
  const vNadir = useRef(new THREE.Vector3());

  // Visual orbital speed: ~57 seconds per complete revolution
  const orbitalSpeed = 0.11;

  useFrame((state, delta) => {
    if (!satelliteGroupRef.current) return;

    if (!reducedMotion) {
      orbitalAngle.current = (orbitalAngle.current + delta * orbitalSpeed) % (Math.PI * 2);
    }

    const angle = orbitalAngle.current;

    // Planar circular orbit inside the inclined orbital plane:
    // x = R * cos(angle), z = R * sin(angle), y = 0
    const localX = orbitalRadius * Math.cos(angle);
    const localZ = orbitalRadius * Math.sin(angle);

    satelliteGroupRef.current.position.set(localX, 0, localZ);

    // Subtle attitude stabilization & Nadir alignment
    if (!reducedMotion) {
      const t = state.clock.getElapsedTime();
      satelliteGroupRef.current.getWorldPosition(vPos.current);
      vNadir.current.copy(vEarth.current).sub(vPos.current).normalize();

      // Subtle gyroscopic attitude rotation
      satelliteGroupRef.current.rotation.y = angle + Math.sin(t * 0.3) * 0.02;
      satelliteGroupRef.current.rotation.x = 0.35 + Math.cos(t * 0.25) * 0.02;
      satelliteGroupRef.current.rotation.z = -0.15 + Math.sin(t * 0.35) * 0.015;
    }
  });

  return (
    /* Inclined Orbital Plane Group placed at Earth Center */
    <group
      position={earthCenter}
      rotation={[-0.95, -0.25, 0.35]} // Realistic orbit plane inclination
    >
      {/* Subtle, authentic aerospace orbital trajectory guide ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbitalRadius - 0.005, orbitalRadius + 0.005, 128]} />
        <meshBasicMaterial
          color="#94a3b8"
          transparent
          opacity={0.16}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <group ref={satelliteGroupRef}>
        {/* Scaled satellite model maintaining exact engineering proportions */}
        <group scale={0.46}>
          <CubeSatSpacecraft />
        </group>
      </group>
    </group>
  );
};

export const SatelliteScene: React.FC<SatelliteProps> = ({
  reducedMotion: propReducedMotion = false,
}) => {
  const [reducedMotion, setReducedMotion] = useState(propReducedMotion);
  const [webglSupported, setWebglSupported] = useState(true);

  // Check system prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(propReducedMotion || mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [propReducedMotion]);

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

  // Earth center in world space: positioned below and slightly offset to match reference composition
  const earthCenter: [number, number, number] = [0.0, -3.8, -1.0];
  const earthRadius = 4.2;
  const orbitalRadius = 5.0; // Altitude ~0.8 units above Earth surface

  if (!webglSupported) {
    return (
      <div className="fixed inset-0 z-0 bg-cover bg-bottom pointer-events-none select-none">
        <img
          src="/assets/earth/earth-orbit.jpg"
          alt="Earth and Satellite from Orbit"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden bg-[#030712]">
      <Canvas
        className="w-full h-full"
        camera={{ position: [0, 0, 8.5], fov: 42 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        {/* Deep Space Background Stars */}
        <DeepSpaceStarfield />

        {/* Ambient Cosmic Fill Light (prevents any surface from turning pitch black) */}
        <ambientLight intensity={1.1} color="#334155" />

        {/* Primary Directional Sunlight matching top-right sunburst */}
        <directionalLight
          position={[12, 8, 10]}
          intensity={3.5}
          color="#fffbf0"
          castShadow
        />

        {/* Earth Albedo Light (Atmospheric blue bounce from below) */}
        <directionalLight
          position={[0, -8, 2]}
          intensity={1.8}
          color="#60a5fa"
        />

        {/* Secondary Sun Specular Accent */}
        <pointLight
          position={[10, 6, 8]}
          intensity={2.0}
          color="#fef08a"
        />

        {/* 3D Earth & Orbiting Satellite with Suspense Loader */}
        <Suspense fallback={null}>
          {/* Realistic 3D Earth */}
          <RealisticEarth
            position={earthCenter}
            radius={earthRadius}
            reducedMotion={reducedMotion}
          />

          {/* Genuine 3D Orbiting Satellite revolving around Earth */}
          <OrbitingSatelliteController
            earthCenter={earthCenter}
            orbitalRadius={orbitalRadius}
            reducedMotion={reducedMotion}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default SatelliteScene;
