import React from 'react';
import { Header } from './components/header';
import { SearchBox } from './components/search-box';
import { KuralCardList } from './components/kural-card';
import { EmptyFallback } from './components/empty-fallback';
import { ModelDownloadModal } from './components/model-download-modal';
import { useKuralStore } from './stores/use-kural-store';
import { Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const { results, hasSearched, isSearching } = useKuralStore();

  const showFallback = hasSearched && (results.length === 0 || results[0].score < 0.35);
  const showResults = hasSearched && results.length > 0 && results[0].score >= 0.35;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center">
      {/* Mobile viewport container */}
      <div className="w-full max-w-md min-h-screen bg-[#FAF9F5] shadow-lg border-x border-stone-200/80 flex flex-col">
        {/* Sticky Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 px-4 py-5 space-y-5">
          {/* Hero Prompt Intro */}
          {!hasSearched && (
            <div className="text-center py-2 space-y-1.5 animate-in fade-in duration-300">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-parchment-200/70 border border-parchment-300 text-stone-700 text-xs font-serif-tamil">
                <Sparkles className="w-3 h-3 text-terracotta-600" />
                <span>1330 குறள்கள் • 100% சாதனத்தில் தேடல்</span>
              </div>
              <h2 className="text-lg font-bold text-stone-900 font-serif-tamil pt-1">
                வாழ்வின் சூழல்களுக்கு திருக்குறள் வழிகாட்டல்
              </h2>
              <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                உங்கள் மனநிலை அல்லது இக்கட்டான சூழலை விவரிக்கவும், தகுந்த குறளும் உரைகளும் உடனே தோன்றும்.
              </p>
            </div>
          )}

          {/* Search Box & Quick Chips */}
          <SearchBox />

          {/* Loading Skeleton */}
          {isSearching && (
            <div className="space-y-3 pt-2 animate-pulse">
              <div className="h-44 bg-stone-200/70 rounded-2xl" />
              <div className="h-28 bg-stone-200/50 rounded-2xl" />
            </div>
          )}

          {/* Results Display */}
          {!isSearching && showResults && <KuralCardList />}

          {/* Low Confidence Fallback */}
          {!isSearching && showFallback && <EmptyFallback />}
        </main>

        {/* Model Download Progress Dialog */}
        <ModelDownloadModal />

        {/* Footer */}
        <footer className="mt-auto border-t border-stone-200/70 px-4 py-4 text-center text-[11px] text-stone-500 space-y-1 bg-parchment-50/50">
          <p className="flex items-center justify-center gap-1 font-serif-tamil text-stone-600">
            <span>திருக்குறள் வழிகாட்டி</span> • <span>உள்ளமை AI & ஆஃப்லைன் தளம்</span>
          </p>
          <p className="text-[10px] text-stone-400">
            Privacy-first • Zero data leaves your device
          </p>
        </footer>
      </div>
    </div>
  );
};
