import { Kural } from '../../types/kural';

export interface IKuralDataSource {
  /**
   * Initializes and loads Kural records into memory.
   */
  load(): Promise<void>;

  /**
   * Retrieves all loaded Kural records.
   */
  getAllKurals(): Kural[];

  /**
   * Retrieves a specific Kural by its 1-indexed number (1 to 1330).
   */
  getKuralById(id: number): Kural | null;

  /**
   * Checks if data source is loaded.
   */
  isLoaded(): boolean;
}
