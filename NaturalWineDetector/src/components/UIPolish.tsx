import React, { ReactNode } from 'react';
import {
  View,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../styles/ThemeProvider';

interface UIPolishProps {
  children: ReactNode;
  statusBarStyle?: 'light' | 'dark';
  backgroundColor?: string;
  safeAreaTop?: boolean;
  safeAreaBottom?: boolean;
}

export const UIPolish: React.FC<UIPolishProps> = ({
  children,
  statusBarStyle = 'light',
  backgroundColor,
  safeAreaTop = true,
  safeAreaBottom = true,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const containerStyle = {
    flex: 1,
    backgroundColor: backgroundColor || theme.colors.background.primary,
    paddingTop: safeAreaTop ? insets.top : 0,
    paddingBottom: safeAreaBottom ? insets.bottom : 0,
  };

  return (
    <View style={containerStyle}>
      <StatusBar
        barStyle={statusBarStyle === 'light' ? 'light-content' : 'dark-content'}
        backgroundColor={Platform.OS === 'android' ? theme.colors.primary[500] : undefined}
        translucent={Platform.OS === 'android'}
      />
      {children}
    </View>
  );
};