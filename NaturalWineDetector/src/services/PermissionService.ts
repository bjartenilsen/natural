/**
 * Permission service for managing camera and location permissions
 * Provides centralized permission handling with user-friendly prompts and fallback flows
 */

import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';

export type PermissionType = 'camera' | 'location' | 'mediaLibrary';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'restricted';

export interface PermissionResult {
  status: PermissionStatus;
  canAskAgain: boolean;
}

export interface PermissionInfo {
  type: PermissionType;
  title: string;
  description: string;
  settingsMessage: string;
  required: boolean;
}

export class PermissionService {
  private static readonly PERMISSION_INFO: Record<PermissionType, PermissionInfo> = {
    camera: {
      type: 'camera',
      title: 'Camera Access Required',
      description: 'To analyze wine bottles, we need access to your camera to take photos.',
      settingsMessage: 'Please enable camera access in your device settings to take photos of wine bottles.',
      required: true,
    },
    location: {
      type: 'location',
      title: 'Location Access',
      description: 'Allow location access to automatically record where you discovered wines. This is optional but enhances your wine journal.',
      settingsMessage: 'To record wine locations, please enable location access in your device settings.',
      required: false,
    },
    mediaLibrary: {
      type: 'mediaLibrary',
      title: 'Photo Library Access',
      description: 'Access your photo library to select existing wine photos for analysis.',
      settingsMessage: 'Please enable photo library access in your device settings to select photos.',
      required: false,
    },
  };

  /**
   * Check current permission status for a specific permission type
   */
  static async checkPermissionStatus(type: PermissionType): Promise<PermissionResult> {
    try {
      let result: any;
      
      switch (type) {
        case 'camera':
          result = await ImagePicker.getCameraPermissionsAsync();
          break;
        case 'location':
          result = await Location.getForegroundPermissionsAsync();
          break;
        case 'mediaLibrary':
          result = await ImagePicker.getMediaLibraryPermissionsAsync();
          break;
        default:
          throw new Error(`Unknown permission type: ${type}`);
      }

      return {
        status: result.status as PermissionStatus,
        canAskAgain: result.canAskAgain ?? true,
      };
    } catch (error) {
      console.error(`Error checking ${type} permission:`, error);
      return {
        status: 'denied',
        canAskAgain: false,
      };
    }
  }

  /**
   * Request permission with user-friendly prompts
   */
  static async requestPermission(type: PermissionType): Promise<PermissionResult> {
    try {
      const info = this.PERMISSION_INFO[type];
      
      // Check current status first
      const currentStatus = await this.checkPermissionStatus(type);
      
      if (currentStatus.status === 'granted') {
        return currentStatus;
      }

      // If permission was previously denied and we can't ask again, show settings prompt
      if (currentStatus.status === 'denied' && !currentStatus.canAskAgain) {
        return this.showSettingsPrompt(type);
      }

      // Request the permission
      let result: any;
      
      switch (type) {
        case 'camera':
          result = await ImagePicker.requestCameraPermissionsAsync();
          break;
        case 'location':
          result = await Location.requestForegroundPermissionsAsync();
          break;
        case 'mediaLibrary':
          result = await ImagePicker.requestMediaLibraryPermissionsAsync();
          break;
        default:
          throw new Error(`Unknown permission type: ${type}`);
      }

      const finalResult: PermissionResult = {
        status: result.status as PermissionStatus,
        canAskAgain: result.canAskAgain ?? true,
      };

      // If permission was denied and it's required, show explanation
      if (finalResult.status === 'denied' && info.required) {
        this.showPermissionDeniedAlert(type);
      }

      return finalResult;
    } catch (error) {
      console.error(`Error requesting ${type} permission:`, error);
      return {
        status: 'denied',
        canAskAgain: false,
      };
    }
  }

  /**
   * Request multiple permissions at once
   */
  static async requestMultiplePermissions(
    types: PermissionType[]
  ): Promise<Record<PermissionType, PermissionResult>> {
    const results: Record<string, PermissionResult> = {};
    
    for (const type of types) {
      results[type] = await this.requestPermission(type);
    }
    
    return results as Record<PermissionType, PermissionResult>;
  }

  /**
   * Check if all required permissions are granted
   */
  static async checkRequiredPermissions(): Promise<{
    allGranted: boolean;
    missing: PermissionType[];
    results: Record<PermissionType, PermissionResult>;
  }> {
    const requiredTypes: PermissionType[] = ['camera']; // Camera is required, location is optional
    const results: Record<string, PermissionResult> = {};
    const missing: PermissionType[] = [];

    for (const type of requiredTypes) {
      const result = await this.checkPermissionStatus(type);
      results[type] = result;
      
      if (result.status !== 'granted') {
        missing.push(type);
      }
    }

    return {
      allGranted: missing.length === 0,
      missing,
      results: results as Record<PermissionType, PermissionResult>,
    };
  }

  /**
   * Show settings prompt when permission is permanently denied
   */
  private static async showSettingsPrompt(type: PermissionType): Promise<PermissionResult> {
    const info = this.PERMISSION_INFO[type];
    
    return new Promise((resolve) => {
      Alert.alert(
        info.title,
        info.settingsMessage,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve({ status: 'denied', canAskAgain: false }),
          },
          {
            text: 'Open Settings',
            onPress: async () => {
              try {
                await Linking.openSettings();
                // After opening settings, check permission again
                setTimeout(async () => {
                  const newStatus = await this.checkPermissionStatus(type);
                  resolve(newStatus);
                }, 1000);
              } catch (error) {
                console.error('Error opening settings:', error);
                resolve({ status: 'denied', canAskAgain: false });
              }
            },
          },
        ]
      );
    });
  }

  /**
   * Show alert when required permission is denied
   */
  private static showPermissionDeniedAlert(type: PermissionType): void {
    const info = this.PERMISSION_INFO[type];
    
    Alert.alert(
      'Permission Required',
      `${info.description}\n\nYou can enable this permission later in the app settings.`,
      [{ text: 'OK' }]
    );
  }

  /**
   * Show permission explanation before requesting (for better UX)
   */
  static async showPermissionExplanation(type: PermissionType): Promise<boolean> {
    const info = this.PERMISSION_INFO[type];
    
    return new Promise((resolve) => {
      Alert.alert(
        info.title,
        info.description,
        [
          {
            text: info.required ? 'Not Now' : 'Skip',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Allow',
            onPress: () => resolve(true),
          },
        ]
      );
    });
  }

  /**
   * Get user-friendly permission status message
   */
  static getPermissionStatusMessage(type: PermissionType, status: PermissionStatus): string {
    const info = this.PERMISSION_INFO[type];
    
    switch (status) {
      case 'granted':
        return `${info.title.replace(' Required', '')} is enabled`;
      case 'denied':
        return `${info.title.replace(' Required', '')} is disabled`;
      case 'undetermined':
        return `${info.title.replace(' Required', '')} not yet requested`;
      case 'restricted':
        return `${info.title.replace(' Required', '')} is restricted by device policy`;
      default:
        return `${info.title.replace(' Required', '')} status unknown`;
    }
  }

  /**
   * Check if location services are enabled on the device
   */
  static async isLocationServiceEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  }

  /**
   * Show location services disabled alert
   */
  static showLocationServicesDisabledAlert(): void {
    Alert.alert(
      'Location Services Disabled',
      'Location services are turned off on your device. To record wine locations, please enable location services in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ]
    );
  }
}