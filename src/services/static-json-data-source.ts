import { Kural } from '../types/kural';
import { IKuralDataSource } from './interfaces/data-source.interface';

export class StaticJsonKuralDataSource implements IKuralDataSource {
  private kurals: Kural[] = [];
  private kuralMap = new Map<number, Kural>();
  private loaded = false;
  private loadPromise: Promise<void> | null = null;

  constructor(private jsonUrl: string = '/kurals.json') {}

  async load(): Promise<void> {
    if (this.loaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      const response = await fetch(this.jsonUrl);
      if (!response.ok) {
        throw new Error(`Failed to load Kural dataset: ${response.status} ${response.statusText}`);
      }
      const data: Kural[] = await response.json();
      this.kurals = data;
      this.kuralMap.clear();
      for (const k of data) {
        this.kuralMap.set(k.id, k);
      }
      this.loaded = true;
    })();

    return this.loadPromise;
  }

  getAllKurals(): Kural[] {
    return this.kurals;
  }

  getKuralById(id: number): Kural | null {
    return this.kuralMap.get(id) || null;
  }

  isLoaded(): boolean {
    return this.loaded;
  }
}
