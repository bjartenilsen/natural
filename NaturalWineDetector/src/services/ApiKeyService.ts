import * as SecureStore from 'expo-secure-store';
import { ApiError } from '../types/ErrorTypes';
import { ErrorHandler } from '../utils/errorHandler';

/**
 * Service for secure API key management using Expo SecureStore
 */
export class ApiKeyService {
  private static readonly OPENAI_API_KEY = 'openai_api_key';
  private static readonly API_USAGE_KEY = 'api_usage_data';
  private static readonly SETTINGS_KEY = 'api_settings';

  /**
   * Store OpenAI API key securely
   * @param apiKey - The OpenAI API key to store
   * @returns Promise<void>
   */
  static async storeApiKey(apiKey: string): Promise<void> {
    try {
      if (!apiKey || apiKey.trim().length === 0) {
        throw new Error('API key cannot be empty');
      }

      // Validate API key format (OpenAI keys start with 'sk-')
      if (!apiKey.startsWith('sk-')) {
        throw new Error('Invalid OpenAI API key format');
      }

      await SecureStore.setItemAsync(this.OPENAI_API_KEY, apiKey.trim());
    } catch (error) {
      console.error('Failed to store API key:', error);
      throw ErrorHandler.createApiError({
        message: 'Failed to store API key securely',
        recoverable: false,
        endpoint: 'secure-storage',
        originalError: error as Error,
      });
    }
  }

  /**
   * Retrieve OpenAI API key from secure storage
   * @returns Promise<string | null> - The stored API key or null if not found
   */
  static async getApiKey(): Promise<string | null> {
    try {
      const apiKey = await SecureStore.getItemAsync(this.OPENAI_API_KEY);
      return apiKey;
    } catch (error) {
      console.error('Failed to retrieve API key:', error);
      throw ErrorHandler.createApiError({
        message: 'Failed to retrieve API key',
        recoverable: false,
        endpoint: 'secure-storage',
        originalError: error as Error,
      });
    }
  }

  /**
   * Remove API key from secure storage
   * @returns Promise<void>
   */
  static async removeApiKey(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.OPENAI_API_KEY);
    } catch (error) {
      console.error('Failed to remove API key:', error);
      throw ErrorHandler.createApiError({
        message: 'Failed to remove API key',
        recoverable: false,
        endpoint: 'secure-storage',
        originalError: error as Error,
      });
    }
  }

  /**
   * Check if API key is stored
   * @returns Promise<boolean> - True if API key exists
   */
  static async hasApiKey(): Promise<boolean> {
    try {
      const apiKey = await this.getApiKey();
      return !!apiKey;
    } catch (error) {
      console.error('Failed to check API key existence:', error);
      return false;
    }
  }

  /**
   * Validate API key format
   * @param apiKey - API key to validate
   * @returns boolean - True if valid format
   */
  static validateApiKeyFormat(apiKey: string): boolean {
    if (!apiKey || typeof apiKey !== 'string') {
      return false;
    }

    // OpenAI API keys start with 'sk-' and are typically 51 characters long
    const trimmedKey = apiKey.trim();
    return trimmedKey.startsWith('sk-') && trimmedKey.length >= 20;
  }

  /**
   * Store API usage data for monitoring
   * @param usageData - Usage statistics to store
   * @returns Promise<void>
   */
  static async storeUsageData(usageData: ApiUsageData): Promise<void> {
    try {
      const existingData = await this.getUsageData();
      const updatedData = {
        ...existingData,
        totalRequests: (existingData?.totalRequests || 0) + 1,
        totalTokens: (existingData?.totalTokens || 0) + (usageData.tokensUsed || 0),
        lastRequestTime: new Date().toISOString(),
        dailyRequests: this.updateDailyRequests(existingData?.dailyRequests || {}),
      };

      await SecureStore.setItemAsync(this.API_USAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Failed to store usage data:', error);
      // Don't throw error for usage tracking failures
    }
  }

  /**
   * Get API usage data
   * @returns Promise<ApiUsageData | null> - Usage statistics or null
   */
  static async getUsageData(): Promise<ApiUsageData | null> {
    try {
      const data = await SecureStore.getItemAsync(this.API_USAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to retrieve usage data:', error);
      return null;
    }
  }

  /**
   * Reset API usage data
   * @returns Promise<void>
   */
  static async resetUsageData(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.API_USAGE_KEY);
    } catch (error) {
      console.error('Failed to reset usage data:', error);
    }
  }

  /**
   * Store API settings
   * @param settings - API configuration settings
   * @returns Promise<void>
   */
  static async storeApiSettings(settings: ApiSettings): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to store API settings:', error);
      throw ErrorHandler.createApiError({
        message: 'Failed to store API settings',
        recoverable: false,
        endpoint: 'secure-storage',
        originalError: error as Error,
      });
    }
  }

  /**
   * Get API settings
   * @returns Promise<ApiSettings> - API settings with defaults
   */
  static async getApiSettings(): Promise<ApiSettings> {
    try {
      const data = await SecureStore.getItemAsync(this.SETTINGS_KEY);
      const stored = data ? JSON.parse(data) : {};
      
      // Return settings with defaults
      return {
        maxRequestsPerDay: stored.maxRequestsPerDay || 100,
        enableUsageTracking: stored.enableUsageTracking !== false, // Default to true
        enableRateLimiting: stored.enableRateLimiting !== false, // Default to true
        compressionQuality: stored.compressionQuality || 80,
        maxImageSize: stored.maxImageSize || 1024 * 1024, // 1MB
        ...stored,
      };
    } catch (error) {
      console.error('Failed to retrieve API settings:', error);
      // Return default settings on error
      return {
        maxRequestsPerDay: 100,
        enableUsageTracking: true,
        enableRateLimiting: true,
        compressionQuality: 80,
        maxImageSize: 1024 * 1024,
      };
    }
  }

  /**
   * Update daily request counter
   * @param dailyRequests - Current daily request data
   * @returns Updated daily request data
   */
  private static updateDailyRequests(dailyRequests: Record<string, number>): Record<string, number> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const updated = { ...dailyRequests };
    
    // Increment today's counter
    updated[today] = (updated[today] || 0) + 1;
    
    // Clean up old entries (keep only last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
    
    Object.keys(updated).forEach(date => {
      if (date < cutoffDate) {
        delete updated[date];
      }
    });
    
    return updated;
  }

  /**
   * Check if daily request limit is exceeded
   * @returns Promise<boolean> - True if limit exceeded
   */
  static async isDailyLimitExceeded(): Promise<boolean> {
    try {
      const settings = await this.getApiSettings();
      const usageData = await this.getUsageData();
      
      if (!settings.enableRateLimiting || !usageData?.dailyRequests) {
        return false;
      }
      
      const today = new Date().toISOString().split('T')[0];
      const todayRequests = usageData.dailyRequests[today] || 0;
      
      return todayRequests >= settings.maxRequestsPerDay;
    } catch (error) {
      console.error('Failed to check daily limit:', error);
      return false;
    }
  }

  /**
   * Get remaining requests for today
   * @returns Promise<number> - Number of remaining requests
   */
  static async getRemainingRequests(): Promise<number> {
    try {
      const settings = await this.getApiSettings();
      const usageData = await this.getUsageData();
      
      if (!settings.enableRateLimiting || !usageData?.dailyRequests) {
        return settings.maxRequestsPerDay;
      }
      
      const today = new Date().toISOString().split('T')[0];
      const todayRequests = usageData.dailyRequests[today] || 0;
      
      return Math.max(0, settings.maxRequestsPerDay - todayRequests);
    } catch (error) {
      console.error('Failed to get remaining requests:', error);
      return 0;
    }
  }
}

/**
 * API usage tracking data
 */
export interface ApiUsageData {
  totalRequests: number;
  totalTokens: number;
  lastRequestTime: string;
  dailyRequests: Record<string, number>; // date -> count
  tokensUsed?: number;
}

/**
 * API configuration settings
 */
export interface ApiSettings {
  maxRequestsPerDay: number;
  enableUsageTracking: boolean;
  enableRateLimiting: boolean;
  compressionQuality: number;
  maxImageSize: number;
}