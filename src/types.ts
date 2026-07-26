export type ShapeType =
  | 'box'
  | 'sphere'
  | 'cylinder'
  | 'torus'
  | 'cone'
  | 'dodecahedron'
  | 'icosahedron'
  | 'ring'
  | 'octahedron'
  | 'capsule'
  | 'custom_mesh';

export type MaterialType = 'standard' | 'physical' | 'wireframe' | 'carbon' | 'glass' | 'emissive';

export interface Part3D {
  id: string;
  name: string;
  shape: ShapeType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  metalness: number;
  roughness: number;
  emissive?: string;
  emissiveIntensity?: number;
  wireframe?: boolean;
  opacity?: number;
  transparent?: boolean;
  rotationSpeed?: [number, number, number];
  floatSpeed?: number;
  floatAmplitude?: number;
  customGeometry?: any; // THREE.BufferGeometry
}

export interface LightingConfig {
  ambientIntensity: number;
  directionalIntensity: number;
  mainLightColor: string;
  accentLightColor: string;
  enableShadows: boolean;
  studioMode: 'carbon-grid' | 'dark-void' | 'emerald-matrix' | 'studio-ring';
  bloom: boolean;
}

export interface Model3DSpec {
  id: string;
  title: string;
  description: string;
  category: 'drone' | 'sculpture' | 'architecture' | 'vehicle' | 'gadget' | 'abstract' | 'custom';
  accentColor: string;
  parts: Part3D[];
  lighting: LightingConfig;
  designNotes?: string;
  suggestedTweaks?: string[];
}

export interface AIAdvice {
  rating: number; // 1-10
  aestheticFeedback: string;
  polygonOptimization: string;
  colorBalance: string;
  designTips: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  modelUpdate?: Model3DSpec;
}
