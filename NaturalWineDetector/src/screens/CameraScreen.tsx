import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/AppTypes';
import { CameraComponent } from '../components/CameraComponent';
import { LocationData } from '../types/WineTypes';
import { NavigationUtils } from '../navigation/navigationUtils';

type Props = StackScreenProps<RootStackParamList, 'Camera'>;

export const CameraScreen: React.FC<Props> = ({ navigation }) => {
  const handleImageCaptured = (imageUri: string, location?: LocationData) => {
    try {
      NavigationUtils.navigateToAnalysis(navigation, imageUri, location);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleError = (error: string) => {
    console.error('Camera error:', error);
    // Could show an alert or toast here
  };

  const navigateToHistory = () => {
    NavigationUtils.navigateToHistory(navigation);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.historyButton} onPress={navigateToHistory}>
          <Text style={styles.historyButtonText}>History</Text>
        </TouchableOpacity>
      </View>
      
      <CameraComponent
        onImageCaptured={handleImageCaptured}
        onError={handleError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
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
  },
});