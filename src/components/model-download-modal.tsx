import React from 'react';
import {
  Cpu,
  ShieldCheck,
  HardDrive,
  CheckCircle2,
  ExternalLink,
  Download,
  Sparkles,
  AlertCircle,
  RefreshCw
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
      }, 700);
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
    stageSubtitle = 'Downloading quantized neural weights (~25MB)';
  } else if (downloadProgress >= 90 && downloadProgress < 100) {
    stageLabel = 'உள்ளமை இயந்திரம் தயார் செய்தல்...';
    stageSubtitle = 'Compiling WebAssembly / WebGPU pipeline';
  } else if (downloadProgress === 100 || isReady) {
    stageLabel = 'வெற்றிகரமாக தயார்!';
    stageSubtitle = 'Ready for 100% offline retrieval';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/65 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md rounded-3xl bg-[#FAF9F5] p-6 shadow-2xl border border-stone-200/90 space-y-5 transition-all">
        {/* Header */}
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-terracotta-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            {isReady ? (
              <CheckCircle2 className="w-6 h-6 text-white" />
            ) : isError ? (
              <AlertCircle className="w-6 h-6 text-white" />
            ) : (
              <Sparkles className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-stone-900 font-serif-tamil leading-tight">
              {isReady
                ? 'உள்ளமை AI மாதிரி தயார்'
                : isDownloading
                ? 'மாதிரி பதிவிறக்கம் ஆகிறது'
                : 'உள்ளமை AI மாதிரி தொடக்கம்'}
            </h2>
            <p className="text-xs text-stone-500 font-sans mt-0.5">
              {isReady
                ? 'On-Device Model Ready for Offline Search'
                : isDownloading
                ? 'Downloading On-Device Multilingual Model'
                : 'First-Time On-Device Search Setup'}
            </p>
          </div>
        </div>

        {/* Model Info Card */}
        <div className="rounded-2xl bg-white p-4 border border-stone-200/90 shadow-subtle space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-100">
            <span className="font-semibold text-stone-700">பயன்படுத்தப்படும் மாதிரி (Model):</span>
            <span className="font-mono text-[11px] bg-stone-100 px-2 py-0.5 rounded-md text-stone-800 font-medium">
              paraphrase-multilingual-MiniLM-L12-v2
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-600">கோப்பு அளவு (Size):</span>
            <span className="font-mono font-bold text-terracotta-700 bg-terracotta-50 px-2 py-0.5 rounded-md">
              ~25 MB (ஒரே முறை பதிவிறக்கம்)
            </span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed pt-1">
            இந்த மாதிரி உங்கள் உலாவியிலேயே (<span className="font-semibold text-stone-800">WebAssembly/WebGPU</span>) இயங்கி, ஆங்கிலம், தமிழ் மற்றும் Tanglish சூழல் வினாக்களுக்கு பொருத்தமான குறள்களை ஆஃப்லைனில் உடனடியாக கண்டறியும்.
          </p>

          {/* HuggingFace Link */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[11px] text-stone-500">HuggingFace Repository:</span>
            <a
              href="https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-terracotta-700 hover:text-terracotta-800 hover:underline"
            >
              <span>View Model on HF</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Active Progress or Action Button */}
        {isDownloading || isReady ? (
          <div className="space-y-2 p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-subtle">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
              <span className="truncate max-w-[240px]">{stageLabel}</span>
              <span className="font-mono text-terracotta-600 text-sm font-bold">
                {downloadProgress}%
              </span>
            </div>

            <Progress value={downloadProgress} className="h-2.5" />

            <div className="h-4 flex items-center justify-between overflow-hidden text-[10px] text-stone-400">
              <span className="truncate">{stageSubtitle}</span>
              {currentLoadingFile && (
                <span className="font-mono truncate max-w-[140px] text-right">
                  {currentLoadingFile.split('/').pop()}
                </span>
              )}
            </div>
          </div>
        ) : isError ? (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>மாதிரி பதிவிறக்கத்தில் சிக்கல் ஏற்பட்டது. தயவுசெய்து இணைய இணைப்பைச் சரிபார்க்கவும்.</span>
            </div>
            <Button
              onClick={handleStartDownload}
              className="w-full gap-2 py-3 rounded-xl font-semibold text-sm shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>மீண்டும் முயற்சி செய்க (Retry Download)</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <Button
              onClick={handleStartDownload}
              className="w-full gap-2 py-3 rounded-xl font-semibold text-sm shadow-md bg-terracotta-600 hover:bg-terracotta-700 text-white"
            >
              <Download className="w-4 h-4" />
              <span>மாதிரியைப் பதிவிறக்கித் தொடங்குக (Download & Start)</span>
            </Button>
            <p className="text-[10px] text-stone-400 text-center">
              ஒருமுறை பதிவிறக்கிய பிறகு 100% இணையமின்றி வாழ்நாள் முழுவதும் இயங்கும்.
            </p>
          </div>
        )}

        {/* Feature Guarantees */}
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
