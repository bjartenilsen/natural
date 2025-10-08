/**
 * Wine repository for managing wine data persistence
 */

import { WineRecord, WineRecordRow } from '../types/WineTypes';
import { StorageError } from '../types/ErrorTypes';
import { DatabaseService } from './DatabaseService';
import { wineRecordToRow, rowToWineRecord, validateWineRecord, generateWineId } from './DatabaseUtils';
import { ErrorHandler } from '../utils/errorHandler';
import { NetworkService } from '../services/NetworkService';

export class WineRepository {
  private dbService: DatabaseService;
  private networkService: NetworkService;

  constructor() {
    this.dbService = DatabaseService.getInstance();
    this.networkService = NetworkService.getInstance();
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
      const storageError = ErrorHandler.createStorageError({
        message: `Failed to save wine record: ${error}`,
        recoverable: true,
        timestamp: new Date(),
        operation: 'write',
        context: { wineId: wine.id, error: (error as Error)?.message }
      });
      
      ErrorHandler.logError(storageError);
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
      const storageError = ErrorHandler.createStorageError({
        message: `Failed to retrieve wine records: ${error}`,
        recoverable: true,
        timestamp: new Date(),
        operation: 'read',
        context: { error: (error as Error)?.message }
      });
      
      ErrorHandler.logError(storageError);
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
      const storageError = ErrorHandler.createStorageError({
        message: `Failed to retrieve wine record: ${error}`,
        recoverable: true,
        timestamp: new Date(),
        operation: 'read',
        context: { wineId: id, error: (error as Error)?.message }
      });
      
      ErrorHandler.logError(storageError);
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
      const storageError = ErrorHandler.createStorageError({
        message: `Failed to delete wine record: ${error}`,
        recoverable: false,
        timestamp: new Date(),
        operation: 'delete',
        context: { wineId: id, error: (error as Error)?.message }
      });
      
      ErrorHandler.logError(storageError);
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
      const storageError = ErrorHandler.createStorageError({
        message: `Failed to retrieve wines by consumption status: ${error}`,
        recoverable: true,
        timestamp: new Date(),
        operation: 'read',
        context: { consumed, error: (error as Error)?.message }
      });
      
      ErrorHandler.logError(storageError);
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
      const storageError = ErrorHandler.createStorageError({
        message: `Failed to retrieve wines by natural status: ${error}`,
        recoverable: true,
        timestamp: new Date(),
        operation: 'read',
        context: { isNatural, error: (error as Error)?.message }
      });
      
      ErrorHandler.logError(storageError);
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
      const storageError = ErrorHandler.createStorageError({
        message: `Failed to search wines by notes: ${error}`,
        recoverable: true,
        timestamp: new Date(),
        operation: 'read',
        context: { searchTerm, error: (error as Error)?.message }
      });
      
      ErrorHandler.logError(storageError);
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
      const storageError = ErrorHandler.createStorageError({
        message: `Failed to retrieve wine statistics: ${error}`,
        recoverable: true,
        timestamp: new Date(),
        operation: 'read',
        context: { error: (error as Error)?.message }
      });
      
      ErrorHandler.logError(storageError);
      throw storageError;
    }
  }

  /**
   * Check if repository is available (always true for local SQLite)
   */
  isAvailable(): boolean {
    return true; // SQLite is always available offline
  }

  /**
   * Get offline status information
   */
  getOfflineStatus(): {
    isOffline: boolean;
    canRead: boolean;
    canWrite: boolean;
    message: string;
  } {
    const isOffline = this.networkService.isOffline();
    
    return {
      isOffline,
      canRead: true, // Always can read from local database
      canWrite: true, // Always can write to local database
      message: isOffline 
        ? 'Offline mode: All wine data is stored locally and available'
        : 'Online: All features available'
    };
  }

  /**
   * Get wines that need synchronization (for future cloud sync)
   */
  async getUnsyncedWines(): Promise<WineRecord[]> {
    // For now, return empty array since we don't have cloud sync
    // This method is prepared for future cloud synchronization features
    return [];
  }

  /**
   * Mark wines as synced (for future cloud sync)
   */
  async markWinesAsSynced(wineIds: string[]): Promise<void> {
    // Placeholder for future cloud sync functionality
    // Would update a sync status field in the database
  }

  /**
   * Perform offline-safe operation with retry
   */
  private async performOfflineSafeOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    try {
      return await ErrorHandler.retryOperation(operation, {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 5000,
        backoffMultiplier: 2,
        retryableErrors: ['storage']
      });
    } catch (error) {
      ErrorHandler.logError(ErrorHandler.createStorageError({
        message: `${operationName} failed after retries`,
        recoverable: false,
        timestamp: new Date(),
        operation: 'read',
        context: { operationName, error: (error as Error)?.message }
      }));
      throw error;
    }
  }
}