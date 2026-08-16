import { ModelDownloadProgress } from './kural';

export type InboundWorkerMessage =
  | { type: 'INIT' }
  | { type: 'EMBED'; query: string; requestId: string };

export type OutboundWorkerMessage =
  | { type: 'PROGRESS'; payload: ModelDownloadProgress }
  | { type: 'READY' }
  | { type: 'EMBED_COMPLETE'; vector: number[]; requestId: string }
  | { type: 'ERROR'; error: string; requestId?: string };
