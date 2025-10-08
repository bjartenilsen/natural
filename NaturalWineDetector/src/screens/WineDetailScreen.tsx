import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/AppTypes';
import { WineDetailComponent } from '../components/WineDetailComponent';
import { ScreenTransition } from '../components/ScreenTransition';
import { LoadingOverlay } from '../components/LoadingOverlay';
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
        Alert.alert(
          'Wine Not Found',
          'The requested wine record could not be found.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } finally {
        setLoading(false);
      }
    };

    loadWine();
  }, [wineId, navigation]);

  return (
    <ScreenTransition isVisible={!loading} animationType="scale">
      <View style={styles.container}>
        {wine ? (
          <WineDetailComponent wine={wine} />
        ) : (
          <View style={styles.centered}>
            <Text style={styles.notFoundText}>Wine not found</Text>
          </View>
        )}
        
        <LoadingOverlay
          visible={loading}
          message="Loading Wine Details"
          subMessage="Retrieving wine information..."
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#6B7280',
  },
});