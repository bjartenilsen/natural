import { 
  AppError, 
  ApiError, 
  NetworkError, 
  PermissionError, 
  StorageError, 
  ImageError, 
  LocationError,
  ErrorHandlerResult 
} from '../types/ErrorTypes';

/**
 * Error handling utilities for creating and managing application errors
 */
export class ErrorHandler {
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