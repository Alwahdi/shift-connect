import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookingCard } from '@/src/components/bookings/BookingCard';
import { Button } from '@/src/components/common/Button';
import { EmptyState } from '@/src/components/common/EmptyState';
import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { useBookings } from '@/src/hooks/useBookings';
import { supabase } from '@/src/lib/supabase';
import type { Booking } from '@/src/types';

export default function ProfessionalBookingsScreen() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const query = useBookings({ role: 'professional', entityId: profile?.id });

  const bookings = query.data ?? [];
  const visible = useMemo(() => bookings.filter((booking) => (tab === 'upcoming' ? ['requested', 'confirmed', 'checked_in'].includes(String(booking.status)) : ['completed', 'checked_out', 'cancelled', 'declined'].includes(String(booking.status)))), [bookings, tab]);

  const updateStatus = async (booking: Booking, status: 'checked_in' | 'checked_out') => {
    try {
      const payload = status === 'checked_in' ? { status, check_in_time: new Date().toISOString() } : { status, check_out_time: new Date().toISOString() };
      const { error } = await supabase.from('bookings').update(payload).eq('id', booking.id);
      if (error) {
        throw error;
      }
      Alert.alert(status === 'checked_in' ? 'Checked in' : 'Checked out', 'Booking status updated.');
      query.refetch();
    } catch (error) {
      Alert.alert('Unable to update booking', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  if (!profile || query.isLoading) {
    return <LoadingSpinner fullScreen label="Loading bookings..." />;
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Your bookings</Text>
        <View style={styles.tabs}>
          <Button title="Upcoming" variant={tab === 'upcoming' ? 'primary' : 'outline'} size="sm" onPress={() => setTab('upcoming')} />
          <Button title="Past" variant={tab === 'past' ? 'primary' : 'outline'} size="sm" onPress={() => setTab('past')} />
        </View>

        <View style={styles.list}>
          {visible.length ? visible.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCheckIn={booking.status === 'confirmed' ? () => updateStatus(booking, 'checked_in') : undefined}
              onCheckOut={booking.status === 'checked_in' ? () => updateStatus(booking, 'checked_out') : undefined}
            />
          )) : <EmptyState title="Nothing here yet" description="Your bookings will appear here once you apply or complete a shift." />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.lg, gap: theme.spacing.md },
  title: { color: theme.colors.text, fontWeight: '800', fontSize: theme.typography.sizes.xxl },
  tabs: { flexDirection: 'row', gap: theme.spacing.sm },
  list: { gap: theme.spacing.md },
});
