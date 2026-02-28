import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/AppTypes';
import { WineAnalysisComponent } from '../components/WineAnalysisComponent';
import { ScreenTransition } from '../components/ScreenTransition';
import { WineAnalysisResult } from '../types/WineTypes';
import { NavigationUtils } from '../navigation/navigationUtils';

type Props = StackScreenProps<RootStackParamList, 'Analysis'>;

export const AnalysisScreen: React.FC<Props> = ({ route, navigation }) => {
  const { imageUri, location } = route.params;
  const [isNavigating, setIsNavigating] = useState(false);

  const handleAnalysisComplete = async (result: WineAnalysisResult) => {
    try {
      setIsNavigating(true);
      
      NavigationUtils.navigateToWineLogging(navigation, result, imageUri, location);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert(
        'Navigation Error',
        'Failed to proceed to wine logging. Please try again.',
        [
          { text: 'Retry', onPress: () => handleAnalysisComplete(result) },
          { text: 'Go Back', onPress: () => NavigationUtils.goBack(navigation) }
        ]
      );
    } finally {
      setIsNavigating(false);
    }
  };

  const handleError = (error: string) => {
    console.error('Analysis error:', error);
    Alert.alert(
      'Analysis Failed',
      error,
      [
        { text: 'Try Again', onPress: () => navigation.replace('Analysis', { imageUri, location }) },
        { text: 'Go Back', onPress: () => NavigationUtils.goBack(navigation) }
      ]
    );
  };

  return (
    <ScreenTransition isVisible={!isNavigating} animationType="slide">
      <View style={styles.container}>
        <WineAnalysisComponent
          imageUri={imageUri}
          location={location}
          onAnalysisComplete={handleAnalysisComplete}
          onError={handleError}
        />
      </View>
    </ScreenTransition>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});