import React, { ReactNode } from 'react';
import {
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../styles/ThemeProvider';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  style,
}) => {
  const { theme } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
    };

    // Padding styles
    const paddingStyles = {
      none: {},
      sm: {
        padding: theme.spacing[3],
      },
      md: {
        padding: theme.spacing[4],
      },
      lg: {
        padding: theme.spacing[6],
      },
    };

    // Variant styles
    const variantStyles = {
      default: {
        ...theme.shadows.base,
      },
      elevated: {
        ...theme.shadows.md,
      },
    };

    return {
      ...baseStyle,
      ...paddingStyles[padding],
      ...variantStyles[variant],
      ...style,
    };
  };

  return (
    <View style={getCardStyle()}>
      {children}
    </View>
  );
};