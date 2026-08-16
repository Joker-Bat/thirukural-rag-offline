import { Kural, SearchResult } from '../../types/kural';

export interface SearchStrategyMeta {
  type: 'direct_kural' | 'athikaram' | 'semantic';
  title?: string;
  subtitle?: string;
  athikaramNum?: number;
  count?: number;
}

export interface SearchStrategyResult {
  results: SearchResult[];
  meta?: SearchStrategyMeta;
}

export interface ISearchStrategy {
  readonly name: string;
  canHandle(query: string, kurals: Kural[]): boolean;
  execute(query: string, kurals: Kural[], topK?: number): Promise<SearchStrategyResult | null>;
}
