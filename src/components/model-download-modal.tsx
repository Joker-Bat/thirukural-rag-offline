import React from 'react';
import { Download, Cpu, ShieldCheck, HardDrive } from 'lucide-react';
import { useKuralStore } from '../stores/use-kural-store';
import { Progress } from './ui/progress';

export const ModelDownloadModal: React.FC = () => {
  const { showDownloadModal, downloadProgress, currentLoadingFile } = useKuralStore();

  if (!showDownloadModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-elevated border border-stone-200 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center shrink-0">
            <Download className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 leading-tight">
              உள்ளமை AI மாதிரி பதிவிறக்கம்
            </h2>
            <p className="text-xs text-stone-500 font-sans">
              First-Time On-Device Model Setup
            </p>
          </div>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed">
          பயன்பாடு முற்றிலும் ஆஃப்லைனில் இயங்க, சிறிய பன்மொழி AI மாதிரி (<span className="font-semibold text-stone-800">~25 MB</span>) உங்கள் உலாவியில் ஒருமுறை மட்டுமே சேமிக்கப்படுகிறது.
        </p>

        {/* Progress Display */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between text-xs font-semibold text-stone-700">
            <span>பதிவிறக்கம் (Downloading...)</span>
            <span className="font-mono text-terracotta-600">{downloadProgress}%</span>
          </div>
          <Progress value={downloadProgress} />
          {currentLoadingFile && (
            <p className="text-[10px] text-stone-400 font-mono truncate">
              {currentLoadingFile}
            </p>
          )}
        </div>

        {/* Value Props */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-[11px] text-stone-600">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>100% Offline Ready</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Zero Data Shared</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <Cpu className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Sub-millisecond On-Device Matching</span>
          </div>
        </div>
      </div>
    </div>
  );
};
