import { Pressable, StyleSheet, Text, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/src/components/Screen';
import { SurfaceCard } from '@/src/components/SurfaceCard';
import { useAuth } from '@/src/providers/AuthProvider';
import { getPalette, radius, spacing, typography } from '@/src/constants/theme';

export default function UnsupportedScreen() {
  const palette = getPalette(useColorScheme());
  const { signOut } = useAuth();

  return (
    <Screen scroll={false}>
      <SurfaceCard style={styles.card}>
        <Text style={[styles.title, { color: palette.text }]}>Admin stays on web</Text>
        <Text style={[styles.description, { color: palette.textMuted }]}>This Expo app intentionally supports only professionals and clinics. Please manage admin tasks from the web dashboard.</Text>
        <Pressable
          style={[styles.button, { backgroundColor: palette.primary }]}
          onPress={async () => {
            await signOut();
            router.replace('/auth');
          }}>
          <Text style={styles.buttonText}>Back to mobile sign in</Text>
        </Pressable>
      </SurfaceCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, justifyContent: 'center' },
  title: { fontSize: typography.title, fontWeight: '800' },
  description: { fontSize: typography.body, lineHeight: 24 },
  button: { minHeight: 52, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md },
  buttonText: { color: '#FFFFFF', fontSize: typography.body, fontWeight: '800' },
});
