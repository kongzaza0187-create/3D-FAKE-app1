import React, { useState, useRef, useEffect } from 'react';
import { Model3DSpec } from './types';
import { PRESET_MODELS } from './data/presets';
import { Viewport3D } from './components/Viewport3D';
import { AIPromptBar } from './components/AIPromptBar';
import { PartInspector } from './components/PartInspector';
import { AIChatDrawer } from './components/AIChatDrawer';
import { StudioSettings } from './components/StudioSettings';
import { ExportModal } from './components/ExportModal';
import { Import3DModal } from './components/Import3DModal';
import { generateProcedural3DModel } from './utils/proceduralGenerator';
import { SecurityModal } from './components/SecurityModal';
import {
  Sparkles,
  Sliders,
  Download,
  MessageSquare,
  Box,
  Layers,
  ChevronRight,
  Plus,
  RefreshCw,
  Zap,
  Upload,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export default function App() {
  const [currentModel, setCurrentModel] = useState<Model3DSpec>(PRESET_MODELS[0]);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modal & Side Drawer States
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState<boolean>(false);
  const [securityAlertMsg, setSecurityAlertMsg] = useState<string | null>(null);

  // Cybersecurity: Block Right-Click and Developer Tools Key Combinations
  useEffect(() => {
    const showSecurityWarning = (msg: string) => {
      setSecurityAlertMsg(msg);
      setTimeout(() => {
        setSecurityAlertMsg(null);
      }, 3000);
    };

    // Prevent Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showSecurityWarning('ห้ามคลิกขวา! ระบบเปิดการป้องกัน Security Mode');
    };

    // Prevent DevTools Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        showSecurityWarning('ห้ามเปิด Developer Tools (F12 Blocked)');
        return;
      }

      if (ctrlOrCmd) {
        // Ctrl+Shift+I (DevTools), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect)
        if (e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
          e.preventDefault();
          showSecurityWarning('ห้ามใช้ Developer Tools / Inspect Element');
          return;
        }

        // Ctrl+U (View Source)
        if (e.key === 'U' || e.key === 'u') {
          e.preventDefault();
          showSecurityWarning('ห้ามเข้าดู View Source Code (Ctrl+U Blocked)');
          return;
        }

        // Ctrl+S (Save Page)
        if (e.key === 'S' || e.key === 's') {
          e.preventDefault();
          showSecurityWarning('ห้ามบันทึกซอร์สโค้ดหน้าเว็บ (Ctrl+S Blocked)');
          return;
        }
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Exporter Ref
  const exportRef = useRef<{
    exportGLTF: () => void;
    exportOBJ: () => void;
    exportSTL: () => void;
    capturePNG: () => string | null;
  } | null>(null);

  // Generate 3D Model via Gemini AI / Search Bar
  const handleGenerateModel = async (prompt: string, category: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, category }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.model) {
          setCurrentModel(data.model);
          setSelectedPartId(null);
          return;
        }
      }
      throw new Error('API unaccessible, using procedural fallback');
    } catch (error: any) {
      console.warn('Using client-side procedural 3D model generator fallback:', error);
      const fallbackModel = generateProcedural3DModel(prompt, category);
      setCurrentModel(fallbackModel);
      setSelectedPartId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportFormat = (format: 'gltf' | 'obj' | 'stl') => {
    if (format === 'gltf') exportRef.current?.exportGLTF();
    else if (format === 'obj') exportRef.current?.exportOBJ();
    else if (format === 'stl') exportRef.current?.exportSTL();
  };

  return (
    <div className="w-screen h-screen bg-[#0b0c0e] text-white flex flex-col overflow-hidden font-sans select-none">
      {/* Top Navbar */}
      <header className="h-14 bg-[#121317] border-b border-[#232630] px-4 flex items-center justify-between z-30 shrink-0">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00FF66] to-[#10B981] p-0.5 shadow-lg shadow-[#00FF66]/20">
            <div className="w-full h-full bg-[#121317] rounded-[10px] flex items-center justify-center">
              <Box className="w-4 h-4 text-[#00FF66]" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-white flex items-center gap-2">
              3D MINIMAL STUDIO
              <span className="text-[10px] bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/30 px-1.5 py-0.5 rounded font-mono font-medium">
                AI Studio
              </span>
            </h1>
            <p className="text-[10px] text-gray-500 hidden sm:block">Minimalist 3D Generator & Design Engine</p>
          </div>
        </div>

        {/* Preset Selector Dropdown */}
        <div className="hidden md:flex items-center gap-2 bg-[#181a22] border border-[#272b38] rounded-xl px-3 py-1.5">
          <span className="text-xs text-gray-400 font-medium">Presets:</span>
          <select
            value={currentModel.id}
            onChange={(e) => {
              const selected = PRESET_MODELS.find((p) => p.id === e.target.value);
              if (selected) {
                setCurrentModel(selected);
                setSelectedPartId(null);
              }
            }}
            className="bg-transparent text-xs text-[#00FF66] font-medium focus:outline-none cursor-pointer"
          >
            {PRESET_MODELS.map((preset) => (
              <option key={preset.id} value={preset.id} className="bg-[#121317] text-white">
                {preset.title}
              </option>
            ))}
          </select>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Cyber Security Shield Button */}
          <button
            onClick={() => setIsSecurityOpen(true)}
            className="bg-[#00FF66]/10 hover:bg-[#00FF66]/20 border border-[#00FF66]/40 text-[#00FF66] font-semibold text-xs px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Cyber Security System Status"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#00FF66]" />
            <span className="hidden md:inline font-mono font-bold text-[11px]">SECURITY SECURE</span>
          </button>

          {/* Import 3D File Button */}
          <button
            onClick={() => setIsImportOpen(true)}
            className="bg-[#181a22] hover:bg-[#232734] border border-[#00FF66]/40 text-[#00FF66] font-semibold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-[#00FF66]" />
            <span className="hidden sm:inline">นำเข้าไฟล์ 3D</span>
          </button>

          {/* AI Chat Drawer Toggle */}
          <button
            onClick={() => {
              setIsChatOpen(!isChatOpen);
              if (isSettingsOpen) setIsSettingsOpen(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              isChatOpen
                ? 'bg-[#00FF66] text-black shadow-md shadow-[#00FF66]/20'
                : 'bg-[#181a22] hover:bg-[#222632] border border-[#2d3242] text-gray-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Design Assistant</span>
          </button>

          {/* Studio Lighting Settings Toggle */}
          <button
            onClick={() => {
              setIsSettingsOpen(!isSettingsOpen);
              if (isChatOpen) setIsChatOpen(false);
            }}
            className={`p-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              isSettingsOpen
                ? 'bg-[#00FF66] text-black shadow-md shadow-[#00FF66]/20'
                : 'bg-[#181a22] hover:bg-[#222632] border border-[#2d3242] text-gray-300'
            }`}
            title="Studio Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Inspector Panel Toggle */}
          <button
            onClick={() => setIsInspectorOpen(!isInspectorOpen)}
            className={`p-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              isInspectorOpen
                ? 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/40'
                : 'bg-[#181a22] hover:bg-[#222632] border border-[#2d3242] text-gray-300'
            }`}
            title="Toggle Outliner Panel"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Export Modal Button */}
          <button
            onClick={() => setIsExportOpen(true)}
            className="bg-[#00FF66] hover:bg-[#00E676] text-black font-semibold text-xs px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-[#00FF66]/20 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export 3D</span>
          </button>
        </div>
      </header>

      {/* AI Prompt Input Bar */}
      <AIPromptBar onGenerate={handleGenerateModel} isLoading={isLoading} />

      {/* Main Workspace Workspace Layout */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Interactive 3D Canvas Viewport */}
        <div className="flex-1 h-full relative">
          <Viewport3D
            model={currentModel}
            selectedPartId={selectedPartId}
            onSelectPart={setSelectedPartId}
            onUpdateModel={setCurrentModel}
            onOpenImportModal={() => setIsImportOpen(true)}
            onOpenExportModal={() => setIsExportOpen(true)}
            exportRef={exportRef}
          />
        </div>

        {/* Right Outliner / Inspector Panel */}
        {isInspectorOpen && (
          <div className="w-72 sm:w-80 h-full relative z-20 shrink-0">
            <PartInspector
              model={currentModel}
              selectedPartId={selectedPartId}
              onSelectPart={setSelectedPartId}
              onUpdateModel={setCurrentModel}
            />
          </div>
        )}

        {/* AI Assistant Drawer */}
        <AIChatDrawer
          model={currentModel}
          onUpdateModel={setCurrentModel}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />

        {/* Studio Lighting & Environment Settings Drawer */}
        <StudioSettings
          model={currentModel}
          onUpdateModel={setCurrentModel}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>

      {/* Import 3D File Modal */}
      <Import3DModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onModelImported={(importedModel) => {
          setCurrentModel(importedModel);
          setSelectedPartId(null);
        }}
        onExportCurrent={handleExportFormat}
      />

      {/* Security System Modal */}
      <SecurityModal
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
      />

      {/* Export Modal */}
      <ExportModal
        model={currentModel}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExportGLTF={() => exportRef.current?.exportGLTF()}
        onExportOBJ={() => exportRef.current?.exportOBJ()}
        onExportSTL={() => exportRef.current?.exportSTL()}
        onCapturePNG={() => exportRef.current?.capturePNG() || null}
      />

      {/* Floating Security Alert Toast */}
      {securityAlertMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#121317]/95 border border-[#00FF66]/60 text-white px-5 py-3 rounded-2xl shadow-2xl shadow-[#00FF66]/20 backdrop-blur-md flex items-center gap-3 animate-bounce">
          <div className="w-8 h-8 rounded-xl bg-[#00FF66]/20 border border-[#00FF66]/50 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4 text-[#00FF66]" />
          </div>
          <div>
            <div className="font-bold text-xs text-[#00FF66] tracking-wide">CYBER SECURITY PROTECTION</div>
            <div className="text-xs text-gray-200">{securityAlertMsg}</div>
          </div>
        </div>
      )}
    </div>
  );
}
