/**
 * Image processing service for wine bottle photos
 * Handles compression, resizing, validation, and cleanup
 */

import ImageResizer from '@bam.tech/react-native-image-resizer';
import * as FileSystem from 'expo-file-system';
import { ErrorHandler } from '../utils/errorHandler';
import { MemoryManager } from '../utils/MemoryManager';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'JPEG' | 'PNG' | 'WEBP';
  keepAspectRatio?: boolean;
}

export interface ProcessedImageResult {
  uri: string;
  width: number;
  height: number;
  size: number;
  originalSize?: number;
  compressionRatio?: number;
}

export class ImageService {
  // Default processing options optimized for ChatGPT API
  private static readonly DEFAULT_OPTIONS: Required<ImageProcessingOptions> = {
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 0.8,
    format: 'JPEG',
    keepAspectRatio: true,
  };

  // Maximum file size for API calls (5MB)
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024;

  // Minimum dimensions for wine bottle recognition
  private static readonly MIN_DIMENSION = 200;

  // Supported image formats
  private static readonly SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];

  /**
   * Process image for ChatGPT API with compression and validation
   */
  static async processImage(
    imageUri: string, 
    options: ImageProcessingOptions = {}
  ): Promise<ProcessedImageResult> {
    return PerformanceMonitor.trackOperation(
      'processImage',
      async () => {
        try {
      // Validate input
      if (!imageUri) {
        throw ErrorHandler.createImageError({
          reason: 'processing_failed',
          message: 'Image URI is required',
          recoverable: false,
          timestamp: new Date(),
        });
      }

      // Get original file info
      const originalInfo = await this.getImageInfo(imageUri);
      
      // Validate image format
      this.validateImageFormat(imageUri);

      // Validate image dimensions
      this.validateImageDimensions(originalInfo.width, originalInfo.height);

      // Merge options with defaults
      const processingOptions = { ...this.DEFAULT_OPTIONS, ...options };

      // Determine if resizing is needed
      const needsResizing = this.shouldResize(
        originalInfo.width,
        originalInfo.height,
        processingOptions.maxWidth,
        processingOptions.maxHeight
      );

      let processedUri = imageUri;
      let processedInfo = originalInfo;

      // Resize and compress if needed
      if (needsResizing || originalInfo.size > this.MAX_FILE_SIZE) {
        const resizeResult = await this.resizeImage(imageUri, processingOptions);
        processedUri = resizeResult.uri;
        processedInfo = await this.getImageInfo(processedUri);
      }

      // Validate final file size
      if (processedInfo.size > this.MAX_FILE_SIZE) {
        throw ErrorHandler.createImageError({
          reason: 'too_large',
          message: `Processed image is still too large: ${(processedInfo.size / 1024 / 1024).toFixed(1)}MB`,
          recoverable: true,
          timestamp: new Date(),
        });
      }

          const compressionRatio = originalInfo.size > 0 
            ? (originalInfo.size - processedInfo.size) / originalInfo.size 
            : 0;

          // Add processed image to memory manager for tracking
          await MemoryManager.addImageToCache(processedUri);

          return {
            uri: processedUri,
            width: processedInfo.width,
            height: processedInfo.height,
            size: processedInfo.size,
            originalSize: originalInfo.size,
            compressionRatio,
          };

        } catch (error) {
          if (error && typeof error === 'object' && 'type' in error && error.type === 'image') {
            throw error;
          }

          throw ErrorHandler.createImageError({
            reason: 'processing_failed',
            message: 'Failed to process image',
            recoverable: true,
            timestamp: new Date(),
          });
        }
      },
      { originalSize: await this.getImageSize(imageUri) }
    );
  }

  /**
   * Compress image for API transmission
   */
  static async compressForApi(imageUri: string): Promise<ProcessedImageResult> {
    return this.processImage(imageUri, {
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.7,
      format: 'JPEG',
    });
  }

  /**
   * Resize image for local storage
   */
  static async resizeForStorage(imageUri: string): Promise<ProcessedImageResult> {
    return this.processImage(imageUri, {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8,
      format: 'JPEG',
    });
  }

  /**
   * Convert image to base64 for API calls
   */
  static async convertToBase64(imageUri: string): Promise<string> {
    try {
      // First process the image to ensure it's optimized
      const processed = await this.compressForApi(imageUri);
      
      // Convert to base64
      const base64 = await FileSystem.readAsStringAsync(processed.uri, {
        encoding: 'base64',
      });

      return base64;
    } catch (error) {
      throw ErrorHandler.createImageError({
        reason: 'processing_failed',
        message: 'Failed to convert image to base64',
        recoverable: true,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Validate image format
   */
  static validateImageFormat(imageUri: string): void {
    const extension = this.getFileExtension(imageUri);
    
    if (!this.SUPPORTED_FORMATS.includes(extension)) {
      throw ErrorHandler.createImageError({
        reason: 'invalid_format',
        message: `Unsupported image format: ${extension}. Supported formats: ${this.SUPPORTED_FORMATS.join(', ')}`,
        recoverable: false,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Validate image dimensions
   */
  static validateImageDimensions(width: number, height: number): void {
    const minDimension = Math.min(width, height);
    
    if (minDimension < this.MIN_DIMENSION) {
      throw ErrorHandler.createImageError({
        reason: 'processing_failed',
        message: `Image too small: ${width}x${height}. Minimum dimension: ${this.MIN_DIMENSION}px`,
        timestamp: new Date(),
        recoverable: true,
      });
    }
  }

  /**
   * Clean up temporary image files
   */
  static async cleanupTempFiles(imageUris: string[]): Promise<void> {
    const cleanupPromises = imageUris.map(async (uri) => {
      try {
        // Only delete files in the cache directory to avoid deleting user photos
        if (uri.includes('cache') || uri.includes('tmp')) {
          const fileInfo = await FileSystem.getInfoAsync(uri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(uri, { idempotent: true });
          }
        }
      } catch (error) {
        console.warn(`Failed to cleanup temp file ${uri}:`, error);
      }
    });

    await Promise.allSettled(cleanupPromises);
  }

  /**
   * Get image file information
   */
  private static async getImageInfo(imageUri: string): Promise<{
    width: number;
    height: number;
    size: number;
  }> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      
      if (!fileInfo.exists) {
        throw new Error('Image file does not exist');
      }

      // For basic file info, we'll use a simple approach
      // In a real implementation, you might want to use a library to get actual image dimensions
      return {
        width: 1000, // Placeholder - would need actual image dimension reading
        height: 1000, // Placeholder - would need actual image dimension reading
        size: (fileInfo as any).size || 0,
      };
    } catch (error) {
      throw ErrorHandler.createImageError({
        reason: 'processing_failed',
        message: 'Failed to get image information',
        recoverable: false,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Resize image using react-native-image-resizer
   */
  private static async resizeImage(
    imageUri: string,
    options: Required<ImageProcessingOptions>
  ): Promise<{ uri: string }> {
    try {
      const result = await ImageResizer.createResizedImage(
        imageUri,
        options.maxWidth,
        options.maxHeight,
        options.format,
        options.quality * 100, // Convert to percentage
        0, // rotation
        undefined, // outputPath
        options.keepAspectRatio
      );

      return { uri: result.uri };
    } catch (error) {
      throw ErrorHandler.createImageError({
        reason: 'processing_failed',
        message: 'Failed to resize image',
        recoverable: true,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Determine if image needs resizing
   */
  private static shouldResize(
    width: number,
    height: number,
    maxWidth: number,
    maxHeight: number
  ): boolean {
    return width > maxWidth || height > maxHeight;
  }

  /**
   * Get file extension from URI
   */
  private static getFileExtension(uri: string): string {
    const parts = uri.split('.');
    const extension = parts[parts.length - 1]?.toLowerCase();
    
    // Handle query parameters
    return extension?.split('?')[0] || '';
  }

  /**
   * Generate unique filename for processed images
   */
  static generateProcessedFilename(originalUri: string, suffix: string = 'processed'): string {
    const timestamp = Date.now();
    const extension = this.getFileExtension(originalUri) || 'jpg';
    return `wine_${suffix}_${timestamp}.${extension}`;
  }

  /**
   * Get cache directory for temporary files
   */
  static getCacheDirectory(): string {
    return `${(FileSystem as any).cacheDirectory || ''}images/`;
  }

  /**
   * Ensure cache directory exists
   */
  static async ensureCacheDirectory(): Promise<void> {
    const cacheDir = this.getCacheDirectory();
    const dirInfo = await FileSystem.getInfoAsync(cacheDir);
    
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
    }
  }

  /**
   * Get image file size
   */
  private static async getImageSize(imageUri: string): Promise<number> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      return (fileInfo as any).size || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Clean up processed image from memory manager
   */
  static async cleanupProcessedImage(imageUri: string): Promise<void> {
    return PerformanceMonitor.trackOperation(
      'cleanupProcessedImage',
      async () => {
        await MemoryManager.removeImageFromCache(imageUri, true);
      },
      { imageUri }
    );
  }

  /**
   * Batch cleanup multiple images
   */
  static async batchCleanupImages(imageUris: string[]): Promise<void> {
    return PerformanceMonitor.trackOperation(
      'batchCleanupImages',
      async () => {
        const cleanupPromises = imageUris.map(uri => 
          MemoryManager.removeImageFromCache(uri, true)
        );
        await Promise.allSettled(cleanupPromises);
      },
      { count: imageUris.length }
    );
  }
}