import { Appearance } from 'react-native';

export const Colors = {
  light: {
    primary: '#7CB53D',
    primaryLight: '#92CB55',
    primaryDark: '#629130',
    accent: '#3BC4C3',
    accentLight: '#55E0DD',
    accentDark: '#2F9D9C',
    background: '#FFFFFF',
    surface: '#F8FAF5',
    surfaceVariant: '#F3F5F7',
    card: '#FFFFFF',
    text: '#1A2E34',
    textSecondary: '#5A6B72',
    textTertiary: '#8A9BA3',
    border: '#E2E8E0',
    borderLight: '#F0F2EE',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    info: '#3B82F6',
    shadow: 'rgba(26, 46, 52, 0.08)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E2E8E0',
    statusBar: '#7CB53D',
    skeleton: '#E2E8E0',
    skeletonHighlight: '#F0F2EE',
    inputBackground: '#F8FAF5',
    badge: '#EF4444',
    badgeText: '#FFFFFF',
    verified: '#10B981',
    pending: '#F59E0B',
    rejected: '#EF4444',
  },
  dark: {
    primary: '#8FBF47',
    primaryLight: '#A2CC5E',
    primaryDark: '#7CB53D',
    accent: '#42D3D2',
    accentLight: '#5DE5E4',
    accentDark: '#3BC4C3',
    background: '#0F1419',
    surface: '#1A1F26',
    surfaceVariant: '#242B33',
    card: '#1A1F26',
    text: '#FAF8F5',
    textSecondary: '#A0ADB5',
    textTertiary: '#6B7C85',
    border: '#2A3540',
    borderLight: '#1F2830',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    errorLight: '#451A1A',
    info: '#60A5FA',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    tabBar: '#1A1F26',
    tabBarBorder: '#2A3540',
    statusBar: '#0F1419',
    skeleton: '#2A3540',
    skeletonHighlight: '#344050',
    inputBackground: '#1A1F26',
    badge: '#F87171',
    badgeText: '#FFFFFF',
    verified: '#34D399',
    pending: '#FBBF24',
    rejected: '#F87171',
  },
} as const;

export type ThemeColors = typeof Colors.light;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  full: 9999,
} as const;

export const Typography = {
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

export const TouchTargets = {
  min: 44,
  comfortable: 48,
  large: 52,
} as const;

export const getSystemTheme = (): 'light' | 'dark' => {
  return Appearance.getColorScheme() || 'light';
};
