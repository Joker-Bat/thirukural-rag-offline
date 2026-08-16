import { Kural, SearchResult } from '../../types/kural';
import { IEmbeddingService } from '../interfaces/embedding-service.interface';
import { IVectorIndex } from '../interfaces/vector-index.interface';
import { ISearchStrategy, SearchStrategyResult } from '../interfaces/search-strategy.interface';

export class SemanticRagStrategy implements ISearchStrategy {
  readonly name = 'SemanticRagStrategy';

  constructor(
    private embeddingService: IEmbeddingService,
    private vectorIndex: IVectorIndex
  ) {}

  canHandle(query: string): boolean {
    return query.trim().length > 0;
  }

  async execute(query: string, kurals: Kural[], topK: number = 3): Promise<SearchStrategyResult | null> {
    const trimmed = query.trim();
    if (!trimmed) return null;

    // 1. Generate query embedding
    const queryVector = await this.embeddingService.embed(trimmed);

    // 2. Query nearest neighbor binary vector index (fetch extra candidates for scoring)
    const rawMatches = await this.vectorIndex.search(queryVector, Math.max(topK, 5));

    // 3. Map indices to Kurals, apply keyword synergy, and assign calibrated confidence tiers
    const queryLower = trimmed.toLowerCase();
    const queryTokens = queryLower.split(/\s+/).filter((t) => t.length > 2);

    const scoredResults: SearchResult[] = [];

    for (const match of rawMatches) {
      const kuralId = match.index + 1; // 1-indexed Kural ID
      const kural = kurals.find((k) => k.id === kuralId);
      if (!kural) continue;

      let finalScore = match.score;

      // Keyword boost: If exact keywords appear in the couplet, modern English, or chapter
      if (queryTokens.length > 0) {
        const fullText = [
          kural.line1,
          kural.line2,
          kural.modern_en || '',
          kural.translation_en,
          kural.athikaram_ta,
          kural.athikaram_en,
          kural.urais.mu_va,
          kural.urais.pappaiah,
        ]
          .join(' ')
          .toLowerCase();

        let matchCount = 0;
        for (const token of queryTokens) {
          if (fullText.includes(token)) matchCount++;
        }

        if (matchCount > 0) {
          const boost = Math.min(0.15, (matchCount / queryTokens.length) * 0.12);
          finalScore = Math.min(1.0, finalScore + boost);
        }
      }

      let confidence: 'high' | 'moderate' | 'low' = 'low';
      if (finalScore >= 0.40) {
        confidence = 'high';
      } else if (finalScore >= 0.25) {
        confidence = 'moderate';
      }

      scoredResults.push({
        kural,
        score: Math.min(1.0, Math.max(0.0, finalScore)),
        confidence,
      });
    }

    // Sort by final score descending and take topK
    scoredResults.sort((a, b) => b.score - a.score);
    const finalResults = scoredResults.slice(0, topK);

    return {
      results: finalResults,
      meta: {
        type: 'semantic',
        title: 'சூழ்நிலை வழிகாட்டல் (Situational Guidance)',
        count: finalResults.length,
      },
    };
  }
}
