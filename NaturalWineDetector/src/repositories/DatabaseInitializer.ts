/**
 * Database initialization utility for app startup
 */

import { DatabaseService } from './DatabaseService';
import { StorageError } from '../types/ErrorTypes';

/**
 * Initialize the database when the app starts
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const dbService = DatabaseService.getInstance();
    await dbService.initialize();
    console.log('Database initialized successfully');
  } catch (error) {
    const storageError: StorageError = {
      type: 'storage',
      message: `Failed to initialize database: ${error}`,
      recoverable: false,
      operation: 'init',
      originalError: error instanceof Error ? error : new Error(String(error))
    };
    throw storageError;
  }
}

/**
 * Check if database is properly initialized
 */
export async function isDatabaseReady(): Promise<boolean> {
  try {
    const dbService = DatabaseService.getInstance();
    const db = dbService.getDatabase();
    
    // Try to query the wines table to verify it exists
    await db.getFirstAsync('SELECT COUNT(*) FROM wines');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Reset database (for testing or troubleshooting)
 * WARNING: This will delete all data!
 */
export async function resetDatabase(): Promise<void> {
  try {
    const dbService = DatabaseService.getInstance();
    const db = dbService.getDatabase();
    
    // Drop all tables
    await db.execAsync('DROP TABLE IF EXISTS wines');
    await db.execAsync('DROP TABLE IF EXISTS migrations');
    
    // Reinitialize
    await dbService.initialize();
    console.log('Database reset successfully');
  } catch (error) {
    const storageError: StorageError = {
      type: 'storage',
      message: `Failed to reset database: ${error}`,
      recoverable: false,
      operation: 'init',
      originalError: error instanceof Error ? error : new Error(String(error))
    };
    throw storageError;
  }
}