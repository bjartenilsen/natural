/**
 * Camera component for wine bottle photo capture
 * Integrates camera functionality with automatic GPS location capture
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LocationData } from '../types/WineTypes';
import { LocationService } from '../services/LocationService';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionGuard } from './PermissionGuard';

interface CameraComponentProps {
  onImageCaptured: (imageUri: string, location?: LocationData) => void;
  onError: (error: string) => void;
}

const { width } = Dimensions.get('window');

const CameraInterface: React.FC<CameraComponentProps> = ({
  onImageCaptured,
  onError,
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const { canUseLocation, canUseMediaLibrary } = usePermissions();

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
    setIsCapturing(true);
    let capturedLocation: LocationData | undefined;

    try {
      // Attempt to get location first (optional)
      if (canUseLocation()) {
        try {
          const location = await LocationService.getCurrentLocationWithFallback();
          capturedLocation = location || undefined;
        } catch (error) {
          console.warn('Failed to get location, continuing without it:', error);
          // Continue without location - it's optional
        }
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
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
    if (!canUseMediaLibrary()) {
      onError('Photo library permission is required to select photos');
      return;
    }

    setIsCapturing(true);

    try {
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
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
  );
};

export const CameraComponent: React.FC<CameraComponentProps> = (props) => {
  return (
    <PermissionGuard requiredPermissions={['camera']}>
      <CameraInterface {...props} />
    </PermissionGuard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    width: 80, // Same width as gallery button to center the capture button
  },
});