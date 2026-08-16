import React, { useRef, useEffect } from 'react';
import { Search, Loader2, ArrowUpRight, CornerDownLeft, ChevronRight } from 'lucide-react';
import { useKuralStore } from '../stores/use-kural-store';
import { useRetrieval } from '../context/service-context';
import { Button } from './ui/button';

const PRESET_CHIPS = [
  {
    ta: 'முயற்சி தோல்வி',
    en: 'Facing failure',
    query: 'Handling failure and staying resilient despite hard work and effort (முயற்சி செய்தும் தோல்வி)'
  },
  {
    ta: 'முடிவு எடுக்க',
    en: 'Big decision',
    query: 'Thinking thoroughly before making a decision and planning action (முடிவு எடுத்தல், சிந்தித்து செயல்படுதல்)'
  },
  {
    ta: 'நட்பு துரோகம்',
    en: 'Friend betrayal',
    query: 'Dealing with betrayal, deceit, and false friendship (நட்பு துரோகம் மற்றும் போலியான நண்பர்கள்)'
  },
  {
    ta: 'கோபம் தணிக்க',
    en: 'Controlling anger',
    query: 'How to control anger and overcome the urge to retaliate (சினம் மற்றும் கோபம் கட்டுப்படுத்துதல்)'
  },
  {
    ta: 'நேர்மை செல்வம்',
    en: 'Ethical living',
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
      // If model is not ready and not a simple number lookup, initialize silently or on demand
      if (modelStatus !== 'ready') {
        await retrievalService.initialize((progress) => {
          handleProgress(progress);
        });
        setModelStatus('ready');
      }

      const { results, meta } = await retrievalService.searchDetailed(trimmed, 3);
      setResults(results, meta);
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

      {/* Situation Preset Chips - Clean, Concise Horizontally Scrollable Row */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <p className="text-[11px] font-semibold tracking-wider text-stone-500 uppercase font-sans">
            விரைவு சூழல்கள் <span className="font-normal text-stone-400 text-[10px]">· Quick Situations</span>
          </p>
          <span className="text-[10px] text-stone-400 font-sans flex items-center gap-0.5">
            Swipe <ChevronRight className="w-2.5 h-2.5 opacity-60" />
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5 snap-x">
          {PRESET_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePresetClick(chip.query)}
              disabled={isSearching}
              className="snap-start shrink-0 min-w-[142px] sm:min-w-[160px] p-2.5 sm:p-3 rounded-2xl border border-stone-200/90 bg-white/95 hover:border-terracotta-400 hover:bg-terracotta-50/40 transition-all shadow-subtle text-left flex flex-col justify-between active:scale-[0.98] group"
            >
              <div className="flex items-center justify-between w-full pb-0.5">
                <span className="text-xs sm:text-[13px] font-bold text-stone-800 font-sans-tamil group-hover:text-terracotta-700 whitespace-nowrap">
                  {chip.ta}
                </span>
                <ArrowUpRight className="w-3 h-3 text-stone-400 group-hover:text-terracotta-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 ml-1.5" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-stone-500 font-sans whitespace-nowrap leading-tight">
                {chip.en}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
