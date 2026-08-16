/// <reference lib="webworker" />

import { pipeline, env } from '@huggingface/transformers';
import { InboundWorkerMessage, OutboundWorkerMessage } from './types/worker-messages';

// Configure transformers.js for browser environment
env.allowLocalModels = false;
env.useBrowserCache = typeof self !== 'undefined' && 'caches' in self && Boolean(self.isSecureContext);
env.useCustomCache = false;

const MODEL_ID = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';

// Maintain single pipeline instance
let extractorPromise: Promise<any> | null = null;

async function getExtractor(): Promise<any> {
  if (!extractorPromise) {
    extractorPromise = pipeline(
      'feature-extraction',
      MODEL_ID,
      {
        dtype: 'q8',
        progress_callback: (progressData: any) => {
          const msg: OutboundWorkerMessage = {
            type: 'PROGRESS',
            payload: {
              status: progressData.status || 'downloading',
              file: progressData.file || '',
              progress: typeof progressData.progress === 'number' ? progressData.progress : undefined,
              loaded: progressData.loaded,
              total: progressData.total,
            }
          };
          self.postMessage(msg);
        }
      }
    );
  }
  return extractorPromise;
}

self.addEventListener('message', async (event: MessageEvent<InboundWorkerMessage>) => {
  const data = event.data;

  if (data.type === 'INIT') {
    try {
      await getExtractor();
      const readyMsg: OutboundWorkerMessage = { type: 'READY' };
      self.postMessage(readyMsg);
    } catch (err: any) {
      console.error('Worker init error:', err);
      const errMsg: OutboundWorkerMessage = {
        type: 'ERROR',
        error: err?.message || 'Failed to initialize embedding model'
      };
      self.postMessage(errMsg);
    }
  } else if (data.type === 'EMBED') {
    const { query, requestId } = data;
    try {
      const extractor = await getExtractor();
      // Generate pooled & L2-normalized 384-d vector
      const output = await extractor(query, { pooling: 'mean', normalize: true });
      const vectorData = Array.from(output.data as Float32Array);

      const completeMsg: OutboundWorkerMessage = {
        type: 'EMBED_COMPLETE',
        vector: vectorData,
        requestId,
      };
      self.postMessage(completeMsg);
    } catch (err: any) {
      console.error('Worker inference error:', err);
      const errMsg: OutboundWorkerMessage = {
        type: 'ERROR',
        error: err?.message || 'Inference failure',
        requestId,
      };
      self.postMessage(errMsg);
    }
  }
});
