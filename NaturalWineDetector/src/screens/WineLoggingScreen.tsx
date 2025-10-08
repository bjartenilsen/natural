import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/AppTypes';
import { WineLoggingComponent } from '../components/WineLoggingComponent';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { ScreenTransition } from '../components/ScreenTransition';
import { useWineRepository } from '../hooks/useWineRepository';
import { NavigationUtils } from '../navigation/navigationUtils';

type Props = StackScreenProps<RootStackParamList, 'WineLogging'>;

export const WineLoggingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { analysisResult, imageUri, capturedLocation } = route.params;
  const { saveWine } = useWineRepository();
  const [isSaving, setIsSaving] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleSave = async (wineRecord: any) => {
    try {
      setIsSaving(true);
      await saveWine(wineRecord);
      
      setIsNavigating(true);
      
      // Show success message and navigate
      Alert.alert(
        'Wine Saved!',
        'Your wine record has been saved successfully.',
        [
          {
            text: 'View History',
            onPress: () => NavigationUtils.navigateToHistory(navigation)
          },
          {
            text: 'Analyze Another',
            onPress: () => NavigationUtils.navigateToCamera(navigation)
          }
        ]
      );
    } catch (error) {
      console.error('Failed to save wine record:', error);
      Alert.alert(
        'Save Failed',
        'Failed to save wine record. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
      setIsNavigating(false);
    }
  };

  const handleError = (error: string) => {
    console.error('Wine logging error:', error);
    Alert.alert(
      'Logging Error',
      error,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScreenTransition isVisible={!isNavigating} animationType="scale">
      <View style={styles.container}>
        <WineLoggingComponent
          analysisResult={analysisResult}
          imageUri={imageUri}
          capturedLocation={capturedLocation}
          onSave={handleSave}
          onError={handleError}
        />
        
        <LoadingOverlay
          visible={isSaving}
          message="Saving Wine Record"
          subMessage="Adding to your wine history..."
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