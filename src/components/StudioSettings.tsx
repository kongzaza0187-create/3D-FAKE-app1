import React from 'react';
import { Model3DSpec, LightingConfig } from '../types';
import { Sun, Moon, Sliders, Sparkles, Layers, Eye } from 'lucide-react';

interface StudioSettingsProps {
  model: Model3DSpec;
  onUpdateModel: (updatedModel: Model3DSpec) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const StudioSettings: React.FC<StudioSettingsProps> = ({
  model,
  onUpdateModel,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const lighting = model.lighting;

  const handleLightingChange = (updatedLighting: LightingConfig) => {
    onUpdateModel({ ...model, lighting: updatedLighting });
  };

  const STUDIO_MODES = [
    { id: 'carbon-grid', label: 'Carbon Grid Floor', desc: 'Dark carbon texture with neon green line grid' },
    { id: 'dark-void', label: 'Infinite Dark Void', desc: 'Deep sleek black background with ambient glow' },
    { id: 'emerald-matrix', label: 'Emerald Matrix Studio', desc: 'Deep forest cyber green lighting theme' },
    { id: 'studio-ring', label: 'Neon Ring Stage', desc: 'High-contrast studio lighting pedestal' },
  ] as const;

  return (
    <div className="w-80 h-full bg-[#121317] border-l border-[#232630] flex flex-col shadow-2xl z-30 text-white">
      {/* Header */}
      <div className="p-3.5 border-b border-[#232630] bg-[#16181f] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#00FF66]" />
          <h3 className="text-xs font-semibold tracking-wider uppercase text-gray-300">ตั้งค่าสตูดิโอ & แสงไฟ</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-[#20232e]"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar text-xs">
        {/* Environment Modes */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block">
            ฉากหลัง & สตูดิโอ (Environment)
          </label>
          <div className="space-y-2">
            {STUDIO_MODES.map((mode) => {
              const isSelected = lighting.studioMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => handleLightingChange({ ...lighting, studioMode: mode.id })}
                  className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#00FF66]/15 border-[#00FF66] text-[#00FF66] shadow-md shadow-[#00FF66]/5'
                      : 'bg-[#181a22] border-[#252a36] text-gray-300 hover:border-gray-600 hover:bg-[#1d202b]'
                  }`}
                >
                  <span className="font-semibold text-xs block">{mode.label}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5 block">{mode.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Light Intensity Sliders */}
        <div className="space-y-4 bg-[#181a22] p-3.5 rounded-2xl border border-[#252a36]">
          <span className="text-[11px] font-semibold text-gray-300 block">ระดับความสว่างแสงไฟ (Lighting Setup)</span>

          <div>
            <div className="flex justify-between text-[11px] text-gray-400 mb-1">
              <span>แสงโดยรอบ (Ambient Light)</span>
              <span className="font-mono text-[#00FF66]">{lighting.ambientIntensity.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.05"
              value={lighting.ambientIntensity}
              onChange={(e) => handleLightingChange({ ...lighting, ambientIntensity: parseFloat(e.target.value) })}
              className="w-full accent-[#00FF66] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-gray-400 mb-1">
              <span>แสงสปอตไลท์หลัก (Directional)</span>
              <span className="font-mono text-[#00FF66]">{lighting.directionalIntensity.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={lighting.directionalIntensity}
              onChange={(e) => handleLightingChange({ ...lighting, directionalIntensity: parseFloat(e.target.value) })}
              className="w-full accent-[#00FF66] cursor-pointer"
            />
          </div>
        </div>

        {/* Accent Light Color */}
        <div className="space-y-2 bg-[#181a22] p-3.5 rounded-2xl border border-[#252a36]">
          <label className="text-[11px] font-semibold text-gray-300 block">สีแสงสะท้อนรอง (Accent Light)</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={lighting.accentLightColor}
              onChange={(e) => handleLightingChange({ ...lighting, accentLightColor: e.target.value })}
              className="w-9 h-9 rounded-lg border border-[#2e3342] bg-transparent cursor-pointer"
            />
            <span className="text-xs font-mono text-gray-300">{lighting.accentLightColor}</span>
          </div>
        </div>

        {/* Shadow & Glow Toggles */}
        <div className="space-y-2 bg-[#181a22] p-3.5 rounded-2xl border border-[#252a36]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300 font-medium">เปิดใช้งานเงาสะท้อน (Soft Shadows)</span>
            <input
              type="checkbox"
              checked={lighting.enableShadows}
              onChange={(e) => handleLightingChange({ ...lighting, enableShadows: e.target.checked })}
              className="accent-[#00FF66] w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#252a36]">
            <span className="text-xs text-gray-300 font-medium">เอฟเฟกต์แสงเรืองแสง (Neon Bloom)</span>
            <input
              type="checkbox"
              checked={lighting.bloom}
              onChange={(e) => handleLightingChange({ ...lighting, bloom: e.target.checked })}
              className="accent-[#00FF66] w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
