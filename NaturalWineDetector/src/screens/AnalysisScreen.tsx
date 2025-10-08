import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/AppTypes';
import { WineAnalysisComponent } from '../components/WineAnalysisComponent';
import { WineAnalysisResult } from '../types/WineTypes';
import { NavigationUtils } from '../navigation/navigationUtils';

type Props = StackScreenProps<RootStackParamList, 'Analysis'>;

export const AnalysisScreen: React.FC<Props> = ({ route, navigation }) => {
  const { imageUri, location } = route.params;

  const handleAnalysisComplete = (result: WineAnalysisResult) => {
    try {
      NavigationUtils.navigateToWineLogging(navigation, result, imageUri, location);
    } catch (error) {
      console.error('Navigation error:', error);
      NavigationUtils.goBack(navigation);
    }
  };

  const handleError = (error: string) => {
    console.error('Analysis error:', error);
    // Could show an alert or toast here
    // For now, navigate back to camera
    NavigationUtils.goBack(navigation);
  };

  return (
    <View style={styles.container}>
      <WineAnalysisComponent
        imageUri={imageUri}
        location={location}
        onAnalysisComplete={handleAnalysisComplete}
        onError={handleError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});