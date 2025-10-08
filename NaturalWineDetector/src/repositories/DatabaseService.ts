/**
 * SQLite database service for managing database connections and schema
 */

import * as SQLite from 'expo-sqlite';
import { WineRecordRow } from '../types/WineTypes';

/**
 * Database configuration
 */
const DATABASE_NAME = 'natural_wine_detector.db';
const DATABASE_VERSION = 1;

/**
 * Database migration interface
 */
interface Migration {
  version: number;
  sql: string[];
}

/**
 * Database service class for managing SQLite operations
 */
export class DatabaseService {
  private static instance: DatabaseService;
  private db: SQLite.SQLiteDatabase | null = null;

  private constructor() {}

  /**
   * Get singleton instance of DatabaseService
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize database connection and run migrations
   */
  public async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await this.runMigrations();
    } catch (error) {
      throw new Error(`Failed to initialize database: ${error}`);
    }
  }

  /**
   * Get database instance
   */
  public getDatabase(): SQLite.SQLiteDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * Run database migrations
   */
  private async runMigrations(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Create migrations table if it doesn't exist
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS migrations (
        version INTEGER PRIMARY KEY,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get current database version
    const result = await this.db.getFirstAsync<{ version: number }>(`
      SELECT MAX(version) as version FROM migrations
    `);
    const currentVersion = result?.version || 0;

    // Apply pending migrations
    const migrations = this.getMigrations();
    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        await this.applyMigration(migration);
      }
    }
  }

  /**
   * Apply a single migration
   */
  private async applyMigration(migration: Migration): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      // Execute migration SQL statements
      for (const sql of migration.sql) {
        await this.db.execAsync(sql);
      }

      // Record migration as applied
      await this.db.runAsync(
        'INSERT INTO migrations (version) VALUES (?)',
        [migration.version]
      );

      console.log(`Applied migration version ${migration.version}`);
    } catch (error) {
      throw new Error(`Failed to apply migration ${migration.version}: ${error}`);
    }
  }

  /**
   * Get all database migrations
   */
  private getMigrations(): Migration[] {
    return [
      {
        version: 1,
        sql: [
          // Create wines table
          `CREATE TABLE wines (
            id TEXT PRIMARY KEY,
            image_uri TEXT NOT NULL,
            is_natural_wine INTEGER NOT NULL,
            confidence_score INTEGER NOT NULL,
            explanation TEXT NOT NULL,
            consumed INTEGER NOT NULL DEFAULT 0,
            latitude REAL,
            longitude REAL,
            location_accuracy REAL,
            notes TEXT,
            created_at TEXT NOT NULL,
            analysis_timestamp TEXT NOT NULL
          )`,
          
          // Create indexes for performance optimization
          'CREATE INDEX idx_wines_created_at ON wines(created_at DESC)',
          'CREATE INDEX idx_wines_consumed ON wines(consumed)',
          'CREATE INDEX idx_wines_is_natural ON wines(is_natural_wine)',
          'CREATE INDEX idx_wines_confidence ON wines(confidence_score DESC)'
        ]
      }
    ];
  }

  /**
   * Close database connection
   */
  public async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }

  /**
   * Execute a raw SQL query (for debugging/maintenance)
   */
  public async executeRaw(sql: string, params: any[] = []): Promise<any> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return await this.db.runAsync(sql, params);
  }

  /**
   * Get database statistics
   */
  public async getStats(): Promise<{ totalWines: number; consumedWines: number; naturalWines: number }> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const totalResult = await this.db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM wines');
    const consumedResult = await this.db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM wines WHERE consumed = 1');
    const naturalResult = await this.db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM wines WHERE is_natural_wine = 1');

    return {
      totalWines: totalResult?.count || 0,
      consumedWines: consumedResult?.count || 0,
      naturalWines: naturalResult?.count || 0
    };
  }
}