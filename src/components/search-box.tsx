import React, { useRef, useEffect } from 'react';
import { Search, Loader2, ArrowUpRight, CornerDownLeft } from 'lucide-react';
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
    if (modelStatus === 'uninitialized') {
      setShowDownloadModal(true);
      return;
    }

    setIsSearching(true);

    try {
      if (modelStatus !== 'ready') {
        await retrievalService.initialize((progress) => {
          handleProgress(progress);
        });
        setModelStatus('ready');
      }

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
    <div className="w-full space-y-3 sm:space-y-4">
      {/* Input container */}
      <div className="relative rounded-2xl bg-white border border-stone-200/90 shadow-card focus-within:border-terracotta-500 focus-within:ring-2 focus-within:ring-terracotta-100 transition-all p-3 sm:p-3.5">
        <div className="flex items-start gap-2">
          <Search className="w-4 h-4 text-stone-400 mt-1 shrink-0 ml-0.5" />
          <textarea
            ref={textareaRef}
            rows={2}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="உங்கள் மனநிலை அல்லது சூழலை விவரிக்கவும்... (e.g. feeling sad because friend cheated / முயற்சி தோல்வி)"
            className="w-full resize-none border-0 bg-transparent p-0 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-0 leading-relaxed font-sans"
            maxLength={300}
          />
        </div>

        <div className="flex items-center justify-between pt-2 mt-2 border-t border-stone-100 text-xs">
          <span className="text-[11px] text-stone-400 font-mono pl-0.5">
            {query.length}/300
          </span>

          <div className="flex items-center gap-1.5">
            {query.trim().length > 0 && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-[11px] text-stone-400 hover:text-stone-700 px-2 py-1 transition-colors"
              >
                Clear
              </button>
            )}
            <Button
              size="sm"
              onClick={() => handleSearch()}
              disabled={!query.trim() || isSearching}
              className="gap-1 px-3 py-1.5 font-medium rounded-xl text-xs shadow-sm"
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

      {/* Situation Preset Chips (Equal Heights & Clean Grid) */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold tracking-wider text-stone-500 uppercase px-0.5">
          விரைவு சூழல்கள் (Quick Situations)
        </p>
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {PRESET_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePresetClick(chip.query)}
              disabled={isSearching}
              className="h-full min-h-[70px] sm:min-h-[76px] flex flex-col justify-between text-left p-2.5 sm:p-3 rounded-2xl border border-stone-200/90 bg-white/95 hover:border-terracotta-400 hover:bg-terracotta-50/40 transition-all shadow-subtle group active:scale-[0.98]"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs sm:text-[13px] font-bold text-stone-800 font-sans-tamil group-hover:text-terracotta-700 truncate pr-1">
                  {chip.ta}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-terracotta-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-stone-500 line-clamp-1 mt-1 font-sans">
                {chip.en}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
