import { SearchResult, ModelDownloadProgress, ModelStatus } from '../../types/kural';

export interface IKuralRetrievalService {
  /**
   * Initializes the underlying data source, vector index, and embedding service.
   */
  initialize(onProgress?: (progress: ModelDownloadProgress) => void): Promise<void>;

  /**
   * Performs end-to-end semantic retrieval for a user query.
   * Vectorizes query, computes similarities, and joins with Kural metadata.
   */
  search(query: string, topK?: number): Promise<SearchResult[]>;

  /**
   * Checks if retrieval system is ready.
   */
  isReady(): boolean;

  /**
   * Gets current model status.
   */
  getModelStatus(): ModelStatus;
}
