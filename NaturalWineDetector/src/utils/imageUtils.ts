/**
 * Image processing utilities for wine bottle photos
 * Provides helper functions for image validation, processing, and cleanup
 */

import * as FileSystem from 'expo-file-system';
import { ImageService, ProcessedImageResult } from '../services/ImageService';

/**
 * Configuration constants for image processing
 */
export const IMAGE_CONFIG = {
  // API optimized settings
  API_MAX_WIDTH: 1024,
  API_MAX_HEIGHT: 1024,
  API_QUALITY: 0.7,
  API_MAX_SIZE: 5 * 1024 * 1024, // 5MB

  // Storage optimized settings
  STORAGE_MAX_WIDTH: 800,
  STORAGE_MAX_HEIGHT: 800,
  STORAGE_QUALITY: 0.8,

  // Validation settings
  MIN_DIMENSION: 200,
  MAX_ORIGINAL_SIZE: 50 * 1024 * 1024, // 50MB
  
  // Supported formats
  SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
} as const;

/**
 * Quick image validation for basic checks
 */
export const validateImageQuick = (imageUri: string): boolean => {
  if (!imageUri || typeof imageUri !== 'string') {
    return false;
  }

  // Check if URI looks valid
  if (!imageUri.startsWith('file://') && !imageUri.startsWith('content://')) {
    return false;
  }

  // Check file extension
  const extension = getFileExtension(imageUri);
  return IMAGE_CONFIG.SUPPORTED_FORMATS.includes(extension as any);
};

/**
 * Comprehensive image validation with file system checks
 */
export const validateImageComplete = async (imageUri: string): Promise<{
  isValid: boolean;
  error?: string;
  fileSize?: number;
}> => {
  try {
    // Quick validation first
    if (!validateImageQuick(imageUri)) {
      return {
        isValid: false,
        error: 'Invalid image URI or unsupported format',
      };
    }

    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (!fileInfo.exists) {
      return {
        isValid: false,
        error: 'Image file does not exist',
      };
    }

    const fileSize = fileInfo.size || 0;

    // Check file size
    if (fileSize === 0) {
      return {
        isValid: false,
        error: 'Image file is empty',
        fileSize,
      };
    }

    if (fileSize > IMAGE_CONFIG.MAX_ORIGINAL_SIZE) {
      return {
        isValid: false,
        error: `Image file too large: ${formatFileSize(fileSize)}`,
        fileSize,
      };
    }

    return {
      isValid: true,
      fileSize,
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

/**
 * Process image for ChatGPT API with automatic optimization
 */
export const processImageForApi = async (imageUri: string): Promise<ProcessedImageResult> => {
  return ImageService.compressForApi(imageUri);
};

/**
 * Process image for local storage
 */
export const processImageForStorage = async (imageUri: string): Promise<ProcessedImageResult> => {
  return ImageService.resizeForStorage(imageUri);
};

/**
 * Convert image to base64 with automatic compression
 */
export const imageToBase64 = async (imageUri: string): Promise<string> => {
  return ImageService.convertToBase64(imageUri);
};

/**
 * Get image file information
 */
export const getImageInfo = async (imageUri: string): Promise<{
  exists: boolean;
  size: number;
  extension: string;
  isValid: boolean;
}> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    const extension = getFileExtension(imageUri);
    
    return {
      exists: fileInfo.exists,
      size: fileInfo.size || 0,
      extension,
      isValid: fileInfo.exists && IMAGE_CONFIG.SUPPORTED_FORMATS.includes(extension as any),
    };
  } catch (error) {
    return {
      exists: false,
      size: 0,
      extension: '',
      isValid: false,
    };
  }
};

/**
 * Clean up temporary image files
 */
export const cleanupTempImages = async (imageUris: string[]): Promise<void> => {
  return ImageService.cleanupTempFiles(imageUris);
};

/**
 * Create a temporary copy of an image for processing
 */
export const createTempImageCopy = async (sourceUri: string): Promise<string> => {
  try {
    await ImageService.ensureCacheDirectory();
    
    const cacheDir = ImageService.getCacheDirectory();
    const filename = ImageService.generateProcessedFilename(sourceUri, 'temp');
    const tempUri = `${cacheDir}${filename}`;
    
    await FileSystem.copyAsync({
      from: sourceUri,
      to: tempUri,
    });
    
    return tempUri;
  } catch (error) {
    throw new Error(`Failed to create temp image copy: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get file extension from URI
 */
export const getFileExtension = (uri: string): string => {
  const parts = uri.split('.');
  const extension = parts[parts.length - 1]?.toLowerCase();
  
  // Handle query parameters and fragments
  return extension?.split('?')[0]?.split('#')[0] || '';
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Calculate compression ratio as percentage
 */
export const calculateCompressionRatio = (originalSize: number, compressedSize: number): number => {
  if (originalSize === 0) return 0;
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
};

/**
 * Check if image needs processing based on size and dimensions
 */
export const needsProcessing = async (imageUri: string): Promise<boolean> => {
  try {
    const info = await getImageInfo(imageUri);
    
    // If file doesn't exist or is invalid, it needs processing (will fail)
    if (!info.exists || !info.isValid) {
      return true;
    }
    
    // If file is larger than API limit, it needs processing
    if (info.size > IMAGE_CONFIG.API_MAX_SIZE) {
      return true;
    }
    
    // For now, we'll assume all images need some processing for consistency
    // In a real app, you might check actual dimensions here
    return true;
  } catch (error) {
    // If we can't determine, assume it needs processing
    return true;
  }
};

/**
 * Batch process multiple images
 */
export const batchProcessImages = async (
  imageUris: string[],
  processor: (uri: string) => Promise<ProcessedImageResult>
): Promise<ProcessedImageResult[]> => {
  const results: ProcessedImageResult[] = [];
  
  for (const uri of imageUris) {
    try {
      const result = await processor(uri);
      results.push(result);
    } catch (error) {
      console.error(`Failed to process image ${uri}:`, error);
      // Continue with other images
    }
  }
  
  return results;
};