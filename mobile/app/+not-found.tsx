import { Text, useColorScheme } from 'react-native';
import { Link } from 'expo-router';
import { Screen } from '@/src/components/Screen';
import { SurfaceCard } from '@/src/components/SurfaceCard';
import { getPalette, typography } from '@/src/constants/theme';

export default function NotFoundScreen() {
  const palette = getPalette(useColorScheme());

  return (
    <Screen scroll={false}>
      <SurfaceCard>
        <Text style={{ color: palette.text, fontSize: typography.title, fontWeight: '800' }}>Screen not found</Text>
        <Link href="/" style={{ color: palette.primary, fontSize: typography.body, fontWeight: '700' }}>
          Return home
        </Link>
      </SurfaceCard>
    </Screen>
  );
}
