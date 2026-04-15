import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { getPalette, radius, spacing, typography } from '@/src/constants/theme';

export function EmptyState({ icon, title, description }: { icon: keyof typeof Ionicons.glyphMap; title: string; description: string }) {
  const palette = getPalette(useColorScheme());

  return (
    <View style={[styles.container, { backgroundColor: palette.surface, borderColor: palette.border }]}> 
      <View style={[styles.iconWrap, { backgroundColor: palette.surfaceMuted }]}> 
        <Ionicons name={icon} size={22} color={palette.secondaryDeep} />
      </View>
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      <Text style={[styles.description, { color: palette.textMuted }]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.h3,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: typography.body,
    lineHeight: 22,
    textAlign: 'center',
  },
});
