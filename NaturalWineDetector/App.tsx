/**
 * Main App component with global state management, error boundary, and initialization
 */
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StatusBar as RNStatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation';
import { AppProvider } from './src/context/AppContext';
import { WorkflowManager } from './src/components/WorkflowManager';
import { ThemeProvider } from './src/styles/ThemeProvider';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AppInitializer } from './src/components/AppInitializer';
import { AccessibilityAudit } from './src/components/AccessibilityAudit';
import { OfflineIndicator } from './src/components/OfflineIndicator';

export default function App() {
  // Ensure Android status bar is not translucent so content doesn't draw behind it
  if (Platform.OS === 'android') {
    RNStatusBar.setTranslucent(false);
    RNStatusBar.setBackgroundColor('#6B46C1');
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppProvider>
            <WorkflowManager>
              <AppInitializer>
                <AccessibilityAudit />
                <AppNavigator />
                <OfflineIndicator showWhenOnline={false} position="top" />
                <StatusBar style="light" />
              </AppInitializer>
            </WorkflowManager>
          </AppProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
