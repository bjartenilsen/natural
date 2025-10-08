/**
 * Permission management screen
 * Allows users to view and manage app permissions with explanations
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { PermissionService, PermissionType, PermissionResult } from '../services/PermissionService';

interface PermissionScreenProps {
  onPermissionsUpdated?: () => void;
}

interface PermissionState {
  camera: PermissionResult;
  location: PermissionResult;
  mediaLibrary: PermissionResult;
}

export const PermissionScreen: React.FC<PermissionScreenProps> = ({
  onPermissionsUpdated,
}) => {
  const [permissions, setPermissions] = useState<PermissionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<PermissionType | null>(null);
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(true);

  useEffect(() => {
    loadPermissionStatus();
  }, []);

  const loadPermissionStatus = async () => {
    setLoading(true);
    try {
      const [camera, location, mediaLibrary, locationServices] = await Promise.all([
        PermissionService.checkPermissionStatus('camera'),
        PermissionService.checkPermissionStatus('location'),
        PermissionService.checkPermissionStatus('mediaLibrary'),
        PermissionService.isLocationServiceEnabled(),
      ]);

      setPermissions({ camera, location, mediaLibrary });
      setLocationServicesEnabled(locationServices);
    } catch (error) {
      console.error('Error loading permission status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionRequest = async (type: PermissionType) => {
    if (requesting) return;

    setRequesting(type);
    try {
      // Show explanation first for better UX
      const shouldRequest = await PermissionService.showPermissionExplanation(type);
      
      if (shouldRequest) {
        const result = await PermissionService.requestPermission(type);
        
        // Update the specific permission in state
        setPermissions(prev => prev ? { ...prev, [type]: result } : null);
        
        // Notify parent component
        onPermissionsUpdated?.();
      }
    } catch (error) {
      console.error(`Error requesting ${type} permission:`, error);
    } finally {
      setRequesting(null);
    }
  };

  const handleLocationServicesPress = () => {
    PermissionService.showLocationServicesDisabledAlert();
  };

  const getPermissionIcon = (status: string) => {
    switch (status) {
      case 'granted':
        return '✅';
      case 'denied':
        return '❌';
      case 'undetermined':
        return '❓';
      case 'restricted':
        return '🚫';
      default:
        return '❓';
    }
  };

  const getPermissionColor = (status: string) => {
    switch (status) {
      case 'granted':
        return '#4CAF50';
      case 'denied':
        return '#F44336';
      case 'undetermined':
        return '#FF9800';
      case 'restricted':
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5A3C" />
        <Text style={styles.loadingText}>Loading permissions...</Text>
      </View>
    );
  }

  if (!permissions) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load permissions</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPermissionStatus}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>App Permissions</Text>
        <Text style={styles.subtitle}>
          Manage permissions to enhance your wine analysis experience
        </Text>
      </View>

      {/* Location Services Status */}
      {!locationServicesEnabled && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Location Services Disabled</Text>
            <Text style={styles.warningText}>
              Location services are turned off on your device. Enable them to record wine locations.
            </Text>
            <TouchableOpacity
              style={styles.warningButton}
              onPress={handleLocationServicesPress}
            >
              <Text style={styles.warningButtonText}>Open Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Camera Permission */}
      <View style={styles.permissionCard}>
        <View style={styles.permissionHeader}>
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionIcon}>📷</Text>
            <View style={styles.permissionDetails}>
              <Text style={styles.permissionTitle}>Camera Access</Text>
              <Text style={styles.permissionRequired}>Required</Text>
            </View>
          </View>
          <View style={styles.permissionStatus}>
            <Text style={styles.statusIcon}>
              {getPermissionIcon(permissions.camera.status)}
            </Text>
            <Text style={[styles.statusText, { color: getPermissionColor(permissions.camera.status) }]}>
              {permissions.camera.status}
            </Text>
          </View>
        </View>
        <Text style={styles.permissionDescription}>
          Take photos of wine bottles for AI analysis. This permission is required for the app to function.
        </Text>
        {permissions.camera.status !== 'granted' && (
          <TouchableOpacity
            style={[styles.permissionButton, requesting === 'camera' && styles.buttonDisabled]}
            onPress={() => handlePermissionRequest('camera')}
            disabled={requesting === 'camera'}
          >
            {requesting === 'camera' ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.permissionButtonText}>
                {permissions.camera.canAskAgain ? 'Grant Permission' : 'Open Settings'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Location Permission */}
      <View style={styles.permissionCard}>
        <View style={styles.permissionHeader}>
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionIcon}>📍</Text>
            <View style={styles.permissionDetails}>
              <Text style={styles.permissionTitle}>Location Access</Text>
              <Text style={styles.permissionOptional}>Optional</Text>
            </View>
          </View>
          <View style={styles.permissionStatus}>
            <Text style={styles.statusIcon}>
              {getPermissionIcon(permissions.location.status)}
            </Text>
            <Text style={[styles.statusText, { color: getPermissionColor(permissions.location.status) }]}>
              {permissions.location.status}
            </Text>
          </View>
        </View>
        <Text style={styles.permissionDescription}>
          Automatically record where you discovered wines. Enhances your wine journal with location data.
        </Text>
        {permissions.location.status !== 'granted' && (
          <TouchableOpacity
            style={[styles.permissionButton, styles.optionalButton, requesting === 'location' && styles.buttonDisabled]}
            onPress={() => handlePermissionRequest('location')}
            disabled={requesting === 'location'}
          >
            {requesting === 'location' ? (
              <ActivityIndicator size="small" color="#8B5A3C" />
            ) : (
              <Text style={[styles.permissionButtonText, styles.optionalButtonText]}>
                {permissions.location.canAskAgain ? 'Enable Location' : 'Open Settings'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Media Library Permission */}
      <View style={styles.permissionCard}>
        <View style={styles.permissionHeader}>
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionIcon}>🖼️</Text>
            <View style={styles.permissionDetails}>
              <Text style={styles.permissionTitle}>Photo Library Access</Text>
              <Text style={styles.permissionOptional}>Optional</Text>
            </View>
          </View>
          <View style={styles.permissionStatus}>
            <Text style={styles.statusIcon}>
              {getPermissionIcon(permissions.mediaLibrary.status)}
            </Text>
            <Text style={[styles.statusText, { color: getPermissionColor(permissions.mediaLibrary.status) }]}>
              {permissions.mediaLibrary.status}
            </Text>
          </View>
        </View>
        <Text style={styles.permissionDescription}>
          Select existing photos from your gallery to analyze wines you've already photographed.
        </Text>
        {permissions.mediaLibrary.status !== 'granted' && (
          <TouchableOpacity
            style={[styles.permissionButton, styles.optionalButton, requesting === 'mediaLibrary' && styles.buttonDisabled]}
            onPress={() => handlePermissionRequest('mediaLibrary')}
            disabled={requesting === 'mediaLibrary'}
          >
            {requesting === 'mediaLibrary' ? (
              <ActivityIndicator size="small" color="#8B5A3C" />
            ) : (
              <Text style={[styles.permissionButtonText, styles.optionalButtonText]}>
                {permissions.mediaLibrary.canAskAgain ? 'Enable Gallery Access' : 'Open Settings'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          You can change these permissions anytime in your device settings.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#8B5A3C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B5A3C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 12,
    lineHeight: 20,
  },
  warningButton: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  warningButtonText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '600',
  },
  permissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  permissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  permissionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  permissionDetails: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  permissionRequired: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  permissionOptional: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  permissionStatus: {
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  permissionDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  permissionButton: {
    backgroundColor: '#8B5A3C',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionalButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#8B5A3C',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  optionalButtonText: {
    color: '#8B5A3C',
  },
  footer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});