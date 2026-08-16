import { Kural } from '../../types/kural';
import { ISearchStrategy, SearchStrategyResult } from '../interfaces/search-strategy.interface';

export class AthikaramStrategy implements ISearchStrategy {
  readonly name = 'AthikaramStrategy';

  private findAthikaram(query: string, kurals: Kural[]): { athikaramNum: number; athikaramTa: string; athikaramEn: string } | null {
    const trimmed = query.trim().toLowerCase();

    // 1. Match Chapter number pattern: "chapter 47", "அதிகாரம் 47", "adhigaram 47", "ch 47", "ch-47"
    const numMatch = trimmed.match(/^(?:chapter|அதிகாரம்|adhigaram|adhikaram|athikaram|ch)\s*(?:#|no\.?\s*)?(\d{1,3})$/i);
    if (numMatch) {
      const chNum = parseInt(numMatch[1], 10);
      if (chNum >= 1 && chNum <= 133) {
        const sampleKural = kurals.find((k) => k.athikaram_num === chNum);
        if (sampleKural) {
          return {
            athikaramNum: chNum,
            athikaramTa: sampleKural.athikaram_ta,
            athikaramEn: sampleKural.athikaram_en,
          };
        }
      }
    }

    // Strip common prefix words for name matching: "அதிகாரம் அறிவுடைமை" -> "அறிவுடைமை", "chapter wisdom" -> "wisdom"
    const cleanedQuery = trimmed
      .replace(/^(?:chapter|அதிகாரம்|adhigaram|adhikaram|athikaram)\s+/i, '')
      .trim();

    if (!cleanedQuery || cleanedQuery.length < 2) return null;

    // Collect distinct chapters
    const chapterMap = new Map<number, { athikaramNum: number; athikaramTa: string; athikaramEn: string; athikaramTrans: string }>();
    for (const k of kurals) {
      if (!chapterMap.has(k.athikaram_num)) {
        chapterMap.set(k.athikaram_num, {
          athikaramNum: k.athikaram_num,
          athikaramTa: k.athikaram_ta,
          athikaramEn: k.athikaram_en,
          athikaramTrans: k.athikaram_trans || '',
        });
      }
    }

    // 2. Exact match check
    for (const ch of chapterMap.values()) {
      if (
        ch.athikaramTa.toLowerCase() === cleanedQuery ||
        ch.athikaramEn.toLowerCase() === cleanedQuery ||
        ch.athikaramTrans.toLowerCase() === cleanedQuery
      ) {
        return ch;
      }
    }

    // 3. High-confidence prefix / substring check (only if cleanedQuery >= 4 chars to avoid false positives)
    if (cleanedQuery.length >= 4) {
      for (const ch of chapterMap.values()) {
        const ta = ch.athikaramTa.toLowerCase();
        const en = ch.athikaramEn.toLowerCase();
        const trans = ch.athikaramTrans.toLowerCase();

        if (ta.startsWith(cleanedQuery) || en.startsWith(cleanedQuery) || trans.startsWith(cleanedQuery)) {
          return ch;
        }
      }
    }

    return null;
  }

  canHandle(query: string, kurals: Kural[]): boolean {
    return this.findAthikaram(query, kurals) !== null;
  }

  async execute(query: string, kurals: Kural[]): Promise<SearchStrategyResult | null> {
    const match = this.findAthikaram(query, kurals);
    if (!match) return null;

    // Retrieve all 10 kurals of this Athikaram in sequential order
    const chapterKurals = kurals
      .filter((k) => k.athikaram_num === match.athikaramNum)
      .sort((a, b) => a.id - b.id);

    if (chapterKurals.length === 0) return null;

    return {
      results: chapterKurals.map((kural) => ({
        kural,
        score: 1.0,
        confidence: 'high',
      })),
      meta: {
        type: 'athikaram',
        title: `அதிகாரம் ${match.athikaramNum}: ${match.athikaramTa}`,
        subtitle: `${match.athikaramEn} · 10 குறள்கள்`,
        athikaramNum: match.athikaramNum,
        count: chapterKurals.length,
      },
    };
  }
}
