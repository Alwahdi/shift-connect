import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { EmptyState } from '@/src/components/EmptyState';
import { SectionHeader } from '@/src/components/SectionHeader';
import { SurfaceCard } from '@/src/components/SurfaceCard';
import { featuredCards } from '@/src/constants/mock-data';
import { getPalette, radius, spacing, typography } from '@/src/constants/theme';
import { useAuth } from '@/src/providers/AuthProvider';

const filters = ['All', 'Priority', 'Nearby'];

export default function ShiftsScreen() {
  const palette = getPalette(useColorScheme());
  const { role: authRole } = useAuth();
  const role = authRole ?? 'professional';
  const [activeFilter, setActiveFilter] = useState('All');

  const cards = useMemo(() => {
    if (activeFilter === 'Priority') {
      return featuredCards[role].filter((item) => item.badge === 'Urgent' || item.badge === 'Top match');
    }
    if (activeFilter === 'Nearby') {
      return featuredCards[role].slice(0, 2);
    }
    return featuredCards[role];
  }, [activeFilter, role]);

  return (
    <Screen>
      <SectionHeader
        title={role === 'professional' ? 'Shifts built for quick decisions' : 'Coverage board'}
        subtitle={role === 'professional' ? 'Swipe through strong matches and keep only the roles that fit your pace.' : 'Focus on the openings that most need attention right now.'}
      />

      <View style={styles.filterRow}>
        {filters.map((filter) => (
          <Pressable key={filter} onPress={() => setActiveFilter(filter)} style={[styles.filterChip, { backgroundColor: activeFilter === filter ? palette.primary : palette.surface, borderColor: palette.border }]}>
            <Text style={[styles.filterText, { color: activeFilter === filter ? '#FFFFFF' : palette.text }]}>{filter}</Text>
          </Pressable>
        ))}
      </View>

      {cards.length === 0 ? (
        <EmptyState icon="calendar-clear" title="Nothing matched this filter" description="Try another filter to surface a broader set of opportunities." />
      ) : (
        <View style={styles.stack}>
          {cards.map((item) => (
            <SurfaceCard key={item.title}>
              <Text style={[styles.title, { color: palette.text }]}>{item.title}</Text>
              <Text style={[styles.meta, { color: palette.textMuted }]}>{item.meta}</Text>
              <Text style={[styles.description, { color: palette.text }]}>{item.supporting}</Text>
              <View style={styles.ctaRow}>
                <Pressable style={[styles.secondaryButton, { borderColor: palette.border }]}> 
                  <Text style={[styles.secondaryButtonText, { color: palette.text }]}>{role === 'professional' ? 'Save' : 'Review talent'}</Text>
                </Pressable>
                <Pressable style={[styles.primaryButton, { backgroundColor: palette.primary }]}> 
                  <Text style={styles.primaryButtonText}>{role === 'professional' ? 'Apply now' : 'Open shift'}</Text>
                </Pressable>
              </View>
            </SurfaceCard>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filterChip: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 10 },
  filterText: { fontSize: typography.small, fontWeight: '700' },
  stack: { gap: spacing.md },
  title: { fontSize: typography.h3, fontWeight: '700' },
  meta: { fontSize: typography.small },
  description: { fontSize: typography.body, lineHeight: 22 },
  ctaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  secondaryButton: { flex: 1, borderWidth: 1, minHeight: 46, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  primaryButton: { flex: 1, minHeight: 46, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { fontSize: typography.body, fontWeight: '700' },
  primaryButtonText: { color: '#FFFFFF', fontSize: typography.body, fontWeight: '800' },
});
