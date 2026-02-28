import { handleError, ErrorHandler } from '../../src/utils/errorHandler';
import { ApiError, NetworkError, PermissionError, StorageError, ImageError, LocationError } from '../../src/types/ErrorTypes';

describe('handleError', () => {
  it('returns message from Error instances', () => {
    expect(handleError(new Error('test error'))).toBe('test error');
  });

  it('returns string errors as-is', () => {
    expect(handleError('string error')).toBe('string error');
  });

  it('returns fallback for unknown types', () => {
    expect(handleError(42)).toBe('An unexpected error occurred');
    expect(handleError(null)).toBe('An unexpected error occurred');
    expect(handleError(undefined)).toBe('An unexpected error occurred');
  });
});

describe('ErrorHandler', () => {
  describe('createApiError', () => {
    it('creates an ApiError with type "api"', () => {
      const error = ErrorHandler.createApiError({
        message: 'API failed',
        recoverable: true,
        timestamp: new Date(),
        apiEndpoint: '/test',
      });
      expect(error.type).toBe('api');
      expect(error.message).toBe('API failed');
      expect(error.apiEndpoint).toBe('/test');
    });
  });

  describe('createNetworkError', () => {
    it('creates a NetworkError with type "network"', () => {
      const error = ErrorHandler.createNetworkError({
        message: 'No network',
        recoverable: true,
        timestamp: new Date(),
        isOffline: true,
      });
      expect(error.type).toBe('network');
      expect(error.isOffline).toBe(true);
    });
  });

  describe('createStorageError', () => {
    it('creates a StorageError with type "storage"', () => {
      const error = ErrorHandler.createStorageError({
        message: 'Storage full',
        recoverable: false,
        timestamp: new Date(),
        operation: 'write',
      });
      expect(error.type).toBe('storage');
      expect(error.operation).toBe('write');
    });
  });

  describe('handle', () => {
    it('handles rate-limited API errors', () => {
      const error: ApiError = {
        type: 'api',
        message: 'Rate limited',
        recoverable: true,
        timestamp: new Date(),
        apiEndpoint: '/chat',
        rateLimited: true,
      };
      const result = ErrorHandler.handle(error);
      expect(result.shouldRetry).toBe(true);
      expect(result.retryDelay).toBe(60000);
    });

    it('handles 401 API errors', () => {
      const error: ApiError = {
        type: 'api',
        message: 'Unauthorized',
        recoverable: false,
        timestamp: new Date(),
        apiEndpoint: '/chat',
        statusCode: 401,
      };
      const result = ErrorHandler.handle(error);
      expect(result.shouldRetry).toBe(false);
      expect(result.shouldShowSettings).toBe(true);
    });

    it('handles network timeout errors', () => {
      const error: NetworkError = {
        type: 'network',
        message: 'Timeout',
        recoverable: true,
        timestamp: new Date(),
        isTimeout: true,
      };
      const result = ErrorHandler.handle(error);
      expect(result.shouldRetry).toBe(true);
      expect(result.userMessage).toContain('timed out');
    });

    it('handles permission errors', () => {
      const error: PermissionError = {
        type: 'permission',
        message: 'Camera denied',
        recoverable: false,
        timestamp: new Date(),
        permission: 'camera',
        canOpenSettings: true,
      };
      const result = ErrorHandler.handle(error);
      expect(result.shouldRetry).toBe(false);
      expect(result.userMessage).toContain('Camera');
    });

    it('handles storage full errors', () => {
      const error: StorageError = {
        type: 'storage',
        message: 'Full',
        recoverable: false,
        timestamp: new Date(),
        operation: 'write',
        isStorageFull: true,
      };
      const result = ErrorHandler.handle(error);
      expect(result.shouldRetry).toBe(false);
      expect(result.userMessage).toContain('storage is full');
    });

    it('handles image format errors', () => {
      const error: ImageError = {
        type: 'image',
        message: 'Bad format',
        recoverable: false,
        timestamp: new Date(),
        reason: 'invalid_format',
      };
      const result = ErrorHandler.handle(error);
      expect(result.shouldRetry).toBe(false);
      expect(result.userMessage).toContain('Invalid image format');
    });

    it('handles location permission denied', () => {
      const error: LocationError = {
        type: 'location',
        message: 'Denied',
        recoverable: false,
        timestamp: new Date(),
        reason: 'permission_denied',
      };
      const result = ErrorHandler.handle(error);
      expect(result.shouldRetry).toBe(false);
      expect(result.shouldShowSettings).toBe(true);
    });
  });

  describe('getErrorStats', () => {
    it('returns error statistics', () => {
      const stats = ErrorHandler.getErrorStats();
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('byType');
      expect(stats).toHaveProperty('recent');
      expect(typeof stats.total).toBe('number');
    });
  });
});
