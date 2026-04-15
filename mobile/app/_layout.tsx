import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';
import { AuthProvider } from '@/src/providers/AuthProvider';
import { getPalette } from '@/src/constants/theme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const scheme = useColorScheme();
  const palette = getPalette(scheme);

  return (
    <AuthProvider>
      <ThemeProvider
        value={
          scheme === 'dark'
            ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: palette.background, card: palette.surface, text: palette.text, border: palette.border, primary: palette.primary } }
            : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: palette.background, card: palette.surface, text: palette.text, border: palette.border, primary: palette.primary } }
        }>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="unsupported" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
