import { Link, router } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookingCard } from '@/src/components/bookings/BookingCard';
import { Button } from '@/src/components/common/Button';
import { Card } from '@/src/components/common/Card';
import { EmptyState } from '@/src/components/common/EmptyState';
import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';
import { StatsCard } from '@/src/components/common/StatsCard';
import { ASSUMED_SHIFT_HOURS, theme } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { useBookings } from '@/src/hooks/useBookings';
import { supabase } from '@/src/lib/supabase';

export default function ProfessionalDashboardScreen() {
  const { profile, refreshAuthState } = useAuth();
  const bookingsQuery = useBookings({ role: 'professional', entityId: profile?.id });

  const bookings = bookingsQuery.data ?? [];
  const upcoming = useMemo(() => bookings.filter((item) => ['requested', 'confirmed', 'checked_in'].includes(String(item.status))), [bookings]);
  const completed = useMemo(() => bookings.filter((item) => item.status === 'completed' || item.status === 'checked_out'), [bookings]);
  const earnings = completed.reduce((sum, item) => sum + (item.shift?.hourly_rate ?? 0) * ASSUMED_SHIFT_HOURS, 0);

  const toggleAvailability = async (value: boolean) => {
    if (!profile) {
      return;
    }

    try {
      const { error } = await supabase.from('profiles').update({ is_available: value }).eq('id', profile.id);
      if (error) {
        throw error;
      }
      await refreshAuthState();
    } catch (error) {
      Alert.alert('Unable to update availability', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  if (!profile || bookingsQuery.isLoading) {
    return <LoadingSpinner fullScreen label="Loading your dashboard..." />;
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <Text style={styles.kicker}>Professional dashboard</Text>
          <Text style={styles.title}>Hi, {profile.full_name}</Text>
          <Text style={styles.description}>Stay on top of your upcoming shifts and profile visibility.</Text>
        </View>

        <Card style={styles.availabilityCard}>
          <View style={styles.availabilityRow}>
            <View style={styles.grow}>
              <Text style={styles.sectionTitle}>Availability</Text>
              <Text style={styles.sectionDescription}>{profile.is_available ? 'You are visible to clinics.' : 'You are hidden from active availability searches.'}</Text>
            </View>
            <Switch value={Boolean(profile.is_available)} onValueChange={toggleAvailability} trackColor={{ true: theme.colors.primary }} />
          </View>
        </Card>

        <View style={styles.statsGrid}>
          <StatsCard title="Upcoming shifts" value={String(upcoming.length)} icon="calendar-outline" />
          <StatsCard title="Total earnings" value={`$${earnings.toFixed(0)}`} icon="cash-outline" tint={theme.colors.success} />
          <StatsCard title="Rating" value={profile.rating_avg ? profile.rating_avg.toFixed(1) : 'New'} icon="star-outline" tint={theme.colors.warning} />
          <StatsCard title="Completed" value={String(completed.length)} icon="checkmark-done-outline" tint={theme.colors.accent} />
        </View>

        <Card style={styles.quickAction}>
          <Text style={styles.sectionTitle}>Quick action</Text>
          <Text style={styles.sectionDescription}>Browse fresh shifts that match your specialty and pay expectations.</Text>
          <Button title="Browse shifts" onPress={() => router.push('/(professional)/browse')} />
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming bookings</Text>
          <Link href="/(professional)/bookings" style={styles.link}>View all</Link>
        </View>

        <View style={styles.list}>
          {upcoming.length ? upcoming.slice(0, 4).map((booking) => <BookingCard key={booking.id} booking={booking} />) : <EmptyState title="No upcoming shifts" description="Browse shifts and apply to build your upcoming schedule." />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.lg, gap: theme.spacing.lg },
  kicker: { color: theme.colors.primary, fontWeight: '700' },
  title: { color: theme.colors.text, fontSize: theme.typography.sizes.xxl, fontWeight: '800', marginTop: 4 },
  description: { color: theme.colors.muted, marginTop: 6 },
  availabilityCard: { gap: theme.spacing.sm },
  availabilityRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  grow: { flex: 1 },
  sectionTitle: { color: theme.colors.text, fontWeight: '700', fontSize: theme.typography.sizes.lg },
  sectionDescription: { color: theme.colors.muted, marginTop: 4, lineHeight: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  quickAction: { gap: theme.spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: { color: theme.colors.primary, fontWeight: '700' },
  list: { gap: theme.spacing.md },
});
