/**
 * Custom hook for managing app permissions
 * Provides reactive permission state and convenient methods for permission handling
 */

import { useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import { PermissionService, PermissionType, PermissionResult } from '../services/PermissionService';

interface PermissionState {
  camera: PermissionResult;
  location: PermissionResult;
  mediaLibrary: PermissionResult;
}

interface UsePermissionsReturn {
  permissions: PermissionState | null;
  loading: boolean;
  error: string | null;
  locationServicesEnabled: boolean;
  
  // Methods
  checkPermissions: () => Promise<void>;
  requestPermission: (type: PermissionType) => Promise<PermissionResult>;
  requestMultiplePermissions: (types: PermissionType[]) => Promise<Record<PermissionType, PermissionResult>>;
  hasRequiredPermissions: () => boolean;
  canUseCamera: () => boolean;
  canUseLocation: () => boolean;
  canUseMediaLibrary: () => boolean;
}

export const usePermissions = (): UsePermissionsReturn => {
  const [permissions, setPermissions] = useState<PermissionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(true);

  /**
   * Check all permission statuses
   */
  const checkPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [camera, location, mediaLibrary, locationServices] = await Promise.all([
        PermissionService.checkPermissionStatus('camera'),
        PermissionService.checkPermissionStatus('location'),
        PermissionService.checkPermissionStatus('mediaLibrary'),
        PermissionService.isLocationServiceEnabled(),
      ]);

      setPermissions({ camera, location, mediaLibrary });
      setLocationServicesEnabled(locationServices);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check permissions';
      setError(errorMessage);
      console.error('Error checking permissions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Request a specific permission
   */
  const requestPermission = useCallback(async (type: PermissionType): Promise<PermissionResult> => {
    try {
      const result = await PermissionService.requestPermission(type);
      
      // Update the specific permission in state
      setPermissions(prev => prev ? { ...prev, [type]: result } : null);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to request ${type} permission`;
      setError(errorMessage);
      console.error(`Error requesting ${type} permission:`, err);
      
      return { status: 'denied', canAskAgain: false };
    }
  }, []);

  /**
   * Request multiple permissions
   */
  const requestMultiplePermissions = useCallback(async (
    types: PermissionType[]
  ): Promise<Record<PermissionType, PermissionResult>> => {
    try {
      const results = await PermissionService.requestMultiplePermissions(types);
      
      // Update permissions state with new results
      setPermissions(prev => prev ? { ...prev, ...results } : null);
      
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permissions';
      setError(errorMessage);
      console.error('Error requesting multiple permissions:', err);
      
      // Return denied status for all requested permissions
      const deniedResults: Record<string, PermissionResult> = {};
      types.forEach(type => {
        deniedResults[type] = { status: 'denied', canAskAgain: false };
      });
      
      return deniedResults as Record<PermissionType, PermissionResult>;
    }
  }, []);

  /**
   * Check if all required permissions are granted
   */
  const hasRequiredPermissions = useCallback((): boolean => {
    if (!permissions) return false;
    return permissions.camera.status === 'granted';
  }, [permissions]);

  /**
   * Check if camera can be used
   */
  const canUseCamera = useCallback((): boolean => {
    if (!permissions) return false;
    return permissions.camera.status === 'granted';
  }, [permissions]);

  /**
   * Check if location can be used
   */
  const canUseLocation = useCallback((): boolean => {
    if (!permissions) return false;
    return permissions.location.status === 'granted' && locationServicesEnabled;
  }, [permissions, locationServicesEnabled]);

  /**
   * Check if media library can be used
   */
  const canUseMediaLibrary = useCallback((): boolean => {
    if (!permissions) return false;
    return permissions.mediaLibrary.status === 'granted';
  }, [permissions]);

  /**
   * Handle app state changes to refresh permissions
   */
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // App became active, check permissions again in case user changed them in settings
        checkPermissions();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [checkPermissions]);

  /**
   * Initial permission check
   */
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return {
    permissions,
    loading,
    error,
    locationServicesEnabled,
    
    // Methods
    checkPermissions,
    requestPermission,
    requestMultiplePermissions,
    hasRequiredPermissions,
    canUseCamera,
    canUseLocation,
    canUseMediaLibrary,
  };
};