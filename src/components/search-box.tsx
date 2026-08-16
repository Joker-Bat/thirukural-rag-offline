import React, { useRef, useEffect } from 'react';
import { Search, Loader2, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useKuralStore } from '../stores/use-kural-store';
import { useRetrieval } from '../context/service-context';
import { Button } from './ui/button';

const PRESET_CHIPS = [
  {
    ta: 'முயற்சி தோல்வி',
    en: 'Failure despite hard work',
    query: 'Handling failure and staying resilient despite hard work and effort (முயற்சி செய்தும் தோல்வி)'
  },
  {
    ta: 'நட்பு துரோகம்',
    en: 'Betrayal by a trusted friend',
    query: 'Dealing with betrayal, deceit, and false friendship (நட்பு துரோகம் மற்றும் போலியான நண்பர்கள்)'
  },
  {
    ta: 'சினம் தவிர்த்தல்',
    en: 'Controlling anger & rage',
    query: 'How to control anger and overcome the urge to retaliate (சினம் மற்றும் கோபம் கட்டுப்படுத்துதல்)'
  },
  {
    ta: 'நேர்மையான செல்வம்',
    en: 'Ethical wealth & living',
    query: 'Earning wealth honestly and avoiding unethical shortcuts (நேர்மையான வழியில் செல்வம் சேர்த்தல்)'
  },
];

export const SearchBox: React.FC = () => {
  const {
    query,
    setQuery,
    isSearching,
    setIsSearching,
    setResults,
    modelStatus,
    setShowDownloadModal,
    handleProgress,
    setModelStatus
  } = useKuralStore();

  const retrievalService = useRetrieval();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [query]);

  const handleSearch = async (searchQuery: string = query) => {
    const trimmed = searchQuery.trim();
    if (!trimmed || isSearching) return;

    // Check if model needs downloading
    if (modelStatus === 'uninitialized' || modelStatus === 'downloading') {
      setShowDownloadModal(true);
    }

    setIsSearching(true);

    try {
      // Ensure retrieval service is initialized
      await retrievalService.initialize((progress) => {
        handleProgress(progress);
      });
      setModelStatus('ready');
      setShowDownloadModal(false);

      const results = await retrievalService.search(trimmed, 3);
      setResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      setIsSearching(false);
      setModelStatus('error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handlePresetClick = (presetQuery: string) => {
    setQuery(presetQuery);
    handleSearch(presetQuery);
  };

  return (
    <div className="w-full space-y-3.5">
      {/* Input container */}
      <div className="relative rounded-2xl bg-white border border-stone-200/90 shadow-card focus-within:border-terracotta-500 focus-within:ring-2 focus-within:ring-terracotta-100 transition-all p-3">
        <div className="flex items-start gap-2">
          <Search className="w-4 h-4 text-stone-400 mt-2 shrink-0 ml-1" />
          <textarea
            ref={textareaRef}
            rows={2}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="உங்கள் மனநிலை அல்லது சூழலை விவரிக்கவும்... (e.g. feeling sad because friend cheated / முயற்சி தோல்வி)"
            className="w-full resize-none border-0 bg-transparent p-0 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-0 leading-relaxed font-sans"
            maxLength={300}
          />
        </div>

        <div className="flex items-center justify-between pt-2 mt-2 border-t border-stone-100 text-xs">
          <span className="text-[11px] text-stone-400 font-mono pl-1">
            {query.length}/300
          </span>

          <div className="flex items-center gap-1.5">
            {query.trim().length > 0 && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-[11px] text-stone-400 hover:text-stone-600 px-1.5 py-0.5"
              >
                Clear
              </button>
            )}
            <Button
              size="sm"
              onClick={() => handleSearch()}
              disabled={!query.trim() || isSearching}
              className="gap-1 px-3 py-1.5 font-medium rounded-lg text-xs"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>தேடுகிறது...</span>
                </>
              ) : (
                <>
                  <span>ஆராய்க</span>
                  <CornerDownLeft className="w-3 h-3 opacity-80" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Situation Preset Chips */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold tracking-wider text-stone-500 uppercase px-1">
          விரைவு சூழல்கள் (Quick Situations)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePresetClick(chip.query)}
              disabled={isSearching}
              className="flex flex-col text-left p-2.5 rounded-xl border border-stone-200/90 bg-white/90 hover:border-terracotta-400 hover:bg-terracotta-50/40 transition-all shadow-subtle group active:scale-[0.98]"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-stone-800 font-sans-tamil group-hover:text-terracotta-700">
                  {chip.ta}
                </span>
                <ArrowRight className="w-3 h-3 text-stone-300 group-hover:text-terracotta-600 transition-transform group-hover:translate-x-0.5 shrink-0" />
              </div>
              <span className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                {chip.en}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
