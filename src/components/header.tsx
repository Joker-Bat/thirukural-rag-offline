import React, { useEffect } from 'react';
import { Sparkles, Wifi, WifiOff, BookOpen } from 'lucide-react';
import { useKuralStore } from '../stores/use-kural-store';
import { Badge } from './ui/badge';

export const Header: React.FC = () => {
  const { isOffline, setIsOffline, modelStatus } = useKuralStore();

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
    <header className="sticky top-0 z-30 bg-parchment-50/95 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 py-3.5 transition-all">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-terracotta-600 flex items-center justify-center text-white shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-stone-900 font-serif-tamil tracking-tight leading-tight flex items-center gap-1.5">
              திருக்குறள் வழிகாட்டி
              <Sparkles className="w-3.5 h-3.5 text-terracotta-500 fill-terracotta-500" />
            </h1>
            <p className="text-[11px] text-stone-500 font-sans tracking-normal">
              Thirukkural Situational Guide
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {modelStatus === 'ready' ? (
            <Badge variant="success" className="text-[10px] px-2 py-0.5 shadow-subtle">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Offline Ready
            </Badge>
          ) : isOffline ? (
            <Badge variant="stone" className="text-[10px] px-2 py-0.5">
              <WifiOff className="w-3 h-3 mr-0.5 text-stone-500" />
              Offline
            </Badge>
          ) : (
            <Badge variant="stone" className="text-[10px] px-2 py-0.5">
              <Wifi className="w-3 h-3 mr-0.5 text-stone-400" />
              On-Device
            </Badge>
          )}
        </div>
      </div>
    </header>
  );
};
