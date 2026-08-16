import React from 'react';
import { Compass, HelpCircle } from 'lucide-react';
import { Card } from './ui/card';

export const EmptyFallback: React.FC = () => {
  return (
    <Card className="border-stone-200/90 bg-white/95 p-6 text-center space-y-4 shadow-card animate-in fade-in-50 duration-300">
      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center">
        <Compass className="w-6 h-6 animate-pulse" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-sm font-bold text-stone-900 font-serif-tamil">
          பொருத்தமான குறள் கண்டறியப்படவில்லை
        </h3>
        <p className="text-xs text-stone-500">
          No strong semantic match found for this query
        </p>
      </div>

      {/* Classical Guardrail Quote - Kural 423 */}
      <div className="p-3.5 rounded-2xl bg-parchment-100/80 border border-parchment-300/60 text-left space-y-1.5">
        <span className="text-[10px] font-semibold tracking-wider text-terracotta-700 uppercase">
          நினைவூட்டும் குறள் (Guiding Verse) • #423
        </span>
        <p className="text-xs font-bold text-stone-800 font-serif-tamil leading-relaxed">
          "எப்பொருள் யார்யார்வாய்க் கேட்பினும் அப்பொருள்
          <br />
          மெய்ப்பொருள் காண்ப தறிவு."
        </p>
        <p className="text-[11px] italic text-stone-600 font-sans">
          “To discern the truth in everything, by whomever spoken, is true wisdom.”
        </p>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-xl bg-stone-50 text-left text-xs text-stone-600">
        <HelpCircle className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          உங்களின் சூழலை மேலும் விரிவாக அல்லது உணர்வுபூர்வமாக (எ.கா. மன அமைதி, ஏமாற்றம், பொறுமை) தமிழில் அல்லது ஆங்கிலத்தில் விவரிக்கவும்.
        </p>
      </div>
    </Card>
  );
};
