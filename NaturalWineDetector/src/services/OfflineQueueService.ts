/**
 * Offline queue service for managing API requests when offline
 */

import { OfflineQueueItem, NetworkState } from '../types/ErrorTypes';
import { NetworkService } from './NetworkService';
import { ErrorHandler } from '../utils/errorHandler';

// Try to import AsyncStorage, fall back to mock if not available
let AsyncStorage: any;

try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (error) {
  // Use mock for development
  const { mockAsyncStorage } = require('../utils/mockDependencies');
  AsyncStorage = mockAsyncStorage;
  console.warn('AsyncStorage not available, using mock implementation');
}

const QUEUE_STORAGE_KEY = '@natural_wine_detector_offline_queue';

export class OfflineQueueService {
  private static instance: OfflineQueueService;
  private queue: OfflineQueueItem[] = [];
  private isProcessing = false;
  private networkService: NetworkService;

  /**
   * Get singleton instance
   */
  static getInstance(): OfflineQueueService {
    if (!OfflineQueueService.instance) {
      OfflineQueueService.instance = new OfflineQueueService();
    }
    return OfflineQueueService.instance;
  }

  constructor() {
    this.networkService = NetworkService.getInstance();
    this.initialize();
  }

  /**
   * Initialize the offline queue service
   */
  private async initialize(): Promise<void> {
    // Load existing queue from storage
    await this.loadQueue();

    // Listen for network state changes
    this.networkService.addListener(this.handleNetworkStateChange.bind(this));

    // Process queue if online
    if (this.networkService.isOnline()) {
      this.processQueue();
    }
  }

  /**
   * Handle network state changes
   * @param state - Network state
   */
  private handleNetworkStateChange(state: NetworkState): void {
    if (state.isConnected && state.isInternetReachable && !this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Add item to offline queue
   * @param type - Type of queued operation
   * @param data - Data for the operation
   * @param maxAttempts - Maximum retry attempts
   */
  async addToQueue(
    type: 'api_request',
    data: any,
    maxAttempts = 3
  ): Promise<string> {
    const item: OfflineQueueItem = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: new Date(),
      attempts: 0,
      maxAttempts,
      nextRetry: new Date()
    };

    this.queue.push(item);
    await this.saveQueue();

    // Try to process immediately if online
    if (this.networkService.isOnline()) {
      this.processQueue();
    }

    return item.id;
  }

  /**
   * Remove item from queue
   * @param id - Item ID to remove
   */
  async removeFromQueue(id: string): Promise<void> {
    this.queue = this.queue.filter(item => item.id !== id);
    await this.saveQueue();
  }

  /**
   * Get current queue status
   * @returns Queue information
   */
  getQueueStatus(): {
    totalItems: number;
    pendingItems: number;
    failedItems: number;
    isProcessing: boolean;
  } {
    const pendingItems = this.queue.filter(item => item.attempts < item.maxAttempts).length;
    const failedItems = this.queue.filter(item => item.attempts >= item.maxAttempts).length;

    return {
      totalItems: this.queue.length,
      pendingItems,
      failedItems,
      isProcessing: this.isProcessing
    };
  }

  /**
   * Process the offline queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.networkService.isOffline()) {
      return;
    }

    this.isProcessing = true;

    try {
      const now = new Date();
      const itemsToProcess = this.queue.filter(item => 
        item.attempts < item.maxAttempts && item.nextRetry <= now
      );

      for (const item of itemsToProcess) {
        try {
          await this.processQueueItem(item);
          
          // Remove successful item from queue
          await this.removeFromQueue(item.id);
        } catch (error) {
          // Update retry information
          item.attempts++;
          
          if (item.attempts < item.maxAttempts) {
            // Calculate exponential backoff delay
            const baseDelay = 5000; // 5 seconds
            const maxDelay = 300000; // 5 minutes
            const delay = Math.min(
              baseDelay * Math.pow(2, item.attempts - 1),
              maxDelay
            );
            
            item.nextRetry = new Date(now.getTime() + delay);
            await this.saveQueue();
          } else {
            // Remove failed item after max attempts
            await this.removeFromQueue(item.id);
            
            // Log the permanent failure
            ErrorHandler.logError(ErrorHandler.createNetworkError({
              message: `Offline queue item failed permanently: ${item.id}`,
              recoverable: false,
              timestamp: new Date(),
              context: { item }
            }));
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process individual queue item
   * @param item - Queue item to process
   */
  private async processQueueItem(item: OfflineQueueItem): Promise<void> {
    switch (item.type) {
      case 'api_request':
        await this.processApiRequest(item);
        break;
      default:
        throw new Error(`Unknown queue item type: ${item.type}`);
    }
  }

  /**
   * Process wine analysis queue item
   * @param item - Wine analysis queue item
   */
  private async processWineAnalysis(item: OfflineQueueItem): Promise<void> {
    // This would integrate with the ChatGPT service
    // For now, we'll simulate the processing
    const { imageBase64, callback } = item.data;
    
    // Import ChatGPT service dynamically to avoid circular dependencies
    const { ChatGPTService } = await import('./ChatGPTService');
    
    const result = await ChatGPTService.analyzeWineImage(imageBase64);
    
    // Execute callback if provided
    if (callback && typeof callback === 'function') {
      callback(result);
    }
  }

  /**
   * Process generic API request queue item
   * @param item - API request queue item
   */
  private async processApiRequest(item: OfflineQueueItem): Promise<void> {
    const { url, method, headers, body, callback } = item.data;
    
    const response = await fetch(url, {
      method: method || 'GET',
      headers: headers || {},
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // Execute callback if provided
    if (callback && typeof callback === 'function') {
      callback(result);
    }
  }

  /**
   * Load queue from persistent storage
   */
  private async loadQueue(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (queueData) {
        const parsedQueue = JSON.parse(queueData);
        // Convert date strings back to Date objects
        this.queue = parsedQueue.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
          nextRetry: new Date(item.nextRetry)
        }));
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to persistent storage
   */
  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  /**
   * Clear all items from queue
   */
  async clearQueue(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
  }

  /**
   * Get queue items for debugging
   * @returns Current queue items
   */
  getQueueItems(): OfflineQueueItem[] {
    return [...this.queue];
  }
}