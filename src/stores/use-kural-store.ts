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
  showDownloadModal: false,
  expandedRelated: false,
  activeSpeechId: null,
  isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,

  setQuery: (query) => set({ query }),
  setIsSearching: (isSearching) => set({ isSearching }),
  setResults: (results) => set({ results, hasSearched: true, isSearching: false }),
  setModelStatus: (modelStatus) => set({ modelStatus }),
  handleProgress: (p) => {
    let pct = 0;
    if (typeof p.progress === 'number') {
      pct = Math.round(p.progress);
    } else if (p.loaded && p.total && p.total > 0) {
      pct = Math.round((p.loaded / p.total) * 100);
    }
    set({
      modelStatus: 'downloading',
      downloadProgress: Math.min(100, Math.max(0, pct)),
      currentLoadingFile: p.file || undefined,
    });
  },
  setShowDownloadModal: (showDownloadModal) => set({ showDownloadModal }),
  setExpandedRelated: (expandedRelated) => set({ expandedRelated }),
  toggleExpandedRelated: () => set((state) => ({ expandedRelated: !state.expandedRelated })),
  setActiveSpeechId: (activeSpeechId) => set({ activeSpeechId }),
  setIsOffline: (isOffline) => set({ isOffline }),
  resetSearch: () => set({ query: '', results: [], hasSearched: false, expandedRelated: false }),
}));
