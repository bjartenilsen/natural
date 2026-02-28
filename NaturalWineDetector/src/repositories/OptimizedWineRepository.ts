/**
 * Optimized Wine Repository with pagination and performance improvements
 * Uses composition to wrap a WineRepository with advanced querying and caching capabilities
 */

import { WineRecord } from '../types/WineTypes';
import { WineRepository } from './WineRepository';
import { DatabaseService } from './DatabaseService';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';
import { MemoryManager } from '../utils/MemoryManager';
import { rowToWineRecord } from './DatabaseUtils';

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: 'createdAt' | 'analysisTimestamp' | 'confidenceScore';
  sortOrder?: 'ASC' | 'DESC';
}

export interface FilterOptions {
  consumed?: boolean;
  isNaturalWine?: boolean;
  minConfidenceScore?: number;
  maxConfidenceScore?: number;
  dateFrom?: Date;
  dateTo?: Date;
  hasLocation?: boolean;
  hasNotes?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export class OptimizedWineRepository {
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_CACHE_SIZE = 50;
  
  private queryCache = new Map<string, { data: any; timestamp: number }>();
  private totalCountCache: { count: number; timestamp: number } | null = null;
  
  private static instance: OptimizedWineRepository | null = null;

  private readonly repository: WineRepository;
  private readonly dbService: DatabaseService;

  private constructor() {
    this.repository = new WineRepository();
    this.dbService = DatabaseService.getInstance();
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(): OptimizedWineRepository {
    if (!this.instance) {
      this.instance = new OptimizedWineRepository();
    }
    return this.instance;
  }

  // --- Delegated base repository methods ---

  async saveWine(wine: WineRecord): Promise<void> {
    await this.repository.saveWine(wine);
    this.clearCache();
  }

  async getAllWines(): Promise<WineRecord[]> {
    return this.repository.getAllWines();
  }

  async getWineById(id: string): Promise<WineRecord | null> {
    return this.repository.getWineById(id);
  }

  async deleteWine(id: string): Promise<void> {
    await this.repository.deleteWine(id);
    this.clearCache();
  }

  async getWinesByConsumption(consumed: boolean): Promise<WineRecord[]> {
    return this.repository.getWinesByConsumption(consumed);
  }

  async getWinesByNaturalStatus(isNatural: boolean): Promise<WineRecord[]> {
    return this.repository.getWinesByNaturalStatus(isNatural);
  }

  async searchWinesByNotes(searchTerm: string): Promise<WineRecord[]> {
    return this.repository.searchWinesByNotes(searchTerm);
  }

  async getWineStats(): Promise<{ total: number; consumed: number; natural: number }> {
    return this.repository.getWineStats();
  }

  isAvailable(): boolean {
    return this.repository.isAvailable();
  }

  getOfflineStatus() {
    return this.repository.getOfflineStatus();
  }

  async getUnsyncedWines(): Promise<WineRecord[]> {
    return this.repository.getUnsyncedWines();
  }

  async markWinesAsSynced(wineIds: string[]): Promise<void> {
    return this.repository.markWinesAsSynced(wineIds);
  }

  /**
   * Get wines with pagination and filtering
   */
  async getWinesPaginated(
    options: PaginationOptions,
    filters?: FilterOptions
  ): Promise<PaginatedResult<WineRecord>> {
    return PerformanceMonitor.trackOperation(
      'getWinesPaginated',
      async () => {
        const cacheKey = this.generateCacheKey('paginated', options, filters);
        const cached = this.getCachedResult(cacheKey);
        
        if (cached) {
          return cached;
        }

        const db = this.dbService.getDatabase();
        
        // Build WHERE clause
        const { whereClause, params } = this.buildWhereClause(filters);
        
        // Build ORDER BY clause
        const orderBy = this.buildOrderByClause(options.sortBy, options.sortOrder);
        
        // Calculate offset
        const offset = (options.page - 1) * options.limit;
        
        // Get total count for pagination
        const totalCount = await this.getTotalCount(filters);
        
        // Execute paginated query
        const query = `
          SELECT * FROM wines 
          ${whereClause}
          ${orderBy}
          LIMIT ? OFFSET ?
        `;
        
        const queryParams = [...params, options.limit, offset];
        const result = await db.getAllAsync(query, queryParams);
        
        const wines = result.map(row => rowToWineRecord(row as any));
        
        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / options.limit);
        const hasNext = options.page < totalPages;
        const hasPrevious = options.page > 1;
        
        const paginatedResult: PaginatedResult<WineRecord> = {
          data: wines,
          pagination: {
            page: options.page,
            limit: options.limit,
            total: totalCount,
            totalPages,
            hasNext,
            hasPrevious,
          },
        };
        
        // Cache the result
        this.setCachedResult(cacheKey, paginatedResult);
        
        return paginatedResult;
      },
      { page: options.page, limit: options.limit, filtersCount: filters ? Object.keys(filters).length : 0 }
    );
  }

  /**
   * Get wine statistics
   */
  async getWineStatistics(): Promise<{
    totalWines: number;
    naturalWines: number;
    consumedWines: number;
    averageConfidenceScore: number;
    winesWithLocation: number;
    winesWithNotes: number;
    recentWines: number; // Last 30 days
  }> {
    return PerformanceMonitor.trackOperation(
      'getWineStatistics',
      async () => {
        const cacheKey = 'wine_statistics';
        const cached = this.getCachedResult(cacheKey);
        
        if (cached) {
          return cached;
        }

        const db = this.dbService.getDatabase();
        
        // Use a single query with aggregations for better performance
        const query = `
          SELECT 
            COUNT(*) as totalWines,
            SUM(CASE WHEN is_natural_wine = 1 THEN 1 ELSE 0 END) as naturalWines,
            SUM(CASE WHEN consumed = 1 THEN 1 ELSE 0 END) as consumedWines,
            AVG(confidence_score) as averageConfidenceScore,
            SUM(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 ELSE 0 END) as winesWithLocation,
            SUM(CASE WHEN notes IS NOT NULL AND notes != '' THEN 1 ELSE 0 END) as winesWithNotes,
            SUM(CASE WHEN created_at > datetime('now', '-30 days') THEN 1 ELSE 0 END) as recentWines
          FROM wines
        `;
        
        const result = await db.getFirstAsync(query) as any;
        
        const statistics = {
          totalWines: result.totalWines || 0,
          naturalWines: result.naturalWines || 0,
          consumedWines: result.consumedWines || 0,
          averageConfidenceScore: result.averageConfidenceScore || 0,
          winesWithLocation: result.winesWithLocation || 0,
          winesWithNotes: result.winesWithNotes || 0,
          recentWines: result.recentWines || 0,
        };
        
        // Cache for 10 minutes
        this.setCachedResult(cacheKey, statistics, 10 * 60 * 1000);
        
        return statistics;
      }
    );
  }

  /**
   * Search wines by text
   */
  async searchWines(
    searchTerm: string,
    options: PaginationOptions
  ): Promise<PaginatedResult<WineRecord>> {
    return PerformanceMonitor.trackOperation(
      'searchWines',
      async () => {
        const cacheKey = this.generateCacheKey('search', { searchTerm, ...options });
        const cached = this.getCachedResult(cacheKey);
        
        if (cached) {
          return cached;
        }

        const db = this.dbService.getDatabase();
        
        // Search in explanation and notes fields
        const searchPattern = `%${searchTerm.toLowerCase()}%`;
        
        // Count total matching records
        const countQuery = `
          SELECT COUNT(*) as total 
          FROM wines 
          WHERE LOWER(explanation) LIKE ? OR LOWER(notes) LIKE ?
        `;
        
        const countResult = await db.getFirstAsync(countQuery, [searchPattern, searchPattern]) as any;
        const totalCount = countResult.total || 0;
        
        // Get paginated results
        const offset = (options.page - 1) * options.limit;
        const orderBy = this.buildOrderByClause(options.sortBy, options.sortOrder);
        
        const query = `
          SELECT * FROM wines 
          WHERE LOWER(explanation) LIKE ? OR LOWER(notes) LIKE ?
          ${orderBy}
          LIMIT ? OFFSET ?
        `;
        
        const result = await db.getAllAsync(query, [searchPattern, searchPattern, options.limit, offset]);
        const wines = result.map(row => rowToWineRecord(row as any));
        
        const totalPages = Math.ceil(totalCount / options.limit);
        
        const searchResult: PaginatedResult<WineRecord> = {
          data: wines,
          pagination: {
            page: options.page,
            limit: options.limit,
            total: totalCount,
            totalPages,
            hasNext: options.page < totalPages,
            hasPrevious: options.page > 1,
          },
        };
        
        // Cache search results for shorter time (2 minutes)
        this.setCachedResult(cacheKey, searchResult, 2 * 60 * 1000);
        
        return searchResult;
      },
      { searchTerm, page: options.page, limit: options.limit }
    );
  }

  /**
   * Bulk delete wines with performance optimization
   */
  async bulkDeleteWines(wineIds: string[]): Promise<number> {
    return PerformanceMonitor.trackOperation(
      'bulkDeleteWines',
      async () => {
        if (wineIds.length === 0) {
          return 0;
        }

        const db = this.dbService.getDatabase();
        
        // Use a single query with IN clause for better performance
        const placeholders = wineIds.map(() => '?').join(',');
        const query = `DELETE FROM wines WHERE id IN (${placeholders})`;
        
        const result = await db.runAsync(query, wineIds);
        
        // Clear relevant caches
        this.clearCache();
        
        // Clean up associated image files
        await this.cleanupDeletedWineImages(wineIds);
        
        return result.changes || 0;
      },
      { count: wineIds.length }
    );
  }

  /**
   * Optimize database (VACUUM and ANALYZE)
   */
  async optimizeDatabase(): Promise<void> {
    return PerformanceMonitor.trackOperation(
      'optimizeDatabase',
      async () => {
        const db = this.dbService.getDatabase();
        
        // VACUUM reclaims space and defragments
        await db.execAsync('VACUUM');
        
        // ANALYZE updates query planner statistics
        await db.execAsync('ANALYZE');
        
        console.log('Database optimization completed');
      }
    );
  }

  /**
   * Get database size information
   */
  async getDatabaseInfo(): Promise<{
    pageCount: number;
    pageSize: number;
    totalSize: number;
    freePages: number;
  }> {
    return PerformanceMonitor.trackOperation(
      'getDatabaseInfo',
      async () => {
        const db = this.dbService.getDatabase();
        
        const pageCountResult = await db.getFirstAsync('PRAGMA page_count') as any;
        const pageSizeResult = await db.getFirstAsync('PRAGMA page_size') as any;
        const freePagesResult = await db.getFirstAsync('PRAGMA freelist_count') as any;
        
        const pageCount = pageCountResult.page_count || 0;
        const pageSize = pageSizeResult.page_size || 0;
        const freePages = freePagesResult.freelist_count || 0;
        
        return {
          pageCount,
          pageSize,
          totalSize: pageCount * pageSize,
          freePages,
        };
      }
    );
  }

  /**
   * Private helper methods
   */
  private buildWhereClause(filters?: FilterOptions): { whereClause: string; params: any[] } {
    if (!filters) {
      return { whereClause: '', params: [] };
    }

    const conditions: string[] = [];
    const params: any[] = [];

    if (filters.consumed !== undefined) {
      conditions.push('consumed = ?');
      params.push(filters.consumed ? 1 : 0);
    }

    if (filters.isNaturalWine !== undefined) {
      conditions.push('is_natural_wine = ?');
      params.push(filters.isNaturalWine ? 1 : 0);
    }

    if (filters.minConfidenceScore !== undefined) {
      conditions.push('confidence_score >= ?');
      params.push(filters.minConfidenceScore);
    }

    if (filters.maxConfidenceScore !== undefined) {
      conditions.push('confidence_score <= ?');
      params.push(filters.maxConfidenceScore);
    }

    if (filters.dateFrom) {
      conditions.push('created_at >= ?');
      params.push(filters.dateFrom.toISOString());
    }

    if (filters.dateTo) {
      conditions.push('created_at <= ?');
      params.push(filters.dateTo.toISOString());
    }

    if (filters.hasLocation !== undefined) {
      if (filters.hasLocation) {
        conditions.push('latitude IS NOT NULL AND longitude IS NOT NULL');
      } else {
        conditions.push('(latitude IS NULL OR longitude IS NULL)');
      }
    }

    if (filters.hasNotes !== undefined) {
      if (filters.hasNotes) {
        conditions.push('notes IS NOT NULL AND notes != ""');
      } else {
        conditions.push('(notes IS NULL OR notes = "")');
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, params };
  }

  private buildOrderByClause(sortBy?: string, sortOrder?: string): string {
    const validSortFields = ['createdAt', 'analysisTimestamp', 'confidenceScore'];
    const validSortOrders = ['ASC', 'DESC'];

    if (!sortBy || !validSortFields.includes(sortBy)) {
      return 'ORDER BY created_at DESC';
    }

    const order = validSortOrders.includes(sortOrder || '') ? sortOrder : 'DESC';
    
    // Map camelCase to snake_case
    const fieldMap: Record<string, string> = {
      createdAt: 'created_at',
      analysisTimestamp: 'analysis_timestamp',
      confidenceScore: 'confidence_score',
    };

    const dbField = fieldMap[sortBy] || 'created_at';
    return `ORDER BY ${dbField} ${order}`;
  }

  private async getTotalCount(filters?: FilterOptions): Promise<number> {
    // Check cache first
    if (!filters && this.totalCountCache) {
      const age = Date.now() - this.totalCountCache.timestamp;
      if (age < OptimizedWineRepository.CACHE_TTL) {
        return this.totalCountCache.count;
      }
    }

    const db = this.dbService.getDatabase();
    const { whereClause, params } = this.buildWhereClause(filters);
    
    const query = `SELECT COUNT(*) as total FROM wines ${whereClause}`;
    const result = await db.getFirstAsync(query, params) as any;
    const count = result.total || 0;

    // Cache total count if no filters
    if (!filters) {
      this.totalCountCache = { count, timestamp: Date.now() };
    }

    return count;
  }

  private generateCacheKey(operation: string, ...args: any[]): string {
    return `${operation}_${JSON.stringify(args)}`;
  }

  private getCachedResult(key: string): any | null {
    const cached = this.queryCache.get(key);
    
    if (!cached) {
      return null;
    }

    const age = Date.now() - cached.timestamp;
    if (age > OptimizedWineRepository.CACHE_TTL) {
      this.queryCache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCachedResult(key: string, data: any, ttl: number = OptimizedWineRepository.CACHE_TTL): void {
    // Prevent cache from growing too large
    if (this.queryCache.size >= OptimizedWineRepository.MAX_CACHE_SIZE) {
      // Remove oldest entries
      const entries = Array.from(this.queryCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, Math.floor(OptimizedWineRepository.MAX_CACHE_SIZE / 2));
      toRemove.forEach(([key]) => this.queryCache.delete(key));
    }

    this.queryCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private clearCache(): void {
    this.queryCache.clear();
    this.totalCountCache = null;
  }

  private async cleanupDeletedWineImages(wineIds: string[]): Promise<void> {
    // This would typically involve getting the image URIs for the deleted wines
    // and cleaning them up from the file system and memory manager
    for (const wineId of wineIds) {
      try {
        // In a real implementation, you'd get the image URI from the wine record
        // before deletion and then clean it up
        await MemoryManager.removeImageFromCache(`wine_${wineId}`, true);
      } catch (error) {
        console.warn(`Failed to cleanup image for wine ${wineId}:`, error);
      }
    }
  }
}