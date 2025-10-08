// Camera component - placeholder for future implementation
import React from 'react';
import { View, Text } from 'react-native';
import { LocationData } from '../types';

interface CameraComponentProps {
  onImageCaptured: (imageUri: string, location?: LocationData) => void;
  onError: (error: string) => void;
}

export const CameraComponent: React.FC<CameraComponentProps> = () => {
  return (
    <View>
      <Text>Camera Component - Not implemented yet</Text>
    </View>
  );
};