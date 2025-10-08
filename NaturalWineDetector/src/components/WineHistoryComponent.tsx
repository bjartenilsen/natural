// Wine history component - placeholder for future implementation
import React from 'react';
import { View, Text } from 'react-native';
import { WineRecord } from '../types';

interface WineHistoryProps {
  wines: WineRecord[];
  onWineSelect: (wine: WineRecord) => void;
}

export const WineHistoryComponent: React.FC<WineHistoryProps> = () => {
  return (
    <View>
      <Text>Wine History Component - Not implemented yet</Text>
    </View>
  );
};