/**
 * Main App component with global state management, error boundary, and initialization
 */
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation';
import { AppProvider } from './src/context/AppContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AppInitializer } from './src/components/AppInitializer';
import { OfflineIndicator } from './src/components/OfflineIndicator';

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppProvider>
          <AppInitializer>
            <AppNavigator />
            <OfflineIndicator showWhenOnline={true} position="top" />
            <StatusBar style="light" />
          </AppInitializer>
        </AppProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
