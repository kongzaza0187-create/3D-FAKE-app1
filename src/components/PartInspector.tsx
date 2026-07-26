import React from 'react';
import { Model3DSpec, Part3D, ShapeType } from '../types';
import {
  Layers,
  Trash2,
  Plus,
  Eye,
  Sliders,
  ChevronDown,
  Sparkles,
  Palette,
  Box,
} from 'lucide-react';

interface PartInspectorProps {
  model: Model3DSpec;
  selectedPartId: string | null;
  onSelectPart: (id: string | null) => void;
  onUpdateModel: (updatedModel: Model3DSpec) => void;
}

export const PartInspector: React.FC<PartInspectorProps> = ({
  model,
  selectedPartId,
  onSelectPart,
  onUpdateModel,
}) => {
  const selectedPart = model.parts.find((p) => p.id === selectedPartId) || null;

  const SHAPE_OPTIONS: ShapeType[] = [
    'box',
    'sphere',
    'cylinder',
    'torus',
    'cone',
    'dodecahedron',
    'icosahedron',
    'ring',
    'octahedron',
    'capsule',
  ];

  // Helper to update a part
  const handlePartChange = (updatedPart: Part3D) => {
    const updatedParts = model.parts.map((p) => (p.id === updatedPart.id ? updatedPart : p));
    onUpdateModel({ ...model, parts: updatedParts });
  };

  // Add a new Primitive Part
  const handleAddPart = () => {
    const newPart: Part3D = {
      id: `part-${Date.now()}`,
      name: `New ${selectedPart ? 'Element' : 'Primitive'}`,
      shape: 'box',
      position: [0, 1.5, 0],
      rotation: [0, 0, 0],
      scale: [0.8, 0.8, 0.8],
      color: '#00FF66',
      metalness: 0.5,
      roughness: 0.2,
      emissive: '#00FF66',
      emissiveIntensity: 0.3,
    };
    onUpdateModel({ ...model, parts: [...model.parts, newPart] });
    onSelectPart(newPart.id);
  };

  // Delete Selected Part
  const handleDeletePart = (partId: string) => {
    const updatedParts = model.parts.filter((p) => p.id !== partId);
    onUpdateModel({ ...model, parts: updatedParts });
    if (selectedPartId === partId) {
      onSelectPart(null);
    }
  };

  return (
    <div className="w-full h-full bg-[#121317] border-l border-[#232630] flex flex-col overflow-hidden text-white">
      {/* Header */}
      <div className="p-3.5 border-b border-[#232630] flex items-center justify-between bg-[#16181f]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00FF66]" />
          <h3 className="text-xs font-semibold tracking-wider uppercase text-gray-300">Outliner & Inspector</h3>
        </div>
        <button
          onClick={handleAddPart}
          className="bg-[#1f232e] hover:bg-[#00FF66] text-gray-300 hover:text-black border border-[#323746] px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>เพิ่มชิ้นส่วน</span>
        </button>
      </div>

      {/* Model Parts Outliner Tree */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2 px-1">
            รายการชิ้นส่วน 3D ({model.parts.length})
          </div>
          <div className="space-y-1">
            {model.parts.map((part) => {
              const isSelected = part.id === selectedPartId;
              return (
                <div
                  key={part.id}
                  onClick={() => onSelectPart(part.id)}
                  className={`group px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-[#00FF66]/15 border-[#00FF66] text-[#00FF66] font-medium shadow-md shadow-[#00FF66]/5'
                      : 'bg-[#181a22] border-[#252a36] text-gray-300 hover:border-gray-600 hover:bg-[#1d202b]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: part.color }}
                    />
                    <span className="truncate">{part.name}</span>
                    <span className="text-[10px] text-gray-500 capitalize">({part.shape})</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePart(part.id);
                    }}
                    title="Delete element"
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-gray-500 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Part Controls */}
        {selectedPart ? (
          <div className="mt-4 pt-4 border-t border-[#232630] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#00FF66] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> ปรับแต่งคุณสมบัติ
              </span>
              <span className="text-[10px] text-gray-400 font-mono">ID: {selectedPart.id.slice(0, 6)}</span>
            </div>

            {/* Name & Shape */}
            <div className="space-y-2">
              <label className="text-[11px] text-gray-400 font-medium">ชื่อชิ้นส่วน</label>
              <input
                type="text"
                value={selectedPart.name}
                onChange={(e) => handlePartChange({ ...selectedPart, name: e.target.value })}
                className="w-full bg-[#181a22] border border-[#2e3342] focus:border-[#00FF66] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] text-gray-400 font-medium">รูปทรง 3D (Primitive Shape)</label>
              <select
                value={selectedPart.shape}
                onChange={(e) => handlePartChange({ ...selectedPart, shape: e.target.value as ShapeType })}
                className="w-full bg-[#181a22] border border-[#2e3342] focus:border-[#00FF66] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none capitalize"
              >
                {SHAPE_OPTIONS.map((shape) => (
                  <option key={shape} value={shape}>
                    {shape}
                  </option>
                ))}
              </select>
            </div>

            {/* Color & Material */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-gray-400 font-medium">สีพื้นผิว</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={selectedPart.color}
                    onChange={(e) => handlePartChange({ ...selectedPart, color: e.target.value })}
                    className="w-8 h-8 rounded border border-[#2e3342] bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono text-gray-300">{selectedPart.color}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 font-medium">สีเรืองแสง (Emissive)</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={selectedPart.emissive || '#00FF66'}
                    onChange={(e) => handlePartChange({ ...selectedPart, emissive: e.target.value })}
                    className="w-8 h-8 rounded border border-[#2e3342] bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono text-gray-300">{selectedPart.emissive || '#00FF66'}</span>
                </div>
              </div>
            </div>

            {/* Sliders: Metalness, Roughness, Glow */}
            <div className="space-y-3 bg-[#181a22] p-3 rounded-xl border border-[#252a36]">
              <div>
                <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                  <span>ความเงาโลหะ (Metalness)</span>
                  <span className="font-mono text-[#00FF66]">{selectedPart.metalness.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={selectedPart.metalness}
                  onChange={(e) => handlePartChange({ ...selectedPart, metalness: parseFloat(e.target.value) })}
                  className="w-full accent-[#00FF66] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                  <span>ความขรุขระ (Roughness)</span>
                  <span className="font-mono text-[#00FF66]">{selectedPart.roughness.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={selectedPart.roughness}
                  onChange={(e) => handlePartChange({ ...selectedPart, roughness: parseFloat(e.target.value) })}
                  className="w-full accent-[#00FF66] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                  <span>ความเข้มการเรืองแสง (Glow)</span>
                  <span className="font-mono text-[#00FF66]">{(selectedPart.emissiveIntensity || 0).toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={selectedPart.emissiveIntensity || 0}
                  onChange={(e) => handlePartChange({ ...selectedPart, emissiveIntensity: parseFloat(e.target.value) })}
                  className="w-full accent-[#00FF66] cursor-pointer"
                />
              </div>
            </div>

            {/* Transforms: Position X Y Z */}
            <div className="space-y-2 bg-[#181a22] p-3 rounded-xl border border-[#252a36]">
              <span className="text-[11px] text-gray-400 font-medium block">ตำแหน่ง (Position X, Y, Z)</span>
              <div className="grid grid-cols-3 gap-2">
                {(['X', 'Y', 'Z'] as const).map((axis, idx) => (
                  <div key={axis}>
                    <span className="text-[10px] text-gray-500 uppercase">{axis}</span>
                    <input
                      type="number"
                      step="0.1"
                      value={selectedPart.position[idx]}
                      onChange={(e) => {
                        const newPos = [...selectedPart.position] as [number, number, number];
                        newPos[idx] = parseFloat(e.target.value) || 0;
                        handlePartChange({ ...selectedPart, position: newPos });
                      }}
                      className="w-full bg-[#121317] border border-[#2e3342] rounded px-2 py-1 text-xs text-white text-center focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Transforms: Scale X Y Z */}
            <div className="space-y-2 bg-[#181a22] p-3 rounded-xl border border-[#252a36]">
              <span className="text-[11px] text-gray-400 font-medium block">ขนาด (Scale X, Y, Z)</span>
              <div className="grid grid-cols-3 gap-2">
                {(['X', 'Y', 'Z'] as const).map((axis, idx) => (
                  <div key={axis}>
                    <span className="text-[10px] text-gray-500 uppercase">{axis}</span>
                    <input
                      type="number"
                      step="0.1"
                      value={selectedPart.scale[idx]}
                      onChange={(e) => {
                        const newScale = [...selectedPart.scale] as [number, number, number];
                        newScale[idx] = parseFloat(e.target.value) || 0.1;
                        handlePartChange({ ...selectedPart, scale: newScale });
                      }}
                      className="w-full bg-[#121317] border border-[#2e3342] rounded px-2 py-1 text-xs text-white text-center focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 text-center py-8 px-4 bg-[#181a22]/50 border border-dashed border-[#252a36] rounded-2xl">
            <Box className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-400 font-medium">คลิกเลือกชิ้นส่วน 3D เพื่อปรับแต่งรายละเอียด</p>
            <p className="text-[10px] text-gray-500 mt-1">หรือคลิก "เพิ่มชิ้นส่วน" เพื่อสร้างทรงเรขาคณิตใหม่</p>
          </div>
        )}
      </div>
    </div>
  );
};
