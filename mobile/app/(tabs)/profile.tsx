import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import { SurfaceCard } from '@/src/components/SurfaceCard';
import { profileChecklist, profileSummary } from '@/src/constants/mock-data';
import { getPalette, radius, typography } from '@/src/constants/theme';
import { useAuth } from '@/src/providers/AuthProvider';

export default function ProfileScreen() {
  const palette = getPalette(useColorScheme());
  const { role: authRole, signOut, isDemoMode, activatePreview } = useAuth();
  const role = authRole ?? 'professional';
  const summary = profileSummary[role];

  return (
    <Screen>
      <SectionHeader title="Profile readiness" subtitle="The app keeps critical profile work small, clear, and easy to finish on mobile." />

      <SurfaceCard>
        <Text style={[styles.name, { color: palette.text }]}>{summary.name}</Text>
        <Text style={[styles.roleLabel, { color: palette.secondaryDeep }]}>{summary.roleLabel}</Text>
        <Text style={[styles.note, { color: palette.textMuted }]}>{summary.note}</Text>
        <View style={[styles.progressTrack, { backgroundColor: palette.surfaceMuted }]}> 
          <View style={[styles.progressFill, { backgroundColor: palette.primary, width: `${summary.completion}%` }]} />
        </View>
        <Text style={[styles.progressLabel, { color: palette.text }]}>{summary.completion}% complete</Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Checklist</Text>
        <View style={styles.stack}>
          {profileChecklist[role].map((item) => (
            <View key={item.title} style={styles.checkRow}>
              <View style={[styles.check, { backgroundColor: item.done ? palette.primary : palette.surfaceMuted, borderColor: palette.border }]} />
              <Text style={[styles.checkText, { color: palette.text }]}>{item.title}</Text>
            </View>
          ))}
        </View>
      </SurfaceCard>

      {isDemoMode ? (
        <SurfaceCard>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Preview controls</Text>
          <View style={styles.stack}>
            <Pressable onPress={() => activatePreview('professional')} style={[styles.altButton, { borderColor: palette.border }]}><Text style={[styles.altButtonText, { color: palette.text }]}>Switch to professional</Text></Pressable>
            <Pressable onPress={() => activatePreview('clinic')} style={[styles.altButton, { borderColor: palette.border }]}><Text style={[styles.altButtonText, { color: palette.text }]}>Switch to clinic</Text></Pressable>
          </View>
        </SurfaceCard>
      ) : null}

      <Pressable
        style={[styles.primaryButton, { backgroundColor: palette.primaryDeep }]}
        onPress={async () => {
          await signOut();
          router.replace('/auth');
        }}>
        <Text style={styles.primaryButtonText}>Sign out</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: typography.h1, fontWeight: '800' },
  roleLabel: { fontSize: typography.body, fontWeight: '700' },
  note: { fontSize: typography.body, lineHeight: 22 },
  progressTrack: { height: 12, borderRadius: radius.pill, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.pill },
  progressLabel: { fontSize: typography.small, fontWeight: '700' },
  sectionTitle: { fontSize: typography.h3, fontWeight: '700' },
  stack: { gap: 16 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  check: { width: 18, height: 18, borderRadius: 9, borderWidth: 1 },
  checkText: { fontSize: typography.body, flex: 1 },
  altButton: { borderWidth: 1, minHeight: 46, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  altButtonText: { fontSize: typography.body, fontWeight: '700' },
  primaryButton: { minHeight: 52, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: typography.body, fontWeight: '800' },
});
