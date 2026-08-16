import { SearchResult, SearchMeta, ModelDownloadProgress, ModelStatus } from '../../types/kural';
import { SearchStrategyResult } from './search-strategy.interface';

export interface IKuralRetrievalService {
  /**
   * Initializes the underlying data source, vector index, and embedding service.
   */
  initialize(onProgress?: (progress: ModelDownloadProgress) => void): Promise<void>;

  /**
   * Performs end-to-end multi-route retrieval for a user query.
   * Returns top matching results.
   */
  search(query: string, topK?: number): Promise<SearchResult[]>;

  /**
   * Performs multi-route retrieval and returns both results and route metadata.
   */
  searchDetailed(query: string, topK?: number): Promise<SearchStrategyResult>;

  /**
   * Gets metadata from the last performed search.
   */
  getLastSearchMeta(): SearchMeta | null;

  /**
   * Checks if retrieval system is ready.
   */
  isReady(): boolean;

  /**
   * Gets current model status.
   */
  getModelStatus(): ModelStatus;
}
