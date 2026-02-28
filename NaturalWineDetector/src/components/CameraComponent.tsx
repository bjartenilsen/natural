/**
 * Camera component for wine bottle photo capture
 * Uses expo-camera CameraView for live preview with GPS location capture
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { LocationData } from '../types/WineTypes';
import { LocationService } from '../services/LocationService';
import { usePermissions } from '../hooks/usePermissions';

interface CameraComponentProps {
  onImageCaptured: (imageUri: string, location?: LocationData) => void;
  onError: (error: string) => void;
  onHistoryPress?: () => void;
}

const { width } = Dimensions.get('window');

export const CameraComponent: React.FC<CameraComponentProps> = ({
  onImageCaptured,
  onError,
  onHistoryPress,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const { canUseLocation, canUseMediaLibrary } = usePermissions();
  const cameraRef = useRef<CameraView>(null);

  // Loading permission state
  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#8B5A3C" />
        <Text style={styles.permissionText}>Checking camera permissions...</Text>
      </View>
    );
  }

  // Permission not granted - show request screen
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionIcon}>📷</Text>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          To analyze wine bottles, we need access to your camera to take photos.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
        </TouchableOpacity>
        {onHistoryPress && (
          <TouchableOpacity style={styles.historyLinkButton} onPress={onHistoryPress}>
            <Text style={styles.historyLinkText}>View Wine History</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  /**
   * Capture photo from the live camera preview
   */
  const capturePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    let capturedLocation: LocationData | undefined;

    try {
      // Attempt to get location (optional)
      if (canUseLocation()) {
        try {
          const location = await LocationService.getCurrentLocationWithFallback();
          capturedLocation = location || undefined;
        } catch (error) {
          console.warn('Failed to get location, continuing without it:', error);
        }
      }

      // Take picture from the live preview
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      if (!photo || !photo.uri) {
        onError('Failed to capture photo. Please try again.');
        return;
      }

      onImageCaptured(photo.uri, capturedLocation);
    } catch (error) {
      console.error('Error capturing photo:', error);
      onError('Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  /**
   * Select photo from gallery as alternative
   */
  const selectFromGallery = async () => {
    if (!canUseMediaLibrary()) {
      onError('Photo library permission is required to select photos');
      return;
    }

    setIsCapturing(true);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        exif: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const imageUri = result.assets[0].uri;
      if (!imageUri) {
        onError('Invalid image: No image data received');
        return;
      }

      onImageCaptured(imageUri, undefined);
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      onError('Failed to select photo from gallery. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Live camera preview */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        mode="picture"
      >
        {/* Viewfinder overlay */}
        <View style={styles.overlay}>
          {/* Top bar with history button */}
          <View style={styles.topBar}>
            {onHistoryPress && (
              <TouchableOpacity style={styles.historyButton} onPress={onHistoryPress}>
                <Text style={styles.historyButtonText}>History</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Viewfinder frame */}
          <View style={styles.viewfinderArea}>
            <View style={styles.viewfinder}>
              <View style={styles.viewfinderCorner} />
              <View style={[styles.viewfinderCorner, styles.topRight]} />
              <View style={[styles.viewfinderCorner, styles.bottomLeft]} />
              <View style={[styles.viewfinderCorner, styles.bottomRight]} />
            </View>
            <Text style={styles.instructionText}>
              Position the wine bottle within the frame
            </Text>
          </View>

          {/* Bottom controls */}
          <View style={styles.controlsContainer}>
            {!canUseLocation() && (
              <View style={styles.locationWarning}>
                <Text style={styles.locationWarningText}>
                  📍 Location access denied. Wine location won&apos;t be recorded.
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.galleryButton, !canUseMediaLibrary() && styles.buttonDisabled]}
                onPress={selectFromGallery}
                disabled={isCapturing || !canUseMediaLibrary()}
              >
                <Text style={styles.galleryButtonText}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
                onPress={capturePhoto}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <ActivityIndicator size="large" color="#FFFFFF" />
                ) : (
                  <View style={styles.captureButtonInner} />
                )}
              </TouchableOpacity>

              <View style={styles.placeholder} />
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  historyButton: {
    backgroundColor: '#6B46C1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  historyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  viewfinderArea: {
    alignItems: 'center',
  },
  viewfinder: {
    width: width * 0.75,
    height: width * 0.75 * 1.33,
    position: 'relative',
  },
  viewfinderCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#FFFFFF',
    borderWidth: 3,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    left: undefined,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    top: undefined,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: undefined,
    left: undefined,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  controlsContainer: {
    paddingBottom: 40,
    paddingHorizontal: 32,
  },
  locationWarning: {
    backgroundColor: 'rgba(255, 193, 7, 0.9)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  locationWarningText: {
    color: '#000000',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  galleryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  galleryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#8B5A3C',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8B5A3C',
  },
  placeholder: {
    width: 80,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 32,
  },
  permissionIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8B5A3C',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 8,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#8B5A3C',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  historyLinkButton: {
    paddingVertical: 8,
  },
  historyLinkText: {
    color: '#6B46C1',
    fontSize: 14,
    fontWeight: '500',
  },
});