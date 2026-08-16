import React, { useState, useEffect, useRef } from 'react';
import { WifiOff, BookOpen, Loader2, ShieldCheck, X } from 'lucide-react';
import { useKuralStore } from '../stores/use-kural-store';

export const Header: React.FC = () => {
  const { setIsOffline, modelStatus, downloadProgress, setShowDownloadModal } = useKuralStore();
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOffline]);

  // Dismiss tooltip on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    };
    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTooltip]);

  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-stone-200/80 px-3.5 sm:px-6 py-2.5 sm:py-3 transition-all">
      <div className="w-full flex items-center justify-between gap-2">
        {/* Left: App Logo & Full Tamil Title (Guaranteed Zero Truncation) */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-terracotta-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-sm sm:text-base font-bold text-stone-900 font-serif-tamil tracking-tight leading-none whitespace-nowrap">
              திருக்குறள் வழிகாட்டி
            </h1>
            <p className="text-[10px] sm:text-xs text-stone-500 font-sans tracking-tight leading-normal whitespace-nowrap mt-0.5">
              Thirukkural Situational Guide
            </p>
          </div>
        </div>

        {/* Right: Compact Status Indicator Button with Interactive Popover Tooltip */}
        <div className="relative shrink-0 flex items-center" ref={tooltipRef}>
          {modelStatus === 'ready' ? (
            <button
              type="button"
              onClick={() => setShowTooltip(!showTooltip)}
              aria-label="Offline status details"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-700 hover:bg-emerald-100/70 transition-all active:scale-95 shadow-subtle"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline text-[11px] font-sans font-semibold">Offline Ready</span>
            </button>
          ) : modelStatus === 'downloading' ? (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-medium">
              <Loader2 className="w-3 h-3 animate-spin shrink-0 text-amber-600" />
              <span className="font-mono font-bold">{downloadProgress}%</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDownloadModal(true)}
              aria-label="Setup offline model"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 hover:bg-terracotta-50 border border-stone-200 text-stone-600 hover:text-terracotta-700 transition-all active:scale-95 text-[11px]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0" />
              <WifiOff className="w-3 h-3 text-stone-400" />
              <span className="hidden sm:inline text-[10px] font-medium">Setup</span>
            </button>
          )}

          {/* Interactive Popover Tooltip */}
          {showTooltip && (
            <div className="absolute right-0 top-full mt-2 w-64 p-3 rounded-2xl bg-white border border-stone-200 shadow-xl z-50 text-left animate-in fade-in zoom-in-95 duration-150 font-sans">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-stone-100">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>100% Offline Ready</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTooltip(false)}
                  className="p-0.5 text-stone-400 hover:text-stone-700 rounded-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Neural AI model (~25MB) is cached in your browser. All vector searches run 100% locally with zero internet needed.
              </p>
              <div className="mt-2 pt-1.5 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                <span>On-Device Vector RAG</span>
                <span className="font-mono text-emerald-600 font-medium">Private</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
