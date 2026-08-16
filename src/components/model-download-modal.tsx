import React from 'react';
import { Cpu, ShieldCheck, HardDrive, CheckCircle2, Sparkles } from 'lucide-react';
import { useKuralStore } from '../stores/use-kural-store';
import { Progress } from './ui/progress';

export const ModelDownloadModal: React.FC = () => {
  const { modelStatus, downloadProgress, currentLoadingFile } = useKuralStore();

  // Modal is visible as long as model is not ready
  const isVisible = modelStatus === 'uninitialized' || modelStatus === 'downloading';
  const isReady = modelStatus === 'ready';

  if (!isVisible && !isReady) return null;
  // If ready, we briefly show 100% and auto-hide
  if (isReady) return null;

  // Determine stage text
  let stageLabel = 'மாதிரி பதிவிறக்கம் தொடங்குகிறது...';
  let stageSubtitle = 'Preparing on-device neural model';

  if (downloadProgress > 5 && downloadProgress < 85) {
    stageLabel = 'பன்மொழி AI மாதிரி பதிவிறக்கம்...';
    stageSubtitle = 'Downloading quantized multilingual model (~25MB)';
  } else if (downloadProgress >= 85 && downloadProgress < 100) {
    stageLabel = 'உள்ளமை இயந்திரம் தயார் செய்தல்...';
    stageSubtitle = 'Initializing WebAssembly / WebGPU engine';
  } else if (downloadProgress === 100) {
    stageLabel = 'வெற்றிகரமாக தயார்!';
    stageSubtitle = 'Model ready for 100% offline retrieval';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/65 backdrop-blur-md animate-in fade-in duration-300 select-none">
      <div className="w-full max-w-sm rounded-3xl bg-[#FAF9F5] p-6 shadow-2xl border border-stone-200/90 space-y-4 transition-all">
        {/* Header */}
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-terracotta-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            {downloadProgress === 100 ? (
              <CheckCircle2 className="w-6 h-6 text-white" />
            ) : (
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            )}
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 font-serif-tamil leading-tight">
              உள்ளமை AI மாதிரி தொடக்கம்
            </h2>
            <p className="text-xs text-stone-500 font-sans">
              On-Device Search Initialization
            </p>
          </div>
        </div>

        {/* Descriptive Text */}
        <p className="text-xs text-stone-600 leading-relaxed font-sans">
          உங்கள் சாதனத்திலேயே 100% ஆஃப்லைனில் தேட, சிறிய பன்மொழி AI மாதிரி (<span className="font-semibold text-stone-900">~25 MB</span>) ஒருமுறை மட்டுமே பதிவிறக்கப்படுகிறது.
        </p>

        {/* Stable Progress Display (Fixed Dimensions to Eliminate Jitter) */}
        <div className="space-y-2 p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-subtle">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
            <span className="truncate max-w-[200px]">{stageLabel}</span>
            <span className="font-mono text-terracotta-600 text-sm">{downloadProgress}%</span>
          </div>

          <Progress value={downloadProgress} className="h-2" />

          <div className="h-4 flex items-center justify-between overflow-hidden">
            <span className="text-[10px] text-stone-400 font-sans truncate">
              {stageSubtitle}
            </span>
            {currentLoadingFile && (
              <span className="text-[10px] text-stone-400 font-mono truncate max-w-[120px] text-right">
                {currentLoadingFile.split('/').pop()}
              </span>
            )}
          </div>
        </div>

        {/* Privacy & Offline Guarantees */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-200/60 text-[11px] text-stone-600">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <span>100% Offline Ready</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Zero Data Leaves Device</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2 text-stone-500">
            <Cpu className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Sub-millisecond Vector Dot Product</span>
          </div>
        </div>
      </div>
    </div>
  );
};
