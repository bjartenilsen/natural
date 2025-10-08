import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/AppTypes';
import { WineHistoryComponent } from '../components/WineHistoryComponent';
import { ScreenTransition } from '../components/ScreenTransition';
import { useWineRepository } from '../hooks/useWineRepository';
import { WineRecord } from '../types/WineTypes';
import { NavigationUtils } from '../navigation/navigationUtils';

type Props = StackScreenProps<RootStackParamList, 'History'>;

export const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const { wines, loading, refreshWines, loadWines } = useWineRepository();
  const [isNavigating, setIsNavigating] = useState(false);

  // Reload wines when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadWines();
    });

    return unsubscribe;
  }, [navigation, loadWines]);

  const handleWineSelect = async (wine: WineRecord) => {
    try {
      setIsNavigating(true);
      
      // Small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 200));
      
      NavigationUtils.navigateToWineDetail(navigation, wine.id);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert(
        'Navigation Error',
        'Failed to open wine details. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsNavigating(false);
    }
  };

  const handleRefresh = () => {
    refreshWines();
  };

  return (
    <ScreenTransition isVisible={!isNavigating} animationType="fade">
      <View style={styles.container}>
        <WineHistoryComponent
          wines={wines}
          onWineSelect={handleWineSelect}
          onRefresh={handleRefresh}
          loading={loading}
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