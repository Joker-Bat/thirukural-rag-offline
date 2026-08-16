import React, { useEffect } from 'react';
import { Wifi, WifiOff, BookOpen, Loader2 } from 'lucide-react';
import { useKuralStore } from '../stores/use-kural-store';
import { Badge } from './ui/badge';

export const Header: React.FC = () => {
  const { isOffline, setIsOffline, modelStatus, downloadProgress } = useKuralStore();

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

  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-stone-200/80 px-3.5 sm:px-6 py-2.5 sm:py-3 transition-all">
      <div className="w-full flex items-center justify-between gap-2">
        {/* Left: App Logo & Titles */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-terracotta-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <h1 className="text-sm sm:text-base font-bold text-stone-900 font-serif-tamil tracking-tight leading-tight truncate">
              திருக்குறள் வழிகாட்டி
            </h1>
            <p className="text-[10px] sm:text-xs text-stone-500 font-sans tracking-tight truncate">
              Thirukkural Situational Guide
            </p>
          </div>
        </div>

        {/* Right: Clean Single-Line Status Badge */}
        <div className="shrink-0 flex items-center">
          {modelStatus === 'ready' ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-700 text-[11px] font-medium whitespace-nowrap shadow-subtle">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
              <span className="font-sans font-semibold">Offline Ready</span>
            </div>
          ) : modelStatus === 'downloading' ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-medium whitespace-nowrap">
              <Loader2 className="w-3 h-3 animate-spin shrink-0 text-amber-600" />
              <span className="font-mono font-bold">{downloadProgress}%</span>
            </div>
          ) : isOffline ? (
            <Badge variant="stone" className="text-[10px] px-2 py-0.5 whitespace-nowrap">
              <WifiOff className="w-3 h-3 mr-1 text-stone-500" />
              <span>Offline</span>
            </Badge>
          ) : (
            <Badge variant="stone" className="text-[10px] px-2 py-0.5 whitespace-nowrap">
              <Wifi className="w-3 h-3 mr-1 text-stone-400" />
              <span>On-Device</span>
            </Badge>
          )}
        </div>
      </div>
    </header>
  );
};
