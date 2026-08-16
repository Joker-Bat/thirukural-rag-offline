import { IKuralDataSource } from './interfaces/data-source.interface';
import { IVectorIndex } from './interfaces/vector-index.interface';
import { IEmbeddingService } from './interfaces/embedding-service.interface';
import { IKuralRetrievalService } from './interfaces/retrieval-service.interface';
import { ISpeechService } from './interfaces/speech-service.interface';

import { StaticJsonKuralDataSource } from './static-json-data-source';
import { FlatBinaryCosineVectorIndex } from './flat-binary-vector-index';
import { WorkerEmbeddingService } from './worker-embedding-service';
import { KuralRetrievalService } from './kural-retrieval-service';
import { WebSpeechService } from './web-speech-service';

// Multi-route search strategies
import { DirectNumberStrategy } from './strategies/direct-number-strategy';
import { AthikaramStrategy } from './strategies/athikaram-strategy';
import { SemanticRagStrategy } from './strategies/semantic-rag-strategy';

export interface IServiceContainer {
  dataSource: IKuralDataSource;
  vectorIndex: IVectorIndex;
  embeddingService: IEmbeddingService;
  retrievalService: IKuralRetrievalService;
  speechService: ISpeechService;
}

export function createDefaultServiceContainer(): IServiceContainer {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  const dataSource = new StaticJsonKuralDataSource(`${base}kurals.json`);
  const vectorIndex = new FlatBinaryCosineVectorIndex(`${base}kural-embeddings.bin`);
  const embeddingService = new WorkerEmbeddingService();

  // Multi-route search strategy pipeline
  const strategies = [
    new DirectNumberStrategy(),
    new AthikaramStrategy(),
    new SemanticRagStrategy(embeddingService, vectorIndex),
  ];

  const retrievalService = new KuralRetrievalService(
    dataSource,
    vectorIndex,
    embeddingService,
    strategies
  );
  const speechService = new WebSpeechService();

  return {
    dataSource,
    vectorIndex,
    embeddingService,
    retrievalService,
    speechService,
  };
}

// Global default container instance
export const defaultContainer = createDefaultServiceContainer();
