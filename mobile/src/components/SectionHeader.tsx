import { Text, View, StyleSheet, useColorScheme } from 'react-native';
import { getPalette, typography } from '@/src/constants/theme';

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const palette = getPalette(useColorScheme());

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: palette.textMuted }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 4 },
  title: { fontSize: typography.h3, fontWeight: '700' },
  subtitle: { fontSize: typography.small, lineHeight: 18 },
});
