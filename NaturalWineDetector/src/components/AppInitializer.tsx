/**
 * App initialization component with loading and error states
 */
import React, { ReactNode, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { NetworkService } from '../services/NetworkService';
import { OfflineQueueService } from '../services/OfflineQueueService';
import { MemoryManager } from '../utils/MemoryManager';

interface AppInitializerProps {
  children: ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const { state, actions } = useAppContext();
  const [servicesInitialized, setServicesInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    initializeServices();
    
    // Cleanup on unmount
    return () => {
      MemoryManager.cleanup();
    };
  }, []);

  const initializeServices = async () => {
    try {
      // Initialize memory manager
      MemoryManager.initialize();

      // Initialize network service
      const networkService = NetworkService.getInstance();
      await networkService.initialize();

      // Initialize offline queue service
      const offlineQueueService = OfflineQueueService.getInstance();
      // Queue service initializes itself in constructor

      setServicesInitialized(true);
    } catch (error) {
      console.error('Failed to initialize services:', error);
      setInitializationError(
        error instanceof Error ? error.message : 'Failed to initialize app services'
      );
    }
  };

  // Show loading screen during service initialization
  if (!servicesInitialized && !initializationError) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#6b46c1" />
          <Text style={styles.loadingText}>Starting Natural Wine Detector...</Text>
          <Text style={styles.subText}>Initializing network and offline services</Text>
        </View>
      </View>
    );
  }

  // Show error screen if service initialization failed
  if (initializationError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContent}>
          <Text style={styles.errorTitle}>Service Initialization Failed</Text>
          <Text style={styles.errorMessage}>{initializationError}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              setInitializationError(null);
              setServicesInitialized(false);
              initializeServices();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show loading screen during app data initialization
  if (state.loading && state.wines.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#6b46c1" />
          <Text style={styles.loadingText}>Initializing Natural Wine Detector...</Text>
          <Text style={styles.subText}>Setting up your wine database</Text>
        </View>
      </View>
    );
  }

  // Show error screen if initialization failed
  if (state.error && state.wines.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContent}>
          <Text style={styles.errorTitle}>Initialization Failed</Text>
          <Text style={styles.errorMessage}>{state.error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              actions.setError(undefined);
              actions.loadWines();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // App is ready, render children
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  errorContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 350,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#6b46c1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});