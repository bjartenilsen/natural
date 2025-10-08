import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../styles/ThemeProvider';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const { theme } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.base,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    const sizeStyles = {
      sm: {
        paddingHorizontal: theme.spacing[3],
        paddingVertical: theme.spacing[2],
      },
      md: {
        paddingHorizontal: theme.spacing[4],
        paddingVertical: theme.spacing[3],
      },
      lg: {
        paddingHorizontal: theme.spacing[6],
        paddingVertical: theme.spacing[4],
      },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: theme.colors.primary[500],
      },
      secondary: {
        backgroundColor: theme.colors.gray[100],
        borderWidth: 1,
        borderColor: theme.colors.border.light,
      },
      success: {
        backgroundColor: theme.colors.success[500],
      },
      warning: {
        backgroundColor: theme.colors.warning[500],
      },
      error: {
        backgroundColor: theme.colors.error[500],
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
      ...(disabled && { opacity: 0.6 }),
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: theme.typography.fontWeight.semibold,
    };

    // Size text styles
    const sizeTextStyles = {
      sm: {
        fontSize: theme.typography.fontSize.sm,
      },
      md: {
        fontSize: theme.typography.fontSize.base,
      },
      lg: {
        fontSize: theme.typography.fontSize.lg,
      },
    };

    // Variant text styles
    const variantTextStyles = {
      primary: {
        color: theme.colors.white,
      },
      secondary: {
        color: theme.colors.text.primary,
      },
      success: {
        color: theme.colors.white,
      },
      warning: {
        color: theme.colors.white,
      },
      error: {
        color: theme.colors.white,
      },
    };

    return {
      ...baseTextStyle,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
      ...textStyle,
    };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' ? theme.colors.primary[500] : theme.colors.white}
          style={{ marginRight: theme.spacing[2] }}
        />
      )}
      <Text style={getTextStyle()}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};