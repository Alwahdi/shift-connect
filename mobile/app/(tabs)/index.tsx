import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import { SurfaceCard } from '@/src/components/SurfaceCard';
import { dashboardStats, featuredCards, quickActions, roleCopy, workflowSteps } from '@/src/constants/mock-data';
import { AppPalette, brand, getPalette, hexToRgba, radius, spacing, typography } from '@/src/constants/theme';
import { useAuth } from '@/src/providers/AuthProvider';

const toneMap: Record<'primary' | 'secondary' | 'warning' | 'success', keyof AppPalette> = {
  primary: 'primary',
  secondary: 'secondaryDeep',
  warning: 'warning',
  success: 'success',
};

const accentBackgrounds = {
  primary: hexToRgba(brand.green, 0.14),
  secondary: hexToRgba(brand.teal, 0.14),
  warning: hexToRgba(brand.gold, 0.16),
} as const;

export default function HomeScreen() {
  const palette = getPalette(useColorScheme());
  const { role: authRole, user, isDemoMode, activatePreview } = useAuth();
  const role = authRole ?? 'professional';
  const copy = roleCopy[role];

  return (
    <Screen>
      <SurfaceCard style={styles.hero}>
        <View style={styles.heroHeader}>
          <View style={styles.heroCopy}>
            <Text style={[styles.kicker, { color: palette.secondaryDeep }]}>{role === 'professional' ? 'Professional mobile' : 'Clinic mobile'}</Text>
            <Text style={[styles.heroTitle, { color: palette.text }]}>{copy.title}</Text>
          </View>
          {isDemoMode ? <View style={[styles.badge, { backgroundColor: palette.backgroundAlt }]}><Text style={[styles.badgeText, { color: palette.primaryDeep }]}>Preview</Text></View> : null}
        </View>
        <Text style={[styles.heroSubtitle, { color: palette.textMuted }]}>{copy.subtitle}</Text>
        <View style={styles.heroFooter}>
          <View>
            <Text style={[styles.statLabel, { color: palette.textMuted }]}>{copy.heroStatLabel}</Text>
            <Text style={[styles.statValue, { color: palette.text }]}>{copy.heroStatValue}</Text>
          </View>
          {isDemoMode ? (
            <Pressable onPress={() => activatePreview(role === 'professional' ? 'clinic' : 'professional')} style={[styles.swapButton, { backgroundColor: palette.primary }]}>
              <Text style={styles.swapButtonText}>Switch to {role === 'professional' ? 'clinic' : 'professional'} preview</Text>
            </Pressable>
          ) : (
            <View style={[styles.badge, { backgroundColor: palette.surfaceMuted }]}>
              <Text style={[styles.badgeText, { color: palette.text }]}>{user?.email ?? 'Live session'}</Text>
            </View>
          )}
        </View>
      </SurfaceCard>

      <SectionHeader title="Command center" subtitle="A mobile-first overview designed to keep staffing momentum high." />
      <View style={styles.statsGrid}>
        {dashboardStats[role].map((item) => {
          const accent = palette[toneMap[item.tone]];
          return (
            <SurfaceCard key={item.label} style={styles.statCard}>
              <Text style={[styles.smallLabel, { color: palette.textMuted }]}>{item.label}</Text>
              <Text style={[styles.bigValue, { color: palette.text }]}>{item.value}</Text>
              <View style={[styles.accentLine, { backgroundColor: accent }]} />
            </SurfaceCard>
          );
        })}
      </View>

      <SectionHeader title="Quick wins" subtitle="The most important work is surfaced first so the app feels calm, not crowded." />
      <View style={styles.stack}>
        {quickActions[role].map((item) => (
          <SurfaceCard key={item.title}>
            <View style={styles.rowBetween}>
              <View style={styles.actionCopy}>
                <Text style={[styles.cardTitle, { color: palette.text }]}>{item.title}</Text>
                <Text style={[styles.cardDescription, { color: palette.textMuted }]}>{item.description}</Text>
              </View>
              <View style={[styles.iconShell, { backgroundColor: palette.backgroundAlt }]}>
                <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={20} color={palette.secondaryDeep} />
              </View>
            </View>
          </SurfaceCard>
        ))}
      </View>

      <SectionHeader title={role === 'professional' ? 'Featured shift matches' : 'Coverage opportunities'} subtitle="The app keeps the highest-value items obvious and actionable." />
      <View style={styles.stack}>
        {featuredCards[role].map((item) => {
          const badgeColor = item.accent === 'warning' ? palette.warning : item.accent === 'secondary' ? palette.secondaryDeep : palette.primary;
          return (
            <SurfaceCard key={item.title}>
              <View style={styles.rowBetween}>
                <View style={styles.actionCopy}>
                  <Text style={[styles.cardTitle, { color: palette.text }]}>{item.title}</Text>
                  <Text style={[styles.cardMeta, { color: palette.textMuted }]}>{item.meta}</Text>
                  <Text style={[styles.cardDescription, { color: palette.text }]}>{item.supporting}</Text>
                </View>
                <View style={[styles.featureBadge, { backgroundColor: accentBackgrounds[item.accent] }]}>
                  <Text style={[styles.featureBadgeText, { color: badgeColor }]}>{item.badge}</Text>
                </View>
              </View>
            </SurfaceCard>
          );
        })}
      </View>

      <SectionHeader title="Workflow that feels polished" subtitle="Everything in mobile is tuned for the two user journeys that matter here." />
      <SurfaceCard>
        {workflowSteps[role].map((step, index) => (
          <View key={step} style={[styles.stepRow, index === workflowSteps[role].length - 1 ? styles.stepRowLast : undefined, { borderBottomColor: palette.border }]}> 
            <View style={[styles.stepBubble, { backgroundColor: palette.primary }]}><Text style={styles.stepBubbleText}>{index + 1}</Text></View>
            <Text style={[styles.cardDescription, { color: palette.text }]}>{step}</Text>
          </View>
        ))}
      </SurfaceCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing.md },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  heroCopy: { flex: 1 },
  kicker: { fontSize: typography.small, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  heroTitle: { fontSize: typography.h1, fontWeight: '800', lineHeight: 32 },
  heroSubtitle: { fontSize: typography.body, lineHeight: 22 },
  heroFooter: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, alignItems: 'center' },
  badge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill },
  badgeText: { fontSize: typography.small, fontWeight: '700' },
  statLabel: { fontSize: typography.small, marginBottom: 4 },
  statValue: { fontSize: 28, fontWeight: '800' },
  swapButton: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: radius.pill },
  swapButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: typography.small },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  statCard: { width: '47%', minWidth: 150 },
  smallLabel: { fontSize: typography.small },
  bigValue: { fontSize: 24, fontWeight: '800' },
  accentLine: { height: 4, borderRadius: radius.pill, marginTop: spacing.sm },
  stack: { gap: spacing.md },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  actionCopy: { flex: 1, gap: 6 },
  iconShell: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: typography.body, fontWeight: '700' },
  cardMeta: { fontSize: typography.small },
  cardDescription: { fontSize: typography.body, lineHeight: 22, flexShrink: 1 },
  featureBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  featureBadgeText: { fontSize: typography.small, fontWeight: '700' },
  stepRow: { flexDirection: 'row', gap: spacing.md, paddingBottom: spacing.md, marginBottom: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  stepRowLast: { marginBottom: 0, paddingBottom: 0, borderBottomWidth: 0 },
  stepBubble: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  stepBubbleText: { color: '#FFFFFF', fontWeight: '800', fontSize: typography.small },
});
