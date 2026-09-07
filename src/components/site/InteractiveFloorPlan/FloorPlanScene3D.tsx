import { useRef, useEffect, useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ROOMS, ROOM_IDS, OVERVIEW_CAMERA, type RoomId } from "./roomData";
import { WALLS, FURNITURE_ITEMS } from "../FloorPlanRise/geometry";

interface FloorPlanScene3DProps {
  activeRoomId: RoomId | null;
  hoveredRoomId: RoomId | null;
  onSelectRoom: (roomId: RoomId | null) => void;
  isMobile?: boolean;
}

function SceneInner({
  activeRoomId,
  hoveredRoomId,
  onSelectRoom,
  isMobile = false,
}: FloorPlanScene3DProps) {
  const { camera, invalidate } = useThree();
  const targetCamPos = useRef(new THREE.Vector3(...OVERVIEW_CAMERA.position));
  const currentCamPos = useRef(new THREE.Vector3(...OVERVIEW_CAMERA.position));
  const targetLookAt = useRef(new THREE.Vector3(...OVERVIEW_CAMERA.target));
  const currentLookAt = useRef(new THREE.Vector3(...OVERVIEW_CAMERA.target));
  const activeSpotLightRef = useRef<THREE.PointLight>(null);

  // Common geometries
  const boxGeom = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const masterFloorGeom = useMemo(() => new THREE.PlaneGeometry(28, 24), []);

  // Shared architectural materials
  const matPlaster = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#1B2144"),
        roughness: 0.78,
        metalness: 0.05,
      }),
    []
  );

  const matConcrete = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#22284C"),
        roughness: 0.90,
        metalness: 0.08,
      }),
    []
  );

  const matWood = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#44362B"),
        roughness: 0.62,
        metalness: 0.08,
      }),
    []
  );

  const matGlass = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#8A86FC"),
        roughness: 0.12,
        metalness: 0.85,
        transparent: true,
        opacity: 0.35,
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

  // Update target camera positions when activeRoomId changes
  useEffect(() => {
    if (activeRoomId && ROOMS[activeRoomId]) {
      const room = ROOMS[activeRoomId];
      const pos = room.camera.position;
      targetCamPos.current.set(
        isMobile ? pos[0] * 1.2 : pos[0],
        isMobile ? pos[1] * 1.3 : pos[1],
        isMobile ? pos[2] * 1.25 : pos[2]
      );
      targetLookAt.current.set(...room.camera.target);
    } else {
      // Reversible return to Overview
      targetCamPos.current.set(
        OVERVIEW_CAMERA.position[0],
        isMobile ? 18.5 : OVERVIEW_CAMERA.position[1],
        OVERVIEW_CAMERA.position[2]
      );
      targetLookAt.current.set(...OVERVIEW_CAMERA.target);
    }
  }, [activeRoomId, isMobile]);

  // Smooth camera interpolation in render frame
  useFrame(() => {
    const posDist = currentCamPos.current.distanceTo(targetCamPos.current);
    const lookDist = currentLookAt.current.distanceTo(targetLookAt.current);

    if (posDist > 0.005 || lookDist > 0.005) {
      currentCamPos.current.lerp(targetCamPos.current, 0.08);
      currentLookAt.current.lerp(targetLookAt.current, 0.08);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);

      // Smooth spot light follow
      if (activeSpotLightRef.current) {
        if (activeRoomId && ROOMS[activeRoomId]) {
          const b = ROOMS[activeRoomId].worldBounds;
          activeSpotLightRef.current.position.set(b.centerX, 2.8, b.centerZ);
          activeSpotLightRef.current.intensity = THREE.MathUtils.lerp(
            activeSpotLightRef.current.intensity,
            1.8,
            0.1
          );
        } else {
          activeSpotLightRef.current.intensity = THREE.MathUtils.lerp(
            activeSpotLightRef.current.intensity,
            0.0,
            0.1
          );
        }
      }

      invalidate();
    }
  });

  // Cleanup geometries & materials
  useEffect(() => {
    return () => {
      boxGeom.dispose();
      masterFloorGeom.dispose();
      matPlaster.dispose();
      matConcrete.dispose();
      matWood.dispose();
      matGlass.dispose();
      matFabric.dispose();
      matCushion.dispose();
      matStone.dispose();
      matRug.dispose();
    };
  }, [boxGeom, masterFloorGeom, matPlaster, matConcrete, matWood, matGlass, matFabric, matCushion, matStone, matRug]);

  return (
    <>
      {/* Lighting Setup */}
      <ambientLight intensity={0.65} color="#CBD2F8" />
      <directionalLight
        position={[9, 15, 11]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={35}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0004}
      />
      <hemisphereLight args={["#D8DCFB", "#090D1F", 0.4]} />

      {/* Dynamic Focused Spotlight for Active Room */}
      <pointLight
        ref={activeSpotLightRef}
        position={[0, 3, 0]}
        intensity={0}
        distance={10}
        decay={2}
        color="#D6D4FC"
      />

      {/* Master Site Ground Floor */}
      <mesh
        geometry={masterFloorGeom}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#0A0E22" roughness={0.8} />
      </mesh>

      {/* ────────────────────────────────────────────────────────
          ROOM INTERACTIVE HIGHLIGHT FLOOR PLANES
          ──────────────────────────────────────────────────────── */}
      {ROOM_IDS.map((id) => {
        const room = ROOMS[id];
        const isSelected = activeRoomId === id;
        const isHovered = hoveredRoomId === id;
        const isHighlighted = isSelected || isHovered;
        const b = room.worldBounds;

        return (
          <group key={`floor-${id}`} position={[b.centerX, 0.005, b.centerZ]}>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectRoom(isSelected ? null : id);
              }}
              receiveShadow
            >
              <planeGeometry args={[b.width, b.depth]} />
              <meshStandardMaterial
                color={isHighlighted ? "#8A86FC" : "#111631"}
                emissive={isHighlighted ? "#8A86FC" : "#000000"}
                emissiveIntensity={isSelected ? 0.35 : isHovered ? 0.2 : 0}
                roughness={0.65}
                transparent
                opacity={isHighlighted ? 0.65 : 0.85}
              />
            </mesh>

            {/* Subtle Hairline Room Border Marker in 3D */}
            {isHighlighted && (
              <lineSegments position={[0, 0.01, 0]}>
                <edgesGeometry args={[new THREE.BoxGeometry(b.width, 0.02, b.depth)]} />
                <lineBasicMaterial color="#8A86FC" linewidth={2} />
              </lineSegments>
            )}
          </group>
        );
      })}

      {/* ────────────────────────────────────────────────────────
          ARCHITECTURAL WALLS & COLUMNS
          ──────────────────────────────────────────────────────── */}
      {WALLS.map((wall) => {
        let mat = matPlaster;
        if (wall.materialType === "concrete") mat = matConcrete;
        if (wall.materialType === "wood") mat = matWood;
        if (wall.materialType === "glass") mat = matGlass;

        const currentHeight = wall.height;
        const posY = currentHeight / 2;

        return (
          <group key={wall.id} position={[wall.x, posY, wall.z]} rotation={[0, wall.rotationY, 0]}>
            <mesh
              geometry={boxGeom}
              scale={[wall.length, currentHeight, wall.thickness]}
              material={mat}
              castShadow
              receiveShadow
            />
          </group>
        );
      })}

      {/* North Continuous Glazing Wall */}
      <group position={[0, 1.8, -2.5]}>
        <mesh
          geometry={boxGeom}
          scale={[7.4, 3.6, 0.04]}
          material={matGlass}
        />
      </group>

      {/* ────────────────────────────────────────────────────────
          PROCEDURAL ARCHITECTURAL FURNITURE
          ──────────────────────────────────────────────────────── */}
      {FURNITURE_ITEMS.map((item) => {
        let mat = matWood;
        if (item.materialType === "fabric") mat = matFabric;
        if (item.materialType === "cushion") mat = matCushion;
        if (item.materialType === "stone") mat = matStone;
        if (item.materialType === "rug") mat = matRug;

        const curHeight = item.size[1];
        const posY = curHeight / 2;

        return (
          <group
            key={item.id}
            position={[item.position[0], posY, item.position[2]]}
            rotation={[0, item.rotationY || 0, 0]}
          >
            <mesh
              geometry={boxGeom}
              scale={[item.size[0], curHeight, item.size[2]]}
              material={mat}
              castShadow
              receiveShadow
            />
          </group>
        );
      })}

      {/* Cantilever Balcony Slab & Railing */}
      <group position={[0.25, 0.08, -3.45]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[6.5, 0.16, 1.9]} />
          <meshStandardMaterial color="#1C2248" roughness={0.7} />
        </mesh>
        {/* Balustrade perimeter */}
        <mesh position={[0, 0.58, -0.92]}>
          <boxGeometry args={[6.5, 1.0, 0.02]} />
          <primitive object={matGlass} attach="material" />
        </mesh>
      </group>
    </>
  );
}

export function FloorPlanScene3D({
  activeRoomId,
  hoveredRoomId,
  onSelectRoom,
  isMobile = false,
}: FloorPlanScene3DProps) {
  return (
    <div
      className="relative w-full h-full cursor-grab active:cursor-grabbing"
      onClick={() => {
        // Clicking empty space deselects room and returns to overview
      }}
    >
      <Canvas
        camera={{
          position: OVERVIEW_CAMERA.position,
          fov: isMobile ? 52 : OVERVIEW_CAMERA.fov,
        }}
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
          background: "#080B1A",
        }}
      >
        <SceneInner
          activeRoomId={activeRoomId}
          hoveredRoomId={hoveredRoomId}
          onSelectRoom={onSelectRoom}
          isMobile={isMobile}
        />
      </Canvas>

      {/* 3D Viewport Datum Watermark */}
      <div className="absolute top-3 right-3 pointer-events-none px-2 py-1 bg-deep/80 border border-white/10 font-mono text-[8px] tracking-wider text-white/50 backdrop-blur-sm">
        3D CAMERA LINK: ACTIVE
      </div>
    </div>
  );
}

export default FloorPlanScene3D;
