import { IKuralRetrievalService } from './interfaces/retrieval-service.interface';
import { IKuralDataSource } from './interfaces/data-source.interface';
import { IVectorIndex } from './interfaces/vector-index.interface';
import { IEmbeddingService } from './interfaces/embedding-service.interface';
import { ISearchStrategy, SearchStrategyResult } from './interfaces/search-strategy.interface';
import { SearchResult, SearchMeta, ModelDownloadProgress, ModelStatus } from '../types/kural';

export class KuralRetrievalService implements IKuralRetrievalService {
  private lastSearchMeta: SearchMeta | null = null;

  constructor(
    private dataSource: IKuralDataSource,
    private vectorIndex: IVectorIndex,
    private embeddingService: IEmbeddingService,
    private strategies: ISearchStrategy[] = []
  ) {}

  async initialize(onProgress?: (progress: ModelDownloadProgress) => void): Promise<void> {
    await Promise.all([
      this.dataSource.load(),
      this.vectorIndex.load(),
      this.embeddingService.initialize(onProgress),
    ]);
  }

  async search(query: string, topK: number = 3): Promise<SearchResult[]> {
    const envelope = await this.searchDetailed(query, topK);
    return envelope.results;
  }

  async searchDetailed(query: string, topK: number = 3): Promise<SearchStrategyResult> {
    const trimmed = query.trim();
    if (!trimmed) {
      this.lastSearchMeta = null;
      return { results: [] };
    }

    // Ensure data source is loaded
    if (!this.dataSource.isLoaded()) {
      await this.dataSource.load();
    }

    const allKurals = this.dataSource.getAllKurals();

    // Iterate through injected search strategies in priority order
    for (const strategy of this.strategies) {
      if (strategy.canHandle(trimmed, allKurals)) {
        // If the strategy requires vector embeddings (like SemanticRagStrategy), ensure index & worker are ready
        if (strategy.name === 'SemanticRagStrategy') {
          if (!this.vectorIndex.isLoaded()) {
            await this.vectorIndex.load();
          }
        }

        const strategyResult = await strategy.execute(trimmed, allKurals, topK);
        if (strategyResult && strategyResult.results.length > 0) {
          this.lastSearchMeta = strategyResult.meta || null;
          return strategyResult;
        }
      }
    }

    this.lastSearchMeta = null;
    return { results: [] };
  }

  getLastSearchMeta(): SearchMeta | null {
    return this.lastSearchMeta;
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
