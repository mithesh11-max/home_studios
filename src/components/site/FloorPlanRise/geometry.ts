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

export interface PlanAnnotation {
  label: string;
  x: number;
  z: number;
  dimension?: string;
}

// Architectural Floor Plan: Modern Single-Story Pavilion (Living, Dining/Kitchen, Bedroom, Entry)
// Grid center is (0, 0), dimensions in meters. Entry at (0, 4.5).
export const WALLS: WallDef[] = [
  // --- Entry & Foyer (stagger: 0.0 - 0.2) ---
  // Entry left wall
  { id: "entry-w-l", x: -1.2, z: 4.5, length: 1.5, thickness: 0.18, rotationY: Math.PI / 2, height: 2.8, stagger: 0.0, materialType: "wood" },
  // Entry right wall
  { id: "entry-w-r", x: 1.2, z: 4.5, length: 1.5, thickness: 0.18, rotationY: Math.PI / 2, height: 2.8, stagger: 0.05, materialType: "wood" },
  // Foyer partition
  { id: "foyer-part", x: 1.8, z: 3.5, length: 1.2, thickness: 0.18, rotationY: 0, height: 2.8, stagger: 0.1, materialType: "plaster" },

  // --- Central Living Room (Double-Height Pavilion, stagger: 0.2 - 0.5) ---
  // Living room south partition (with wide opening)
  { id: "liv-s-l", x: -2.8, z: 3.5, length: 2.0, thickness: 0.22, rotationY: 0, height: 3.6, stagger: 0.2, materialType: "plaster" },
  { id: "liv-s-r", x: 3.4, z: 3.5, length: 2.0, thickness: 0.22, rotationY: 0, height: 3.6, stagger: 0.22, materialType: "plaster" },
  
  // Living room west wall (solid concrete texture tone)
  { id: "liv-w", x: -3.8, z: 0.5, length: 6.0, thickness: 0.25, rotationY: Math.PI / 2, height: 3.6, stagger: 0.28, materialType: "concrete" },
  
  // Living room north wall (Glazing frame columns & hairlines)
  { id: "liv-n-col1", x: -3.7, z: -2.5, length: 0.35, thickness: 0.35, rotationY: 0, height: 3.6, stagger: 0.45, materialType: "concrete" },
  { id: "liv-n-col2", x: -1.2, z: -2.5, length: 0.25, thickness: 0.25, rotationY: 0, height: 3.6, stagger: 0.48, materialType: "wood" },
  { id: "liv-n-col3", x: 1.2, z: -2.5, length: 0.25, thickness: 0.25, rotationY: 0, height: 3.6, stagger: 0.5, materialType: "wood" },
  { id: "liv-n-col4", x: 3.7, z: -2.5, length: 0.35, thickness: 0.35, rotationY: 0, height: 3.6, stagger: 0.52, materialType: "concrete" },
  // Low sill under glazing
  { id: "liv-n-sill", x: 0, z: -2.5, length: 7.2, thickness: 0.2, rotationY: 0, height: 0.4, stagger: 0.55, materialType: "concrete" },

  // --- Kitchen & Dining Suite (East Wing, stagger: 0.35 - 0.65) ---
  // East exterior wall
  { id: "kit-e", x: 4.4, z: 1.0, length: 5.0, thickness: 0.22, rotationY: Math.PI / 2, height: 2.8, stagger: 0.38, materialType: "plaster" },
  // Kitchen-Dining divider stub
  { id: "kit-div", x: 2.6, z: 0.5, length: 1.6, thickness: 0.18, rotationY: 0, height: 2.8, stagger: 0.42, materialType: "wood" },
  // Kitchen North wall
  { id: "kit-n", x: 3.5, z: -1.5, length: 2.0, thickness: 0.22, rotationY: 0, height: 2.8, stagger: 0.6, materialType: "plaster" },
  // Kitchen island counter (furniture base element)
  { id: "kit-island", x: 3.0, z: 1.8, length: 1.8, thickness: 0.9, rotationY: Math.PI / 2, height: 0.9, stagger: 0.68, materialType: "wood" },

  // --- Bedroom / Studio Suite (West Wing, stagger: 0.4 - 0.75) ---
  // Bedroom dividing wall from living
  { id: "bed-div", x: -4.8, z: 1.0, length: 5.0, thickness: 0.2, rotationY: 0, height: 2.8, stagger: 0.4, materialType: "plaster" },
  // Bedroom West exterior wall
  { id: "bed-w", x: -7.3, z: -0.5, length: 4.0, thickness: 0.22, rotationY: Math.PI / 2, height: 2.8, stagger: 0.62, materialType: "plaster" },
  // Bedroom North exterior wall
  { id: "bed-n", x: -5.8, z: -2.5, length: 3.0, thickness: 0.22, rotationY: 0, height: 2.8, stagger: 0.7, materialType: "plaster" },
  // Bedroom South wall
  { id: "bed-s", x: -5.8, z: 1.5, length: 3.0, thickness: 0.22, rotationY: 0, height: 2.8, stagger: 0.72, materialType: "plaster" },

  // --- Bathroom Core (stagger: 0.5 - 0.8) ---
  { id: "bath-w", x: -6.0, z: 2.8, length: 2.5, thickness: 0.18, rotationY: Math.PI / 2, height: 2.8, stagger: 0.75, materialType: "plaster" },
  { id: "bath-s", x: -4.8, z: 4.0, length: 2.5, thickness: 0.18, rotationY: 0, height: 2.8, stagger: 0.8, materialType: "plaster" }
];

export const ANNOTATIONS: PlanAnnotation[] = [
  { label: "ENTRY THRESHOLD", x: 0, z: 4.7, dimension: "2.40M" },
  { label: "DOUBLE-HEIGHT LIVING", x: 0, z: 0.5, dimension: "7.40 × 6.00M" },
  { label: "KITCHEN & DINING", x: 3.2, z: 0.8, dimension: "4.40 × 3.80M" },
  { label: "MASTER SUITE", x: -5.8, z: -0.5, dimension: "4.20 × 3.80M" },
  { label: "BATHROOM", x: -4.8, z: 2.8, dimension: "2.40 × 2.20M" },
];
