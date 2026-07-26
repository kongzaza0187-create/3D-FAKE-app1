import React, { useState, useRef } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { Model3DSpec, Part3D } from '../types';
import {
  Upload,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Box,
  Download,
  Sparkles,
  Layers,
  Cpu,
  Zap,
} from 'lucide-react';

interface Import3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModelImported: (importedModel: Model3DSpec, rawMeshInfo?: any) => void;
  onExportCurrent: (format: 'gltf' | 'obj' | 'stl') => void;
}

export const Import3DModal: React.FC<Import3DModalProps> = ({
  isOpen,
  onClose,
  onModelImported,
  onExportCurrent,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedFileInfo, setImportedFileInfo] = useState<{
    fileName: string;
    fileSize: string;
    fileType: string;
    verticesCount: number;
    polygonsCount: number;
    bboxDimensions: [number, number, number];
    aiAnalysis?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Supported Programs badges
  const SUPPORTED_SOFTWARE = [
    { name: 'Blender', exts: '.obj, .stl, .gltf, .glb' },
    { name: 'Maya / 3ds Max', exts: '.obj, .gltf' },
    { name: 'SolidWorks / AutoCAD', exts: '.stl, .ply' },
    { name: 'ZBrush', exts: '.obj, .ply' },
    { name: 'SketchUp / Tinkercad', exts: '.stl, .obj' },
  ];

  const handleFileProcess = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setImportedFileInfo(null);

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const fileSizeStr = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    try {
      const arrayBuffer = await file.arrayBuffer();

      let verticesCount = 0;
      let polygonsCount = 0;
      let bboxDimensions: [number, number, number] = [1, 1, 1];
      const createdParts: Part3D[] = [];

      if (ext === '.obj') {
        const text = new TextDecoder().decode(arrayBuffer);
        const loader = new OBJLoader();
        const group = loader.parse(text);

        group.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const geom = mesh.geometry;
            if (geom.attributes.position) {
              verticesCount += geom.attributes.position.count;
              polygonsCount += geom.index ? geom.index.count / 3 : geom.attributes.position.count / 3;
            }
          }
        });

        // Compute Bounding Box
        const bbox = new THREE.Box3().setFromObject(group);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        bboxDimensions = [parseFloat(size.x.toFixed(2)), parseFloat(size.y.toFixed(2)), parseFloat(size.z.toFixed(2))];

        // Convert obj group meshes into Carbon 3D parts
        let index = 1;
        group.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            createdParts.push({
              id: `imported-obj-${index}`,
              name: m.name || `Imported Mesh Element ${index}`,
              shape: 'box', // Base bounds
              position: [m.position.x, m.position.y, m.position.z],
              rotation: [m.rotation.x, m.rotation.y, m.rotation.z],
              scale: [m.scale.x || 1, m.scale.y || 1, m.scale.z || 1],
              color: '#1a1c24',
              metalness: 0.9,
              roughness: 0.2,
              emissive: '#00FF66',
              emissiveIntensity: 0.3,
            });
            index++;
          }
        });
      } else if (ext === '.stl') {
        const loader = new STLLoader();
        const geometry = loader.parse(arrayBuffer);
        geometry.computeBoundingBox();

        verticesCount = geometry.attributes.position ? geometry.attributes.position.count : 0;
        polygonsCount = geometry.index ? geometry.index.count / 3 : verticesCount / 3;

        const size = new THREE.Vector3();
        geometry.boundingBox?.getSize(size);
        bboxDimensions = [parseFloat(size.x.toFixed(2)), parseFloat(size.y.toFixed(2)), parseFloat(size.z.toFixed(2))];

        createdParts.push({
          id: `imported-stl-1`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          shape: 'box',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          color: '#181a22',
          metalness: 0.95,
          roughness: 0.15,
          emissive: '#00FF66',
          emissiveIntensity: 0.4,
        });
      } else if (ext === '.gltf' || ext === '.glb') {
        const loader = new GLTFLoader();
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.parse(arrayBuffer, '', resolve, reject);
        });

        gltf.scene.traverse((child: any) => {
          if (child.isMesh) {
            const geom = child.geometry;
            if (geom && geom.attributes.position) {
              verticesCount += geom.attributes.position.count;
              polygonsCount += geom.index ? geom.index.count / 3 : geom.attributes.position.count / 3;
            }
          }
        });

        const bbox = new THREE.Box3().setFromObject(gltf.scene);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        bboxDimensions = [parseFloat(size.x.toFixed(2)), parseFloat(size.y.toFixed(2)), parseFloat(size.z.toFixed(2))];

        let index = 1;
        gltf.scene.traverse((child: any) => {
          if (child.isMesh) {
            createdParts.push({
              id: `imported-gltf-${index}`,
              name: child.name || `GLTF Mesh ${index}`,
              shape: 'box',
              position: [child.position.x, child.position.y, child.position.z],
              rotation: [child.rotation.x, child.rotation.y, child.rotation.z],
              scale: [child.scale.x || 1, child.scale.y || 1, child.scale.z || 1],
              color: '#121317',
              metalness: 0.85,
              roughness: 0.2,
              emissive: '#00FF66',
              emissiveIntensity: 0.5,
            });
            index++;
          }
        });
      } else if (ext === '.ply') {
        const loader = new PLYLoader();
        const geometry = loader.parse(arrayBuffer);
        geometry.computeBoundingBox();

        verticesCount = geometry.attributes.position ? geometry.attributes.position.count : 0;
        polygonsCount = geometry.index ? geometry.index.count / 3 : verticesCount / 3;

        const size = new THREE.Vector3();
        geometry.boundingBox?.getSize(size);
        bboxDimensions = [parseFloat(size.x.toFixed(2)), parseFloat(size.y.toFixed(2)), parseFloat(size.z.toFixed(2))];

        createdParts.push({
          id: `imported-ply-1`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          shape: 'sphere',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          color: '#101216',
          metalness: 0.9,
          roughness: 0.1,
          emissive: '#00FF66',
          emissiveIntensity: 0.6,
        });
      } else if (ext === '.json') {
        const text = new TextDecoder().decode(arrayBuffer);
        const parsed = JSON.parse(text);
        if (parsed.parts) {
          onModelImported(parsed);
          setIsLoading(false);
          onClose();
          return;
        }
      } else {
        throw new Error('Unsupported file extension. Please upload .OBJ, .STL, .GLTF, .GLB, .PLY, or .JSON files.');
      }

      // Default parts fallback if empty
      if (createdParts.length === 0) {
        createdParts.push({
          id: `imported-mesh-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          shape: 'box',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1.5, 1.5, 1.5],
          color: '#121317',
          metalness: 0.9,
          roughness: 0.2,
          emissive: '#00FF66',
          emissiveIntensity: 0.5,
        });
      }

      const newModelSpec: Model3DSpec = {
        id: `imported-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: `Imported 3D model file (${ext.toUpperCase()}) from external CAD/3D software. Size: ${fileSizeStr}`,
        category: 'custom',
        accentColor: '#00FF66',
        lighting: {
          ambientIntensity: 0.4,
          directionalIntensity: 1.3,
          mainLightColor: '#ffffff',
          accentLightColor: '#00FF66',
          enableShadows: true,
          studioMode: 'carbon-grid',
          bloom: true,
        },
        designNotes: `Imported mesh consisting of ${verticesCount.toLocaleString()} vertices and ${Math.round(polygonsCount).toLocaleString()} polygons. Bounding box: ${bboxDimensions.join(' × ')} meters.`,
        suggestedTweaks: [
          'Optimize polygon count for WebGL performance',
          'Apply carbon fiber dark material shader',
          'Adjust emissive neon glow rings',
        ],
        parts: createdParts,
      };

      setImportedFileInfo({
        fileName: file.name,
        fileSize: fileSizeStr,
        fileType: ext.toUpperCase(),
        verticesCount,
        polygonsCount: Math.round(polygonsCount),
        bboxDimensions,
      });

      // Update active 3D Model on viewport
      onModelImported(newModelSpec, { verticesCount, polygonsCount, bboxDimensions });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error parsing 3D file. Please ensure the file is valid.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-[#121317] border border-[#232630] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#232630] bg-[#16181f] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#00FF66]" />
            <h2 className="text-sm font-semibold tracking-wider uppercase text-gray-200">
              นำเข้าไฟล์ 3D (Import 3D Models)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-sm p-1 rounded-lg hover:bg-[#20232e]"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs custom-scrollbar">
          {/* Software Support Badges */}
          <div className="bg-[#181a22] border border-[#252a36] p-3 rounded-xl space-y-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              รองรับไฟล์จากโปรแกรมออกแบบ 3D ชั้นนำ:
            </span>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_SOFTWARE.map((sw, idx) => (
                <div
                  key={idx}
                  className="bg-[#101216] border border-[#2d3240] px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[11px]"
                >
                  <Box className="w-3 h-3 text-[#00FF66]" />
                  <span className="font-semibold text-gray-200">{sw.name}</span>
                  <span className="text-gray-500 font-mono text-[10px]">({sw.exts})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
              isDragging
                ? 'border-[#00FF66] bg-[#00FF66]/10 scale-[0.99]'
                : 'border-[#2e3342] bg-[#181a22]/60 hover:border-[#00FF66]/60 hover:bg-[#1c1f2b]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".gltf,.glb,.obj,.stl,.ply,.json"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
            />

            {isLoading ? (
              <div className="space-y-2 py-4">
                <Loader2 className="w-8 h-8 text-[#00FF66] animate-spin mx-auto" />
                <p className="text-xs text-[#00FF66] font-medium">กำลังอ่านและประมวลผลโครงสร้างไฟล์ 3D...</p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66]">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-200">ลากไฟล์ 3D มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
                  <p className="text-gray-400 text-[11px] mt-1">
                    รองรับนามสกุล .OBJ, .STL, .GLTF, .GLB, .PLY, .JSON
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-center gap-2 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Imported Mesh Analysis Card */}
          {importedFileInfo && (
            <div className="bg-[#181a22] border border-[#00FF66]/40 p-4 rounded-xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#272b38] pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#00FF66]" />
                  <div>
                    <h3 className="font-bold text-sm text-white">{importedFileInfo.fileName}</h3>
                    <p className="text-[11px] text-gray-400">
                      ฟอร์แมต {importedFileInfo.fileType} • ขนาด {importedFileInfo.fileSize}
                    </p>
                  </div>
                </div>
                <span className="bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/40 text-[10px] font-bold px-2 py-1 rounded-md">
                  แสดงผลบนหน้าจอแล้ว
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#121317] p-2.5 rounded-lg border border-[#252a36]">
                  <span className="text-[10px] text-gray-400 block uppercase">Vertices</span>
                  <span className="font-bold text-sm text-[#00FF66] font-mono">
                    {importedFileInfo.verticesCount.toLocaleString()}
                  </span>
                </div>
                <div className="bg-[#121317] p-2.5 rounded-lg border border-[#252a36]">
                  <span className="text-[10px] text-gray-400 block uppercase">Polygons</span>
                  <span className="font-bold text-sm text-[#00FF66] font-mono">
                    {importedFileInfo.polygonsCount.toLocaleString()}
                  </span>
                </div>
                <div className="bg-[#121317] p-2.5 rounded-lg border border-[#252a36]">
                  <span className="text-[10px] text-gray-400 block uppercase">มิติสัดส่วน (X×Y×Z)</span>
                  <span className="font-bold text-[11px] text-white font-mono">
                    {importedFileInfo.bboxDimensions.join('×')}m
                  </span>
                </div>
              </div>

              {/* Quick Download Action Buttons for imported file */}
              <div className="space-y-2 pt-2 border-t border-[#272b38]">
                <span className="text-[11px] text-gray-400 font-semibold block">
                  ปุ่มดาวน์โหลดไฟล์ 3D โมเดล (Download Imported File):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onExportCurrent('gltf')}
                    className="bg-[#00FF66] hover:bg-[#00E676] text-black font-semibold py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 text-xs transition-all shadow-md shadow-[#00FF66]/20 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลด .GLTF</span>
                  </button>
                  <button
                    onClick={() => onExportCurrent('obj')}
                    className="bg-[#212532] hover:bg-[#2d3244] border border-[#3b4257] text-white font-semibold py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#00FF66]" />
                    <span>ดาวน์โหลด .OBJ</span>
                  </button>
                  <button
                    onClick={() => onExportCurrent('stl')}
                    className="bg-[#212532] hover:bg-[#2d3244] border border-[#3b4257] text-white font-semibold py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#00FF66]" />
                    <span>ดาวน์โหลด .STL</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
