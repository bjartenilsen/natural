/**
 * Network connectivity service for offline detection and management
 */

import NetInfo from '@react-native-community/netinfo';
import { NetworkState } from '../types/ErrorTypes';

export class NetworkService {
  private static instance: NetworkService;
  private listeners: ((state: NetworkState) => void)[] = [];
  private currentState: NetworkState = {
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    details: null
  };

  /**
   * Get singleton instance
   */
  static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  /**
   * Initialize network monitoring
   */
  async initialize(): Promise<void> {
    // Get initial network state
    const state = await NetInfo.fetch();
    this.updateNetworkState(state);

    // Subscribe to network state changes
    NetInfo.addEventListener(this.handleNetworkStateChange.bind(this));
  }

  /**
   * Handle network state changes
   * @param state - NetInfo state
   */
  private handleNetworkStateChange(state: any): void {
    this.updateNetworkState(state);
  }

  /**
   * Update internal network state and notify listeners
   * @param state - NetInfo state
   */
  private updateNetworkState(state: any): void {
    const networkState: NetworkState = {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false,
      type: state.type,
      details: state.details
    };

    const wasOffline = !this.currentState.isConnected || !this.currentState.isInternetReachable;
    const isNowOnline = networkState.isConnected && networkState.isInternetReachable;

    this.currentState = networkState;

    // Notify listeners
    this.listeners.forEach(listener => listener(networkState));

    // Log connectivity changes
    if (wasOffline && isNowOnline) {
      console.log('Network connectivity restored');
    } else if (!wasOffline && !isNowOnline) {
      console.log('Network connectivity lost');
    }
  }

  /**
   * Get current network state
   * @returns Current network state
   */
  getCurrentState(): NetworkState {
    return { ...this.currentState };
  }

  /**
   * Check if device is currently online
   * @returns True if online
   */
  isOnline(): boolean {
    return this.currentState.isConnected && this.currentState.isInternetReachable;
  }

  /**
   * Check if device is currently offline
   * @returns True if offline
   */
  isOffline(): boolean {
    return !this.isOnline();
  }

  /**
   * Add listener for network state changes
   * @param listener - Callback function
   * @returns Unsubscribe function
   */
  addListener(listener: (state: NetworkState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    this.listeners = [];
  }

  /**
   * Test internet connectivity by making a simple request
   * @returns Promise that resolves to true if internet is reachable
   */
  async testInternetConnectivity(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for network connectivity to be restored
   * @param timeout - Maximum time to wait in milliseconds
   * @returns Promise that resolves when online or rejects on timeout
   */
  async waitForConnectivity(timeout = 30000): Promise<void> {
    if (this.isOnline()) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        unsubscribe();
        reject(new Error('Timeout waiting for network connectivity'));
      }, timeout);

      const unsubscribe = this.addListener((state) => {
        if (state.isConnected && state.isInternetReachable) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve();
        }
      });
    });
  }
}