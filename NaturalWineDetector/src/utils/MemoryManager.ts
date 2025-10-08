/**
 * Memory management utilities for image processing and cleanup
 * Handles image cleanup, memory monitoring, and performance optimizations
 */

import * as FileSystem from 'expo-file-system';

export interface MemoryInfo {
  usedMemory: number;
  totalMemory: number;
  freeMemory: number;
  memoryPressure: 'low' | 'medium' | 'high';
}

export class MemoryManager {
  private static readonly MEMORY_WARNING_THRESHOLD = 0.8; // 80% memory usage
  private static readonly MEMORY_CRITICAL_THRESHOLD = 0.9; // 90% memory usage
  private static readonly MAX_CACHED_IMAGES = 10;
  private static readonly IMAGE_CLEANUP_INTERVAL = 30000; // 30 seconds
  
  private static imageCache = new Map<string, { uri: string; timestamp: number; size: number }>();
  private static cleanupTimer: NodeJS.Timeout | null = null;
  private static memoryWarningCallbacks: Array<(info: MemoryInfo) => void> = [];

  /**
   * Initialize memory manager with automatic cleanup
   */
  static initialize(): void {
    this.startPeriodicCleanup();
    this.setupMemoryWarningListeners();
  }

  /**
   * Clean up resources when app is closing
   */
  static cleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clearImageCache();
    this.memoryWarningCallbacks = [];
  }

  /**
   * Add an image to the cache for tracking
   */
  static async addImageToCache(uri: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      if (fileInfo.exists) {
        const size = fileInfo.size || 0;
        
        // Remove oldest images if cache is full
        if (this.imageCache.size >= this.MAX_CACHED_IMAGES) {
          this.removeOldestCachedImage();
        }
        
        this.imageCache.set(uri, {
          uri,
          timestamp: Date.now(),
          size,
        });
      }
    } catch (error) {
      console.warn('Failed to add image to cache:', error);
    }
  }

  /**
   * Remove an image from cache and optionally delete the file
   */
  static async removeImageFromCache(uri: string, deleteFile = false): Promise<void> {
    try {
      this.imageCache.delete(uri);
      
      if (deleteFile) {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        }
      }
    } catch (error) {
      console.warn('Failed to remove image from cache:', error);
    }
  }

  /**
   * Clear all cached images and optionally delete files
   */
  static async clearImageCache(deleteFiles = false): Promise<void> {
    try {
      if (deleteFiles) {
        const promises = Array.from(this.imageCache.values()).map(async (item) => {
          try {
            const fileInfo = await FileSystem.getInfoAsync(item.uri);
            if (fileInfo.exists) {
              await FileSystem.deleteAsync(item.uri, { idempotent: true });
            }
          } catch (error) {
            console.warn(`Failed to delete cached image ${item.uri}:`, error);
          }
        });
        
        await Promise.all(promises);
      }
      
      this.imageCache.clear();
    } catch (error) {
      console.warn('Failed to clear image cache:', error);
    }
  }

  /**
   * Get current memory usage information
   */
  static async getMemoryInfo(): Promise<MemoryInfo> {
    try {
      // Note: React Native doesn't provide direct memory access
      // This is a simplified implementation that estimates based on image cache
      const cachedImageSize = Array.from(this.imageCache.values())
        .reduce((total, item) => total + item.size, 0);
      
      // Estimate total memory usage (this is approximate)
      const estimatedUsedMemory = cachedImageSize;
      const estimatedTotalMemory = 512 * 1024 * 1024; // Assume 512MB available for app
      const freeMemory = estimatedTotalMemory - estimatedUsedMemory;
      const memoryUsageRatio = estimatedUsedMemory / estimatedTotalMemory;
      
      let memoryPressure: 'low' | 'medium' | 'high' = 'low';
      if (memoryUsageRatio > this.MEMORY_CRITICAL_THRESHOLD) {
        memoryPressure = 'high';
      } else if (memoryUsageRatio > this.MEMORY_WARNING_THRESHOLD) {
        memoryPressure = 'medium';
      }
      
      return {
        usedMemory: estimatedUsedMemory,
        totalMemory: estimatedTotalMemory,
        freeMemory,
        memoryPressure,
      };
    } catch (error) {
      console.warn('Failed to get memory info:', error);
      return {
        usedMemory: 0,
        totalMemory: 512 * 1024 * 1024,
        freeMemory: 512 * 1024 * 1024,
        memoryPressure: 'low',
      };
    }
  }

  /**
   * Clean up temporary files and old cached images
   */
  static async performCleanup(): Promise<void> {
    try {
      // Clean up old cached images (older than 1 hour)
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      const oldImages = Array.from(this.imageCache.entries())
        .filter(([_, item]) => item.timestamp < oneHourAgo);
      
      for (const [uri, _] of oldImages) {
        await this.removeImageFromCache(uri, true);
      }
      
      // Clean up temporary directory
      await this.cleanupTempDirectory();
      
      // Check memory pressure and clean more aggressively if needed
      const memoryInfo = await this.getMemoryInfo();
      if (memoryInfo.memoryPressure === 'high') {
        await this.aggressiveCleanup();
      }
      
    } catch (error) {
      console.warn('Failed to perform cleanup:', error);
    }
  }

  /**
   * Aggressive cleanup when memory pressure is high
   */
  static async aggressiveCleanup(): Promise<void> {
    try {
      // Remove half of the cached images, starting with oldest
      const sortedImages = Array.from(this.imageCache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const imagesToRemove = sortedImages.slice(0, Math.ceil(sortedImages.length / 2));
      
      for (const [uri, _] of imagesToRemove) {
        await this.removeImageFromCache(uri, true);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
    } catch (error) {
      console.warn('Failed to perform aggressive cleanup:', error);
    }
  }

  /**
   * Clean up temporary directory
   */
  static async cleanupTempDirectory(): Promise<void> {
    try {
      const tempDir = `${(FileSystem as any).cacheDirectory || ''}images/`;
      const dirInfo = await FileSystem.getInfoAsync(tempDir);
      
      if (dirInfo.exists && dirInfo.isDirectory) {
        const files = await FileSystem.readDirectoryAsync(tempDir);
        
        // Delete files older than 1 hour
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        
        for (const file of files) {
          try {
            const filePath = `${tempDir}${file}`;
            const fileInfo = await FileSystem.getInfoAsync(filePath);
            
            if (fileInfo.exists && fileInfo.modificationTime) {
              const fileAge = fileInfo.modificationTime * 1000; // Convert to milliseconds
              
              if (fileAge < oneHourAgo) {
                await FileSystem.deleteAsync(filePath, { idempotent: true });
              }
            }
          } catch (error) {
            console.warn(`Failed to clean up temp file ${file}:`, error);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup temp directory:', error);
    }
  }

  /**
   * Add memory warning callback
   */
  static addMemoryWarningCallback(callback: (info: MemoryInfo) => void): void {
    this.memoryWarningCallbacks.push(callback);
  }

  /**
   * Remove memory warning callback
   */
  static removeMemoryWarningCallback(callback: (info: MemoryInfo) => void): void {
    const index = this.memoryWarningCallbacks.indexOf(callback);
    if (index > -1) {
      this.memoryWarningCallbacks.splice(index, 1);
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    imageCount: number;
    totalSize: number;
    oldestTimestamp: number;
    newestTimestamp: number;
  } {
    const images = Array.from(this.imageCache.values());
    
    if (images.length === 0) {
      return {
        imageCount: 0,
        totalSize: 0,
        oldestTimestamp: 0,
        newestTimestamp: 0,
      };
    }
    
    const totalSize = images.reduce((sum, item) => sum + item.size, 0);
    const timestamps = images.map(item => item.timestamp);
    
    return {
      imageCount: images.length,
      totalSize,
      oldestTimestamp: Math.min(...timestamps),
      newestTimestamp: Math.max(...timestamps),
    };
  }

  /**
   * Private helper methods
   */
  private static removeOldestCachedImage(): void {
    let oldestUri: string | null = null;
    let oldestTimestamp = Date.now();
    
    for (const [uri, item] of this.imageCache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestUri = uri;
      }
    }
    
    if (oldestUri) {
      this.removeImageFromCache(oldestUri, true);
    }
  }

  private static startPeriodicCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, this.IMAGE_CLEANUP_INTERVAL);
  }

  private static setupMemoryWarningListeners(): void {
    // Check memory pressure periodically
    setInterval(async () => {
      const memoryInfo = await this.getMemoryInfo();
      
      if (memoryInfo.memoryPressure !== 'low') {
        this.memoryWarningCallbacks.forEach(callback => {
          try {
            callback(memoryInfo);
          } catch (error) {
            console.warn('Memory warning callback failed:', error);
          }
        });
      }
    }, 10000); // Check every 10 seconds
  }
}