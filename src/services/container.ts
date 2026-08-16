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

export interface IServiceContainer {
  dataSource: IKuralDataSource;
  vectorIndex: IVectorIndex;
  embeddingService: IEmbeddingService;
  retrievalService: IKuralRetrievalService;
  speechService: ISpeechService;
}

export function createDefaultServiceContainer(): IServiceContainer {
  const dataSource = new StaticJsonKuralDataSource('/kurals.json');
  const vectorIndex = new FlatBinaryCosineVectorIndex('/kural-embeddings.bin');
  const embeddingService = new WorkerEmbeddingService();
  const retrievalService = new KuralRetrievalService(dataSource, vectorIndex, embeddingService);
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
