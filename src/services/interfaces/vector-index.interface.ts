import { VectorMatch } from '../../types/kural';

export interface IVectorIndex {
  /**
   * Loads or initializes the vector index buffer.
   */
  load(): Promise<void>;

  /**
   * Computes top-K nearest neighbors using cosine similarity.
   * @param queryVector 384-dimensional normalized vector
   * @param topK number of top matches to return
   */
  search(queryVector: Float32Array | number[], topK?: number): Promise<VectorMatch[]>;

  /**
   * Returns whether index is loaded in memory.
   */
  isLoaded(): boolean;

  /**
   * Total number of indexed vectors.
   */
  count(): number;
}
