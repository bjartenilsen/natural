/**
 * Error handling type definitions for the Natural Wine Detector app
 */

/**
 * Categories of errors that can occur in the app
 */
export type ErrorType = 'network' | 'permission' | 'storage' | 'image' | 'api' | 'location';

/**
 * Structured error information
 */
export interface AppError {
  type: ErrorType;
  message: string;
  recoverable: boolean;
  retryAction?: () => void;
  originalError?: Error;
}

/**
 * Network-related errors
 */
export interface NetworkError extends AppError {
  type: 'network';
  statusCode?: number;
  isTimeout?: boolean;
}

/**
 * Permission-related errors
 */
export interface PermissionError extends AppError {
  type: 'permission';
  permission: 'camera' | 'location';
  canOpenSettings: boolean;
}

/**
 * Storage/Database errors
 */
export interface StorageError extends AppError {
  type: 'storage';
  operation: 'read' | 'write' | 'delete' | 'init';
  isStorageFull?: boolean;
}

/**
 * Image processing errors
 */
export interface ImageError extends AppError {
  type: 'image';
  reason: 
    | 'invalid_format' 
    | 'too_large' 
    | 'file_too_large'
    | 'processing_failed' 
    | 'no_wine_detected'
    | 'conversion_failed'
    | 'invalid_dimensions'
    | 'info_failed'
    | 'resize_failed';
}

/**
 * API-related errors
 */
export interface ApiError extends AppError {
  type: 'api';
  endpoint: string;
  statusCode?: number;
  rateLimited?: boolean;
}

/**
 * Location service errors
 */
export interface LocationError extends AppError {
  type: 'location';
  reason: 'permission_denied' | 'unavailable' | 'timeout' | 'accuracy_low';
}

/**
 * Union type for all specific error types
 */
export type SpecificError = NetworkError | PermissionError | StorageError | ImageError | ApiError | LocationError;

/**
 * Error handler result
 */
export interface ErrorHandlerResult {
  userMessage: string;
  shouldRetry: boolean;
  retryDelay?: number;
  shouldShowSettings?: boolean;
}