import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/AppTypes';
import { WineDetailComponent } from '../components/WineDetailComponent';
import { useWineRepository } from '../hooks/useWineRepository';
import { WineRecord } from '../types/WineTypes';

type Props = StackScreenProps<RootStackParamList, 'WineDetail'>;

export const WineDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { wineId } = route.params;
  const { getWineById } = useWineRepository();
  const [wine, setWine] = useState<WineRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWine = async () => {
      try {
        setLoading(true);
        const wineRecord = await getWineById(wineId);
        setWine(wineRecord);
      } catch (error) {
        console.error('Failed to load wine:', error);
        // Navigate back if wine not found
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadWine();
  }, [wineId, navigation]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading wine details...</Text>
      </View>
    );
  }

  if (!wine) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Wine not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WineDetailComponent wine={wine} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});