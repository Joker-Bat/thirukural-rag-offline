import { ModelStatus, ModelDownloadProgress } from '../../types/kural';

export interface IEmbeddingService {
  /**
   * Initializes the embedding model runtime (e.g. downloading ONNX or starting worker).
   */
  initialize(onProgress?: (progress: ModelDownloadProgress) => void): Promise<void>;

  /**
   * Computes normalized 384-dimensional dense vector for a query text.
   */
  embed(text: string): Promise<Float32Array>;

  /**
   * Gets current lifecycle status of the model.
   */
  getStatus(): ModelStatus;

  /**
   * Cleans up worker and listeners.
   */
  dispose(): void;
}
