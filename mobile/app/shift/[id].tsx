import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/src/components/common/Avatar';
import { Badge } from '@/src/components/common/Badge';
import { Button } from '@/src/components/common/Button';
import { Card } from '@/src/components/common/Card';
import { EmptyState } from '@/src/components/common/EmptyState';
import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';
import type { Booking, Profile, Shift } from '@/src/types';

export default function ShiftDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { role, profile, clinic } = useAuth();
  const [shift, setShift] = useState<Shift | null>(null);
  const [applicants, setApplicants] = useState<Array<Booking & { professional: Profile | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from('shifts').select('*, clinic:clinics(*)').eq('id', id).maybeSingle();
        if (error) {
          throw error;
        }
        setShift((data as Shift | null) ?? null);

        if (role === 'clinic' && data) {
          const { data: bookingData } = await supabase.from('bookings').select('*, professional:profiles(*)').eq('shift_id', data.id);
          setApplicants((bookingData ?? []) as Array<Booking & { professional: Profile | null }>);
        }
      } finally {
        setLoading(false);
      }
    };

    load().catch(() => setLoading(false));
  }, [id, role]);

  const applyForShift = async () => {
    if (!shift || !profile) {
      return;
    }

    setSubmitting(true);
    try {
      const { data: existing } = await supabase
        .from('bookings')
        .select('id')
        .eq('shift_id', shift.id)
        .eq('professional_id', profile.id)
        .maybeSingle();

      if (existing) {
        Alert.alert('Already applied', 'You have already applied to this shift.');
        return;
      }

      const { error } = await supabase.from('bookings').insert({
        shift_id: shift.id,
        clinic_id: shift.clinic_id,
        professional_id: profile.id,
        status: 'requested',
      });

      if (error) {
        throw error;
      }

      Alert.alert('Application sent', 'The clinic can now review your application.');
    } catch (error) {
      Alert.alert('Unable to apply', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmApplicantAndFillShift = async (booking: Booking) => {
    try {
      const { error: bookingError } = await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', booking.id);
      if (bookingError) {
        throw bookingError;
      }
      const { error: shiftError } = await supabase.from('shifts').update({ is_filled: true }).eq('id', booking.shift_id);
      if (shiftError) {
        throw shiftError;
      }
      Alert.alert('Applicant confirmed', 'Shift filled successfully.');
    } catch (error) {
      Alert.alert('Unable to confirm applicant', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading shift details..." />;
  }

  if (!shift) {
    return <LoadingSpinner fullScreen label="Shift not found" />;
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.hero}>
          <Text style={styles.title}>{shift.title}</Text>
          <Text style={styles.subtitle}>{shift.clinic?.name ?? clinic?.name ?? 'Clinic'}</Text>
          <View style={styles.badges}>
            <Badge label={shift.role_required} variant="accent" />
            {shift.is_urgent ? <Badge label="Urgent" variant="warning" /> : null}
            {shift.is_filled ? <Badge label="Filled" variant="muted" /> : null}
          </View>
          <Text style={styles.body}>{shift.description ?? 'No description provided.'}</Text>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Shift details</Text>
          <Text style={styles.detail}>Date: {shift.shift_date}</Text>
          <Text style={styles.detail}>Time: {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}</Text>
          <Text style={styles.detail}>Location: {shift.location_address ?? 'Address not provided'}</Text>
          <Text style={styles.detail}>Rate: ${shift.hourly_rate}/hr</Text>
          <Text style={styles.detail}>Required certifications: {shift.required_certifications?.join(', ') || 'None specified'}</Text>
        </Card>

        {role === 'professional' ? <Button title="Apply for this shift" fullWidth onPress={applyForShift} loading={submitting} disabled={Boolean(shift.is_filled)} /> : null}

        {role === 'clinic' ? (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Applicants</Text>
            {applicants.length ? applicants.map((booking) => (
              <Card key={booking.id} style={styles.applicantCard}>
                <View style={styles.applicantRow}>
                  <Avatar uri={booking.professional?.avatar_url} name={booking.professional?.full_name ?? 'Professional'} />
                  <View style={styles.applicantText}>
                    <Text style={styles.applicantName}>{booking.professional?.full_name ?? 'Professional'}</Text>
                    <Text style={styles.applicantMeta}>{booking.professional?.specialties?.join(', ') || 'No specialties listed'}</Text>
                  </View>
                </View>
                <Button title="Confirm applicant" onPress={() => confirmApplicantAndFillShift(booking)} disabled={shift.is_filled === true} />
              </Card>
            )) : <EmptyState title="No applicants yet" description="Applicants will appear here once professionals apply." />}
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.lg, gap: theme.spacing.md },
  hero: { gap: theme.spacing.sm },
  title: { color: theme.colors.text, fontSize: theme.typography.sizes.xxl, fontWeight: '800' },
  subtitle: { color: theme.colors.muted },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  body: { color: theme.colors.text, lineHeight: 22 },
  section: { gap: theme.spacing.sm },
  sectionTitle: { color: theme.colors.text, fontWeight: '700', fontSize: theme.typography.sizes.lg },
  detail: { color: theme.colors.text, lineHeight: 22 },
  applicantCard: { gap: theme.spacing.md },
  applicantRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  applicantText: { flex: 1 },
  applicantName: { color: theme.colors.text, fontWeight: '700' },
  applicantMeta: { color: theme.colors.muted, fontSize: theme.typography.sizes.xs },
});
