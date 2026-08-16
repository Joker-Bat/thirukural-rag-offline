import { create } from 'zustand';
import { SearchResult, ModelStatus, ModelDownloadProgress } from '../types/kural';

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

export const useKuralStore = create<KuralState>((set) => ({
  query: '',
  isSearching: false,
  hasSearched: false,
  results: [],
  modelStatus: 'uninitialized',
  downloadProgress: 0,
  currentLoadingFile: undefined,
  showDownloadModal: true, // Default open on startup for transparent first-time setup
  expandedRelated: false,
  activeSpeechId: null,
  isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,

  setQuery: (query) => set({ query }),
  setIsSearching: (isSearching) => set({ isSearching }),
  setResults: (results) => set({ results, hasSearched: true, isSearching: false }),
  setModelStatus: (modelStatus) =>
    set((state) => ({
      modelStatus,
      downloadProgress: modelStatus === 'ready' ? 100 : state.downloadProgress,
    })),
  handleProgress: (p) => {
    set((state) => {
      let rawPct = 0;
      if (typeof p.progress === 'number') {
        rawPct = p.progress;
      } else if (p.loaded && p.total && p.total > 0) {
        rawPct = (p.loaded / p.total) * 100;
      }

      // Calculate smooth monotonic percentage across all model sub-files
      let effectivePct = state.downloadProgress;
      const fileName = p.file || '';

      if (fileName.includes('.onnx') || fileName.includes('model')) {
        // Main ONNX model takes 10% - 95%
        effectivePct = Math.max(state.downloadProgress, Math.round(10 + rawPct * 0.85));
      } else if (fileName.includes('tokenizer') || fileName.includes('json')) {
        // Tokenizer/config takes 2% - 10%
        effectivePct = Math.max(state.downloadProgress, Math.min(10, Math.round(rawPct * 0.1)));
      } else {
        effectivePct = Math.max(state.downloadProgress, Math.round(rawPct));
      }

      return {
        modelStatus: 'downloading',
        downloadProgress: Math.min(99, Math.max(state.downloadProgress, effectivePct)),
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
