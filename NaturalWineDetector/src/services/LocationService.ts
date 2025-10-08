/**
 * Location service for GPS functionality
 * Handles location permissions, GPS data retrieval, and accuracy validation
 */

import * as Location from 'expo-location';
import { LocationData } from '../types/WineTypes';
import { ErrorHandler } from '../utils/errorHandler';

export class LocationService {
  // Minimum accuracy threshold in meters (50m is reasonable for wine location tracking)
  private static readonly MIN_ACCURACY_THRESHOLD = 50;
  
  // Location request timeout in milliseconds
  private static readonly LOCATION_TIMEOUT = 15000;
  
  // High accuracy location options
  private static readonly HIGH_ACCURACY_OPTIONS: Location.LocationOptions = {
    accuracy: Location.Accuracy.High,
    timeInterval: 1000,
    distanceInterval: 1,
  };

  /**
   * Requests location permission from the user
   * @returns Promise<boolean> - true if permission granted, false otherwise
   */
  static async requestLocationPermission(): Promise<boolean> {
    try {
      // Check if location services are enabled on the device
      const serviceEnabled = await Location.hasServicesEnabledAsync();
      if (!serviceEnabled) {
        throw ErrorHandler.createLocationError({
          reason: 'unavailable',
          message: 'Location services are disabled on this device',
          recoverable: true,
        });
      }

      // Request foreground location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        return true;
      } else {
        throw ErrorHandler.createLocationError({
          reason: 'permission_denied',
          message: 'Location permission was denied',
          recoverable: true,
        });
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error && error.type === 'location') {
        throw error;
      }
      
      throw ErrorHandler.createLocationError({
        reason: 'permission_denied',
        message: 'Failed to request location permission',
        recoverable: true,
        originalError: error as Error,
      });
    }
  }

  /**
   * Gets the current location with permission handling and accuracy validation
   * @returns Promise<LocationData> - Current location with accuracy info
   */
  static async getCurrentLocation(): Promise<LocationData> {
    try {
      // Check if we have permission first
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        // Try to request permission
        const permissionGranted = await this.requestLocationPermission();
        if (!permissionGranted) {
          throw ErrorHandler.createLocationError({
            reason: 'permission_denied',
            message: 'Location permission is required to capture location data',
            recoverable: true,
          });
        }
      }

      // Get current location with timeout
      const locationPromise = Location.getCurrentPositionAsync(this.HIGH_ACCURACY_OPTIONS);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(ErrorHandler.createLocationError({
            reason: 'timeout',
            message: 'Location request timed out',
            recoverable: true,
          }));
        }, this.LOCATION_TIMEOUT);
      });

      const location = await Promise.race([locationPromise, timeoutPromise]);

      // Validate location data
      if (!location || !location.coords) {
        throw ErrorHandler.createLocationError({
          reason: 'unavailable',
          message: 'Unable to retrieve location data',
          recoverable: true,
        });
      }

      const { latitude, longitude, accuracy } = location.coords;

      // Validate coordinates
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        throw ErrorHandler.createLocationError({
          reason: 'unavailable',
          message: 'Invalid location coordinates received',
          recoverable: true,
        });
      }

      // Check accuracy - if accuracy is null/undefined, use a default value
      const locationAccuracy = accuracy ?? 999;

      // Warn about low accuracy but don't fail
      if (locationAccuracy > this.MIN_ACCURACY_THRESHOLD) {
        console.warn(`Location accuracy is low: ${locationAccuracy}m (threshold: ${this.MIN_ACCURACY_THRESHOLD}m)`);
      }

      return {
        latitude,
        longitude,
        accuracy: locationAccuracy,
      };

    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error && error.type === 'location') {
        throw error;
      }

      // Handle specific expo-location errors
      if (error && typeof error === 'object' && 'code' in error) {
        const locationError = error as any;
        
        switch (locationError.code) {
          case 'E_LOCATION_SERVICES_DISABLED':
            throw ErrorHandler.createLocationError({
              reason: 'unavailable',
              message: 'Location services are disabled',
              recoverable: true,
              originalError: error as unknown as Error,
            });
          
          case 'E_LOCATION_UNAUTHORIZED':
            throw ErrorHandler.createLocationError({
              reason: 'permission_denied',
              message: 'Location permission denied',
              recoverable: true,
              originalError: error as unknown as Error,
            });
          
          default:
            throw ErrorHandler.createLocationError({
              reason: 'unavailable',
              message: 'Failed to get current location',
              recoverable: true,
              originalError: error as unknown as Error,
            });
        }
      }

      throw ErrorHandler.createLocationError({
        reason: 'unavailable',
        message: 'An unexpected error occurred while getting location',
        recoverable: true,
        originalError: error as Error,
      });
    }
  }

  /**
   * Checks if location permission is currently granted
   * @returns Promise<boolean> - true if permission is granted
   */
  static async hasLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.warn('Failed to check location permission:', error);
      return false;
    }
  }

  /**
   * Gets location with fallback options for better user experience
   * Tries high accuracy first, then falls back to balanced accuracy
   * @returns Promise<LocationData | null> - Location data or null if unavailable
   */
  static async getCurrentLocationWithFallback(): Promise<LocationData | null> {
    try {
      // Try high accuracy first
      return await this.getCurrentLocation();
    } catch (error) {
      console.warn('High accuracy location failed, trying fallback:', error);
      
      try {
        // Fallback to balanced accuracy with longer timeout
        const fallbackOptions: Location.LocationOptions = {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 2000,
          distanceInterval: 10,
        };

        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          return null;
        }

        const location = await Location.getCurrentPositionAsync(fallbackOptions);
        
        if (!location || !location.coords) {
          return null;
        }

        const { latitude, longitude, accuracy } = location.coords;
        
        return {
          latitude,
          longitude,
          accuracy: accuracy ?? 999,
        };
      } catch (fallbackError) {
        console.warn('Fallback location also failed:', fallbackError);
        return null;
      }
    }
  }
}