import { useRef, useEffect, useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  WALLS,
  BLUEPRINT_LINES,
  FURNITURE_ITEMS,
  REALITY_CALLOUTS,
  type BlueprintLineDef,
  type FurnitureItemDef,
} from "./geometry";

interface SceneContentProps {
  progress: number; // 0 to 1
  isMobile?: boolean;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function smoothstep(min: number, max: number, value: number) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

function ArchitecturalScene({ progress, isMobile = false }: SceneContentProps) {
  const { camera, invalidate } = useThree();
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const interiorLightRef = useRef<THREE.PointLight>(null);
  const smoothProgressRef = useRef(progress);

  // Common geometries
  const boxGeom = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const floorGeom = useMemo(() => new THREE.PlaneGeometry(26, 22), []);
  const cylGeom = useMemo(() => new THREE.CylinderGeometry(1, 1, 1, 16), []);

  // Base materials tuned for Dark Indigo architectural monograph
  const matPlaster = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#1B2144"),
        roughness: 0.76,
        metalness: 0.04,
      }),
    []
  );

  const matConcrete = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#252B52"),
        roughness: 0.90,
        metalness: 0.08,
      }),
    []
  );

  const matWood = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#483A2E"),
        roughness: 0.58,
        metalness: 0.08,
      }),
    []
  );

  const matFloor = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#0F142A"),
        roughness: 0.70,
        metalness: 0.05,
        transparent: true,
        opacity: 0,
      }),
    []
  );

  const matPlanLine = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#8A86FC"), // Soft Electric Indigo blueprint trace
        transparent: true,
        opacity: 0.92,
      }),
    []
  );

  const matPlanDim = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#A9AED0"),
        transparent: true,
        opacity: 0.75,
      }),
    []
  );

  const matGlass = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#7F8CF8"),
        roughness: 0.12,
        metalness: 0.85,
        transparent: true,
        opacity: 0.28,
      }),
    []
  );

  const matFabric = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#2C3460"),
        roughness: 0.82,
        metalness: 0.02,
      }),
    []
  );

  const matCushion = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#384278"),
        roughness: 0.78,
        metalness: 0.02,
      }),
    []
  );

  const matStone = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#32385C"),
        roughness: 0.45,
        metalness: 0.15,
      }),
    []
  );

  const matRug = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#161C38"),
        roughness: 0.95,
        metalness: 0.0,
      }),
    []
  );

  // Line segments geometry pre-calculation
  const parsedLines = useMemo(() => {
    return BLUEPRINT_LINES.map((line) => {
      const [x1, z1] = line.start;
      const [x2, z2] = line.end;
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);
      const midX = (x1 + x2) / 2;
      const midZ = (z1 + z2) / 2;
      return {
        ...line,
        len,
        angle,
        midX,
        midZ,
      };
    });
  }, []);

  // Inertial smooth lerp in render frame
  useFrame(() => {
    const target = progress;
    const current = smoothProgressRef.current;
    const diff = target - current;

    if (Math.abs(diff) > 0.0003) {
      const next = current + diff * 0.12;
      smoothProgressRef.current = next;

      // Update camera trajectory (Stages 1-5 mapped to 0-1 progress)
      // 0.00 -> 0.20: PLAN (Top-down drafting view)
      // 0.20 -> 0.60: BUILD & LIGHT (Axonometric depth overview)
      // 0.60 -> 0.85: WALK (Eye-level push into living room, y: 1.55m)
      // 0.85 -> 1.00: EXPERIENCE (Final hold & subtle pan)
      const p = next;
      let camX = 0;
      let camY = isMobile ? 22 : 16.5;
      let camZ = 0.01;
      let targetX = 0;
      let targetY = 0;
      let targetZ = 0;

      if (p < 0.20) {
        camX = 0;
        camY = isMobile ? 22 : 16.5;
        camZ = 0.01;
        targetX = 0;
        targetY = 0;
        targetZ = 0;
      } else if (p < 0.60) {
        // Starts moving to axonometric during BUILD
        const t = smoothstep(0.20, 0.50, p);
        camX = lerp(0, isMobile ? 2.5 : 4.5, t);
        camY = lerp(isMobile ? 22 : 16.5, isMobile ? 9.5 : 7.5, t);
        camZ = lerp(0.01, isMobile ? 9.8 : 8.2, t);
        targetX = lerp(0, 0, t);
        targetY = lerp(0, 1.2, t);
        targetZ = lerp(0, 0.6, t);
      } else if (p < 0.85) {
        // WALK phase: drop to eye level
        const t = smoothstep(0.60, 0.85, p);
        camX = lerp(isMobile ? 2.5 : 4.5, -0.1, t);
        camY = lerp(isMobile ? 9.5 : 7.5, 1.55, t); // Standard human eye height
        camZ = lerp(isMobile ? 9.8 : 8.2, 2.6, t);
        targetX = 0;
        targetY = lerp(1.2, 1.45, t);
        targetZ = lerp(0.6, -2.5, t); // Gaze through glass wall towards horizon
      } else {
        // EXPERIENCE phase: slow pan
        const t = smoothstep(0.85, 1.0, p);
        camX = lerp(-0.1, -0.15, t);
        camY = 1.55;
        camZ = lerp(2.6, 2.3, t);
        targetX = lerp(0, 0.1, t);
        targetY = 1.45;
        targetZ = -2.5;
      }

      camera.position.set(camX, camY, camZ);
      camera.lookAt(targetX, targetY, targetZ);

      // LIGHT phase: Lighting activation
      // 0.45 -> 0.65
      const lightActivation = smoothstep(0.40, 0.65, p);
      if (dirLightRef.current) {
        dirLightRef.current.intensity = lerp(0.4, 2.2, lightActivation);
        dirLightRef.current.color.setRGB(
          lerp(0.82, 1.0, lightActivation),
          lerp(0.86, 0.96, lightActivation),
          lerp(0.92, 0.90, lightActivation)
        );
      }

      if (interiorLightRef.current) {
        interiorLightRef.current.intensity = lerp(0.0, 1.4, smoothstep(0.60, 0.85, p));
      }

      // Material opacities & transitions
      matPlanLine.opacity = lerp(0.92, 0.0, smoothstep(0.20, 0.35, p));
      matPlanDim.opacity = lerp(0.75, 0.0, smoothstep(0.18, 0.30, p));
      matFloor.opacity = smoothstep(0.25, 0.50, p);

      invalidate();
    }
  });

  // Always invalidate on external progress change
  useEffect(() => {
    invalidate();
  }, [progress, invalidate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      boxGeom.dispose();
      floorGeom.dispose();
      cylGeom.dispose();
      matPlaster.dispose();
      matConcrete.dispose();
      matWood.dispose();
      matFloor.dispose();
      matPlanLine.dispose();
      matPlanDim.dispose();
      matGlass.dispose();
      matFabric.dispose();
      matCushion.dispose();
      matStone.dispose();
      matRug.dispose();
    };
  }, [
    boxGeom,
    floorGeom,
    cylGeom,
    matPlaster,
    matConcrete,
    matWood,
    matFloor,
    matPlanLine,
    matPlanDim,
    matGlass,
    matFabric,
    matCushion,
    matStone,
    matRug,
  ]);

  const p = smoothProgressRef.current;

  return (
    <>
      {/* Dynamic Lighting System */}
      <ambientLight intensity={lerp(0.5, 0.85, smoothstep(0.4, 0.9, p))} color="#CBD2F8" />
      <directionalLight
        ref={dirLightRef}
        position={[8.5, 14, 10.5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={36}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0004}
      />
      <hemisphereLight args={["#D8DCFB", "#0D1126", 0.45]} />

      {/* Warm Interior Spot in Living Pavilion (activates at eye level) */}
      <pointLight
        ref={interiorLightRef}
        position={[-0.2, 3.2, 0.6]}
        intensity={0}
        distance={9}
        decay={2}
        color="#FFE5CC"
      />

      {/* Ground Floor Plane */}
      <mesh
        geometry={floorGeom}
        material={matFloor}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.005, 0]}
        receiveShadow
      />

      {/* Ceiling Plane (Fades in over Double-Height Living at Stage 7) */}
      {p > 0.62 && (
        <mesh
          position={[0, 3.6, 0.5]}
          rotation={[Math.PI / 2, 0, 0]}
          material={
            new THREE.MeshStandardMaterial({
              color: "#121734",
              roughness: 0.85,
              transparent: true,
              opacity: smoothstep(0.62, 0.92, p) * 0.9,
            })
          }
        >
          <planeGeometry args={[8.8, 7.8]} />
        </mesh>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STAGE 1 & 2: 2D Blueprint Lines (Draws itself 0.00 -> 0.22)
          ───────────────────────────────────────────────────────────── */}
      {p < 0.48 &&
        parsedLines.map((line) => {
          // Progression of each drawn line segment
          const lineStart = line.stagger * 0.14;
          const lineEnd = lineStart + 0.07;
          const drawFactor = smoothstep(lineStart, lineEnd, p);

          if (drawFactor <= 0.001) return null;

          const currentLen = Math.max(0.01, line.len * drawFactor);
          const isDim = line.category === "dimension";

          return (
            <group key={line.id} position={[line.midX, 0.003, line.midZ]} rotation={[0, line.angle, 0]}>
              <mesh
                geometry={boxGeom}
                scale={[isDim ? 0.012 : 0.022, 0.002, currentLen]}
                material={isDim ? matPlanDim : matPlanLine}
              />
            </group>
          );
        })}

      {/* ─────────────────────────────────────────────────────────────
          BUILD: Extruded Architectural Walls & Columns (0.20 -> 0.45)
          ───────────────────────────────────────────────────────────── */}
      {WALLS.map((wall) => {
        const startProgress = 0.20 + wall.stagger * 0.15;
        const endProgress = startProgress + 0.10;
        const extrusionFactor = smoothstep(startProgress, endProgress, p);

        // Height is at least a hair's width (0.002m) so it sits exactly on plan
        const currentHeight = Math.max(0.002, extrusionFactor * wall.height);
        const posY = currentHeight / 2;

        let mat = matPlaster;
        if (wall.materialType === "concrete") mat = matConcrete;
        if (wall.materialType === "wood") mat = matWood;
        if (wall.materialType === "glass") mat = matGlass;

        return (
          <group key={wall.id} position={[wall.x, 0, wall.z]} rotation={[0, wall.rotationY, 0]}>
            {/* Wall footprint shadow/depth line */}
            {p > 0.14 && p < 0.42 && (
              <mesh
                position={[0, 0.003, 0]}
                geometry={boxGeom}
                scale={[wall.length, 0.004, wall.thickness]}
                material={matPlanLine}
              />
            )}

            {/* Extruded 3D Wall Box */}
            <mesh
              position={[0, posY, 0]}
              geometry={boxGeom}
              scale={[wall.length, currentHeight, wall.thickness]}
              material={mat}
              castShadow={extrusionFactor > 0.12}
              receiveShadow
            />
          </group>
        );
      })}

      {/* Floor-to-Ceiling North Glazing Panels (0.35 -> 0.65) */}
      {p > 0.32 && (
        <group position={[0, 1.8, -2.5]}>
          <mesh
            geometry={boxGeom}
            scale={[7.2, Math.max(0.01, smoothstep(0.32, 0.58, p) * 3.2), 0.04]}
            material={matGlass}
          />
        </group>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STAGE 4: Progressive Procedural Furniture (0.40 -> 0.72)
          ───────────────────────────────────────────────────────────── */}
      {FURNITURE_ITEMS.map((item) => {
        const startP = item.stagger;
        const endP = startP + 0.11;
        const furnFactor = smoothstep(startP, endP, p);

        if (furnFactor <= 0.005) return null;

        const curHeight = Math.max(0.002, furnFactor * item.size[1]);
        const posY = curHeight / 2;

        let mat = matWood;
        if (item.materialType === "fabric") mat = matFabric;
        if (item.materialType === "cushion") mat = matCushion;
        if (item.materialType === "stone") mat = matStone;
        if (item.materialType === "rug") mat = matRug;

        return (
          <group
            key={item.id}
            position={[item.position[0], 0, item.position[2]]}
            rotation={[0, item.rotationY || 0, 0]}
          >
            <mesh
              position={[0, posY, 0]}
              geometry={boxGeom}
              scale={[item.size[0], curHeight, item.size[2]]}
              material={mat}
              castShadow={furnFactor > 0.25}
              receiveShadow
            />
          </group>
        );
      })}
    </>
  );
}

export function FloorPlanScene({
  progress,
  isMobile = false,
}: {
  progress: number;
  isMobile?: boolean;
}) {
  return (
    <Canvas
      frameloop="demand"
      camera={{ position: [0, isMobile ? 22 : 16.5, 0.01], fov: isMobile ? 50 : 42 }}
      dpr={[1, 1.5]}
      shadows
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      style={{
        width: "100%",
        height: "100%",
        background: "#080B1A", // Dark Indigo deep background
      }}
    >
      <ArchitecturalScene progress={progress} isMobile={isMobile} />
    </Canvas>
  );
}

export default FloorPlanScene;

