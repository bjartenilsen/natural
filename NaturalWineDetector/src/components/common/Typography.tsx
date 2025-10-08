import React, { ReactNode } from 'react';
import {
  Text,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../styles/ThemeProvider';

interface TypographyProps {
  children: ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'caption' | 'overline';
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'muted';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body1',
  color = 'primary',
  weight,
  align = 'left',
  style,
}) => {
  const { theme } = useTheme();

  const getTextStyle = (): TextStyle => {
    // Variant styles
    const variantStyles: Record<string, TextStyle> = {
      h1: {
        fontSize: theme.typography.fontSize['4xl'],
        fontWeight: theme.typography.fontWeight.bold,
        lineHeight: theme.typography.fontSize['4xl'] * theme.typography.lineHeight.tight,
      },
      h2: {
        fontSize: theme.typography.fontSize['3xl'],
        fontWeight: theme.typography.fontWeight.bold,
        lineHeight: theme.typography.fontSize['3xl'] * theme.typography.lineHeight.tight,
      },
      h3: {
        fontSize: theme.typography.fontSize['2xl'],
        fontWeight: theme.typography.fontWeight.semibold,
        lineHeight: theme.typography.fontSize['2xl'] * theme.typography.lineHeight.tight,
      },
      h4: {
        fontSize: theme.typography.fontSize.xl,
        fontWeight: theme.typography.fontWeight.semibold,
        lineHeight: theme.typography.fontSize.xl * theme.typography.lineHeight.normal,
      },
      body1: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.normal,
        lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.normal,
      },
      body2: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.normal,
        lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
      },
      caption: {
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.normal,
        lineHeight: theme.typography.fontSize.xs * theme.typography.lineHeight.normal,
      },
      overline: {
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.medium,
        textTransform: 'uppercase',
        letterSpacing: 1,
      },
    };

    // Color styles
    const colorStyles = {
      primary: { color: theme.colors.text.primary },
      secondary: { color: theme.colors.text.secondary },
      tertiary: { color: theme.colors.text.tertiary },
      inverse: { color: theme.colors.text.inverse },
      muted: { color: theme.colors.text.muted },
    };

    // Weight override
    const weightStyle = weight ? { fontWeight: theme.typography.fontWeight[weight] } : {};

    return {
      ...variantStyles[variant],
      ...colorStyles[color],
      ...weightStyle,
      textAlign: align,
      ...style,
    };
  };

  return (
    <Text style={getTextStyle()}>
      {children}
    </Text>
  );
};