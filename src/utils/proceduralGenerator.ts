import { Model3DSpec, Part3D } from '../types';

export function generateProcedural3DModel(prompt: string, category: string = 'custom'): Model3DSpec {
  const cleanPrompt = prompt.toLowerCase();
  let modelTitle = prompt.length > 32 ? prompt.substring(0, 32) + '...' : prompt;
  modelTitle = modelTitle.charAt(0).toUpperCase() + modelTitle.slice(1);

  const parts: Part3D[] = [];
  let detectedCategory: Model3DSpec['category'] = 'custom';

  if (
    cleanPrompt.includes('drone') ||
    cleanPrompt.includes('quadcopter') ||
    cleanPrompt.includes('fly') ||
    cleanPrompt.includes('copter') ||
    cleanPrompt.includes('เครื่องบิน') ||
    cleanPrompt.includes('โดรน') ||
    cleanPrompt.includes('ยานบิน')
  ) {
    detectedCategory = 'drone';
    // Central chassis & armor
    parts.push({
      id: 'drone-chassis',
      name: 'Titanium Composite Core Chassis',
      shape: 'box',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1.3, 0.45, 1.3],
      color: '#12141a',
      metalness: 0.95,
      roughness: 0.15,
      emissive: '#00FF66',
      emissiveIntensity: 0.2,
    });
    parts.push({
      id: 'drone-top-armor',
      name: 'Vented Carbon Hood',
      shape: 'octahedron',
      position: [0, 0.35, 0],
      rotation: [0, Math.PI / 4, 0],
      scale: [1.1, 0.3, 1.1],
      color: '#1a1d26',
      metalness: 0.9,
      roughness: 0.2,
    });
    parts.push({
      id: 'drone-ai-lens',
      name: 'Autonomous AI LIDAR Scanner',
      shape: 'dodecahedron',
      position: [0, 0.5, 0],
      rotation: [0, 0, 0],
      scale: [0.4, 0.4, 0.4],
      color: '#00FF66',
      metalness: 0.8,
      roughness: 0.1,
      emissive: '#00FF66',
      emissiveIntensity: 0.9,
      rotationSpeed: [0, 0.03, 0],
    });

    // 4 Diagonal Arms, Rings, Blades, and Landing Struts (16 parts)
    const angles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
    angles.forEach((angle, i) => {
      const dist = 1.9;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      // Carbon arm
      parts.push({
        id: `drone-arm-${i}`,
        name: `High-Tensile Carbon Strut ${i + 1}`,
        shape: 'cylinder',
        position: [x / 2, 0, z / 2],
        rotation: [0, -angle, Math.PI / 2],
        scale: [0.12, dist, 0.12],
        color: '#1e212b',
        metalness: 0.92,
        roughness: 0.18,
      });
      // Plasma shroud ring
      parts.push({
        id: `drone-ring-${i}`,
        name: `Ion Ring Shroud ${i + 1}`,
        shape: 'torus',
        position: [x, 0.1, z],
        rotation: [Math.PI / 2, 0, 0],
        scale: [0.75, 0.75, 0.22],
        color: '#10B981',
        metalness: 0.9,
        roughness: 0.1,
        emissive: '#00FF66',
        emissiveIntensity: 0.85,
      });
      // Rotating rotor blade
      parts.push({
        id: `drone-rotor-${i}`,
        name: `Kinetic Carbon Rotor ${i + 1}`,
        shape: 'cylinder',
        position: [x, 0.26, z],
        rotation: [0, 0, 0],
        scale: [0.95, 0.03, 0.09],
        color: '#00FF66',
        metalness: 0.95,
        roughness: 0.05,
        rotationSpeed: [0, i % 2 === 0 ? 0.15 : -0.15, 0],
      });
      // Landing leg damper
      parts.push({
        id: `drone-leg-${i}`,
        name: `Pneumatic Shock Leg ${i + 1}`,
        shape: 'cone',
        position: [x * 0.8, -0.4, z * 0.8],
        rotation: [Math.PI, 0, 0],
        scale: [0.15, 0.6, 0.15],
        color: '#141620',
        metalness: 0.9,
        roughness: 0.2,
      });
    });

    // Rear Plasma Jet
    parts.push({
      id: 'drone-thruster',
      name: 'Rear Ion Propulsion Nozzle',
      shape: 'cylinder',
      position: [0, -0.05, -0.75],
      rotation: [Math.PI / 2, 0, 0],
      scale: [0.35, 0.4, 0.35],
      color: '#00FF66',
      metalness: 0.95,
      roughness: 0.1,
      emissive: '#00FF66',
      emissiveIntensity: 1.0,
    });
  } else if (
    cleanPrompt.includes('car') ||
    cleanPrompt.includes('vehicle') ||
    cleanPrompt.includes('hypercar') ||
    cleanPrompt.includes('truck') ||
    cleanPrompt.includes('รถ') ||
    cleanPrompt.includes('ยานพาหนะ') ||
    cleanPrompt.includes('สปอร์ต')
  ) {
    detectedCategory = 'vehicle';
    // Aerodynamic Chassis Base
    parts.push({
      id: 'car-chassis',
      name: 'Carbon Fiber Monocoque Chassis',
      shape: 'box',
      position: [0, 0.45, 0],
      rotation: [0, 0, 0],
      scale: [1.85, 0.45, 3.4],
      color: '#101217',
      metalness: 0.95,
      roughness: 0.1,
      emissive: '#00FF66',
      emissiveIntensity: 0.15,
    });
    // Sleek Cockpit Canopy
    parts.push({
      id: 'car-cockpit',
      name: 'Aerodynamic Glass Cockpit Dome',
      shape: 'capsule',
      position: [0, 0.88, -0.2],
      rotation: [Math.PI / 2, 0, 0],
      scale: [1.15, 1.5, 0.58],
      color: '#1a222a',
      metalness: 0.9,
      roughness: 0.05,
      opacity: 0.85,
      transparent: true,
    });
    // Front Splitter
    parts.push({
      id: 'car-splitter',
      name: 'Front Carbon Downforce Splitter',
      shape: 'box',
      position: [0, 0.25, 1.75],
      rotation: [-0.1, 0, 0],
      scale: [1.9, 0.08, 0.5],
      color: '#00FF66',
      metalness: 0.9,
      roughness: 0.1,
      emissive: '#00FF66',
      emissiveIntensity: 0.3,
    });
    // Rear Wing Spoiler
    parts.push({
      id: 'car-spoiler-wing',
      name: 'Active Aerodynamic Rear Wing',
      shape: 'box',
      position: [0, 1.1, -1.6],
      rotation: [0.1, 0, 0],
      scale: [2.0, 0.08, 0.45],
      color: '#151720',
      metalness: 0.95,
      roughness: 0.15,
    });
    parts.push({
      id: 'car-spoiler-strut-1',
      name: 'Left Spoiler Strut',
      shape: 'cylinder',
      position: [-0.6, 0.8, -1.6],
      rotation: [0, 0, 0],
      scale: [0.06, 0.5, 0.12],
      color: '#00FF66',
      metalness: 0.9,
      roughness: 0.1,
      emissive: '#00FF66',
      emissiveIntensity: 0.8,
    });
    parts.push({
      id: 'car-spoiler-strut-2',
      name: 'Right Spoiler Strut',
      shape: 'cylinder',
      position: [0.6, 0.8, -1.6],
      rotation: [0, 0, 0],
      scale: [0.06, 0.5, 0.12],
      color: '#00FF66',
      metalness: 0.9,
      roughness: 0.1,
      emissive: '#00FF66',
      emissiveIntensity: 0.8,
    });

    // 4 Neon Rim Wheels
    const wheelPositions: [number, number, number][] = [
      [-1.02, 0.45, 1.15],
      [1.02, 0.45, 1.15],
      [-1.02, 0.45, -1.15],
      [1.02, 0.45, -1.15],
    ];
    wheelPositions.forEach((pos, i) => {
      parts.push({
        id: `wheel-${i}`,
        name: `Neon Halo Rim Wheel ${i + 1}`,
        shape: 'torus',
        position: pos,
        rotation: [0, 0, Math.PI / 2],
        scale: [0.48, 0.48, 0.28],
        color: '#00FF66',
        metalness: 0.92,
        roughness: 0.15,
        emissive: '#00FF66',
        emissiveIntensity: 0.7,
        rotationSpeed: [0.08, 0, 0],
      });
    });

    // Front Lightbar & Rear Exhaust
    parts.push({
      id: 'car-headlights',
      name: 'Laser Matrix Front Lightbar',
      shape: 'box',
      position: [0, 0.52, 1.72],
      rotation: [0, 0, 0],
      scale: [1.6, 0.08, 0.08],
      color: '#00FF66',
      metalness: 0.9,
      roughness: 0.1,
      emissive: '#00FF66',
      emissiveIntensity: 1.0,
    });
    parts.push({
      id: 'car-taillights',
      name: 'Neon Tail Beam Strip',
      shape: 'box',
      position: [0, 0.65, -1.72],
      rotation: [0, 0, 0],
      scale: [1.7, 0.08, 0.08],
      color: '#10B981',
      metalness: 0.9,
      roughness: 0.1,
      emissive: '#10B981',
      emissiveIntensity: 0.9,
    });
    parts.push({
      id: 'car-exhaust-1',
      name: 'Left Plasma Exhaust Pipe',
      shape: 'cylinder',
      position: [-0.3, 0.4, -1.72],
      rotation: [Math.PI / 2, 0, 0],
      scale: [0.15, 0.2, 0.15],
      color: '#00FF66',
      metalness: 0.95,
      roughness: 0.1,
      emissive: '#00FF66',
      emissiveIntensity: 1.0,
    });
    parts.push({
      id: 'car-exhaust-2',
      name: 'Right Plasma Exhaust Pipe',
      shape: 'cylinder',
      position: [0.3, 0.4, -1.72],
      rotation: [Math.PI / 2, 0, 0],
      scale: [0.15, 0.2, 0.15],
      color: '#00FF66',
      metalness: 0.95,
      roughness: 0.1,
      emissive: '#00FF66',
      emissiveIntensity: 1.0,
    });
  } else if (
    cleanPrompt.includes('robot') ||
    cleanPrompt.includes('mech') ||
    cleanPrompt.includes('android') ||
    cleanPrompt.includes('หุ่นยนต์') ||
    cleanPrompt.includes('เมชา') ||
    cleanPrompt.includes('ชุดเกราะ')
  ) {
    detectedCategory = 'gadget';
    // Torso & Core
    parts.push({
      id: 'mech-torso',
      name: 'Heavy Armored Chest Plate',
      shape: 'box',
      position: [0, 1.85, 0],
      rotation: [0, 0, 0],
      scale: [1.3, 1.4, 0.85],
      color: '#11131a',
      metalness: 0.92,
      roughness: 0.2,
    });
    parts.push({
      id: 'mech-arc-core',
      name: 'Quantum Arc Energy Reactor',
      shape: 'octahedron',
      position: [0, 1.95, 0.45],
      rotation: [0, 0, 0],
      scale: [0.38, 0.38, 0.38],
      color: '#00FF66',
      metalness: 0.9,
      roughness: 0.1,
      emissive: '#00FF66',
      emissiveIntensity: 1.0,
      rotationSpeed: [0.01, 0.02, 0],
    });
    // Head & Helmet
    parts.push({
      id: 'mech-head',
      name: 'Command Cyber Helmet',
      shape: 'dodecahedron',
      position: [0, 2.85, 0],
      rotation: [0, 0, 0],
      scale: [0.5, 0.5, 0.5],
      color: '#1a1c26',
      metalness: 0.85,
      roughness: 0.15,
    });
    parts.push({
      id: 'mech-visor',
      name: 'Tactical Neon Visor',
      shape: 'box',
      position: [0, 2.9, 0.22],
      rotation: [0, 0, 0],
      scale: [0.42, 0.12, 0.1],
      color: '#00FF66',
      metalness: 0.9,
      roughness: 0.1,
      emissive: '#00FF66',
      emissiveIntensity: 1.0,
    });
    // Shoulders
    [-0.85, 0.85].forEach((x, i) => {
      parts.push({
        id: `mech-shoulder-${i}`,
        name: `Heavy Pauldron Shield ${i + 1}`,
        shape: 'icosahedron',
        position: [x, 2.35, 0],
        rotation: [0, 0, 0],
        scale: [0.45, 0.45, 0.45],
        color: '#00FF66',
        metalness: 0.9,
        roughness: 0.1,
        emissive: '#00FF66',
        emissiveIntensity: 0.4,
      });
      // Arms
      parts.push({
        id: `mech-arm-${i}`,
        name: `Pneumatic Hydraulic Arm ${i + 1}`,
        shape: 'cylinder',
        position: [x * 1.08, 1.55, 0],
        rotation: [0, 0, i === 0 ? 0.2 : -0.2],
        scale: [0.22, 1.25, 0.22],
        color: '#181a24',
        metalness: 0.9,
        roughness: 0.2,
      });
    });
    // Legs & Stabilizers
    [-0.42, 0.42].forEach((x, i) => {
      parts.push({
        id: `mech-thigh-${i}`,
        name: `Upper Thigh Actuator ${i + 1}`,
        shape: 'cylinder',
        position: [x, 0.9, 0],
        rotation: [0, 0, 0],
        scale: [0.28, 0.9, 0.28],
        color: '#141620',
        metalness: 0.92,
        roughness: 0.2,
      });
      parts.push({
        id: `mech-foot-${i}`,
        name: `Stabilizer Foot Plate ${i + 1}`,
        shape: 'box',
        position: [x, 0.15, 0.1],
        rotation: [0, 0, 0],
        scale: [0.4, 0.25, 0.65],
        color: '#0e1015',
        metalness: 0.95,
        roughness: 0.15,
        emissive: '#00FF66',
        emissiveIntensity: 0.2,
      });
    });
  } else if (
    cleanPrompt.includes('building') ||
    cleanPrompt.includes('tower') ||
    cleanPrompt.includes('architecture') ||
    cleanPrompt.includes('ตึก') ||
    cleanPrompt.includes('อาคาร') ||
    cleanPrompt.includes('บ้าน') ||
    cleanPrompt.includes('สถาปัตยกรรม')
  ) {
    detectedCategory = 'architecture';
    // Base & Foundation
    parts.push({
      id: 'arch-base',
      name: 'Granite Carbon Foundation',
      shape: 'box',
      position: [0, 0.15, 0],
      rotation: [0, 0, 0],
      scale: [3.0, 0.3, 3.0],
      color: '#0c0d11',
      metalness: 0.95,
      roughness: 0.1,
    });
    // Main Tower Blocks (3 Stepped Tiers)
    parts.push({
      id: 'arch-tier-1',
      name: 'Lower Podium Facade',
      shape: 'box',
      position: [0, 0.9, 0],
      rotation: [0, 0, 0],
      scale: [2.0, 1.2, 2.0],
      color: '#161822',
      metalness: 0.88,
      roughness: 0.2,
    });
    parts.push({
      id: 'arch-tier-2',
      name: 'Mid-Level Cantilever Atrium',
      shape: 'box',
      position: [0, 2.1, 0],
      rotation: [0, Math.PI / 8, 0],
      scale: [1.5, 1.2, 1.5],
      color: '#12141c',
      metalness: 0.9,
      roughness: 0.15,
      emissive: '#00FF66',
      emissiveIntensity: 0.1,
    });
    parts.push({
      id: 'arch-tier-3',
      name: 'High-Rise Penthouse Spire Block',
      shape: 'box',
      position: [0, 3.2, 0],
      rotation: [0, Math.PI / 4, 0],
      scale: [1.1, 1.0, 1.1],
      color: '#1a1d28',
      metalness: 0.92,
      roughness: 0.1,
    });
    // Floating Observation Rings
    parts.push({
      id: 'arch-ring-1',
      name: 'Halo Skybridge Platform',
      shape: 'torus',
      position: [0, 1.5, 0],
      rotation: [Math.PI / 2, 0, 0],
      scale: [2.2, 2.2, 0.15],
      color: '#00FF66',
      metalness: 0.9,
      roughness: 0.1,
      emissive: '#00FF66',
      emissiveIntensity: 0.85,
    });
    parts.push({
      id: 'arch-spire',
      name: 'Quantum Telecoms Antenna Spire',
      shape: 'cone',
      position: [0, 4.2, 0],
      rotation: [0, 0, 0],
      scale: [0.2, 1.2, 0.2],
      color: '#00FF66',
      metalness: 0.95,
      roughness: 0.05,
      emissive: '#00FF66',
      emissiveIntensity: 1.0,
    });
  } else if (
    cleanPrompt.includes('sword') ||
    cleanPrompt.includes('blade') ||
    cleanPrompt.includes('weapon') ||
    cleanPrompt.includes('ดาบ') ||
    cleanPrompt.includes('อาวุธ')
  ) {
    detectedCategory = 'sculpture';
    // Hilt Grip
    parts.push({
      id: 'sword-hilt',
      name: 'Carbon Grip Handle',
      shape: 'cylinder',
      position: [0, 0.5, 0],
      rotation: [0, 0, 0],
      scale: [0.12, 1.0, 0.12],
      color: '#12141c',
      metalness: 0.95,
      roughness: 0.1,
    });
    // Crossguard
    parts.push({
      id: 'sword-guard',
      name: 'Emerald Plasma Guard',
      shape: 'box',
      position: [0, 1.05, 0],
      rotation: [0, 0, 0],
      scale: [1.2, 0.12, 0.3],
      color: '#00FF66',
      metalness: 0.9,
      roughness: 0.1,
      emissive: '#00FF66',
      emissiveIntensity: 0.9,
    });
    // Multi-segment Crystal Blade (3 tiers)
    parts.push({
      id: 'sword-blade-base',
      name: 'Primary Energy Core Blade',
      shape: 'box',
      position: [0, 2.0, 0],
      rotation: [0, Math.PI / 4, 0],
      scale: [0.25, 1.8, 0.08],
      color: '#00FF66',
      metalness: 0.85,
      roughness: 0.05,
      emissive: '#00FF66',
      emissiveIntensity: 0.8,
    });
    parts.push({
      id: 'sword-blade-tip',
      name: 'Monomolecular Razor Tip',
      shape: 'octahedron',
      position: [0, 3.2, 0],
      rotation: [0, 0, 0],
      scale: [0.22, 0.8, 0.1],
      color: '#10B981',
      metalness: 0.9,
      roughness: 0.1,
      emissive: '#00FF66',
      emissiveIntensity: 1.0,
    });
    // Orbiting Energy Ring
    parts.push({
      id: 'sword-ring',
      name: 'Holo-Focus Gyro Ring',
      shape: 'torus',
      position: [0, 2.0, 0],
      rotation: [Math.PI / 3, 0, 0],
      scale: [0.8, 0.8, 0.08],
      color: '#00FF66',
      metalness: 0.9,
      roughness: 0.1,
      emissive: '#00FF66',
      emissiveIntensity: 1.0,
      rotationSpeed: [0.02, 0.03, 0.01],
    });
  } else {
    // Ultra Complex Kinetic High-Tech Monument (16 synchronized parts)
    detectedCategory = 'sculpture';
    parts.push({
      id: 'complex-base-1',
      name: 'Stepped Carbon Base Plate',
      shape: 'box',
      position: [0, 0.1, 0],
      rotation: [0, 0, 0],
      scale: [2.8, 0.2, 2.8],
      color: '#0b0d12',
      metalness: 0.95,
      roughness: 0.1,
    });
    parts.push({
      id: 'complex-base-2',
      name: 'Internal Octagonal Platform',
      shape: 'box',
      position: [0, 0.3, 0],
      rotation: [0, Math.PI / 4, 0],
      scale: [2.1, 0.2, 2.1],
      color: '#161824',
      metalness: 0.92,
      roughness: 0.15,
    });
    parts.push({
      id: 'complex-monolith',
      name: 'Monolithic Quantum Core Pillar',
      shape: 'octahedron',
      position: [0, 1.8, 0],
      rotation: [0, 0, 0],
      scale: [0.95, 2.6, 0.95],
      color: '#181b28',
      metalness: 0.88,
      roughness: 0.1,
      emissive: '#00FF66',
      emissiveIntensity: 0.25,
      rotationSpeed: [0, 0.008, 0],
    });
    // Floating Outer Halo Rings
    parts.push({
      id: 'complex-ring-outer',
      name: 'Primary Emerald Halo Ring',
      shape: 'torus',
      position: [0, 1.8, 0],
      rotation: [Math.PI / 3, 0, 0],
      scale: [1.9, 1.9, 0.12],
      color: '#00FF66',
      metalness: 0.9,
      roughness: 0.1,
      emissive: '#00FF66',
      emissiveIntensity: 0.85,
      rotationSpeed: [0.01, 0.015, 0.005],
    });
    parts.push({
      id: 'complex-ring-inner',
      name: 'Secondary Gyroscope Ring',
      shape: 'torus',
      position: [0, 1.8, 0],
      rotation: [-Math.PI / 4, Math.PI / 4, 0],
      scale: [1.45, 1.45, 0.09],
      color: '#10B981',
      metalness: 0.9,
      roughness: 0.1,
      emissive: '#10B981',
      emissiveIntensity: 0.9,
      rotationSpeed: [-0.015, 0.01, -0.01],
    });
    // Floating Energy Sphere
    parts.push({
      id: 'complex-energy-orb',
      name: 'Floating Quantum Plasma Orb',
      shape: 'sphere',
      position: [0, 1.8, 0],
      rotation: [0, 0, 0],
      scale: [0.45, 0.45, 0.45],
      color: '#00FF66',
      metalness: 0.8,
      roughness: 0.1,
      emissive: '#00FF66',
      emissiveIntensity: 1.0,
      floatSpeed: 1.6,
      floatAmplitude: 0.12,
    });

    // 4 Perimeter Beacons
    const beaconAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    beaconAngles.forEach((a, i) => {
      const dist = 1.35;
      const bx = Math.cos(a) * dist;
      const bz = Math.sin(a) * dist;
      parts.push({
        id: `beacon-${i}`,
        name: `Perimeter Sensor Beacon ${i + 1}`,
        shape: 'cylinder',
        position: [bx, 0.8, bz],
        rotation: [0, 0, 0],
        scale: [0.12, 0.8, 0.12],
        color: '#00FF66',
        metalness: 0.9,
        roughness: 0.1,
        emissive: '#00FF66',
        emissiveIntensity: 0.7,
      });
    });
  }

  return {
    id: `model-${Date.now()}`,
    title: modelTitle,
    description: `Multi-component high-tech 3D architectural composition created for: "${prompt}"`,
    category: detectedCategory,
    accentColor: '#00FF66',
    designNotes: `Constructed with high-tech carbon fiber shaders, precision geometric primitives, and glowing neon green accents.`,
    suggestedTweaks: [
      'Increase metalness for ultra-reflective finish',
      'Adjust neon ring rotation speed in Inspector',
      'Toggle bloom and shadow environment effects',
    ],
    lighting: {
      ambientIntensity: 0.45,
      directionalIntensity: 1.4,
      mainLightColor: '#ffffff',
      accentLightColor: '#00FF66',
      enableShadows: true,
      studioMode: 'carbon-grid',
      bloom: true,
    },
    parts,
  };
}
