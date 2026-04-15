import { ActivityIndicator, View, useColorScheme } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/src/providers/AuthProvider';
import { getPalette } from '@/src/constants/theme';

export default function Index() {
  const { isLoading, role, isUnsupportedRole } = useAuth();
  const palette = getPalette(useColorScheme());

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.background }}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  if (isUnsupportedRole) {
    return <Redirect href="/unsupported" />;
  }

  if (!role) {
    return <Redirect href="/auth" />;
  }

  return <Redirect href="/(tabs)" />;
}
