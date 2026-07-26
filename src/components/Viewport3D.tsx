import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { Model3DSpec, Part3D, ShapeType } from '../types';
import {
  Camera,
  Maximize2,
  RefreshCw,
  Eye,
  Box as BoxIcon,
  Sparkles,
  Layers,
  Download,
  Upload,
} from 'lucide-react';

interface Viewport3DProps {
  model: Model3DSpec;
  selectedPartId: string | null;
  onSelectPart: (partId: string | null) => void;
  onUpdateModel: (updatedModel: Model3DSpec) => void;
  onOpenImportModal?: () => void;
  onOpenExportModal?: () => void;
  exportRef?: React.MutableRefObject<{
    exportGLTF: () => void;
    exportOBJ: () => void;
    exportSTL: () => void;
    capturePNG: () => string | null;
  } | null>;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  model,
  selectedPartId,
  onSelectPart,
  onUpdateModel,
  onOpenImportModal,
  onOpenExportModal,
  exportRef,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const selectedHighlightRef = useRef<THREE.BoxHelper | null>(null);

  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [wireframeAll, setWireframeAll] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [activeCamPreset, setActiveCamPreset] = useState<'persp' | 'front' | 'top' | 'iso'>('persp');

  // Geometry Factory Helper
  const createGeometry = (shape: ShapeType): THREE.BufferGeometry => {
    switch (shape) {
      case 'box':
        return new THREE.BoxGeometry(1, 1, 1);
      case 'sphere':
        return new THREE.SphereGeometry(0.5, 32, 32);
      case 'cylinder':
        return new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
      case 'torus':
        return new THREE.TorusGeometry(0.5, 0.15, 16, 48);
      case 'cone':
        return new THREE.ConeGeometry(0.5, 1, 32);
      case 'dodecahedron':
        return new THREE.DodecahedronGeometry(0.6);
      case 'icosahedron':
        return new THREE.IcosahedronGeometry(0.6);
      case 'ring':
        return new THREE.RingGeometry(0.2, 0.6, 32);
      case 'octahedron':
        return new THREE.OctahedronGeometry(0.6);
      case 'capsule':
        return new THREE.CapsuleGeometry(0.3, 0.8, 8, 16);
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  };

  // Setup Three.js Engine
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b0c0e');
    scene.fog = new THREE.FogExp2('#0b0c0e', 0.05);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4, 3, 5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Stay above ground plane
    controls.minDistance = 1;
    controls.maxDistance = 25;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.5;
    controlsRef.current = controls;

    // Grid Floor
    const gridHelper = new THREE.GridHelper(16, 32, '#00FF66', '#1a221f');
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight('#ffffff', model.lighting.ambientIntensity);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(model.lighting.mainLightColor, model.lighting.directionalIntensity);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const accentLight = new THREE.PointLight(model.lighting.accentLightColor, 2, 10);
    accentLight.position.set(-3, 2, -3);
    scene.add(accentLight);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Animate Individual Parts
      meshMapRef.current.forEach((mesh, partId) => {
        const part = model.parts.find((p) => p.id === partId);
        if (part) {
          if (part.rotationSpeed) {
            mesh.rotation.x += part.rotationSpeed[0];
            mesh.rotation.y += part.rotationSpeed[1];
            mesh.rotation.z += part.rotationSpeed[2];
          }
          if (part.floatSpeed && part.floatAmplitude) {
            mesh.position.y = part.position[1] + Math.sin(elapsedTime * part.floatSpeed) * part.floatAmplitude;
          }
        }
      });

      // Update Highlight Box position if tracking
      if (selectedHighlightRef.current) {
        selectedHighlightRef.current.update();
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Studio Lighting & Environment Background
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Studio Background
    switch (model.lighting.studioMode) {
      case 'carbon-grid':
        scene.background = new THREE.Color('#0b0c0e');
        if (gridHelperRef.current) gridHelperRef.current.visible = showGrid;
        break;
      case 'dark-void':
        scene.background = new THREE.Color('#050506');
        if (gridHelperRef.current) gridHelperRef.current.visible = false;
        break;
      case 'emerald-matrix':
        scene.background = new THREE.Color('#03120a');
        if (gridHelperRef.current) gridHelperRef.current.visible = showGrid;
        break;
      case 'studio-ring':
        scene.background = new THREE.Color('#101216');
        if (gridHelperRef.current) gridHelperRef.current.visible = showGrid;
        break;
    }
  }, [model.lighting.studioMode, showGrid]);

  // Sync Controls AutoRotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Re-build 3D Meshes from model.parts Specification
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Remove existing meshes
    meshMapRef.current.forEach((mesh) => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else {
        mesh.material.dispose();
      }
    });
    meshMapRef.current.clear();

    if (selectedHighlightRef.current) {
      scene.remove(selectedHighlightRef.current);
      selectedHighlightRef.current = null;
    }

    // Build new meshes
    model.parts.forEach((part: Part3D) => {
      const geometry = createGeometry(part.shape);

      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(part.color),
        metalness: part.metalness,
        roughness: part.roughness,
        wireframe: wireframeAll || part.wireframe || false,
        transparent: part.transparent || false,
        opacity: part.opacity !== undefined ? part.opacity : 1.0,
      });

      if (part.emissive) {
        material.emissive = new THREE.Color(part.emissive);
        material.emissiveIntensity = part.emissiveIntensity || 0.5;
      }

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...part.position);
      mesh.rotation.set(...part.rotation);
      mesh.scale.set(...part.scale);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { partId: part.id };

      scene.add(mesh);
      meshMapRef.current.set(part.id, mesh);
    });
  }, [model.parts, wireframeAll]);

  // Highlight Selected Mesh
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (selectedHighlightRef.current) {
      scene.remove(selectedHighlightRef.current);
      selectedHighlightRef.current = null;
    }

    if (selectedPartId) {
      const selectedMesh = meshMapRef.current.get(selectedPartId);
      if (selectedMesh) {
        const boxHelper = new THREE.BoxHelper(selectedMesh, new THREE.Color('#00FF66'));
        scene.add(boxHelper);
        selectedHighlightRef.current = boxHelper;
      }
    }
  }, [selectedPartId, model.parts]);

  // Click Raycaster for Selecting Mesh Parts
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const meshes = Array.from(meshMapRef.current.values()) as THREE.Mesh[];
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      const partId = hitMesh.userData.partId;
      if (partId) {
        onSelectPart(partId);
      }
    } else {
      onSelectPart(null);
    }
  };

  // Camera Presets
  const setCameraPreset = (preset: 'persp' | 'front' | 'top' | 'iso') => {
    if (!cameraRef.current || !controlsRef.current) return;
    setActiveCamPreset(preset);
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    switch (preset) {
      case 'persp':
        camera.position.set(4, 3, 5);
        break;
      case 'front':
        camera.position.set(0, 0, 7);
        break;
      case 'top':
        camera.position.set(0, 7, 0.001);
        break;
      case 'iso':
        camera.position.set(5, 5, 5);
        break;
    }
    controls.target.set(0, 0, 0);
    controls.update();
  };

  // Expose Exporter functions via Ref
  useEffect(() => {
    if (!exportRef) return;

    exportRef.current = {
      exportGLTF: () => {
        if (!sceneRef.current) return;
        const exporter = new GLTFExporter();
        exporter.parse(
          sceneRef.current,
          (gltf) => {
            const output = JSON.stringify(gltf, null, 2);
            const blob = new Blob([output], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${model.title.toLowerCase().replace(/\s+/g, '-')}.gltf`;
            link.click();
          },
          (error) => console.error('GLTF Export Error:', error),
          { binary: false }
        );
      },
      exportOBJ: () => {
        if (!sceneRef.current) return;
        const exporter = new OBJExporter();
        const result = exporter.parse(sceneRef.current);
        const blob = new Blob([result], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${model.title.toLowerCase().replace(/\s+/g, '-')}.obj`;
        link.click();
      },
      exportSTL: () => {
        if (!sceneRef.current) return;
        const exporter = new STLExporter();
        const result = exporter.parse(sceneRef.current, { binary: true });
        const blob = new Blob([result], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${model.title.toLowerCase().replace(/\s+/g, '-')}.stl`;
        link.click();
      },
      capturePNG: () => {
        if (!rendererRef.current) return null;
        return rendererRef.current.domElement.toDataURL('image/png');
      },
    };
  }, [exportRef, model.title]);

  return (
    <div className="relative w-full h-full bg-[#0b0c0e] overflow-hidden select-none flex flex-col">
      {/* Interactive WebGL Mount Point */}
      <div
        ref={mountRef}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top Floating Control Toolbar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        {/* Model Title Badge */}
        <div className="pointer-events-auto bg-[#14161b]/90 border border-[#272a33] backdrop-blur-md rounded-xl px-4 py-2 flex items-center gap-3 shadow-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-pulse" />
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide">{model.title}</h2>
            <p className="text-xs text-[#8c919e] capitalize">{model.category} • {model.parts.length} primitives</p>
          </div>
        </div>

        {/* Viewport Control Buttons */}
        <div className="pointer-events-auto bg-[#14161b]/90 border border-[#272a33] backdrop-blur-md rounded-xl p-1.5 flex items-center gap-1.5 shadow-xl">
          {onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              title="Import 3D File (นำเข้าไฟล์ 3D)"
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#181a22] hover:bg-[#232733] border border-[#2e3345] text-[#00FF66] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#00FF66]" />
              <span className="hidden sm:inline">นำเข้าไฟล์ 3D</span>
            </button>
          )}

          {onOpenExportModal && (
            <button
              onClick={onOpenExportModal}
              title="Download 3D File (ดาวน์โหลดไฟล์)"
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#00FF66] hover:bg-[#00E676] text-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#00FF66]/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ดาวน์โหลด</span>
            </button>
          )}

          <div className="w-px h-5 bg-[#272a33] mx-0.5 hidden sm:block" />

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle Auto Rotate"
            className={`p-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              autoRotate ? 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/30' : 'text-gray-400 hover:text-white hover:bg-[#1f222b]'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Rotate</span>
          </button>

          <button
            onClick={() => setWireframeAll(!wireframeAll)}
            title="Toggle Wireframe Mode"
            className={`p-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              wireframeAll ? 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/30' : 'text-gray-400 hover:text-white hover:bg-[#1f222b]'
            }`}
          >
            <BoxIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Wireframe</span>
          </button>

          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Grid Floor"
            className={`p-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              showGrid ? 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/30' : 'text-gray-400 hover:text-white hover:bg-[#1f222b]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </button>
        </div>
      </div>

      {/* Bottom Camera Angle Preset Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto bg-[#14161b]/95 border border-[#272a33] backdrop-blur-md rounded-xl px-2 py-1.5 flex items-center gap-1 shadow-2xl z-10">
        {(['persp', 'iso', 'front', 'top'] as const).map((preset) => (
          <button
            key={preset}
            onClick={() => setCameraPreset(preset)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              activeCamPreset === preset
                ? 'bg-[#00FF66] text-black font-semibold shadow-lg shadow-[#00FF66]/20'
                : 'text-gray-400 hover:text-white hover:bg-[#1f222b]'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
};
