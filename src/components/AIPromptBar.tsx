import React, { useState } from 'react';
import { Sparkles, Send, Loader2, Compass, Layers } from 'lucide-react';

interface AIPromptBarProps {
  onGenerate: (prompt: string, category: string) => Promise<void>;
  isLoading: boolean;
}

export const AIPromptBar: React.FC<AIPromptBarProps> = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('custom');

  const SAMPLE_PROMPTS = [
    { label: 'Stealth Quadcopter', category: 'drone', text: 'Minimalist carbon fiber quadcopter with neon green plasma thruster rings' },
    { label: 'Quantum Crystal Obelisk', category: 'sculpture', text: 'Abstract kinetic crystalline monolith with glowing emerald energy core' },
    { label: 'Aero Wedge Hypercar', category: 'vehicle', text: 'Futuristic aerodynamic low-poly hypercar with green matrix LED headlights' },
    { label: 'Nordic Carbon Chair', category: 'gadget', text: 'Ergonomic scandinavian lounge chair with matte black composite legs' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onGenerate(prompt.trim(), category);
  };

  const handleSelectSample = (sample: { text: string; category: string }) => {
    setPrompt(sample.text);
    setCategory(sample.category);
    onGenerate(sample.text, sample.category);
  };

  return (
    <div className="w-full bg-[#121317] border-b border-[#232630] p-3 sm:p-4 shadow-xl z-20">
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2 max-w-5xl mx-auto">
        <div className="relative flex-1 flex items-center bg-[#181a22] border border-[#2e3342] focus-within:border-[#00FF66] rounded-xl px-3.5 py-2 transition-all shadow-inner">
          <Sparkles className="w-4 h-4 text-[#00FF66] mr-2.5 shrink-0 animate-pulse" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="พิมพ์คำอธิบายเพื่อสร้างโมเดล 3D... (e.g. Minimalist drone with carbon fiber frame & green neon core)"
            disabled={isLoading}
            className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="bg-[#00FF66] hover:bg-[#00E676] disabled:bg-gray-800 disabled:text-gray-600 text-black font-semibold text-xs sm:text-sm px-4 sm:px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-[#00FF66]/20 shrink-0 cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>กำลังสร้าง...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>สร้างด้วย AI</span>
            </>
          )}
        </button>
      </form>

      {/* Quick Prompt Suggestions */}
      <div className="flex items-center gap-2 max-w-5xl mx-auto mt-2.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-gray-500 text-[11px] font-medium flex items-center gap-1 shrink-0">
          <Compass className="w-3 h-3 text-[#00FF66]" /> ตัวอย่าง:
        </span>
        {SAMPLE_PROMPTS.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectSample(sample)}
            disabled={isLoading}
            className="bg-[#1a1c24] hover:bg-[#252834] text-gray-300 hover:text-[#00FF66] border border-[#2d3240] hover:border-[#00FF66]/40 px-2.5 py-1 rounded-lg transition-all shrink-0 whitespace-nowrap cursor-pointer"
          >
            {sample.label}
          </button>
        ))}
      </div>
    </div>
  );
};
