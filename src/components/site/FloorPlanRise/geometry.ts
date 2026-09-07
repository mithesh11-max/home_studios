export interface WallDef {
  id: string;
  // Center position of the wall box in XZ plane
  x: number;
  z: number;
  // Wall length (along its orientation)
  length: number;
  // Wall thickness (perpendicular)
  thickness: number;
  // Rotation around Y axis in radians (0 = along X axis, Math.PI/2 = along Z axis)
  rotationY: number;
  // Full height when fully extruded (meters)
  height: number;
  // Stagger index (0 = entry walls rise first, up to 1 = outer walls)
  stagger: number;
  // Material type for final stage
  materialType?: "plaster" | "wood" | "concrete" | "glass";
}

export interface BlueprintLineDef {
  id: string;
  // Start and end coordinates in XZ plane
  start: [number, number];
  end: [number, number];
  stagger: number; // 0.0 to 1.0 (drawing sequence)
  category: "perimeter" | "partition" | "opening" | "window" | "dimension";
  label?: string;
}

export interface FurnitureItemDef {
  id: string;
  room: "living" | "dining" | "kitchen" | "bedroom";
  name: string;
  position: [number, number, number]; // [x, y, z]
  size: [number, number, number];     // [width, height, depth]
  rotationY?: number;
  stagger: number;                     // 0.40 to 0.75
  materialType: "fabric" | "wood" | "stone" | "metal" | "rug" | "cushion";
}

export interface PlanAnnotation {
  label: string;
  x: number;
  z: number;
  dimension?: string;
  phase?: "plan" | "space" | "reality";
}

export interface RealityCalloutDef {
  id: string;
  label: string;
  sublabel: string;
  position: [number, number, number]; // [x, y, z] in 3D world
  align?: "left" | "right" | "center";
}

// ---------------------------------------------------------------------------
// 1. 2D Blueprint Line Segments (Draws during Stage 1: Progress 0.00 -> 0.22)
// ---------------------------------------------------------------------------
export const BLUEPRINT_LINES: BlueprintLineDef[] = [
  // Outer site boundary guidelines
  { id: "bnd-n", start: [-7.8, -3.2], end: [5.2, -3.2], stagger: 0.0, category: "perimeter" },
  { id: "bnd-e", start: [5.2, -3.2], end: [5.2, 5.2], stagger: 0.04, category: "perimeter" },
  { id: "bnd-s", start: [5.2, 5.2], end: [-7.8, 5.2], stagger: 0.08, category: "perimeter" },
  { id: "bnd-w", start: [-7.8, 5.2], end: [-7.8, -3.2], stagger: 0.12, category: "perimeter" },

  // Double-height living pavilion perimeter
  { id: "liv-w", start: [-3.8, 3.5], end: [-3.8, -2.5], stagger: 0.16, category: "partition" },
  { id: "liv-s", start: [-3.8, 3.5], end: [4.4, 3.5], stagger: 0.20, category: "partition" },
  { id: "liv-e", start: [4.4, 3.5], end: [4.4, -2.5], stagger: 0.24, category: "partition" },
  { id: "liv-n-glass", start: [-3.8, -2.5], end: [4.4, -2.5], stagger: 0.28, category: "window", label: "GLAZING 7.4M" },

  // Entry threshold & foyer
  { id: "ent-l", start: [-1.2, 5.2], end: [-1.2, 3.7], stagger: 0.32, category: "partition" },
  { id: "ent-r", start: [1.2, 5.2], end: [1.2, 3.7], stagger: 0.35, category: "partition" },
  { id: "ent-door-arc", start: [-1.2, 4.8], end: [0.8, 4.8], stagger: 0.38, category: "opening", label: "DOOR 900MM" },

  // Master bedroom wing (West)
  { id: "bed-w", start: [-7.3, 1.5], end: [-7.3, -2.5], stagger: 0.42, category: "partition" },
  { id: "bed-n", start: [-7.3, -2.5], end: [-3.8, -2.5], stagger: 0.46, category: "partition" },
  { id: "bed-s", start: [-7.3, 1.5], end: [-3.8, 1.5], stagger: 0.50, category: "partition" },

  // Kitchen & dining wing (East)
  { id: "kit-div", start: [1.8, 0.5], end: [3.4, 0.5], stagger: 0.54, category: "partition" },
  { id: "kit-island", start: [2.2, 1.8], end: [3.8, 1.8], stagger: 0.58, category: "partition", label: "ISLAND" },

  // Bathroom core
  { id: "bath-w", start: [-6.0, 4.0], end: [-6.0, 1.5], stagger: 0.62, category: "partition" },
  { id: "bath-s", start: [-6.0, 4.0], end: [-3.8, 4.0], stagger: 0.66, category: "partition" },

  // Technical Dimension markers
  { id: "dim-liv-x", start: [-3.8, -2.9], end: [4.4, -2.9], stagger: 0.70, category: "dimension", label: "7.40 M" },
  { id: "dim-liv-z", start: [4.8, -2.5], end: [4.8, 3.5], stagger: 0.74, category: "dimension", label: "6.00 M" },
  { id: "dim-bed-x", start: [-7.3, -2.9], end: [-3.8, -2.9], stagger: 0.78, category: "dimension", label: "3.50 M" },
];

// ---------------------------------------------------------------------------
// 2. Extruded Architectural Walls & Columns (Stage 3: Progress 0.25 -> 0.55)
// ---------------------------------------------------------------------------
export const WALLS: WallDef[] = [
  // --- Entry & Foyer ---
  { id: "entry-w-l", x: -1.2, z: 4.45, length: 1.5, thickness: 0.18, rotationY: Math.PI / 2, height: 2.8, stagger: 0.02, materialType: "wood" },
  { id: "entry-w-r", x: 1.2, z: 4.45, length: 1.5, thickness: 0.18, rotationY: Math.PI / 2, height: 2.8, stagger: 0.05, materialType: "wood" },
  { id: "foyer-part", x: 1.8, z: 3.5, length: 1.2, thickness: 0.18, rotationY: 0, height: 2.8, stagger: 0.08, materialType: "plaster" },

  // --- Central Double-Height Living Pavilion ---
  { id: "liv-s-l", x: -2.8, z: 3.5, length: 2.0, thickness: 0.22, rotationY: 0, height: 3.6, stagger: 0.15, materialType: "plaster" },
  { id: "liv-s-r", x: 3.4, z: 3.5, length: 2.0, thickness: 0.22, rotationY: 0, height: 3.6, stagger: 0.18, materialType: "plaster" },
  { id: "liv-w", x: -3.8, z: 0.5, length: 6.0, thickness: 0.25, rotationY: Math.PI / 2, height: 3.6, stagger: 0.22, materialType: "concrete" },
  { id: "liv-e", x: 4.4, z: 0.5, length: 6.0, thickness: 0.25, rotationY: Math.PI / 2, height: 3.6, stagger: 0.25, materialType: "concrete" },

  // --- North Glazing Wall: Columns & Mullions ---
  { id: "liv-n-col1", x: -3.7, z: -2.5, length: 0.35, thickness: 0.35, rotationY: 0, height: 3.6, stagger: 0.32, materialType: "concrete" },
  { id: "liv-n-col2", x: -1.2, z: -2.5, length: 0.22, thickness: 0.22, rotationY: 0, height: 3.6, stagger: 0.35, materialType: "wood" },
  { id: "liv-n-col3", x: 1.2, z: -2.5, length: 0.22, thickness: 0.22, rotationY: 0, height: 3.6, stagger: 0.38, materialType: "wood" },
  { id: "liv-n-col4", x: 3.7, z: -2.5, length: 0.35, thickness: 0.35, rotationY: 0, height: 3.6, stagger: 0.40, materialType: "concrete" },
  // Low sill under glass
  { id: "liv-n-sill", x: 0, z: -2.5, length: 7.2, thickness: 0.18, rotationY: 0, height: 0.38, stagger: 0.42, materialType: "concrete" },

  // --- Kitchen & Dining (East Wing) ---
  { id: "kit-div", x: 2.6, z: 0.5, length: 1.6, thickness: 0.18, rotationY: 0, height: 2.8, stagger: 0.45, materialType: "wood" },
  { id: "kit-n", x: 3.5, z: -1.5, length: 2.0, thickness: 0.22, rotationY: 0, height: 2.8, stagger: 0.52, materialType: "plaster" },

  // --- Bedroom Suite (West Wing) ---
  { id: "bed-div", x: -4.8, z: 1.0, length: 5.0, thickness: 0.2, rotationY: 0, height: 2.8, stagger: 0.38, materialType: "plaster" },
  { id: "bed-w", x: -7.3, z: -0.5, length: 4.0, thickness: 0.22, rotationY: Math.PI / 2, height: 2.8, stagger: 0.58, materialType: "plaster" },
  { id: "bed-n", x: -5.8, z: -2.5, length: 3.0, thickness: 0.22, rotationY: 0, height: 2.8, stagger: 0.62, materialType: "plaster" },
  { id: "bed-s", x: -5.8, z: 1.5, length: 3.0, thickness: 0.22, rotationY: 0, height: 2.8, stagger: 0.65, materialType: "plaster" },

  // --- Bathroom Core ---
  { id: "bath-w", x: -6.0, z: 2.8, length: 2.5, thickness: 0.18, rotationY: Math.PI / 2, height: 2.8, stagger: 0.70, materialType: "plaster" },
  { id: "bath-s", x: -4.8, z: 4.0, length: 2.5, thickness: 0.18, rotationY: 0, height: 2.8, stagger: 0.72, materialType: "plaster" }
];

// ---------------------------------------------------------------------------
// 3. Procedural Architectural Furniture Items (Stage 4: Progress 0.40 -> 0.72)
// ---------------------------------------------------------------------------
export const FURNITURE_ITEMS: FurnitureItemDef[] = [
  // --- Living Room Seating Group ---
  // Area Rug (ground plane marker)
  {
    id: "liv-rug",
    room: "living",
    name: "Woven Wool Rug",
    position: [-0.2, 0.008, 0.4],
    size: [4.8, 0.012, 3.8],
    stagger: 0.40,
    materialType: "rug",
  },
  // Sectional Sofa: Main Bench
  {
    id: "liv-sofa-main",
    room: "living",
    name: "Architectural Sectional Sofa",
    position: [-0.2, 0.22, 1.8],
    size: [3.2, 0.44, 0.95],
    stagger: 0.44,
    materialType: "fabric",
  },
  // Sectional Sofa: Backrest
  {
    id: "liv-sofa-back",
    room: "living",
    name: "Sofa Back Cushion",
    position: [-0.2, 0.48, 2.18],
    size: [3.2, 0.32, 0.24],
    stagger: 0.46,
    materialType: "fabric",
  },
  // Sectional Sofa: Chaise Extension (Left)
  {
    id: "liv-sofa-chaise",
    room: "living",
    name: "Sofa Chaise",
    position: [-1.4, 0.22, 0.85],
    size: [0.95, 0.44, 1.2],
    stagger: 0.48,
    materialType: "fabric",
  },
  // Low Minimalist Coffee Table
  {
    id: "liv-coffee-table",
    room: "living",
    name: "Smoked Timber Coffee Table",
    position: [-0.1, 0.15, 0.3],
    size: [1.6, 0.28, 0.8],
    stagger: 0.52,
    materialType: "wood",
  },
  // Low Media Credenza along concrete wall
  {
    id: "liv-credenza",
    room: "living",
    name: "Floating Wall Credenza",
    position: [-3.45, 0.28, 0.5],
    size: [0.45, 0.48, 3.4],
    stagger: 0.56,
    materialType: "wood",
  },

  // --- Kitchen & Dining Group ---
  // Quartz Kitchen Island
  {
    id: "kit-island-base",
    room: "kitchen",
    name: "Monolithic Quartz Island",
    position: [3.0, 0.45, 1.8],
    size: [1.1, 0.90, 2.2],
    stagger: 0.54,
    materialType: "stone",
  },
  // Island Stool 1
  {
    id: "kit-stool-1",
    room: "kitchen",
    name: "Oak Bar Stool",
    position: [2.25, 0.35, 1.3],
    size: [0.42, 0.68, 0.42],
    stagger: 0.58,
    materialType: "wood",
  },
  // Island Stool 2
  {
    id: "kit-stool-2",
    room: "kitchen",
    name: "Oak Bar Stool",
    position: [2.25, 0.35, 2.2],
    size: [0.42, 0.68, 0.42],
    stagger: 0.60,
    materialType: "wood",
  },
  // Dining Table
  {
    id: "din-table",
    room: "dining",
    name: "Solid Oak Dining Table",
    position: [2.8, 0.38, -0.6],
    size: [1.2, 0.74, 2.0],
    stagger: 0.62,
    materialType: "wood",
  },

  // --- Master Suite ---
  // Platform Bed Base
  {
    id: "bed-platform",
    room: "bedroom",
    name: "Low Platform Bed Base",
    position: [-5.6, 0.18, -0.6],
    size: [2.1, 0.32, 2.3],
    stagger: 0.64,
    materialType: "wood",
  },
  // Mattress
  {
    id: "bed-mattress",
    room: "bedroom",
    name: "Linen Mattress",
    position: [-5.6, 0.38, -0.55],
    size: [1.8, 0.26, 2.0],
    stagger: 0.66,
    materialType: "cushion",
  },
  // Headboard
  {
    id: "bed-headboard",
    room: "bedroom",
    name: "Timber Headboard",
    position: [-5.6, 0.65, -1.65],
    size: [2.4, 0.85, 0.14],
    stagger: 0.68,
    materialType: "wood",
  },
  // Nightstand Left
  {
    id: "bed-nightstand-l",
    room: "bedroom",
    name: "Floating Bedside Table",
    position: [-7.0, 0.22, -1.5],
    size: [0.55, 0.38, 0.45],
    stagger: 0.70,
    materialType: "wood",
  },
  // Nightstand Right
  {
    id: "bed-nightstand-r",
    room: "bedroom",
    name: "Floating Bedside Table",
    position: [-4.2, 0.22, -1.5],
    size: [0.55, 0.38, 0.45],
    stagger: 0.72,
    materialType: "wood",
  }
];

// ---------------------------------------------------------------------------
// 4. Room Label Annotations (Stage 1 & 2)
// ---------------------------------------------------------------------------
export const ANNOTATIONS: PlanAnnotation[] = [
  { label: "ENTRY THRESHOLD", x: 0, z: 4.7, dimension: "2.40M CLEARANCE", phase: "plan" },
  { label: "DOUBLE-HEIGHT LIVING", x: -0.2, z: 0.6, dimension: "7.40 × 6.00M", phase: "plan" },
  { label: "KITCHEN & DINING", x: 3.0, z: 0.8, dimension: "4.40 × 3.80M", phase: "plan" },
  { label: "MASTER SUITE", x: -5.6, z: -0.5, dimension: "4.20 × 3.80M", phase: "plan" },
  { label: "BATHROOM CORE", x: -4.8, z: 2.8, dimension: "2.40 × 2.20M", phase: "plan" },
];

// ---------------------------------------------------------------------------
// 5. Reality Spatial Verification Callouts (Stage 7: Progress >= 0.75)
// ---------------------------------------------------------------------------
export const REALITY_CALLOUTS: RealityCalloutDef[] = [
  {
    id: "cal-height",
    label: "3.60M CLEARANCE",
    sublabel: "Double-height living pavilion volume",
    position: [-0.5, 2.6, -0.4],
    align: "left",
  },
  {
    id: "cal-light",
    label: "DIRECT DAYLIGHT",
    sublabel: "North-facing floor-to-ceiling glazing",
    position: [1.2, 1.8, -2.3],
    align: "right",
  },
  {
    id: "cal-circulation",
    label: "1200MM WALKWAY",
    sublabel: "Unobstructed flow between living and island",
    position: [1.4, 0.5, 1.2],
    align: "center",
  },
  {
    id: "cal-scale",
    label: "1:1 REPRODUCIBLE",
    sublabel: "Walk this exact outline at our RR Nagar studio",
    position: [-1.8, 0.4, 2.4],
    align: "left",
  }
];
