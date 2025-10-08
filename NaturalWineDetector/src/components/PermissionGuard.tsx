/**
 * Permission guard component
 * Wraps components that require specific permissions and handles permission requests
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { PermissionService, PermissionType } from '../services/PermissionService';
import { usePermissions } from '../hooks/usePermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions: PermissionType[];
  fallbackComponent?: React.ReactNode;
  showPermissionScreen?: boolean;
  onPermissionGranted?: () => void;
  onPermissionDenied?: (deniedPermissions: PermissionType[]) => void;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermissions,
  fallbackComponent,
  showPermissionScreen = true,
  onPermissionGranted,
  onPermissionDenied,
}) => {
  const {
    permissions,
    loading,
    requestMultiplePermissions,
    canUseCamera,
    canUseLocation,
    canUseMediaLibrary,
  } = usePermissions();
  
  const [requesting, setRequesting] = useState(false);
  const [hasCheckedPermissions, setHasCheckedPermissions] = useState(false);

  /**
   * Check if all required permissions are granted
   */
  const checkRequiredPermissions = (): { granted: boolean; missing: PermissionType[] } => {
    if (!permissions) return { granted: false, missing: requiredPermissions };

    const missing: PermissionType[] = [];
    
    requiredPermissions.forEach(permission => {
      switch (permission) {
        case 'camera':
          if (!canUseCamera()) missing.push(permission);
          break;
        case 'location':
          if (!canUseLocation()) missing.push(permission);
          break;
        case 'mediaLibrary':
          if (!canUseMediaLibrary()) missing.push(permission);
          break;
      }
    });

    return {
      granted: missing.length === 0,
      missing,
    };
  };

  /**
   * Request all required permissions
   */
  const requestPermissions = async () => {
    if (requesting) return;

    setRequesting(true);
    try {
      const results = await requestMultiplePermissions(requiredPermissions);
      
      // Check which permissions were granted
      const { granted, missing } = checkRequiredPermissions();
      
      if (granted) {
        onPermissionGranted?.();
      } else {
        onPermissionDenied?.(missing);
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      onPermissionDenied?.(requiredPermissions);
    } finally {
      setRequesting(false);
      setHasCheckedPermissions(true);
    }
  };

  /**
   * Check permissions when component mounts or permissions change
   */
  useEffect(() => {
    if (!loading && permissions && !hasCheckedPermissions) {
      const { granted, missing } = checkRequiredPermissions();
      
      if (granted) {
        onPermissionGranted?.();
      } else {
        onPermissionDenied?.(missing);
      }
      
      setHasCheckedPermissions(true);
    }
  }, [loading, permissions, hasCheckedPermissions]);

  /**
   * Get permission info for display
   */
  const getPermissionInfo = (type: PermissionType) => {
    switch (type) {
      case 'camera':
        return {
          icon: '📷',
          title: 'Camera Access',
          description: 'Take photos of wine bottles for analysis',
        };
      case 'location':
        return {
          icon: '📍',
          title: 'Location Access',
          description: 'Record where you discovered wines',
        };
      case 'mediaLibrary':
        return {
          icon: '🖼️',
          title: 'Photo Library Access',
          description: 'Select existing photos for analysis',
        };
      default:
        return {
          icon: '❓',
          title: 'Permission',
          description: 'Required for app functionality',
        };
    }
  };

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8B5A3C" />
        <Text style={styles.loadingText}>Checking permissions...</Text>
      </View>
    );
  }

  // Check if permissions are granted
  const { granted, missing } = checkRequiredPermissions();

  // If all permissions are granted, render children
  if (granted) {
    return <>{children}</>;
  }

  // If fallback component is provided and we don't want to show permission screen
  if (fallbackComponent && !showPermissionScreen) {
    return <>{fallbackComponent}</>;
  }

  // Show permission request screen
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Permissions Required</Text>
        <Text style={styles.subtitle}>
          This feature requires the following permissions to work properly:
        </Text>

        <View style={styles.permissionsList}>
          {missing.map(permission => {
            const info = getPermissionInfo(permission);
            return (
              <View key={permission} style={styles.permissionItem}>
                <Text style={styles.permissionIcon}>{info.icon}</Text>
                <View style={styles.permissionDetails}>
                  <Text style={styles.permissionTitle}>{info.title}</Text>
                  <Text style={styles.permissionDescription}>{info.description}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.requestButton, requesting && styles.requestButtonDisabled]}
          onPress={requestPermissions}
          disabled={requesting}
        >
          {requesting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.requestButtonText}>Grant Permissions</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          You can change these permissions anytime in your device settings.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 32,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5A3C',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionsList: {
    width: '100%',
    marginBottom: 32,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  permissionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  permissionDetails: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  requestButton: {
    backgroundColor: '#8B5A3C',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 24,
    minWidth: 200,
    alignItems: 'center',
  },
  requestButtonDisabled: {
    opacity: 0.6,
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 18,
  },
});