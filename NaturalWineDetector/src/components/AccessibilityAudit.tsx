import React, { useEffect } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Component that audits and improves accessibility throughout the app
 */
export const AccessibilityAudit: React.FC = () => {
  useEffect(() => {
    // Check if screen reader is enabled
    const checkScreenReader = async () => {
      try {
        const isScreenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
        if (isScreenReaderEnabled) {
          console.log('Screen reader is enabled - ensuring optimal accessibility');
          
          // Announce app launch for screen reader users
          if (Platform.OS === 'ios') {
            AccessibilityInfo.announceForAccessibility(
              'Natural Wine Detector app launched. Use the camera to analyze wine bottles.'
            );
          }
        }
      } catch (error) {
        console.warn('Could not check screen reader status:', error);
      }
    };

    checkScreenReader();

    // Listen for screen reader changes
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (isEnabled) => {
        console.log('Screen reader status changed:', isEnabled);
        if (isEnabled) {
          AccessibilityInfo.announceForAccessibility(
            'Screen reader enabled. Natural Wine Detector is optimized for accessibility.'
          );
        }
      }
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  // This component doesn't render anything
  return null;
};

/**
 * Utility functions for accessibility announcements
 */
export const AccessibilityAnnouncements = {
  /**
   * Announce when wine analysis starts
   */
  analysisStarted: () => {
    AccessibilityInfo.announceForAccessibility(
      'Wine analysis started. Please wait while we analyze your photo.'
    );
  },

  /**
   * Announce analysis results
   */
  analysisComplete: (isNaturalWine: boolean, confidence: number) => {
    const wineType = isNaturalWine ? 'natural wine' : 'not a natural wine';
    const confidenceLevel = confidence >= 80 ? 'high' : confidence >= 60 ? 'medium' : 'low';
    
    AccessibilityInfo.announceForAccessibility(
      `Analysis complete. This appears to be ${wineType} with ${confidenceLevel} confidence at ${confidence} percent.`
    );
  },

  /**
   * Announce when wine is saved
   */
  wineSaved: () => {
    AccessibilityInfo.announceForAccessibility(
      'Wine record saved successfully to your history.'
    );
  },

  /**
   * Announce navigation changes
   */
  navigationChanged: (screenName: string) => {
    const screenAnnouncements: Record<string, string> = {
      Camera: 'Camera screen. Take a photo of a wine bottle to analyze.',
      Analysis: 'Analysis screen. Viewing wine analysis results.',
      WineLogging: 'Wine logging screen. Add details about your wine experience.',
      History: 'Wine history screen. Browse your analyzed wines.',
      WineDetail: 'Wine detail screen. Viewing detailed wine information.',
    };

    const announcement = screenAnnouncements[screenName] || `Navigated to ${screenName}`;
    AccessibilityInfo.announceForAccessibility(announcement);
  },

  /**
   * Announce errors
   */
  error: (errorMessage: string) => {
    AccessibilityInfo.announceForAccessibility(
      `Error occurred: ${errorMessage}`
    );
  },

  /**
   * Announce loading states
   */
  loading: (message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  },
};