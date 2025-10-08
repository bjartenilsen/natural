/**
 * Error handling type definitions for the Natural Wine Detector app
 */

/**
 * Base application error interface
 */
export interface AppError {
  type: 'api' | 'network' | 'permission' | 'storage' | 'image' | 'location';
  message: string;
  recoverable: boolean;
  timestamp: Date;
  context?: Record<string, any>;
}

/**
 * API-specific error
 */
export interface ApiError extends AppError {
  type: 'api';
  statusCode?: number;
  rateLimited?: boolean;
  apiEndpoint?: string;
  requestId?: string;
}

/**
 * Network-specific error
 */
export interface NetworkError extends AppError {
  type: 'network';
  isTimeout?: boolean;
  isOffline?: boolean;
  connectionType?: string;
}

/**
 * Permission-specific error
 */
export interface PermissionError extends AppError {
  type: 'permission';
  permission: 'camera' | 'location';
  canOpenSettings?: boolean;
  currentStatus?: string;
}

/**
 * Storage-specific error
 */
export interface StorageError extends AppError {
  type: 'storage';
  isStorageFull?: boolean;
  operation?: 'read' | 'write' | 'delete';
  tableName?: string;
}

/**
 * Image processing error
 */
export interface ImageError extends AppError {
  type: 'image';
  reason?: 'invalid_format' | 'too_large' | 'no_wine_detected' | 'processing_failed';
  imageSize?: number;
  imageFormat?: string;
}

/**
 * Location service error
 */
export interface LocationError extends AppError {
  type: 'location';
  reason?: 'permission_denied' | 'unavailable' | 'timeout' | 'accuracy_low';
  accuracy?: number;
}

/**
 * Result of error handling
 */
export interface ErrorHandlerResult {
  userMessage: string;
  shouldRetry: boolean;
  retryDelay?: number;
  shouldShowSettings?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

/**
 * Offline queue item
 */
export interface OfflineQueueItem {
  id: string;
  type: 'api_request';
  data: any;
  timestamp: Date;
  attempts: number;
  maxAttempts: number;
  nextRetry: Date;
}

/**
 * Network connectivity state
 */
export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  details: any;
}

/**
 * Error logging entry
 */
export interface ErrorLogEntry {
  id: string;
  error: AppError;
  userAgent?: string;
  appVersion?: string;
  timestamp: Date;
  resolved: boolean;
}