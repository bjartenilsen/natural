/**
 * Custom hook for camera functionality
 * Manages camera state and provides image capture capabilities
 */

import { useState, useCallback } from 'react';
import { LocationData } from '../types';

interface UseCameraReturn {
  imageUri: string | null;
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  captureImage: (uri: string, locationData?: LocationData) => void;
  clearImage: () => void;
  clearError: () => void;
}

export const useCamera = (): UseCameraReturn => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle image capture from CameraComponent
   */
  const captureImage = useCallback((uri: string, locationData?: LocationData) => {
    setImageUri(uri);
    setLocation(locationData || null);
    setError(null);
  }, []);

  /**
   * Clear captured image and location
   */
  const clearImage = useCallback(() => {
    setImageUri(null);
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
    imageUri,
    location,
    loading,
    error,
    captureImage,
    clearImage,
    clearError,
  };
};