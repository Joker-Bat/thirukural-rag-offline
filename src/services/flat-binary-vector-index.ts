import { VectorMatch } from '../types/kural';
import { IVectorIndex } from './interfaces/vector-index.interface';

const EMBEDDING_DIM = 384;
const TOTAL_KURALS = 1330;

export class FlatBinaryCosineVectorIndex implements IVectorIndex {
  private matrix: Float32Array | null = null;
  private loaded = false;
  private loadPromise: Promise<void> | null = null;

  constructor(
    private binUrl: string = '/kural-embeddings.bin',
    private dim: number = EMBEDDING_DIM,
    private totalVectors: number = TOTAL_KURALS
  ) {}

  async load(): Promise<void> {
    if (this.loaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      const response = await fetch(this.binUrl);
      if (!response.ok) {
        throw new Error(`Failed to load binary embeddings: ${response.status} ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();
      const floatCount = buffer.byteLength / 4;
      
      if (floatCount < this.totalVectors * this.dim) {
        throw new Error(`Invalid binary vector size: got ${floatCount} floats, expected ${this.totalVectors * this.dim}`);
      }

      this.matrix = new Float32Array(buffer);
      this.loaded = true;
    })();

    return this.loadPromise;
  }

  async search(queryVector: Float32Array | number[], topK: number = 3): Promise<VectorMatch[]> {
    if (!this.loaded || !this.matrix) {
      await this.load();
    }
    const matrix = this.matrix!;
    const dim = this.dim;
    const total = this.totalVectors;

    // Direct in-memory dot product
    const matches: VectorMatch[] = new Array(total);
    for (let i = 0; i < total; i++) {
      let dot = 0.0;
      const offset = i * dim;
      for (let d = 0; d < dim; d++) {
        dot += queryVector[d] * matrix[offset + d];
      }
      matches[i] = {
        index: i, // 0-indexed (maps to Kural ID: index + 1)
        score: dot,
      };
    }

    // Sort descending by similarity score
    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, topK);
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  count(): number {
    return this.totalVectors;
  }
}
