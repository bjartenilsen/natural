/**
 * Wine repository for managing wine data persistence
 */

import { WineRecord, WineRecordRow } from '../types/WineTypes';
import { StorageError } from '../types/ErrorTypes';
import { DatabaseService } from './DatabaseService';
import { wineRecordToRow, rowToWineRecord, validateWineRecord, generateWineId } from './DatabaseUtils';

export class WineRepository {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  /**
   * Save a wine record to the database
   */
  async saveWine(wine: WineRecord): Promise<void> {
    try {
      // Validate wine record
      const validation = validateWineRecord(wine);
      if (!validation.isValid) {
        throw new Error(`Invalid wine record: ${validation.errors.join(', ')}`);
      }

      const db = this.dbService.getDatabase();
      const row = wineRecordToRow(wine);

      await db.runAsync(
        `INSERT OR REPLACE INTO wines (
          id, image_uri, is_natural_wine, confidence_score, explanation,
          consumed, latitude, longitude, location_accuracy, notes,
          created_at, analysis_timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          row.id,
          row.image_uri,
          row.is_natural_wine,
          row.confidence_score,
          row.explanation,
          row.consumed,
          row.latitude ?? null,
          row.longitude ?? null,
          row.location_accuracy ?? null,
          row.notes ?? null,
          row.created_at,
          row.analysis_timestamp
        ]
      );
    } catch (error) {
      const storageError: StorageError = {
        type: 'storage',
        message: `Failed to save wine record: ${error}`,
        recoverable: true,
        operation: 'write',
        originalError: error instanceof Error ? error : new Error(String(error))
      };
      throw storageError;
    }
  }

  /**
   * Get all wine records from the database
   */
  async getAllWines(): Promise<WineRecord[]> {
    try {
      const db = this.dbService.getDatabase();
      const rows = await db.getAllAsync<WineRecordRow>(
        'SELECT * FROM wines ORDER BY created_at DESC'
      );

      return rows.map(rowToWineRecord);
    } catch (error) {
      const storageError: StorageError = {
        type: 'storage',
        message: `Failed to retrieve wine records: ${error}`,
        recoverable: true,
        operation: 'read',
        originalError: error instanceof Error ? error : new Error(String(error))
      };
      throw storageError;
    }
  }

  /**
   * Get a specific wine record by ID
   */
  async getWineById(id: string): Promise<WineRecord | null> {
    try {
      const db = this.dbService.getDatabase();
      const row = await db.getFirstAsync<WineRecordRow>(
        'SELECT * FROM wines WHERE id = ?',
        [id]
      );

      return row ? rowToWineRecord(row) : null;
    } catch (error) {
      const storageError: StorageError = {
        type: 'storage',
        message: `Failed to retrieve wine record: ${error}`,
        recoverable: true,
        operation: 'read',
        originalError: error instanceof Error ? error : new Error(String(error))
      };
      throw storageError;
    }
  }

  /**
   * Delete a wine record from the database
   */
  async deleteWine(id: string): Promise<void> {
    try {
      const db = this.dbService.getDatabase();
      const result = await db.runAsync('DELETE FROM wines WHERE id = ?', [id]);
      
      if (result.changes === 0) {
        throw new Error(`Wine record with ID ${id} not found`);
      }
    } catch (error) {
      const storageError: StorageError = {
        type: 'storage',
        message: `Failed to delete wine record: ${error}`,
        recoverable: false,
        operation: 'delete',
        originalError: error instanceof Error ? error : new Error(String(error))
      };
      throw storageError;
    }
  }

  /**
   * Get wines filtered by consumption status
   */
  async getWinesByConsumption(consumed: boolean): Promise<WineRecord[]> {
    try {
      const db = this.dbService.getDatabase();
      const rows = await db.getAllAsync<WineRecordRow>(
        'SELECT * FROM wines WHERE consumed = ? ORDER BY created_at DESC',
        [consumed ? 1 : 0]
      );

      return rows.map(rowToWineRecord);
    } catch (error) {
      const storageError: StorageError = {
        type: 'storage',
        message: `Failed to retrieve wines by consumption status: ${error}`,
        recoverable: true,
        operation: 'read',
        originalError: error instanceof Error ? error : new Error(String(error))
      };
      throw storageError;
    }
  }

  /**
   * Get wines filtered by natural wine status
   */
  async getWinesByNaturalStatus(isNatural: boolean): Promise<WineRecord[]> {
    try {
      const db = this.dbService.getDatabase();
      const rows = await db.getAllAsync<WineRecordRow>(
        'SELECT * FROM wines WHERE is_natural_wine = ? ORDER BY created_at DESC',
        [isNatural ? 1 : 0]
      );

      return rows.map(rowToWineRecord);
    } catch (error) {
      const storageError: StorageError = {
        type: 'storage',
        message: `Failed to retrieve wines by natural status: ${error}`,
        recoverable: true,
        operation: 'read',
        originalError: error instanceof Error ? error : new Error(String(error))
      };
      throw storageError;
    }
  }

  /**
   * Search wines by notes content
   */
  async searchWinesByNotes(searchTerm: string): Promise<WineRecord[]> {
    try {
      const db = this.dbService.getDatabase();
      const rows = await db.getAllAsync<WineRecordRow>(
        'SELECT * FROM wines WHERE notes LIKE ? ORDER BY created_at DESC',
        [`%${searchTerm}%`]
      );

      return rows.map(rowToWineRecord);
    } catch (error) {
      const storageError: StorageError = {
        type: 'storage',
        message: `Failed to search wines by notes: ${error}`,
        recoverable: true,
        operation: 'read',
        originalError: error instanceof Error ? error : new Error(String(error))
      };
      throw storageError;
    }
  }

  /**
   * Get wine statistics
   */
  async getWineStats(): Promise<{ total: number; consumed: number; natural: number }> {
    try {
      const stats = await this.dbService.getStats();
      return {
        total: stats.totalWines,
        consumed: stats.consumedWines,
        natural: stats.naturalWines
      };
    } catch (error) {
      const storageError: StorageError = {
        type: 'storage',
        message: `Failed to retrieve wine statistics: ${error}`,
        recoverable: true,
        operation: 'read',
        originalError: error instanceof Error ? error : new Error(String(error))
      };
      throw storageError;
    }
  }
}