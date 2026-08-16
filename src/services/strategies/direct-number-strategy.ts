import { Kural } from '../../types/kural';
import { ISearchStrategy, SearchStrategyResult } from '../interfaces/search-strategy.interface';

export class DirectNumberStrategy implements ISearchStrategy {
  readonly name = 'DirectNumberStrategy';

  private parseKuralNumber(query: string): number | null {
    const trimmed = query.trim().toLowerCase();

    // Pattern 1: Pure number e.g. "417", "#417", "no 417", "no. 417"
    const pureNumMatch = trimmed.match(/^(?:#|no\.?\s*)?(\d{1,4})$/i);
    if (pureNumMatch) {
      const num = parseInt(pureNumMatch[1], 10);
      if (num >= 1 && num <= 1330) return num;
    }

    // Pattern 2: "kural 417", "kural #417", "குறள் 417", "குறள் எண் 417", "417 kural", "417th kural"
    const prefixMatch = trimmed.match(/^(?:kural|குறள்|குறள்\s*எண்)\s*(?:#|no\.?\s*)?(\d{1,4})$/i);
    if (prefixMatch) {
      const num = parseInt(prefixMatch[1], 10);
      if (num >= 1 && num <= 1330) return num;
    }

    const suffixMatch = trimmed.match(/^(\d{1,4})(?:st|nd|rd|th)?\s*(?:kural|குறள்)$/i);
    if (suffixMatch) {
      const num = parseInt(suffixMatch[1], 10);
      if (num >= 1 && num <= 1330) return num;
    }

    return null;
  }

  canHandle(query: string): boolean {
    return this.parseKuralNumber(query) !== null;
  }

  async execute(query: string, kurals: Kural[]): Promise<SearchStrategyResult | null> {
    const kuralNum = this.parseKuralNumber(query);
    if (kuralNum === null) return null;

    const targetKural = kurals.find((k) => k.id === kuralNum);
    if (!targetKural) return null;

    return {
      results: [
        {
          kural: targetKural,
          score: 1.0,
          confidence: 'high',
        },
      ],
      meta: {
        type: 'direct_kural',
        title: `நேரடி குறள் எண் #${kuralNum}`,
        subtitle: `${targetKural.athikaram_ta} (${targetKural.athikaram_en})`,
        count: 1,
      },
    };
  }
}
