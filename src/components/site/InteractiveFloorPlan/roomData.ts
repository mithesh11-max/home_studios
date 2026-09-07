import interiorFinishedImg from "@/assets/interior-finished.jpg";
import walkthroughFurnitureImg from "@/assets/walkthrough-furniture.jpg";
import walkthroughVrImg from "@/assets/walkthrough-vr.jpg";
import aboutStudioBannerImg from "@/assets/about-studio-banner.jpg";
import homeStudiosHeroImg from "@/assets/home-studios-hero.jpg";
import walkthroughStudioImg from "@/assets/walkthrough-studio.jpg";

export type RoomId = "living" | "kitchen" | "bedroom" | "bathroom" | "balcony";

export interface RoomData {
  id: RoomId;
  index: string; // e.g. "01 / 05"
  name: string;
  subtitle: string;
  tag: string;
  dimensionsImperial: string;
  dimensionsMetric: string;
  areaImperial: string;
  areaMetric: string;
  clearance: string;
  orientation: string;
  materiality: string;
  description: string;
  specifications: { label: string; value: string }[];
  image: string;
  imageCaption: string;
  camera: {
    position: [number, number, number];
    target: [number, number, number];
    fov?: number;
  };
  // 2D SVG bounding geometry for blueprint plan rendering & hit-testing (coordinate space 800x560)
  svg: {
    polygon: string;
    center: [number, number];
    labelPos: [number, number];
    dimensionLines: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      label: string;
      align?: "top" | "bottom" | "left" | "right";
    }[];
  };
  // 3D world zone bounds in XZ meters
  worldBounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    centerX: number;
    centerZ: number;
    width: number;
    depth: number;
  };
}

export const OVERVIEW_CAMERA = {
  position: [0, 15.2, 0.01] as [number, number, number],
  target: [0, 0, 0] as [number, number, number],
  fov: 44,
};

export const MASTER_PLAN_INFO = {
  index: "MASTER PLAN",
  name: "Pavilion Residence 1:1",
  subtitle: "Architectural Studio Floor Plan",
  dimensionsImperial: "46'0\" × 36'0\"",
  dimensionsMetric: "14.0m × 11.0m",
  areaImperial: "1,148 sq ft",
  areaMetric: "106.7 m²",
  clearance: "3.60m Maximum Ceiling Height",
  orientation: "North-South Axial Alignment",
  description: "Select any room on the architectural blueprint or 3D viewport to inspect clearance dimensions, daylight paths, and sightlines at 1:1 scale.",
  image: walkthroughStudioImg,
  imageCaption: "Full 1:1 scale laser projection floor field at Home Studios RR Nagar.",
};

export const ROOMS: Record<RoomId, RoomData> = {
  living: {
    id: "living",
    index: "01 / 05",
    name: "Living Room",
    subtitle: "Double-Height Central Pavilion",
    tag: "PRIMARY LIVING",
    dimensionsImperial: "24'0\" × 18'6\"",
    dimensionsMetric: "7.30m × 5.60m",
    areaImperial: "444 sq ft",
    areaMetric: "41.2 m²",
    clearance: "3.60m Double-Height Clearance",
    orientation: "North-Facing Glazing · High Diffuse Lux",
    materiality: "Cast concrete walls, smoked oak timber, linen upholstery",
    description: "The primary social core characterized by continuous north daylight, double-height volume, and an unobstructed 1200mm walkway linking the foyer and outdoor deck.",
    specifications: [
      { label: "Ceiling Height", value: "3.60m (11'10\") Clear" },
      { label: "Glazing Span", value: "7.40m Continuous Mullion-free" },
      { label: "Corridor Clearance", value: "1,200mm Unobstructed Passage" },
      { label: "Floor Finish", value: "Micro-cement with Woven Wool Rug" },
    ],
    image: interiorFinishedImg,
    imageCaption: "Occupied realization showing double-height volume and diffused northern light.",
    camera: {
      position: [0.0, 3.4, 5.2],
      target: [-0.2, 0.9, 0.6],
      fov: 46,
    },
    svg: {
      // Bounded in central coordinates
      polygon: "260,160 540,160 540,360 260,360",
      center: [400, 260],
      labelPos: [400, 255],
      dimensionLines: [
        { x1: 260, y1: 150, x2: 540, y2: 150, label: "7.30 M  (24'0\")", align: "top" },
        { x1: 550, y1: 160, x2: 550, y2: 360, label: "5.60 M  (18'6\")", align: "right" },
      ],
    },
    worldBounds: {
      minX: -3.8,
      maxX: 4.4,
      minZ: -2.5,
      maxZ: 3.5,
      centerX: 0.3,
      centerZ: 0.5,
      width: 8.2,
      depth: 6.0,
    },
  },

  kitchen: {
    id: "kitchen",
    index: "02 / 05",
    name: "Kitchen & Dining",
    subtitle: "Culinary Island & Breakfast Bar",
    tag: "CULINARY & SERVICE",
    dimensionsImperial: "14'6\" × 12'0\"",
    dimensionsMetric: "4.40m × 3.65m",
    areaImperial: "174 sq ft",
    areaMetric: "16.1 m²",
    clearance: "1100mm Island Counter Passage",
    orientation: "East Morning Lux · Low Heat Gain",
    materiality: "Honed Quartz Monolith, Solid White Oak, Matte Black Fixtures",
    description: "Ergonomically engineered cook's kitchen featuring a monolithic 3.0m prep island, integrated concealed induction, and generous 1100mm back-to-counter clearance.",
    specifications: [
      { label: "Island Dimensions", value: "3,000 × 1,100 × 900mm" },
      { label: "Passage Clearance", value: "1,100mm Counter-to-Island" },
      { label: "Storage Height", value: "Full 2,800mm Ceiling Fitment" },
      { label: "Exhaust Routing", value: "Direct Exterior Plinth Shaft" },
    ],
    image: walkthroughFurnitureImg,
    imageCaption: "1:1 scale furniture session testing kitchen island clearance and prep workflow.",
    camera: {
      position: [5.2, 2.9, 4.4],
      target: [2.9, 0.8, 1.4],
      fov: 44,
    },
    svg: {
      polygon: "540,180 720,180 720,380 540,380",
      center: [630, 280],
      labelPos: [630, 275],
      dimensionLines: [
        { x1: 540, y1: 170, x2: 720, y2: 170, label: "4.40 M  (14'6\")", align: "top" },
        { x1: 730, y1: 180, x2: 730, y2: 380, label: "3.65 M  (12'0\")", align: "right" },
      ],
    },
    worldBounds: {
      minX: 1.8,
      maxX: 5.4,
      minZ: -1.0,
      maxZ: 3.5,
      centerX: 3.6,
      centerZ: 1.25,
      width: 3.6,
      depth: 4.5,
    },
  },

  bedroom: {
    id: "bedroom",
    index: "03 / 05",
    name: "Master Bedroom",
    subtitle: "Private Acoustic Suite",
    tag: "REST & RETREAT",
    dimensionsImperial: "16'0\" × 13'6\"",
    dimensionsMetric: "4.85m × 4.10m",
    areaImperial: "216 sq ft",
    areaMetric: "20.0 m²",
    clearance: "950mm Bedside Circulation",
    orientation: "West Afternoon Light · Acoustic Buffer",
    materiality: "Slatted walnut wall, acoustic plasterboard, linen drapery",
    description: "Separated from social living areas by a 200mm insulated wall. Accommodates a king-size platform bed with 950mm continuous clearance on either flank.",
    specifications: [
      { label: "Bed Clearance", value: "950mm Lateral Walkway" },
      { label: "Acoustic Rating", value: "STC 52 Wall Construction" },
      { label: "Wardrobe Run", value: "3,800mm Floor-to-Ceiling" },
      { label: "Ceiling Height", value: "2,800mm Flat Plaster" },
    ],
    image: walkthroughVrImg,
    imageCaption: "VR spatial simulation validating bed clearance, sightlines, and wardrobe doors.",
    camera: {
      position: [-7.8, 2.9, 1.9],
      target: [-5.6, 0.7, -0.6],
      fov: 44,
    },
    svg: {
      polygon: "80,180 260,180 260,370 80,370",
      center: [170, 275],
      labelPos: [170, 270],
      dimensionLines: [
        { x1: 80, y1: 170, x2: 260, y2: 170, label: "4.85 M  (16'0\")", align: "top" },
        { x1: 70, y1: 180, x2: 70, y2: 370, label: "4.10 M  (13'6\")", align: "left" },
      ],
    },
    worldBounds: {
      minX: -7.5,
      maxX: -3.8,
      minZ: -2.5,
      maxZ: 1.8,
      centerX: -5.65,
      centerZ: -0.35,
      width: 3.7,
      depth: 4.3,
    },
  },

  bathroom: {
    id: "bathroom",
    index: "04 / 05",
    name: "Ensuite Bathroom",
    subtitle: "Wet / Dry Core",
    tag: "HYGIENE & WELLNESS",
    dimensionsImperial: "8'6\" × 7'6\"",
    dimensionsMetric: "2.60m × 2.30m",
    areaImperial: "64 sq ft",
    areaMetric: "6.0 m²",
    clearance: "1000mm Walk-in Shower Depth",
    orientation: "Plumbing Shaft Vent · High Privacy",
    materiality: "Large format porcelain tiles, fluted glass, brushed steel",
    description: "Compact, efficient wet/dry core engineered with slope-to-drain wet zone, concealed cistern, and a walk-in shower with 1000mm frameless glass screen.",
    specifications: [
      { label: "Shower Footprint", value: "1,400 × 1,000mm Walk-in" },
      { label: "Dry Vanity Width", value: "1,200mm Floating Stone Basin" },
      { label: "Ventilation Rate", value: "12 Air Changes per Hour" },
      { label: "Waterproofing", value: "Dual Polyurethane Membrane" },
    ],
    image: aboutStudioBannerImg,
    imageCaption: "Architectural detailing of wet-area plumbing chases and reinforcement.",
    camera: {
      position: [-6.4, 2.5, 5.0],
      target: [-4.9, 0.6, 2.8],
      fov: 42,
    },
    svg: {
      polygon: "80,370 240,370 240,490 80,490",
      center: [160, 430],
      labelPos: [160, 425],
      dimensionLines: [
        { x1: 80, y1: 500, x2: 240, y2: 500, label: "2.60 M  (8'6\")", align: "bottom" },
        { x1: 70, y1: 370, x2: 70, y2: 490, label: "2.30 M  (7'6\")", align: "left" },
      ],
    },
    worldBounds: {
      minX: -6.2,
      maxX: -3.8,
      minZ: 1.8,
      maxZ: 4.2,
      centerX: -5.0,
      centerZ: 3.0,
      width: 2.4,
      depth: 2.4,
    },
  },

  balcony: {
    id: "balcony",
    index: "05 / 05",
    name: "Cantilever Balcony",
    subtitle: "Outdoor Extension & Vista Deck",
    tag: "TERRACE & AIR",
    dimensionsImperial: "18'6\" × 6'0\"",
    dimensionsMetric: "5.60m × 1.80m",
    areaImperial: "111 sq ft",
    areaMetric: "10.3 m²",
    clearance: "1800mm Cantilever Depth",
    orientation: "North Exposure · 180° Open Horizon",
    materiality: "Reinforced cantilever concrete, thermal decking, glass balustrade",
    description: "Cantilevered reinforced slab projecting 1.8m outward beyond the thermal envelope. Seamless flush floor transition with zero step-up threshold from the living room.",
    specifications: [
      { label: "Cantilever Overhang", value: "1,800mm Reinforced Concrete" },
      { label: "Balustrade Height", value: "1,150mm Laminated Glass" },
      { label: "Threshold Detail", value: "Zero-Step Concealed Drainage" },
      { label: "Live Load Rating", value: "4.0 kN/m² Engineered Deck" },
    ],
    image: homeStudiosHeroImg,
    imageCaption: "Cantilevered terrace slab and exterior envelope overlooking Bengaluru canopy.",
    camera: {
      position: [0.0, 2.3, -1.2],
      target: [0.0, 1.1, -4.6],
      fov: 48,
    },
    svg: {
      polygon: "260,70 540,70 540,160 260,160",
      center: [400, 115],
      labelPos: [400, 110],
      dimensionLines: [
        { x1: 260, y1: 60, x2: 540, y2: 60, label: "5.60 M  (18'6\")", align: "top" },
        { x1: 550, y1: 70, x2: 550, y2: 160, label: "1.80 M  (6'0\")", align: "right" },
      ],
    },
    worldBounds: {
      minX: -3.0,
      maxX: 3.5,
      minZ: -4.4,
      maxZ: -2.5,
      centerX: 0.25,
      centerZ: -3.45,
      width: 6.5,
      depth: 1.9,
    },
  },
};

export const ROOM_IDS: RoomId[] = ["living", "kitchen", "bedroom", "bathroom", "balcony"];
