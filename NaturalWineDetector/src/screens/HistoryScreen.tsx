import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/AppTypes';
import { WineHistoryComponent } from '../components/WineHistoryComponent';
import { useWineRepository } from '../hooks/useWineRepository';
import { WineRecord } from '../types/WineTypes';
import { NavigationUtils } from '../navigation/navigationUtils';

type Props = StackScreenProps<RootStackParamList, 'History'>;

export const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const { wines, loading, refreshWines, loadWines } = useWineRepository();

  // Reload wines when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadWines();
    });

    return unsubscribe;
  }, [navigation, loadWines]);

  const handleWineSelect = (wine: WineRecord) => {
    try {
      NavigationUtils.navigateToWineDetail(navigation, wine.id);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleRefresh = () => {
    refreshWines();
  };

  return (
    <View style={styles.container}>
      <WineHistoryComponent
        wines={wines}
        onWineSelect={handleWineSelect}
        onRefresh={handleRefresh}
        loading={loading}
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