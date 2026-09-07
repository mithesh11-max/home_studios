import { useRef, useEffect, useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { WALLS, ANNOTATIONS, WallDef } from "./geometry";

interface SceneContentProps {
  progress: number; // 0 to 1
  onFpsSample?: (fps: number) => void;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function smoothstep(min: number, max: number, value: number) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

function ArchitecturalScene({ progress }: SceneContentProps) {
  const { camera, invalidate, gl } = useThree();
  const dirLightRef = useRef<THREE.DirectionalLight>(null);

  // Common geometries
  const boxGeom = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const floorGeom = useMemo(() => new THREE.PlaneGeometry(24, 20), []);

  // Base materials tuned for Dark Indigo architectural monograph
  const matPlaster = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#1E2548"),
        roughness: 0.75,
        metalness: 0.05,
      }),
    []
  );

  const matConcrete = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#282E55"),
        roughness: 0.88,
        metalness: 0.08,
      }),
    []
  );

  const matWood = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#5A4535"),
        roughness: 0.6,
        metalness: 0.1,
      }),
    []
  );

  const matFloor = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#10152B"),
        roughness: 0.8,
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
        opacity: 0.95,
      }),
    []
  );

  // Update scene states based on scroll progress
  useEffect(() => {
    // 1. Camera path
    // 0.00 -> 0.15: Top down orthographic feel (high Y, looking straight down)
    // 0.15 -> 0.60: Tilt down, perspective reveals heights
    // 0.60 -> 0.95: Eye-level push into living room (y: 1.6m)
    let camX = 0;
    let camY = 16;
    let camZ = 0.01;
    let targetX = 0;
    let targetY = 0;
    let targetZ = 0;

    if (progress < 0.15) {
      camX = 0;
      camY = 16;
      camZ = 0.01;
      targetX = 0;
      targetY = 0;
      targetZ = 0;
    } else if (progress < 0.6) {
      const t = smoothstep(0.15, 0.6, progress);
      camX = lerp(0, 0.5, t);
      camY = lerp(16, 5.5, t);
      camZ = lerp(0.01, 8.5, t);
      targetX = lerp(0, 0, t);
      targetY = lerp(0, 1.2, t);
      targetZ = lerp(0, 1.0, t);
    } else {
      const t = smoothstep(0.6, 0.95, progress);
      camX = lerp(0.5, 0, t);
      camY = lerp(5.5, 1.6, t); // human eye-level 1.6m
      camZ = lerp(8.5, 3.2, t);
      targetX = 0;
      targetY = lerp(1.2, 1.6, t);
      targetZ = lerp(1.0, -2.5, t); // Looking out through the living room glass wall
    }

    camera.position.set(camX, camY, camZ);
    camera.lookAt(targetX, targetY, targetZ);

    // 2. Lighting color & warmth
    // Progress 0.0 -> 0.5: Cool flat study tone
    // Progress 0.5 -> 1.0: Warm daylight (not orange)
    const lightWarmth = smoothstep(0.5, 0.9, progress);
    if (dirLightRef.current) {
      dirLightRef.current.color.setRGB(
        lerp(0.85, 1.0, lightWarmth),
        lerp(0.88, 0.96, lightWarmth),
        lerp(0.92, 0.88, lightWarmth)
      );
      dirLightRef.current.intensity = lerp(1.0, 1.7, lightWarmth);
    }

    // 3. Materials opacity & color shifts
    // Plan lines fade as walls grow
    matPlanLine.opacity = lerp(0.9, 0.0, smoothstep(0.15, 0.4, progress));
    // Floor fades in
    matFloor.opacity = smoothstep(0.4, 0.75, progress);

    // Invalidate frame to trigger demand render
    invalidate();
  }, [progress, camera, invalidate, matFloor, matPlanLine]);

  // Clean up materials & geometries on unmount
  useEffect(() => {
    return () => {
      boxGeom.dispose();
      floorGeom.dispose();
      matPlaster.dispose();
      matConcrete.dispose();
      matWood.dispose();
      matFloor.dispose();
      matPlanLine.dispose();
    };
  }, [boxGeom, floorGeom, matPlaster, matConcrete, matWood, matFloor, matPlanLine]);

  return (
    <>
      <ambientLight intensity={lerp(0.9, 1.1, smoothstep(0.5, 0.9, progress))} color="#F4F1EB" />
      <directionalLight
        ref={dirLightRef}
        position={[8, 14, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={35}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <hemisphereLight args={["#FFFFFF", "#DCD6C8", 0.7]} />

      {/* Ground Floor Plane */}
      <mesh geometry={floorGeom} material={matFloor} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow />

      {/* Ceiling Plane (Living Room only, fades in at end) */}
      {progress > 0.65 && (
        <mesh
          position={[0, 3.6, 0.5]}
          rotation={[Math.PI / 2, 0, 0]}
          material={
            new THREE.MeshStandardMaterial({
              color: "#F6F4EE",
              roughness: 0.8,
              transparent: true,
              opacity: smoothstep(0.65, 0.9, progress) * 0.85,
            })
          }
        >
          <planeGeometry args={[8.5, 7.5]} />
        </mesh>
      )}

      {/* Wall Extrusions & 2D Plan Footprint Lines */}
      {WALLS.map((wall) => {
        // Calculate wall height based on staggered scroll range:
        // Walls extrude between progress 0.20 and 0.55
        const startProgress = 0.2 + wall.stagger * 0.22;
        const endProgress = startProgress + 0.12;
        const extrusionFactor = smoothstep(startProgress, endProgress, progress);

        // Height is at least a hair's width (0.002m) so it sits exactly on plan
        const currentHeight = Math.max(0.002, extrusionFactor * wall.height);
        const posY = currentHeight / 2;

        let mat = matPlaster;
        if (wall.materialType === "concrete") mat = matConcrete;
        if (wall.materialType === "wood") mat = matWood;

        return (
          <group key={wall.id} position={[wall.x, 0, wall.z]} rotation={[0, wall.rotationY, 0]}>
            {/* 2D Plan Footprint Line on Paper (visible at start) */}
            {progress < 0.45 && (
              <mesh
                position={[0, 0.002, 0]}
                geometry={boxGeom}
                scale={[wall.length, 0.002, wall.thickness]}
                material={matPlanLine}
              />
            )}

            {/* Extruded 3D Wall Box */}
            <mesh
              position={[0, posY, 0]}
              geometry={boxGeom}
              scale={[wall.length, currentHeight, wall.thickness]}
              material={mat}
              castShadow={extrusionFactor > 0.1}
              receiveShadow
            />
          </group>
        );
      })}
    </>
  );
}

export function FloorPlanScene({ progress }: { progress: number }) {
  return (
    <Canvas
      frameloop="demand"
      camera={{ position: [0, 16, 0.01], fov: 42 }}
      dpr={[1, 1.75]}
      shadows
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      style={{
        width: "100%",
        height: "100%",
        background: "#F4F1EB", // Paper tone background
      }}
    >
      <ArchitecturalScene progress={progress} />
    </Canvas>
  );
}
export default FloorPlanScene;
