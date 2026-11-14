# MASTERX – SPACE MACHINE
## Frontend Architecture Documentation (Task 01)

### 1. Architectural Overview & Philosophy
The **MASTERX – SPACE MACHINE** frontend is architected as a high-performance, cinematic, NASA-inspired space mission design interface for the NASA Space Apps Challenge 2026. 

The core philosophy prioritizes:
- **Aerospace Realism:** Clean typography, natural photographic Earth curvature, realistic orbital lighting, and subtle, physical spacecraft behavior over neon/cyberpunk aesthetics.
- **Strict Separation of Concerns:** Member 1 owns the presentation, routing, responsive design, and integration shell, leaving mission calculations to Member 2 and simulation logic to Member 3.
- **Resilient 3D Rendering:** The 3D satellite visualization subsystem is decoupled into a modular component (`SatelliteScene.tsx`) supporting both real-time Three.js WebGL PBR rendering and high-definition cinematic compositing with hardware acceleration and reduced-motion fallbacks.

---

### 2. Technology Stack
| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | React | `^19.0.0` | Modern component architecture, Concurrent React |
| **Language** | TypeScript | `~5.7.3` | Type safety and strict contract definitions |
| **Build Tool** | Vite | `^6.2.0` | Ultra-fast HMR and optimized production bundling |
| **Styling** | Tailwind CSS v4 | `^4.0.9` | Zero-runtime CSS framework via `@tailwindcss/vite` |
| **Routing** | React Router | `^7.2.0` | Client-side routing and clean route mounting |
| **3D Engine** | Three.js & R3F | `^0.174.0` / `^9.0.4` | Physical WebGL rendering of Earth-observation CubeSat |
| **Icons** | Lucide React | `^1.16.0` | Clean, minimalist aerospace UI icons |

---

### 3. Directory Structure
```
MASTERX-Space-Mission/
├── docs/
│   ├── frontend-architecture.md       # Frontend architectural specification
│   └── integration-guide.md          # 3-Member integration contracts & workflow
├── public/
│   ├── assets/
│   │   ├── earth/
│   │   │   └── earth-orbit.jpg       # High-res orbital Earth curvature background
│   │   └── spacecraft/
│   │       ├── cubesat-hd.png        # Transparent HD CubeSat render asset
│   │       ├── CubeSat-ICECube.glb   # NASA official 3D GLB model
│   │       ├── CubeSat-1RU.glb       # NASA official 1U GLB model
│   │       └── CubeSat-2RU.glb       # NASA official 2U GLB model
│   └── favicon.svg                   # Vector aerospace orbital icon
├── src/
│   ├── app/
│   │   ├── App.tsx                   # Top-level application component
│   │   └── routes.tsx                # Route definitions & integration mount points
│   ├── components/
│   │   ├── navigation/
│   │   │   └── Navbar.tsx            # Minimalist transparent header with mobile drawer
│   │   ├── spacecraft/
│   │   │   └── SatelliteScene.tsx    # Dual-mode R3F 3D Mesh & Cinematic visualizer
│   │   └── ui/
│   │       ├── Button.tsx            # Aerospace solid-button component
│   │       └── Modal.tsx             # Accessible dialog component
│   ├── layouts/
│   │   └── MainLayout.tsx            # Cinematic background plate, header, and footer
│   ├── pages/
│   │   └── HomePage.tsx              # Primary cinematic landing page
│   ├── styles/
│   │   └── globals.css               # Global typography, animations & theme tokens
│   ├── main.tsx                      # Vite React 19 entry point
│   └── vite-env.d.ts                 # TypeScript environment declarations
├── index.html                        # HTML5 shell with Inter & Space Grotesk fonts
├── package.json                      # Single shared workspace manifest
├── tsconfig.json                     # Solution TypeScript configuration
├── tsconfig.app.json                 # Application TS options
├── tsconfig.node.json                # Vite config TS options
└── vite.config.ts                    # Vite build configuration with Tailwind v4
```

---

### 4. Design System & Strict Color Tokens
Per project directives, all neon, glowing cyber borders, and oversaturated gaming gradients are strictly prohibited. The interface adheres to an aerospace-grade palette:

| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `Space Dark (Base)` | `#030712` | Deep-space viewport background |
| `Space Surface` | `#0B1222` | Modal and card surface background |
| `Space Border` | `#1E293B` | Subtle panel borders and dividers |
| `Text Primary` | `#FFFFFF` | Hero titles and primary headings |
| `Text Muted` | `#CBD5E1` / `#94A3B8` | Descriptions, labels, and secondary copy |
| `Sky Accent` | `#0284C7` / `#38BDF8` | Solid action buttons, category markers, active underline |
| `Solar Gold` | `#D4AF37` | Satellite mechanical fittings and hinge brackets |

---

### 5. 3D Earth & Satellite Orbital Subsystem (`SatelliteScene.tsx`)
The visualization subsystem is implemented with React Three Fiber and Three.js as a full-viewport, physically consistent 3D simulation:
- **3D Spherical Earth (`RealisticEarth`):**
  - High-resolution NASA Blue Marble 2048×1024 surface map (`earth_atmos_2048.jpg`) and elevation normal map (`earth_normal_2048.jpg`).
  - Secondary atmospheric limb sphere with custom Fresnel scattering shader producing an authentic blue atmospheric halo along the Earth curvature.
  - Slow planetary rotation matching orbital dynamics.
- **True 3D Orbital Trajectory & Planetary Occlusion:**
  - The satellite revolves continuously around the 3D Earth's center (`position: [0.0, -3.8, -1.0]`) at orbital radius $R = 5.0$.
  - An inclined orbital group ($\approx 35^\circ$ inclination) directs the spacecraft across the front hemisphere of Earth (where it glides through the right observation corridor at maximum detail and specular illumination) and then behind the solid Earth sphere, where Three.js depth buffer testing naturally occludes the satellite until it re-emerges from the horizon.
- **High-Contrast, Visible CubeSat Materials:**
  - Dark-blue photovoltaic solar panels mapped with fine silicon cell grid and silver busbar textures (`solar_cell_texture.png`) with subtle emissive balance so they never appear black.
  - Gleaming aerospace 6061-T6 aluminum corner posts (`#e2e8f0`) and gold-anodized structural brackets (`#fbbf24`).
  - Titanium chassis paneling (`#334155`), multi-coated optical camera payload (`#38bdf8`), and stainless steel telemetry antenna.
- **Lighting & Specular Setup:**
  - Directional sunlight at `[12, 8, 10]` (`intensity: 3.5`, `#fffbf0`).
  - Earth albedo bounce light at `[0, -8, 2]` (`intensity: 1.8`, `#60a5fa`).
  - Cosmic ambient fill at `intensity: 1.1` (`#334155`) ensuring all spacecraft faces maintain crisp visibility.
- **Performance & Zero Frame Churn:**
  - Driven by `delta` time inside `useFrame`.
  - Zero React state allocations during animation.
  - Automatically respects `prefers-reduced-motion`.

---

### 6. AAA Space Exploration Game UI Redesign (`MissionBriefingPage.tsx`)
In **Task 06**, the Mission Briefing screen was elevated from a traditional data-heavy dashboard into an immersive, AAA space exploration game mission staging HUD:

1. **Planetary Visual Dominance:**
   - Fullscreen 3D canvas (`SatelliteScene.tsx`) features a large, majestic 3D spherical Earth with visible continents and oceans, natural atmospheric limb lighting, procedural stars, directional sunlight, and an authentic 3D CubeSat in continuous revolution.
   - An ultra-subtle lunar silver orbital trajectory guide ring (`opacity: 0.16`, width 0.01) tracks the CubeSat's inclined orbit without artificial oval glow.
   - Heavy full-viewport black gradients were replaced with micro edge scrims, leaving the entire center and right viewport completely clear so Earth and the spacecraft remain the undisputed visual centerpiece.

2. **Left Tactical HUD (Mission Identity & Staging Controls):**
   - Floating glass overlay container (`max-w-[410px]`, `bg-[#060c19]/80 backdrop-blur-md`).
   - Clean mission designation (`MISSION 01 • CUBESAT PROGRAM`), title (`CUBESAT EARTH OBSERVATION`), and concise objective.
   - **Interactive Observation Target Selector:** 3 compact pill buttons (`Vegetation`, `Coastal & Oceans`, `Atmosphere`) providing immediate visual feedback, category tags, and payload readouts.
   - **Quick Difficulty Selector:** 3-tier selector (`Cadet $2.5M`, `Specialist $1.8M`, `Commander $1.2M`) that dynamically adjusts resource constraints.
   - **Solid CTA Action Button:** High-contrast solid sky-blue button (`INITIALIZE SPACECRAFT DESIGN →`) navigating to `/planner`.

3. **Floating Collapsible Mission Guide Panel:**
   - Unified, single floating drawer on the right edge (`w-[380px]`).
   - Easily collapsed with one click to maximize full-screen view of Earth and the spacecraft.
   - Organized into 5 expandable accordion sections (`01. Objective & Criteria`, `02. Difficulty Tiers`, `03. Active Science Target`, `04. Resource Constraints`, `05. Orbital Flight Rules`). Only active sections expand, keeping reading punchy and game-focused.

4. **Bottom HUD (Compact Flight Resource & Progression Strip):**
   - Low-profile horizontal tactical telemetry bar docked at screen bottom.
   - Live micro-meters with proportional capacity bars for `Budget`, `Mass Cap`, `Power`, `Storage`, and `Lifetime`.
   - Dynamic real-time synchronization: selecting difficulty on either the left HUD or inside the guide instantly recomputes and animates the bottom resource meters.

5. **Natural Planetary Color System (Zero Neon):**
   - Deep space navy (`#030712`, `#060c19`)
   - Earth atmospheric & ocean blue (`#0284c7`, `#38bdf8`)
   - Terrestrial biosphere green (`#10b981`)
   - Jupiter warm amber (`#d97706`)
   - Mars rust / sandstone (`#c2410c`)
   - Lunar silver (`#cbd5e1`, `#94a3b8`)
   - Strictly zero neon cyan, green, purple, RGB lighting, or glowing cyber borders.

---

### 7. Interactive Flight Parameters, Scroll Animations & Gameplay Polish (Task 08)
In **Task 08**, `MissionBriefingPage.tsx` was expanded with a dedicated below-the-fold engineering suite, making the mission design phase feel like an authentic space exploration strategy game:

1. **Two-Stage Page Architecture:**
   - **Hero Staging Viewport:** Retains the majestic 3D Earth, CubeSat orbit, target selector, and primary CTA button (`INITIALIZE SPACECRAFT DESIGN →`). A sleek scroll invitation button smoothly directs players down to the engineering telemetry.
   - **Full-Width Below-the-Fold Suite:** Houses the 10 flight parameters, 7 engineering constraints, and the tactical challenge objective.

2. **10 Interactive Flight Parameter Cards:**
   - Displays:
     1. Initial Budget (`$2.5M` / `$1.8M` / `$1.2M`)
     2. Maximum Spacecraft Mass (`12.0 kg` / `8.0 kg` / `4.5 kg`)
     3. Minimum Power Generation (`≥ 15W` / `≥ 25W` / `≥ 38W`)
     4. Battery Capacity (`30 Wh` / `45 Wh` / `60 Wh`)
     5. Data Storage Capacity (`64 GB` / `32 GB` / `16 GB`)
     6. Mission Lifetime (`180 d` / `365 d` / `730 d`)
     7. Orbit Altitude (`500 km` / `550 km`)
     8. Orbit Inclination (`97.4°` / `97.8°` Sun-Synchronous)
     9. Communication Requirements (`2.5 Mbps` S-band)
     10. Data Generation Capacity (`~120 MB / pass`)

3. **Scroll-Triggered Entrance Animations:**
   - Powered by a custom React `useScrollIntersection` hook based on the native `IntersectionObserver` API.
   - Triggers once upon entering the viewport with staggered entrance delays (`transitionDelay: idx * 40ms`).
   - Cards slide upward smoothly (`translate-y-6` → `translate-y-0`) with subtle opacity fade (`opacity-0` → `opacity-100`).
   - Zero jitter or redundant re-triggering during minor scrolling. Fully respects `prefers-reduced-motion`.

4. **Gaming Hover Interactions & Click-to-Inspect Modal:**
   - Hovering lifts cards (`-translate-y-1.5`) with border highlight and displays a contextual explanation tooltip.
   - Clicking opens an in-depth aerospace specification modal with 4 structured analyses:
     - What the parameter means.
     - Why it matters for Earth observation.
     - Consequences if the limit is exceeded.
     - Actionable steps to optimize in Phase 02 (Spacecraft Builder).

5. **Mission Engineering Constraints HUD:**
   - Visual checks with simple `PASS`, `WARNING`, and `FAIL` status tags across 7 constraints: Budget, Mass, Power Balance, Battery Reserve, Storage, Communication Link, and SSO Orbit Alignment.
   - Dynamically adapts: choosing Hard tier triggers realistic `WARNING` indicators for the strict 4.5 kg mass and 38W power threshold.

6. **Engineering Challenge (Game Feedback):**
   - High-impact objective callout summarizing mission goals, constraints satisfied counter (`7 / 7 PASS`), dynamic tactical hint, and secondary CTA button.

---

### 8. Spacecraft Experience Final UX Implementation (Floating Navigation & Scroll Hierarchy)
In the final UX implementation, `SpacecraftBuilderPage.tsx` was restructured based on the user's Excalidraw design specification:

1. **Top Floating Navigation (iOS / Dynamic Island Glass Bar):**
   - Eliminated full-width header bars and permanent subtitle banners.
   - **Left:** Floating rounded pill with MASTERX logo PNG / curved swoosh.
   - **Center:** Floating pill with 6 rounded navigation bubbles (`01 Briefing`, `02 Spacecraft` [ACTIVE], `03 Subsystems`, `04 Payload`, `05 Orbit & Launch`, `06 Simulation`) featuring smooth active indicator elevation and hover scaling.
   - **Right:** Single circular `?` Mission Guide button and floating Home pill button.

2. **Main 3D Spacecraft Viewport (Hero Experience):**
   - The central 3D Mars Engineering Bay workspace is the dominant visual element across the entire screen.
   - **Full Interactive Camera Controls (`OrbitControls`):**
     - Smooth mouse drag rotates pitch and yaw around the CubeSat.
     - Mouse wheel zooms with safe distance clamping (`2.6` to `8.5`) to prevent clipping.
     - Continuous slow turntable rotation with `[❚❚ PAUSE TURNTABLE / ▶ ROTATE TURNTABLE]` toggle.
     - Instant `[⟲ RESET CAMERA]` control.
   - **Collapsible Engineering Bay Catalogue:**
     - Positioned on the left as a floating glass drawer.
     - Smooth collapse button folds the catalogue into a compact pill, giving 100% of the screen width to the 3D spacecraft!
     - Equipping any component updates the 3D model geometry (chassis size, solar wings, antennas, star tracker) in real time.

3. **Sequential Scroll-Based Architecture (Below the Viewport):**
   - **SECTION A – SPACECRAFT TELEMETRY:** 9 animated cards for Mass, Budget, Power Gen, Consumption, Net Balance, Battery, Storage, Altitude, and Lifetime.
   - **SECTION B – ENGINEERING PARAMETERS:** Detailed validation matrix (deployer mass envelope, daylight power margin, 35-min eclipse DoD, downlink rate, pointing stability).
   - **SECTION C – SUBSYSTEM INSPECTION:** Component breakdown with technical specs, dimensions, certifications, and expandable educational engineering context.
   - **SECTION D – NEXT MISSION STAGE:** Prominent `CONTINUE TO SUBSYSTEMS →` CTA button preserving all state and presenting the Stage Gate modal.
