import { 
  AppError, 
  ApiError, 
  NetworkError, 
  PermissionError, 
  StorageError, 
  ImageError, 
  LocationError,
  ErrorHandlerResult,
  RetryConfig,
  ErrorLogEntry
} from '../types/ErrorTypes';

/**
 * Simple error handler function for converting errors to user-friendly messages
 * @param error - The error to handle
 * @returns User-friendly error message
 */
export const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

/**
 * Error handling utilities for creating and managing application errors
 */
export class ErrorHandler {
  private static errorLog: ErrorLogEntry[] = [];

  /**
   * Default retry configuration
   */
  private static defaultRetryConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    retryableErrors: ['network', 'api', 'timeout']
  };

  /**
   * Log error for debugging and analytics
   * @param error - Error to log
   */
  static logError(error: AppError): void {
    const logEntry: ErrorLogEntry = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      error,
      timestamp: new Date(),
      resolved: false
    };

    this.errorLog.push(logEntry);

    // Keep only last 100 errors to prevent memory issues
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    // Log to console in development
    if (__DEV__) {
      console.error('App Error:', error);
    }
  }

  /**
   * Get error statistics for monitoring
   * @returns Error statistics
   */
  static getErrorStats(): { total: number; byType: Record<string, number>; recent: number } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recent = this.errorLog.filter(entry => entry.timestamp > oneHourAgo).length;
    const byType = this.errorLog.reduce((acc, entry) => {
      acc[entry.error.type] = (acc[entry.error.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.errorLog.length,
      byType,
      recent
    };
  }

  /**
   * Retry operation with exponential backoff
   * @param operation - Function to retry
   * @param config - Retry configuration
   * @returns Promise that resolves with operation result
   */
  static async retryOperation<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const retryConfig = { ...this.defaultRetryConfig, ...config };
    let lastError: Error;

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry if it's the last attempt or error is not retryable
        if (attempt === retryConfig.maxAttempts || !this.isRetryableError(error, retryConfig)) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
          retryConfig.maxDelay
        );

        await this.delay(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Check if error is retryable based on configuration
   * @param error - Error to check
   * @param config - Retry configuration
   * @returns True if error is retryable
   */
  private static isRetryableError(error: any, config: RetryConfig): boolean {
    if (error?.type && config.retryableErrors.includes(error.type)) {
      return true;
    }
    
    // Check for specific error conditions
    if (error?.code === 'NETWORK_ERROR' || error?.code === 'TIMEOUT') {
      return true;
    }

    return false;
  }

  /**
   * Delay execution for specified milliseconds
   * @param ms - Milliseconds to delay
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  /**
   * Handle an application error and return user-friendly result
   * @param error - The error to handle
   * @returns ErrorHandlerResult with user message and recovery options
   */
  static handle(error: AppError): ErrorHandlerResult {
    switch (error.type) {
      case 'api':
        return this.handleApiError(error as ApiError);
      case 'network':
        return this.handleNetworkError(error as NetworkError);
      case 'permission':
        return this.handlePermissionError(error as PermissionError);
      case 'storage':
        return this.handleStorageError(error as StorageError);
      case 'image':
        return this.handleImageError(error as ImageError);
      case 'location':
        return this.handleLocationError(error as LocationError);
      default:
        return {
          userMessage: 'An unexpected error occurred. Please try again.',
          shouldRetry: true,
          retryDelay: 1000,
        };
    }
  }

  /**
   * Create an API error
   * @param params - Error parameters
   * @returns ApiError instance
   */
  static createApiError(params: Omit<ApiError, 'type'>): ApiError {
    return {
      type: 'api',
      ...params,
    };
  }

  /**
   * Create a network error
   * @param params - Error parameters
   * @returns NetworkError instance
   */
  static createNetworkError(params: Omit<NetworkError, 'type'>): NetworkError {
    return {
      type: 'network',
      ...params,
    };
  }

  /**
   * Create a permission error
   * @param params - Error parameters
   * @returns PermissionError instance
   */
  static createPermissionError(params: Omit<PermissionError, 'type'>): PermissionError {
    return {
      type: 'permission',
      ...params,
    };
  }

  /**
   * Create a storage error
   * @param params - Error parameters
   * @returns StorageError instance
   */
  static createStorageError(params: Omit<StorageError, 'type'>): StorageError {
    return {
      type: 'storage',
      ...params,
    };
  }

  /**
   * Create an image error
   * @param params - Error parameters
   * @returns ImageError instance
   */
  static createImageError(params: Omit<ImageError, 'type'>): ImageError {
    return {
      type: 'image',
      ...params,
    };
  }

  /**
   * Create a location error
   * @param params - Error parameters
   * @returns LocationError instance
   */
  static createLocationError(params: Omit<LocationError, 'type'>): LocationError {
    return {
      type: 'location',
      ...params,
    };
  }

  /**
   * Handle API-specific errors
   */
  private static handleApiError(error: ApiError): ErrorHandlerResult {
    if (error.rateLimited) {
      return {
        userMessage: 'API rate limit exceeded. Please wait a moment before trying again.',
        shouldRetry: true,
        retryDelay: 60000, // 1 minute
      };
    }

    if (error.statusCode === 401) {
      return {
        userMessage: 'Invalid API key. Please check your OpenAI API key in settings.',
        shouldRetry: false,
        shouldShowSettings: true,
      };
    }

    if (error.statusCode === 429) {
      return {
        userMessage: 'Too many requests. Please wait before trying again.',
        shouldRetry: true,
        retryDelay: 30000, // 30 seconds
      };
    }

    return {
      userMessage: error.message || 'API request failed. Please try again.',
      shouldRetry: error.recoverable,
      retryDelay: 5000,
    };
  }

  /**
   * Handle network-specific errors
   */
  private static handleNetworkError(error: NetworkError): ErrorHandlerResult {
    if (error.isTimeout) {
      return {
        userMessage: 'Request timed out. Please check your internet connection and try again.',
        shouldRetry: true,
        retryDelay: 3000,
      };
    }

    return {
      userMessage: 'Network error. Please check your internet connection.',
      shouldRetry: true,
      retryDelay: 5000,
    };
  }

  /**
   * Handle permission-specific errors
   */
  private static handlePermissionError(error: PermissionError): ErrorHandlerResult {
    const permissionName = error.permission === 'camera' ? 'Camera' : 'Location';
    
    return {
      userMessage: `${permissionName} permission is required. Please enable it in settings.`,
      shouldRetry: false,
      shouldShowSettings: error.canOpenSettings,
    };
  }

  /**
   * Handle storage-specific errors
   */
  private static handleStorageError(error: StorageError): ErrorHandlerResult {
    if (error.isStorageFull) {
      return {
        userMessage: 'Device storage is full. Please free up space and try again.',
        shouldRetry: false,
      };
    }

    return {
      userMessage: 'Storage error occurred. Please try again.',
      shouldRetry: true,
      retryDelay: 2000,
    };
  }

  /**
   * Handle image-specific errors
   */
  private static handleImageError(error: ImageError): ErrorHandlerResult {
    switch (error.reason) {
      case 'invalid_format':
        return {
          userMessage: 'Invalid image format. Please use JPG or PNG images.',
          shouldRetry: false,
        };
      case 'too_large':
        return {
          userMessage: 'Image is too large. Please use a smaller image.',
          shouldRetry: false,
        };
      case 'no_wine_detected':
        return {
          userMessage: 'No wine bottle detected in the image. Please try again with a clearer photo.',
          shouldRetry: false,
        };
      default:
        return {
          userMessage: 'Image processing failed. Please try again.',
          shouldRetry: true,
          retryDelay: 2000,
        };
    }
  }

  /**
   * Handle location-specific errors
   */
  private static handleLocationError(error: LocationError): ErrorHandlerResult {
    switch (error.reason) {
      case 'permission_denied':
        return {
          userMessage: 'Location permission denied. Enable location access in settings.',
          shouldRetry: false,
          shouldShowSettings: true,
        };
      case 'unavailable':
        return {
          userMessage: 'Location services unavailable. Please enable GPS.',
          shouldRetry: false,
        };
      case 'timeout':
        return {
          userMessage: 'Location request timed out. Please try again.',
          shouldRetry: true,
          retryDelay: 3000,
        };
      default:
        return {
          userMessage: 'Location error occurred. Please try again.',
          shouldRetry: true,
          retryDelay: 2000,
        };
    }
  }
}