import { Platform } from 'react-native';

export const colors = {
  primary: '#663C6D',
  accent: '#56849A',
  background: '#F5F7F9',
  card: '#FFFFFF',
  text: '#2D1A33',
  muted: '#8B9299',
  border: '#E2E8F0',
  success: '#2D9E68',
  warning: '#F59E0B',
  error: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(45, 26, 51, 0.35)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  round: 999,
};

export const typography = {
  heading: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
  body: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
  arabic: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
};

export const shadows = {
  card: {
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 3,
  },
};

export const theme = {
  colors,
  spacing,
  radii,
  typography,
  shadows,
};

export const layout = {
  screenPadding: spacing.lg,
  fabBottom: 30,
};

/** Assumed shift duration in hours used for earnings estimates when
 *  actual start_time/end_time are unavailable to compute a duration. */
export const ASSUMED_SHIFT_HOURS = 8;
