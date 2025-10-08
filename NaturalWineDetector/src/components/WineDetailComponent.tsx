// Wine detail component - placeholder for future implementation
import React from 'react';
import { View, Text } from 'react-native';
import { WineRecord } from '../types';

interface WineDetailProps {
  wine: WineRecord;
}

export const WineDetailComponent: React.FC<WineDetailProps> = () => {
  return (
    <View>
      <Text>Wine Detail Component - Not implemented yet</Text>
    </View>
  );
};