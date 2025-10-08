/**
 * Comprehensive theme system for Natural Wine Detector
 */

export const colors = {
  // Primary brand colors
  primary: {
    50: '#F3F4F6',
    100: '#E5E7EB',
    200: '#D1D5DB',
    300: '#9CA3AF',
    400: '#6B7280',
    500: '#6B46C1', // Main brand color
    600: '#5B21B6',
    700: '#4C1D95',
    800: '#3730A3',
    900: '#312E81',
  },
  
  // Wine-themed colors
  wine: {
    red: '#722F37',
    burgundy: '#800020',
    rosé: '#F8BBD0',
    white: '#F5F5DC',
    champagne: '#F7E7CE',
  },
  
  // Semantic colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
  },
  
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },
  
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
  
  // Neutral colors
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Special colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },
  
  // Text colors
  text: {
    primary: '#1F2937',
    secondary: '#4B5563',
    tertiary: '#6B7280',
    inverse: '#FFFFFF',
    muted: '#9CA3AF',
  },
  
  // Border colors
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    dark: '#9CA3AF',
  },
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const layout = {
  container: {
    maxWidth: 400,
    paddingHorizontal: spacing[4],
  },
  
  screen: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[6],
  },
  
  card: {
    padding: spacing[4],
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    ...shadows.base,
  },
  
  button: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.base,
  },
  
  input: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
};

// Component-specific theme tokens
export const components = {
  button: {
    primary: {
      backgroundColor: colors.primary[500],
      color: colors.white,
    },
    secondary: {
      backgroundColor: colors.gray[100],
      color: colors.text.primary,
    },
    success: {
      backgroundColor: colors.success[500],
      color: colors.white,
    },
    warning: {
      backgroundColor: colors.warning[500],
      color: colors.white,
    },
    error: {
      backgroundColor: colors.error[500],
      color: colors.white,
    },
  },
  
  card: {
    default: {
      backgroundColor: colors.white,
      borderColor: colors.border.light,
      ...shadows.base,
    },
    elevated: {
      backgroundColor: colors.white,
      borderColor: colors.border.light,
      ...shadows.md,
    },
  },
  
  input: {
    default: {
      backgroundColor: colors.white,
      borderColor: colors.border.light,
      color: colors.text.primary,
    },
    focused: {
      borderColor: colors.primary[500],
    },
    error: {
      borderColor: colors.error[500],
    },
  },
};

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
  components,
};

export type Theme = typeof theme;