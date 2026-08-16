import { IEmbeddingService } from './interfaces/embedding-service.interface';
import { ModelStatus, ModelDownloadProgress } from '../types/kural';
import { InboundWorkerMessage, OutboundWorkerMessage } from '../types/worker-messages';

export class WorkerEmbeddingService implements IEmbeddingService {
  private worker: Worker | null = null;
  private status: ModelStatus = 'uninitialized';
  private pendingRequests = new Map<
    string,
    { resolve: (v: Float32Array) => void; reject: (err: any) => void }
  >();
  private initPromise: Promise<void> | null = null;
  private progressCallbacks: Set<(p: ModelDownloadProgress) => void> = new Set();

  private getWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL('../worker.ts', import.meta.url), {
        type: 'module'
      });

      this.worker.onmessage = (event: MessageEvent<OutboundWorkerMessage>) => {
        const msg = event.data;

        if (msg.type === 'PROGRESS') {
          this.status = 'downloading';
          this.progressCallbacks.forEach((cb) => cb(msg.payload));
        } else if (msg.type === 'READY') {
          this.status = 'ready';
        } else if (msg.type === 'EMBED_COMPLETE') {
          const req = this.pendingRequests.get(msg.requestId);
          if (req) {
            this.pendingRequests.delete(msg.requestId);
            req.resolve(new Float32Array(msg.vector));
          }
        } else if (msg.type === 'ERROR') {
          if (msg.requestId) {
            const req = this.pendingRequests.get(msg.requestId);
            if (req) {
              this.pendingRequests.delete(msg.requestId);
              req.reject(new Error(msg.error));
            }
          } else {
            this.status = 'error';
          }
        }
      };

      this.worker.onerror = (err) => {
        console.error('Embedding worker error:', err);
        this.status = 'error';
      };
    }
    return this.worker;
  }

  async initialize(onProgress?: (progress: ModelDownloadProgress) => void): Promise<void> {
    if (this.status === 'ready') return;
    if (onProgress) {
      this.progressCallbacks.add(onProgress);
    }
    if (this.initPromise) return this.initPromise;

    this.status = 'downloading';
    const worker = this.getWorker();

    this.initPromise = new Promise<void>((resolve, reject) => {
      const handler = (event: MessageEvent<OutboundWorkerMessage>) => {
        if (event.data.type === 'READY') {
          this.status = 'ready';
          worker.removeEventListener('message', handler);
          resolve();
        } else if (event.data.type === 'ERROR' && !event.data.requestId) {
          this.status = 'error';
          worker.removeEventListener('message', handler);
          reject(new Error(event.data.error));
        }
      };

      worker.addEventListener('message', handler);
      const initMsg: InboundWorkerMessage = { type: 'INIT' };
      worker.postMessage(initMsg);
    });

    return this.initPromise;
  }

  async embed(text: string): Promise<Float32Array> {
    if (this.status !== 'ready') {
      await this.initialize();
    }
    const worker = this.getWorker();
    const requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    return new Promise<Float32Array>((resolve, reject) => {
      this.pendingRequests.set(requestId, { resolve, reject });
      const msg: InboundWorkerMessage = {
        type: 'EMBED',
        query: text,
        requestId
      };
      worker.postMessage(msg);
    });
  }

  getStatus(): ModelStatus {
    return this.status;
  }

  dispose(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.status = 'uninitialized';
    this.pendingRequests.clear();
    this.progressCallbacks.clear();
  }
}
