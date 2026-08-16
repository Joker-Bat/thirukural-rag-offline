import { create } from 'zustand';
import { SearchResult, ModelStatus, ModelDownloadProgress } from '../types/kural';

const STORAGE_KEY = 'thirukural_model_cached_v1';

const isAlreadyCached = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

interface KuralState {
  query: string;
  isSearching: boolean;
  hasSearched: boolean;
  results: SearchResult[];
  modelStatus: ModelStatus;
  downloadProgress: number;
  currentLoadingFile?: string;
  showDownloadModal: boolean;
  expandedRelated: boolean;
  activeSpeechId: number | null;
  isOffline: boolean;

  // Actions
  setQuery: (query: string) => void;
  setIsSearching: (isSearching: boolean) => void;
  setResults: (results: SearchResult[]) => void;
  setModelStatus: (status: ModelStatus) => void;
  handleProgress: (progress: ModelDownloadProgress) => void;
  setShowDownloadModal: (show: boolean) => void;
  setExpandedRelated: (expanded: boolean) => void;
  toggleExpandedRelated: () => void;
  setActiveSpeechId: (id: number | null) => void;
  setIsOffline: (isOffline: boolean) => void;
  resetSearch: () => void;
}

const alreadyDownloaded = isAlreadyCached();

export const useKuralStore = create<KuralState>((set) => ({
  query: '',
  isSearching: false,
  hasSearched: false,
  results: [],
  // If already downloaded, start as ready/uninitialized without showing modal
  modelStatus: alreadyDownloaded ? 'ready' : 'uninitialized',
  downloadProgress: alreadyDownloaded ? 100 : 0,
  currentLoadingFile: undefined,
  showDownloadModal: !alreadyDownloaded,
  expandedRelated: false,
  activeSpeechId: null,
  isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,

  setQuery: (query) => set({ query }),
  setIsSearching: (isSearching) => set({ isSearching }),
  setResults: (results) => set({ results, hasSearched: true, isSearching: false }),
  setModelStatus: (modelStatus) => {
    if (modelStatus === 'ready') {
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch (e) {
        console.warn('localStorage error', e);
      }
    }
    set((state) => ({
      modelStatus,
      downloadProgress: modelStatus === 'ready' ? 100 : state.downloadProgress,
    }));
  },
  handleProgress: (p) => {
    set((state) => {
      let rawPct = 0;
      if (typeof p.progress === 'number' && !isNaN(p.progress)) {
        rawPct = p.progress;
      } else if (p.loaded && p.total && p.total > 0) {
        rawPct = (p.loaded / p.total) * 100;
      }

      let currentPct = state.downloadProgress;
      const file = p.file || '';

      if (file.includes('onnx') || file.includes('model')) {
        currentPct = Math.max(currentPct, Math.round(5 + rawPct * 0.90));
      } else if (file.includes('tokenizer') || file.includes('json')) {
        currentPct = Math.max(currentPct, Math.min(5, Math.round(rawPct * 0.05)));
      } else if (p.status === 'done') {
        currentPct = Math.max(currentPct, 95);
      }

      return {
        modelStatus: 'downloading',
        downloadProgress: Math.min(99, Math.max(state.downloadProgress, currentPct)),
        currentLoadingFile: p.file || state.currentLoadingFile,
      };
    });
  },
  setShowDownloadModal: (showDownloadModal) => set({ showDownloadModal }),
  setExpandedRelated: (expandedRelated) => set({ expandedRelated }),
  toggleExpandedRelated: () => set((state) => ({ expandedRelated: !state.expandedRelated })),
  setActiveSpeechId: (activeSpeechId) => set({ activeSpeechId }),
  setIsOffline: (isOffline) => set({ isOffline }),
  resetSearch: () => set({ query: '', results: [], hasSearched: false, expandedRelated: false }),
}));
