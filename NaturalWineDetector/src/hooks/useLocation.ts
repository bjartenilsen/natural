/**
 * Custom hook for location functionality
 * Manages location state and provides GPS capabilities
 */

import { useState, useCallback } from 'react';
import { LocationData } from '../types';
import { LocationService } from '../services/LocationService';

interface UseLocationReturn {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  hasPermission: boolean | null;
  getCurrentLocation: () => Promise<LocationData | null>;
  requestPermission: () => Promise<boolean>;
  clearLocation: () => void;
  clearError: () => void;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  /**
   * Get current location using LocationService
   */
  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    setLoading(true);
    setError(null);

    try {
      const locationData = await LocationService.getCurrentLocation();
      setLocation(locationData);
      setHasPermission(true);
      return locationData;
    } catch (error) {
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as any).message 
        : 'Failed to get current location';
      
      setError(errorMessage);
      setHasPermission(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Request location permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const granted = await LocationService.requestLocationPermission();
      setHasPermission(granted);
      return granted;
    } catch (error) {
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as any).message 
        : 'Failed to request location permission';
      
      setError(errorMessage);
      setHasPermission(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear location data
   */
  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    location,
    loading,
    error,
    hasPermission,
    getCurrentLocation,
    requestPermission,
    clearLocation,
    clearError,
  };
};