export interface KuralUrais {
  mu_va: string;       // Dr. Mu. Varadarajan
  pappaiah: string;    // Solomon Pappaiah
  karunanidhi: string; // Kalaignar M. Karunanidhi
}

export interface Kural {
  id: number;
  line1: string;
  line2: string;
  modern_en?: string;
  translation_en: string;
  explanation_en: string;
  couplet_en: string;
  transliteration1: string;
  transliteration2: string;
  pal_ta: string;
  pal_en: string;
  pal_trans: string;
  iyal_ta: string;
  iyal_en: string;
  iyal_trans: string;
  athikaram_num: number;
  athikaram_ta: string;
  athikaram_en: string;
  athikaram_trans: string;
  urais: KuralUrais;
}

export interface VectorMatch {
  index: number;
  score: number;
}

export interface SearchMeta {
  type: 'direct_kural' | 'athikaram' | 'semantic';
  title?: string;
  subtitle?: string;
  athikaramNum?: number;
  count?: number;
}

export interface SearchResult {
  kural: Kural;
  score: number;
  confidence: 'high' | 'moderate' | 'low';
}

export type ModelStatus = 'uninitialized' | 'downloading' | 'ready' | 'error';

export interface ModelDownloadProgress {
  status: string;
  file?: string;
  progress?: number;
  loaded?: number;
  total?: number;
}
