import { IKuralRetrievalService } from './interfaces/retrieval-service.interface';
import { IKuralDataSource } from './interfaces/data-source.interface';
import { IVectorIndex } from './interfaces/vector-index.interface';
import { IEmbeddingService } from './interfaces/embedding-service.interface';
import { SearchResult, ModelDownloadProgress, ModelStatus } from '../types/kural';

export class KuralRetrievalService implements IKuralRetrievalService {
  constructor(
    private dataSource: IKuralDataSource,
    private vectorIndex: IVectorIndex,
    private embeddingService: IEmbeddingService
  ) {}

  async initialize(onProgress?: (progress: ModelDownloadProgress) => void): Promise<void> {
    await Promise.all([
      this.dataSource.load(),
      this.vectorIndex.load(),
      this.embeddingService.initialize(onProgress),
    ]);
  }

  async search(query: string, topK: number = 3): Promise<SearchResult[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    // Ensure data and index are loaded
    if (!this.dataSource.isLoaded()) {
      await this.dataSource.load();
    }
    if (!this.vectorIndex.isLoaded()) {
      await this.vectorIndex.load();
    }

    // 1. Vectorize query
    const queryVector = await this.embeddingService.embed(trimmed);

    // 2. Query nearest neighbor vector index
    const matches = await this.vectorIndex.search(queryVector, topK);

    // 3. Map indices to Kurals and assign confidence tiers
    const results: SearchResult[] = [];
    for (const match of matches) {
      const kuralId = match.index + 1; // 1-indexed Kural ID
      const kural = this.dataSource.getKuralById(kuralId);
      if (kural) {
        let confidence: 'high' | 'moderate' | 'low' = 'low';
        if (match.score >= 0.55) {
          confidence = 'high';
        } else if (match.score >= 0.35) {
          confidence = 'moderate';
        }

        results.push({
          kural,
          score: Math.min(1.0, Math.max(0.0, match.score)),
          confidence,
        });
      }
    }

    return results;
  }

  isReady(): boolean {
    return (
      this.dataSource.isLoaded() &&
      this.vectorIndex.isLoaded() &&
      this.embeddingService.getStatus() === 'ready'
    );
  }

  getModelStatus(): ModelStatus {
    return this.embeddingService.getStatus();
  }
}
