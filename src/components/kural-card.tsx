import React, { useState } from 'react';
import { Volume2, VolumeX, Copy, Check, Share2, Layers } from 'lucide-react';
import { SearchResult } from '../types/kural';
import { useSpeech } from '../context/service-context';
import { useKuralStore } from '../stores/use-kural-store';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { AccordionItem } from './ui/accordion';

interface KuralCardProps {
  result: SearchResult;
  isPrimary?: boolean;
}

export const KuralCardItem: React.FC<KuralCardProps> = ({ result, isPrimary = false }) => {
  const { kural, score } = result;
  const speechService = useSpeech();
  const { activeSpeechId, setActiveSpeechId } = useKuralStore();
  const [copied, setCopied] = useState(false);

  const matchPercent = Math.round(score * 100);
  const isSpeaking = activeSpeechId === kural.id;

  const handleSpeak = async () => {
    if (isSpeaking) {
      speechService.stop();
      setActiveSpeechId(null);
    } else {
      setActiveSpeechId(kural.id);
      try {
        const fullTamilText = `${kural.line1} ${kural.line2}. மு வரதராசனார் உரை: ${kural.urais.mu_va}`;
        await speechService.speak(fullTamilText);
      } catch (e) {
        console.error('Speech synthesis error:', e);
      } finally {
        setActiveSpeechId(null);
      }
    }
  };

  const handleCopy = async () => {
    const textToCopy = `திருக்குறள் #${kural.id}
அதிகாரம்: ${kural.athikaram_ta} (${kural.athikaram_en})

${kural.line1}
${kural.line2}

மு. வரதராசனார் உரை:
${kural.urais.mu_va}

English:
${kural.translation_en}
${kural.explanation_en}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy to clipboard', e);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `திருக்குறள் #${kural.id} - ${kural.athikaram_ta}`,
          text: `${kural.line1}\n${kural.line2}\n\nஉரை: ${kural.urais.mu_va}\n\nEnglish: ${kural.translation_en}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card
      className={`relative overflow-hidden transition-all ${
        isPrimary
          ? 'border-terracotta-200/90 bg-gradient-to-b from-parchment-50 to-white shadow-card ring-1 ring-terracotta-100'
          : 'border-stone-200/90 bg-white/95'
      }`}
    >
      {/* Top Meta Header */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-stone-100">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="terracotta" className="font-serif-tamil text-[11px] font-semibold">
            குறள் #{kural.id}
          </Badge>
          <span className="text-xs text-stone-600 font-medium font-serif-tamil truncate max-w-[170px]">
            {kural.athikaram_ta} ({kural.athikaram_en})
          </span>
        </div>

        <Badge
          variant={matchPercent >= 60 ? 'terracotta' : 'stone'}
          className="text-[11px] font-mono shrink-0 font-semibold"
        >
          {matchPercent}% Match
        </Badge>
      </div>

      {/* Couplet Section */}
      <div className="py-2 px-3.5 my-2 rounded-xl bg-parchment-100/70 border border-parchment-300/60">
        <p className="text-base font-bold text-stone-900 font-serif-tamil leading-relaxed tracking-wide">
          {kural.line1}
        </p>
        <p className="text-base font-bold text-stone-900 font-serif-tamil leading-relaxed tracking-wide mt-1">
          {kural.line2}
        </p>
      </div>

      {/* English Translation & Explanation */}
      <div className="pt-2 pb-3 space-y-1">
        <p className="text-xs italic text-stone-600 font-sans leading-relaxed">
          "{kural.translation_en}"
        </p>
        {kural.explanation_en && kural.explanation_en !== kural.translation_en && (
          <p className="text-xs text-stone-500 leading-relaxed">
            {kural.explanation_en}
          </p>
        )}
      </div>

      {/* Primary Commentary (Mu. Varadarajan) */}
      <div className="my-2.5 p-3 rounded-xl bg-stone-50/90 border border-stone-200/70 space-y-1">
        <div className="flex items-center justify-between text-[11px] font-semibold text-terracotta-700 font-sans-tamil">
          <span>மு. வரதராசனார் உரை (Mu. Va Commentary)</span>
          <span className="text-[10px] text-stone-400 font-normal">முதன்மை உரை</span>
        </div>
        <p className="text-xs text-stone-800 font-sans-tamil leading-relaxed">
          {kural.urais.mu_va}
        </p>
      </div>

      {/* Scholarly Accordion for other Urais */}
      <div className="pt-1">
        <AccordionItem
          title="சாலமன் பாப்பையா உரை"
          subtitle="Solomon Pappaiah Commentary"
        >
          <p className="leading-relaxed">{kural.urais.pappaiah}</p>
        </AccordionItem>

        <AccordionItem
          title="கலைஞர் மு. கருணாநிதி உரை"
          subtitle="Kalaignar M. Karunanidhi Commentary"
        >
          <p className="leading-relaxed">{kural.urais.karunanidhi}</p>
        </AccordionItem>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100 text-xs">
        <span className="text-[10px] text-stone-400 font-sans">
          {kural.pal_ta} ({kural.pal_en}) • {kural.iyal_ta}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSpeak}
            aria-label="Speak couplet"
            className={`p-2 rounded-lg transition-colors ${
              isSpeaking
                ? 'bg-terracotta-600 text-white animate-pulse'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy couplet"
            className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Share couplet"
            className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export const KuralCardList: React.FC = () => {
  const { results, expandedRelated, toggleExpandedRelated } = useKuralStore();

  if (!results || results.length === 0) return null;

  const primaryResult = results[0];
  const secondaryResults = results.slice(1);
  const isHighConfidence = primaryResult.confidence === 'high';

  return (
    <div className="space-y-4 pt-1">
      {/* Primary Result */}
      <KuralCardItem result={primaryResult} isPrimary={true} />

      {/* Secondary Results Section */}
      {secondaryResults.length > 0 && (
        <div className="space-y-3 pt-1">
          {isHighConfidence && (
            <button
              type="button"
              onClick={toggleExpandedRelated}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-stone-200 bg-white/80 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-all shadow-subtle"
            >
              <Layers className="w-3.5 h-3.5 text-terracotta-600" />
              <span>
                {expandedRelated
                  ? 'தொடர்புடைய பிற குறள்களை மறை (Hide Related)'
                  : `மேலும் தொடர்புடைய ${secondaryResults.length} குறள்கள் (View ${secondaryResults.length} more related)`}
              </span>
            </button>
          )}

          {(!isHighConfidence || expandedRelated) && (
            <div className="space-y-3 animate-in fade-in-50 duration-300">
              {secondaryResults.map((result) => (
                <KuralCardItem key={result.kural.id} result={result} isPrimary={false} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
