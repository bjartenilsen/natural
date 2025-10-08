/**
 * Camera component for wine bottle photo capture
 * Integrates camera functionality with automatic GPS location capture
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LocationData } from '../types';
import { LocationService } from '../services/LocationService';
import { ErrorHandler } from '../utils/errorHandler';

interface CameraComponentProps {
  onImageCaptured: (imageUri: string, location?: LocationData) => void;
  onError: (error: string) => void;
}

const { width, height } = Dimensions.get('window');

export const CameraComponent: React.FC<CameraComponentProps> = ({
  onImageCaptured,
  onError,
}) => {
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  /**
   * Check and request necessary permissions
   */
  const checkPermissions = async () => {
    setIsRequestingPermissions(true);
    try {
      // Check camera permission
      const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
      setCameraPermission(cameraStatus.status === 'granted');

      // Check location permission
      const hasLocation = await LocationService.hasLocationPermission();
      setLocationPermission(hasLocation);

      // Request camera permission if not granted
      if (cameraStatus.status !== 'granted') {
        const cameraRequest = await ImagePicker.requestCameraPermissionsAsync();
        setCameraPermission(cameraRequest.status === 'granted');
      }

      // Request location permission if not granted (optional)
      if (!hasLocation) {
        try {
          const locationGranted = await LocationService.requestLocationPermission();
          setLocationPermission(locationGranted);
        } catch (error) {
          // Location permission is optional, so we don't fail here
          console.warn('Location permission not granted:', error);
          setLocationPermission(false);
        }
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      onError('Failed to check camera permissions');
    } finally {
      setIsRequestingPermissions(false);
    }
  };

  /**
   * Validate image quality and format
   */
  const validateImage = (result: ImagePicker.ImagePickerResult): boolean => {
    if (result.canceled || !result.assets || result.assets.length === 0) {
      return false;
    }

    const asset = result.assets[0];
    
    // Check if image exists and has valid URI
    if (!asset.uri) {
      onError('Invalid image: No image data received');
      return false;
    }

    // Check image dimensions (minimum size for wine bottle recognition)
    if (asset.width && asset.height) {
      const minDimension = Math.min(asset.width, asset.height);
      if (minDimension < 200) {
        onError('Image quality too low. Please take a clearer photo of the wine bottle.');
        return false;
      }
    }

    // Check file size (basic validation)
    if (asset.fileSize && asset.fileSize > 50 * 1024 * 1024) { // 50MB limit
      onError('Image file too large. Please try again.');
      return false;
    }

    return true;
  };

  /**
   * Capture photo with automatic location
   */
  const capturePhoto = async () => {
    if (!cameraPermission) {
      Alert.alert(
        'Camera Permission Required',
        'Please grant camera permission to take photos of wine bottles.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Grant Permission', onPress: checkPermissions },
        ]
      );
      return;
    }

    setIsCapturing(true);
    let capturedLocation: LocationData | undefined;

    try {
      // Attempt to get location first (optional)
      if (locationPermission) {
        try {
          capturedLocation = await LocationService.getCurrentLocationWithFallback();
        } catch (error) {
          console.warn('Failed to get location, continuing without it:', error);
          // Continue without location - it's optional
        }
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4], // Good aspect ratio for wine bottles
        quality: 0.8, // Balance between quality and file size
        exif: false, // Don't include EXIF data for privacy
      });

      // Validate the captured image
      if (!validateImage(result)) {
        return;
      }

      const imageUri = result.assets![0].uri;
      
      // Call the callback with image and location
      onImageCaptured(imageUri, capturedLocation || undefined);

    } catch (error) {
      console.error('Error capturing photo:', error);
      
      if (error && typeof error === 'object' && 'code' in error) {
        const imageError = error as any;
        
        switch (imageError.code) {
          case 'E_CAMERA_UNAVAILABLE':
            onError('Camera is not available on this device');
            break;
          case 'E_PERMISSION_MISSING':
            onError('Camera permission is required to take photos');
            break;
          default:
            onError('Failed to capture photo. Please try again.');
        }
      } else {
        onError('An unexpected error occurred while taking the photo');
      }
    } finally {
      setIsCapturing(false);
    }
  };

  /**
   * Select photo from gallery as alternative
   */
  const selectFromGallery = async () => {
    setIsCapturing(true);

    try {
      // Request media library permission
      const mediaStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (mediaStatus.status !== 'granted') {
        const mediaRequest = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (mediaRequest.status !== 'granted') {
          onError('Media library permission is required to select photos');
          return;
        }
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        exif: false,
      });

      // Validate the selected image
      if (!validateImage(result)) {
        return;
      }

      const imageUri = result.assets![0].uri;
      
      // Note: Gallery images don't have current location, so we pass undefined
      onImageCaptured(imageUri, undefined);

    } catch (error) {
      console.error('Error selecting from gallery:', error);
      onError('Failed to select photo from gallery. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  if (isRequestingPermissions) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5A3C" />
        <Text style={styles.loadingText}>Checking permissions...</Text>
      </View>
    );
  }

  if (cameraPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          To analyze wine bottles, we need access to your camera to take photos.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={checkPermissions}>
          <Text style={styles.permissionButtonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraArea}>
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

      <View style={styles.controlsContainer}>
        {locationPermission === false && (
          <View style={styles.locationWarning}>
            <Text style={styles.locationWarningText}>
              📍 Location access denied. Wine location won't be recorded.
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={selectFromGallery}
            disabled={isCapturing}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F5F5F5',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5A3C',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#8B5A3C',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  viewfinder: {
    width: width * 0.8,
    height: width * 0.8 * 1.33, // 3:4 aspect ratio
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
    left: 'auto',
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    top: 'auto',
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 32,
  },
  controlsContainer: {
    paddingBottom: 50,
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
    width: 80, // Same width as gallery button to center the capture button
  },
});