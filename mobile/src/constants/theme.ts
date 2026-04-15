import { ColorSchemeName } from 'react-native';

export const brand = {
  green: '#7CB53D',
  greenDark: '#4A6D24',
  teal: '#3BC4C3',
  tealDark: '#237675',
  navy: '#0F172A',
  gold: '#F59E0B',
  coral: '#F97360',
};

const lightPalette = {
  background: '#F4F7FB',
  backgroundAlt: '#EAF7F4',
  surface: '#FFFFFF',
  surfaceMuted: '#EDF3F8',
  text: '#102038',
  textMuted: '#5B6880',
  border: '#D7E0EA',
  primary: brand.green,
  primaryDeep: brand.greenDark,
  secondary: brand.teal,
  secondaryDeep: brand.tealDark,
  success: '#16A34A',
  warning: brand.gold,
  danger: '#DC2626',
  info: '#2563EB',
  shadow: 'rgba(15, 23, 42, 0.12)',
  overlay: 'rgba(15, 23, 42, 0.72)',
};

const darkPalette = {
  background: '#071019',
  backgroundAlt: '#0A1622',
  surface: '#102038',
  surfaceMuted: '#162B45',
  text: '#F8FAFC',
  textMuted: '#B8C5D6',
  border: '#223B59',
  primary: '#92CB55',
  primaryDeep: '#7CB53D',
  secondary: '#55E0DD',
  secondaryDeep: '#3BC4C3',
  success: '#22C55E',
  warning: '#FBBF24',
  danger: '#F87171',
  info: '#60A5FA',
  shadow: 'rgba(0, 0, 0, 0.35)',
  overlay: 'rgba(7, 16, 25, 0.82)',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  pill: 999,
};

export const typography = {
  title: 30,
  h1: 26,
  h2: 22,
  h3: 18,
  body: 15,
  small: 13,
  tiny: 11,
};

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
};

export const getPalette = (scheme: ColorSchemeName) => {
  const resolvedScheme = scheme ?? 'light';
  return resolvedScheme === 'dark' ? darkPalette : lightPalette;
};

export const hexToRgba = (hex: string, alpha: number) => {
  const value = hex.replace('#', '');
  const normalized = value.length === 3 ? value.split('').map((char) => `${char}${char}`).join('') : value;
  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

export type AppPalette = ReturnType<typeof getPalette>;
