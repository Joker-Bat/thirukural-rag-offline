import React, { useEffect, useRef } from 'react';
import { Header } from './components/header';
import { SearchBox } from './components/search-box';
import { KuralCardList } from './components/kural-card';
import { EmptyFallback } from './components/empty-fallback';
import { ModelDownloadModal } from './components/model-download-modal';
import { useKuralStore } from './stores/use-kural-store';
import { useRetrieval } from './context/service-context';
import { Sparkles, Shield, Cpu, Compass } from 'lucide-react';

export const App: React.FC = () => {
  const { results, hasSearched, isSearching, modelStatus, setModelStatus } = useKuralStore();
  const retrievalService = useRetrieval();
  const resultsRef = useRef<HTMLDivElement | null>(null);

  // If already cached in localStorage, silently connect to worker in background
  useEffect(() => {
    let isMounted = true;
    if (modelStatus === 'ready') {
      retrievalService
        .initialize()
        .then(() => {
          if (isMounted) setModelStatus('ready');
        })
        .catch((err) => {
          console.warn('Background worker connection:', err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [modelStatus, retrievalService, setModelStatus]);

  // Scroll to results on search completion
  useEffect(() => {
    if (hasSearched && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hasSearched, results]);

  const showFallback = hasSearched && (results.length === 0 || results[0].score < 0.35);
  const showResults = hasSearched && results.length > 0 && results[0].score >= 0.35;

  return (
    <div className="min-h-screen py-0 sm:py-6 md:py-10 flex flex-col items-center justify-start px-0 sm:px-4">
      {/* Editorial App Container */}
      <div className="w-full max-w-2xl min-h-screen sm:min-h-[85vh] bg-[#FAF9F5] sm:rounded-3xl shadow-xl sm:border border-stone-200/90 flex flex-col overflow-hidden">
        {/* Sticky App Header */}
        <Header />

        {/* Main Content Area */}
        <main className="flex-1 px-3.5 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Hero Banner when no search has been performed */}
          {!hasSearched && (
            <div className="text-center py-2 sm:py-3 space-y-2 animate-in fade-in duration-300">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-parchment-200/80 border border-parchment-300/80 text-stone-800 text-[11px] sm:text-xs font-serif-tamil shadow-subtle">
                <Sparkles className="w-3.5 h-3.5 text-terracotta-600 shrink-0" />
                <span>1330 குறள்கள் • 100% சாதனத்தில் நேரடித் தேடல்</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-stone-900 font-serif-tamil pt-0.5 tracking-tight leading-snug">
                வாழ்வின் சூழல்களுக்கு திருக்குறள் வழிகாட்டல்
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed font-sans px-1">
                உங்கள் மனநிலை, இக்கட்டான சூழல் அல்லது வழிகாட்டல் வினாவை விவரிக்கவும். பொருத்தமான குறளும் உரைகளும் உடனடியாகத் தோன்றும்.
              </p>

              {/* Feature Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1 text-[11px] text-stone-500 font-sans">
                <div className="flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-terracotta-600 shrink-0" />
                  <span>On-Device AI</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Zero Data Shared</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>3 Classical Urais</span>
                </div>
              </div>
            </div>
          )}

          {/* Search Box with Situation Preset Chips */}
          <SearchBox />

          {/* Search Results Anchor */}
          <div ref={resultsRef}>
            {/* Loading Skeleton */}
            {isSearching && (
              <div className="space-y-3.5 pt-1 animate-pulse">
                <div className="h-48 bg-stone-200/70 rounded-2xl" />
                <div className="h-28 bg-stone-200/50 rounded-2xl" />
              </div>
            )}

            {/* Matching Results */}
            {!isSearching && showResults && <KuralCardList />}

            {/* Low Confidence Fallback */}
            {!isSearching && showFallback && <EmptyFallback />}
          </div>
        </main>

        {/* Model Setup Modal */}
        <ModelDownloadModal />

        {/* Clean Aligned Mobile Footer */}
        <footer className="mt-auto border-t border-stone-200/80 px-4 py-4 text-center text-xs text-stone-500 space-y-1 bg-parchment-50/70">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 font-serif-tamil text-stone-700 font-medium text-xs">
            <span>திருக்குறள் வழிகாட்டி</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-stone-500 font-sans text-[11px]">100% Offline Semantic PWA</span>
          </div>
          <p className="text-[10px] text-stone-400 font-sans">
            Precomputed 384-d vector embeddings • Zero data leaves your device
          </p>
        </footer>
      </div>
    </div>
  );
};
