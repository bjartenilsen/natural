import { useCallback } from 'react';
import { Alert } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/AppTypes';
import { WineAnalysisResult, LocationData, WineRecord } from '../types/WineTypes';
import { NavigationUtils } from '../navigation/navigationUtils';
import { useAppContext } from '../context/AppContext';
import { useWorkflow } from '../components/WorkflowManager';

/**
 * Custom hook that integrates the complete wine analysis workflow
 * Ensures proper data flow and state management across all screens
 */
export const useWorkflowIntegration = (navigation: NavigationProp<RootStackParamList>) => {
  const { actions: appActions } = useAppContext();
  const { actions: workflowActions } = useWorkflow();

  /**
   * Handle image capture from camera
   */
  const handleImageCaptured = useCallback(async (
    imageUri: string, 
    location?: LocationData
  ) => {
    try {
      workflowActions.setTransitioning(true);
      
      // Validate image URI
      if (!imageUri || imageUri.trim() === '') {
        throw new Error('Invalid image captured');
      }

      // Update workflow state
      workflowActions.startAnalysis(imageUri, location);
      
      // Navigate to analysis screen
      NavigationUtils.navigateToAnalysis(navigation, imageUri, location);
      
    } catch (error) {
      console.error('Image capture workflow error:', error);
      Alert.alert(
        'Capture Error',
        'Failed to process captured image. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      workflowActions.setTransitioning(false);
    }
  }, [navigation, workflowActions]);

  /**
   * Handle analysis completion
   */
  const handleAnalysisComplete = useCallback(async (
    result: WineAnalysisResult,
    imageUri: string,
    location?: LocationData
  ) => {
    try {
      workflowActions.setTransitioning(true);
      
      // Validate analysis result
      if (!result || typeof result.confidenceScore !== 'number') {
        throw new Error('Invalid analysis result');
      }

      // Update workflow and app state
      workflowActions.completeAnalysis(result);
      appActions.setCurrentAnalysis(result);
      
      // Navigate to wine logging
      NavigationUtils.navigateToWineLogging(navigation, result, imageUri, location);
      
    } catch (error) {
      console.error('Analysis completion workflow error:', error);
      Alert.alert(
        'Analysis Error',
        'Failed to process analysis results. Please try again.',
        [
          { text: 'Retry', onPress: () => NavigationUtils.navigateToAnalysis(navigation, imageUri, location) },
          { text: 'Cancel', onPress: () => NavigationUtils.navigateToCamera(navigation) }
        ]
      );
    } finally {
      workflowActions.setTransitioning(false);
    }
  }, [navigation, workflowActions, appActions]);

  /**
   * Handle wine record save
   */
  const handleWineSaved = useCallback(async (wineRecord: WineRecord) => {
    try {
      workflowActions.setTransitioning(true);
      
      // Validate wine record
      if (!wineRecord || !wineRecord.id) {
        throw new Error('Invalid wine record');
      }

      // Update app state
      appActions.addWine(wineRecord);
      appActions.clearCurrentAnalysis();
      
      // Update workflow state
      workflowActions.completeLogging(wineRecord);
      
      // Show success message and navigate
      Alert.alert(
        'Wine Saved Successfully!',
        'Your wine record has been added to your history.',
        [
          {
            text: 'View History',
            onPress: () => {
              workflowActions.viewHistory();
              NavigationUtils.navigateToHistory(navigation);
            }
          },
          {
            text: 'Analyze Another',
            onPress: () => {
              workflowActions.returnToCamera();
              NavigationUtils.navigateToCamera(navigation);
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Wine save workflow error:', error);
      Alert.alert(
        'Save Error',
        'Failed to save wine record. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      workflowActions.setTransitioning(false);
    }
  }, [navigation, workflowActions, appActions]);

  /**
   * Handle wine selection from history
   */
  const handleWineSelected = useCallback(async (wine: WineRecord) => {
    try {
      workflowActions.setTransitioning(true);
      
      // Validate wine record
      if (!wine || !wine.id) {
        throw new Error('Invalid wine selection');
      }

      // Update workflow state
      workflowActions.viewWineDetail(wine);
      
      // Navigate to wine detail
      NavigationUtils.navigateToWineDetail(navigation, wine.id);
      
    } catch (error) {
      console.error('Wine selection workflow error:', error);
      Alert.alert(
        'Navigation Error',
        'Failed to open wine details. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      workflowActions.setTransitioning(false);
    }
  }, [navigation, workflowActions]);

  /**
   * Handle navigation to history
   */
  const handleNavigateToHistory = useCallback(() => {
    try {
      workflowActions.viewHistory();
      NavigationUtils.navigateToHistory(navigation);
    } catch (error) {
      console.error('History navigation workflow error:', error);
      Alert.alert(
        'Navigation Error',
        'Failed to open wine history. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [navigation, workflowActions]);

  /**
   * Handle return to camera
   */
  const handleReturnToCamera = useCallback(() => {
    try {
      workflowActions.returnToCamera();
      appActions.clearCurrentAnalysis();
      NavigationUtils.navigateToCamera(navigation);
    } catch (error) {
      console.error('Camera navigation workflow error:', error);
      Alert.alert(
        'Navigation Error',
        'Failed to return to camera. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [navigation, workflowActions, appActions]);

  /**
   * Handle workflow errors
   */
  const handleWorkflowError = useCallback((error: string, context: string) => {
    console.error(`Workflow error in ${context}:`, error);
    
    Alert.alert(
      'Workflow Error',
      `An error occurred during ${context}. Would you like to start over?`,
      [
        { text: 'Try Again', style: 'default' },
        { 
          text: 'Start Over', 
          onPress: handleReturnToCamera,
          style: 'destructive'
        }
      ]
    );
  }, [handleReturnToCamera]);

  return {
    handleImageCaptured,
    handleAnalysisComplete,
    handleWineSaved,
    handleWineSelected,
    handleNavigateToHistory,
    handleReturnToCamera,
    handleWorkflowError,
  };
};