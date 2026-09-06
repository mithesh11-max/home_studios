export interface VantaTrunkOptions {
  el: HTMLElement | null;
  p5?: any;
  mouseControls?: boolean;
  touchControls?: boolean;
  gyroControls?: boolean;
  minHeight?: number;
  minWidth?: number;
  scale?: number;
  scaleMobile?: number;
  color?: number;
  backgroundColor?: number;
  spacing?: number;
  chaos?: number;
  [key: string]: any;
}

export interface VantaEffect {
  destroy: () => void;
  resize?: () => void;
  setOptions?: (options: Partial<VantaTrunkOptions>) => void;
}

declare module "vanta/dist/vanta.trunk.min.js" {
  interface VantaTrunkOptions {
    el: HTMLElement | null;
    p5?: any;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    color?: number;
    backgroundColor?: number;
    spacing?: number;
    chaos?: number;
    [key: string]: any;
  }

  export interface VantaEffect {
    destroy: () => void;
    resize?: () => void;
    setOptions?: (options: Partial<VantaTrunkOptions>) => void;
  }

  export default function TRUNK(options: VantaTrunkOptions): VantaEffect;
}

declare module "vanta/dist/vanta.trunk.min" {
  import TRUNK from "vanta/dist/vanta.trunk.min.js";
  export default TRUNK;
}

declare module "p5" {
  const p5: any;
  export default p5;
}
