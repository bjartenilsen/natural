import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/AppTypes';
import { WineLoggingComponent } from '../components/WineLoggingComponent';
import { useWineRepository } from '../hooks/useWineRepository';
import { NavigationUtils } from '../navigation/navigationUtils';

type Props = StackScreenProps<RootStackParamList, 'WineLogging'>;

export const WineLoggingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { analysisResult, imageUri, capturedLocation } = route.params;
  const { saveWine } = useWineRepository();

  const handleSave = async (wineRecord: any) => {
    try {
      await saveWine(wineRecord);
      // Navigate to history after successful save
      NavigationUtils.navigateToHistory(navigation);
    } catch (error) {
      console.error('Failed to save wine record:', error);
    }
  };

  const handleError = (error: string) => {
    console.error('Wine logging error:', error);
    // Could show an alert or toast here
  };

  return (
    <View style={styles.container}>
      <WineLoggingComponent
        analysisResult={analysisResult}
        imageUri={imageUri}
        capturedLocation={capturedLocation}
        onSave={handleSave}
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