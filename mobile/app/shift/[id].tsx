import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/src/components/common/Avatar';
import { Badge } from '@/src/components/common/Badge';
import { Button } from '@/src/components/common/Button';
import { Card } from '@/src/components/common/Card';
import { EmptyState } from '@/src/components/common/EmptyState';
import { ErrorState } from '@/src/components/common/ErrorState';
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
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('shifts')
        .select('*, clinic:clinics(*)')
        .eq('id', id)
        .maybeSingle();
      if (fetchError) throw fetchError;
      setShift((data as Shift | null) ?? null);

      if (role === 'clinic' && data) {
        const { data: bookingData } = await supabase
          .from('bookings')
          .select('*, professional:profiles(*)')
          .eq('shift_id', data.id);
        setApplicants((bookingData ?? []) as Array<Booking & { professional: Profile | null }>);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load shift details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => undefined);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, role]);

  const applyForShift = async () => {
    if (!shift || !profile) return;

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

      const { error: insertError } = await supabase.from('bookings').insert({
        shift_id: shift.id,
        clinic_id: shift.clinic_id,
        professional_id: profile.id,
        status: 'requested',
      });
      if (insertError) throw insertError;

      Alert.alert('Application sent', 'The clinic can now review your application.');
    } catch (err) {
      Alert.alert('Unable to apply', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmApplicant = (booking: Booking) => {
    const name = booking.professional?.full_name ?? 'this applicant';
    Alert.alert(
      'Confirm applicant',
      `Confirm ${name} and mark this shift as filled? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const { error: bookingError } = await supabase
                .from('bookings')
                .update({ status: 'confirmed' })
                .eq('id', booking.id);
              if (bookingError) throw bookingError;

              const { error: shiftError } = await supabase
                .from('shifts')
                .update({ is_filled: true })
                .eq('id', booking.shift_id);
              if (shiftError) throw shiftError;

              Alert.alert('Applicant confirmed', 'Shift filled successfully.');
              load().catch(() => undefined);
            } catch (err) {
              Alert.alert('Unable to confirm applicant', err instanceof Error ? err.message : 'Please try again.');
            }
          },
        },
      ],
    );
  };

  const declineApplicant = (booking: Booking) => {
    Alert.alert(
      'Decline applicant',
      `Decline ${booking.professional?.full_name ?? 'this applicant'}? They will be notified.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('bookings')
                .update({ status: 'declined' })
                .eq('id', booking.id);
              if (error) throw error;
              Alert.alert('Applicant declined', 'The application has been declined.');
              load().catch(() => undefined);
            } catch (err) {
              Alert.alert('Unable to decline', err instanceof Error ? err.message : 'Please try again.');
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading shift details..." />;
  }

  if (error) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.backRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
          </Pressable>
        </View>
        <View style={styles.center}>
          <ErrorState title="Unable to load shift" description={error} onRetry={() => load().catch(() => undefined)} />
        </View>
      </SafeAreaView>
    );
  }

  if (!shift) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.backRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
          </Pressable>
        </View>
        <View style={styles.center}>
          <EmptyState
            icon="calendar-outline"
            title="Shift not found"
            description="This shift may have been removed or the link is no longer valid."
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.backRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
          </Pressable>
        </View>

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
          <Text style={styles.detail}>Date: {(() => { try { return format(new Date(shift.shift_date), 'EEEE, MMMM d, yyyy'); } catch { return shift.shift_date; } })()}</Text>
          <Text style={styles.detail}>
            Time: {shift.start_time.slice(0, 5)} – {shift.end_time.slice(0, 5)}
          </Text>
          <Text style={styles.detail}>Location: {shift.location_address ?? 'Address not provided'}</Text>
          <Text style={styles.detail}>Rate: ${shift.hourly_rate}/hr</Text>
          <Text style={styles.detail}>
            Required certifications: {shift.required_certifications?.join(', ') || 'None specified'}
          </Text>
        </Card>

        {role === 'professional' ? (
          <View style={styles.actionRow}>
            <Button
              title="Apply for this shift"
              fullWidth
              onPress={applyForShift}
              loading={submitting}
              disabled={Boolean(shift.is_filled)}
            />
            {shift.clinic_id ? (
              <Button
                title="Message clinic"
                variant="outline"
                fullWidth
                leftIcon={<Ionicons name="chatbubble-outline" size={18} color={theme.colors.primary} />}
                onPress={async () => {
                  if (!profile) return;
                  try {
                    // Find or create a conversation between this professional and the clinic.
                    const { data: existing } = await supabase
                      .from('conversations')
                      .select('id')
                      .eq('clinic_id', shift.clinic_id)
                      .eq('professional_id', profile.id)
                      .maybeSingle();

                    let conversationId = existing?.id;

                    if (!conversationId) {
                      const { data: created, error: createError } = await supabase
                        .from('conversations')
                        .insert({ clinic_id: shift.clinic_id, professional_id: profile.id })
                        .select('id')
                        .single();
                      if (createError) throw createError;
                      conversationId = created?.id;
                    }

                    if (conversationId) {
                      router.push(`/conversation/${conversationId}`);
                    }
                  } catch (err) {
                    Alert.alert('Unable to open chat', err instanceof Error ? err.message : 'Please try again.');
                  }
                }}
              />
            ) : null}
          </View>
        ) : null}

        {role === 'clinic' ? (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Applicants ({applicants.length})</Text>
            {applicants.length ? (
              applicants.map((booking) => (
                <Card key={booking.id} style={styles.applicantCard}>
                  <View style={styles.applicantRow}>
                    <Avatar
                      uri={booking.professional?.avatar_url}
                      name={booking.professional?.full_name ?? 'Professional'}
                    />
                    <View style={styles.applicantText}>
                      <Text style={styles.applicantName}>
                        {booking.professional?.full_name ?? 'Professional'}
                      </Text>
                      <Text style={styles.applicantMeta}>
                        {booking.professional?.specialties?.join(', ') || 'No specialties listed'}
                      </Text>
                    </View>
                  </View>
                  {!['confirmed', 'declined'].includes(String(booking.status)) ? (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <Button
                        title="Confirm applicant"
                        onPress={() => confirmApplicant(booking)}
                        disabled={shift.is_filled === true || ['confirmed', 'declined'].includes(String(booking.status))}
                        style={styles.applicantAction}
                      />
                      <Button
                        title="Decline"
                        variant="danger"
                        onPress={() => declineApplicant(booking)}
                        disabled={['confirmed', 'declined'].includes(String(booking.status))}
                        style={styles.applicantAction}
                      />
                    </View>
                  ) : null}
                </Card>
              ))
            ) : (
              <EmptyState
                title="No applicants yet"
                description="Applicants will appear here once professionals apply."
              />
            )}
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: 40 },
  backRow: { flexDirection: 'row', marginBottom: theme.spacing.sm },
  backBtn: { padding: theme.spacing.xs },
  center: { flex: 1, padding: theme.spacing.xl, justifyContent: 'center' },
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
  applicantAction: { flex: 1 },
  actionRow: { gap: theme.spacing.sm },
});
