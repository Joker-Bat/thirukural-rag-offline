import React from 'react';
import {
  ShieldCheck,
  HardDrive,
  CheckCircle2,
  ExternalLink,
  Download,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Zap
} from 'lucide-react';
import { useKuralStore } from '../stores/use-kural-store';
import { useRetrieval } from '../context/service-context';
import { Progress } from './ui/progress';
import { Button } from './ui/button';

export const ModelDownloadModal: React.FC = () => {
  const {
    modelStatus,
    downloadProgress,
    currentLoadingFile,
    showDownloadModal,
    setShowDownloadModal,
    setModelStatus,
    handleProgress
  } = useKuralStore();

  const retrievalService = useRetrieval();

  // If modal is explicitly closed or model is already ready and modal dismissed, don't show
  if (!showDownloadModal && modelStatus === 'ready') return null;

  const isDownloading = modelStatus === 'downloading';
  const isReady = modelStatus === 'ready';
  const isError = modelStatus === 'error';

  const handleStartDownload = async () => {
    setModelStatus('downloading');
    try {
      await retrievalService.initialize((progress) => {
        handleProgress(progress);
      });
      setModelStatus('ready');
      // Auto-dismiss smoothly after short delay
      setTimeout(() => {
        setShowDownloadModal(false);
      }, 600);
    } catch (err) {
      console.error('Failed to download model:', err);
      setModelStatus('error');
    }
  };

  // Determine stage label
  let stageLabel = 'மாதிரி பதிவிறக்கம் தொடங்குகிறது...';
  let stageSubtitle = 'Connecting to HuggingFace CDN...';

  if (downloadProgress > 5 && downloadProgress < 90) {
    stageLabel = 'பன்மொழி AI மாதிரி பதிவிறக்கம்...';
    stageSubtitle = 'Downloading neural model weights (~25MB)';
  } else if (downloadProgress >= 90 && downloadProgress < 100) {
    stageLabel = 'உள்ளமை இயந்திரம் தயார் செய்தல்...';
    stageSubtitle = 'Initializing in-browser WASM engine';
  } else if (downloadProgress === 100 || isReady) {
    stageLabel = 'வெற்றிகரமாக தயார்!';
    stageSubtitle = 'Ready for 100% offline retrieval';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-stone-950/70 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-sm sm:max-w-md rounded-3xl bg-[#FAF9F5] p-5 sm:p-6 shadow-2xl border border-stone-200/90 space-y-4 sm:space-y-5 transition-all">
        {/* Top Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta-50 border border-terracotta-200 text-terracotta-700 text-[11px] font-semibold">
            <Sparkles className="w-3 h-3 text-terracotta-600" />
            <span>உள்ளமை AI மாதிரி தொடக்கம்</span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-stone-900 font-serif-tamil tracking-tight">
            {isReady
              ? 'AI மாதிரி தயார்'
              : isDownloading
              ? 'மாதிரி பதிவிறக்கம் ஆகிறது...'
              : 'ஆஃப்லைன் தேடல் மாதிரி அமைப்பு'}
          </h2>

          <p className="text-[11px] sm:text-xs text-stone-500 font-sans leading-relaxed max-w-xs mx-auto">
            {isDownloading
              ? 'பதிவிறக்கம் முடிகிறது வரை காத்திருக்கவும்'
              : '100% இணையமின்றி வாழ்நாள் முழுவதும் இயங்கும் வகையில் சிறிய AI மாதிரி அமைக்கப்படுகிறது.'}
          </p>
        </div>

        {/* Dynamic State Section */}
        {isDownloading || isReady ? (
          /* Downloading / Progress State */
          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-800 font-sans-tamil truncate pr-2">
                {stageLabel}
              </span>
              <span className="font-mono text-sm font-bold text-terracotta-600">
                {downloadProgress}%
              </span>
            </div>

            <Progress value={downloadProgress} className="h-2.5" />

            <div className="flex items-center justify-between text-[10px] text-stone-400 font-sans pt-0.5">
              <span className="truncate">{stageSubtitle}</span>
              {currentLoadingFile && (
                <span className="font-mono truncate max-w-[120px] text-right">
                  {currentLoadingFile.split('/').pop()}
                </span>
              )}
            </div>

            {/* Micro steps */}
            <div className="pt-2 border-t border-stone-100 grid grid-cols-3 gap-1 text-[10px] text-stone-500 text-center font-sans">
              <div className={`p-1.5 rounded-lg ${downloadProgress > 5 ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'bg-stone-50'}`}>
                1. Tokenizer
              </div>
              <div className={`p-1.5 rounded-lg ${downloadProgress > 20 ? (downloadProgress >= 90 ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'bg-amber-50 text-amber-700 font-semibold animate-pulse') : 'bg-stone-50'}`}>
                2. AI Model (~25MB)
              </div>
              <div className={`p-1.5 rounded-lg ${downloadProgress >= 95 ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'bg-stone-50'}`}>
                3. WASM Engine
              </div>
            </div>
          </div>
        ) : isError ? (
          /* Error & Retry State */
          <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200 space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                மாதிரி பதிவிறக்கத்தில் சிக்கல் ஏற்பட்டது. தயவுசெய்து இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.
              </p>
            </div>
            <Button
              onClick={handleStartDownload}
              className="w-full gap-2 py-2.5 rounded-xl font-semibold text-xs bg-red-700 hover:bg-red-800 text-white"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>மீண்டும் பதிவிறக்குக (Retry Download)</span>
            </Button>
          </div>
        ) : (
          /* Initial Ready-to-Download Cards */
          <div className="space-y-3">
            {/* 2 Feature Cards */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-2xl bg-white border border-stone-200/90 shadow-subtle space-y-1">
                <div className="w-7 h-7 rounded-xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center">
                  <HardDrive className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs font-bold text-stone-800 font-sans-tamil">
                  ~25 MB பதிவிறக்கம்
                </p>
                <p className="text-[10px] text-stone-500 font-sans leading-tight">
                  ஒரே முறை சேமிப்பு • 100% ஆஃப்லைன்
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-stone-200/90 shadow-subtle space-y-1">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs font-bold text-stone-800 font-sans-tamil">
                  முழு தனியுரிமை
                </p>
                <p className="text-[10px] text-stone-500 font-sans leading-tight">
                  எந்தத் தரவும் சாதனத்தை விட்டுப் போகாது
                </p>
              </div>
            </div>

            {/* Model Spec Bar with HuggingFace Link */}
            <div className="p-3 rounded-2xl bg-white border border-stone-200/90 shadow-subtle flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <div className="min-w-0">
                  <span className="font-semibold text-stone-800 text-[11px] block truncate">
                    Multilingual MiniLM-L12
                  </span>
                  <span className="text-[10px] text-stone-400 block font-sans">
                    384-dimensional cross-lingual vectors
                  </span>
                </div>
              </div>

              <a
                href="https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10.5px] font-medium transition-colors shrink-0 ml-2"
              >
                <span>HuggingFace</span>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </a>
            </div>

            {/* Download CTA Button */}
            <div className="pt-1 space-y-2">
              <Button
                onClick={handleStartDownload}
                className="w-full gap-2 py-3 rounded-2xl font-bold text-sm bg-terracotta-600 hover:bg-terracotta-700 text-white shadow-md active:scale-[0.98] transition-all"
              >
                <Download className="w-4 h-4" />
                <span>மாதிரியைத் தொடங்குக (Download & Start)</span>
              </Button>

              <p className="text-[10px] text-stone-400 text-center font-sans">
                ஒருமுறை பதிவிறக்கிய பின் இணையமின்றி வாழ்நாள் முழுவதும் பயன்படுத்தலாம்.
              </p>
            </div>
          </div>
        )}

        {/* Footer Guarantees */}
        <div className="pt-2 border-t border-stone-200/70 flex items-center justify-center gap-3 text-[10.5px] text-stone-500 font-sans">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 100% Offline
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-600" /> &lt;2ms Search
          </span>
          <span>•</span>
          <span>Zero Server API</span>
        </div>
      </div>
    </div>
  );
};
