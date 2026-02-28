import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/AppTypes';
import { CameraComponent } from '../components/CameraComponent';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { ScreenTransition } from '../components/ScreenTransition';
import { LocationData } from '../types/WineTypes';
import { NavigationUtils } from '../navigation/navigationUtils';

type Props = StackScreenProps<RootStackParamList, 'Camera'>;

export const CameraScreen: React.FC<Props> = ({ navigation }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleImageCaptured = async (imageUri: string, location?: LocationData) => {
    try {
      setIsCapturing(true);
      
      setIsNavigating(true);
      NavigationUtils.navigateToAnalysis(navigation, imageUri, location);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert(
        'Navigation Error',
        'Failed to proceed to analysis. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCapturing(false);
      setIsNavigating(false);
    }
  };

  const handleError = (error: string) => {
    console.error('Camera error:', error);
    Alert.alert(
      'Camera Error',
      error,
      [{ text: 'OK' }]
    );
  };

  const navigateToHistory = () => {
    try {
      NavigationUtils.navigateToHistory(navigation);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert(
        'Navigation Error',
        'Failed to open wine history. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <ScreenTransition isVisible={!isNavigating} animationType="fade">
      <View style={styles.container}>
        <CameraComponent
          onImageCaptured={handleImageCaptured}
          onError={handleError}
          onHistoryPress={navigateToHistory}
        />
        
        <LoadingOverlay
          visible={isCapturing}
          message="Processing Image"
          subMessage="Preparing for wine analysis..."
        />
      </View>
    </ScreenTransition>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});