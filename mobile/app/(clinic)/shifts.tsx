import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/src/components/common/Avatar';
import { Badge } from '@/src/components/common/Badge';
import { Button } from '@/src/components/common/Button';
import { Card } from '@/src/components/common/Card';
import { EmptyState } from '@/src/components/common/EmptyState';
import { ErrorState } from '@/src/components/common/ErrorState';
import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';
import { CreateShiftSheet } from '@/src/components/shifts/CreateShiftSheet';
import { ShiftCard } from '@/src/components/shifts/ShiftCard';
import { FLOATING_TAB_BOTTOM_INSET } from '@/src/components/navigation/FloatingTabBar';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { useShifts } from '@/src/hooks/useShifts';
import { supabase } from '@/src/lib/supabase';
import type { Booking, Profile, Shift } from '@/src/types';

type Filter = 'all' | 'active' | 'filled' | 'urgent';

const FILTERS: Filter[] = ['all', 'active', 'filled', 'urgent'];

export default function ClinicShiftsScreen() {
  const { clinic } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>('all');
  const [createVisible, setCreateVisible] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [applicants, setApplicants] = useState<Array<Booking & { professional: Profile | null }>>([]);
  const query = useShifts({ mode: 'clinic', clinicId: clinic?.id, filter });

  const shifts = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);

  useEffect(() => {
    const loadApplicants = async () => {
      if (!selectedShift) {
        setApplicants([]);
        return;
      }

      const { data, error } = await supabase
        .from('bookings')
        .select('*, professional:profiles(*)')
        .eq('shift_id', selectedShift.id)
        .order('id', { ascending: false });

      if (!error) {
        setApplicants((data ?? []) as Array<Booking & { professional: Profile | null }>);
      }
    };

    loadApplicants().catch(() => undefined);
  }, [selectedShift]);

  const fillShift = (booking: Booking) => {
    Alert.alert(
      'Confirm and fill shift',
      `Confirm ${booking.professional?.full_name ?? 'this applicant'} for the shift? This action cannot be undone.`,
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

              Alert.alert('Shift filled', 'The applicant has been confirmed.');
              setSelectedShift(null);
              queryClient.invalidateQueries({ queryKey: ['shifts'] });
            } catch (error) {
              Alert.alert('Unable to fill shift', error instanceof Error ? error.message : 'Please try again.');
            }
          },
        },
      ],
    );
  };

  const onRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['shifts'] });
  }, [queryClient]);

  if (!clinic || query.isLoading) {
    return <LoadingSpinner fullScreen label="Loading shifts..." />;
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <FlatList
        data={shifts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={query.isFetching && !query.isLoading}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Manage shifts</Text>
              <Text style={styles.description}>Review posted shifts, applicants, and urgent requests.</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              {FILTERS.map((item) => (
                <Button
                  key={item}
                  title={item[0].toUpperCase() + item.slice(1)}
                  variant={filter === item ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setFilter(item)}
                />
              ))}
            </ScrollView>
            {query.isError ? (
              <ErrorState onRetry={() => queryClient.invalidateQueries({ queryKey: ['shifts'] })} />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !query.isError ? (
            <EmptyState title="No shifts match this filter" description="Try another filter or create a new shift." />
          ) : null
        }
        renderItem={({ item }) => (
          <ShiftCard shift={item} clinicName={clinic.name} onPress={() => setSelectedShift(item)} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <View style={styles.fabWrap}>
        <Button
          size="fab"
          onPress={() => setCreateVisible(true)}
          leftIcon={<Ionicons name="add" size={24} color={theme.colors.white} />}
        />
      </View>

      <Modal
        visible={Boolean(selectedShift)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedShift(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedShift?.title}</Text>
              <Button title="Close" variant="ghost" onPress={() => setSelectedShift(null)} />
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalSubtitle}>Applicants ({applicants.length})</Text>
              {applicants.length ? (
                applicants.map((applicant) => (
                  <Card key={applicant.id} style={styles.applicantCard}>
                    <View style={styles.row}>
                      <Avatar uri={applicant.professional?.avatar_url} name={applicant.professional?.full_name ?? 'Professional'} />
                      <View style={styles.grow}>
                        <Text style={styles.applicantName}>{applicant.professional?.full_name ?? 'Professional'}</Text>
                        <Text style={styles.applicantMeta}>
                          {applicant.professional?.specialties?.join(', ') || 'No specialties listed'}
                        </Text>
                      </View>
                      <Badge label={(applicant.status ?? 'pending').replace('_', ' ')} variant="accent" />
                    </View>
                    <Button
                      title="Confirm and fill shift"
                      onPress={() => fillShift(applicant)}
                      disabled={selectedShift?.is_filled === true}
                    />
                  </Card>
                ))
              ) : (
                <EmptyState
                  title="No applicants yet"
                  description="New applications will appear here as soon as professionals apply."
                />
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <CreateShiftSheet
        visible={createVisible}
        clinicId={clinic.id}
        onClose={() => setCreateVisible(false)}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['shifts'] })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.lg, gap: theme.spacing.lg, paddingBottom: FLOATING_TAB_BOTTOM_INSET },
  header: { gap: theme.spacing.md, marginBottom: theme.spacing.md },
  title: { color: theme.colors.text, fontSize: theme.typography.sizes.xxl, fontWeight: '800' },
  description: { color: theme.colors.muted, marginTop: 6 },
  filters: { gap: theme.spacing.sm },
  separator: { height: theme.spacing.md },
  fabWrap: { position: 'absolute', right: theme.spacing.lg, bottom: 96 },
  overlay: { flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'flex-end' },
  modal: {
    maxHeight: '88%',
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    paddingTop: theme.spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  modalTitle: { color: theme.colors.text, fontSize: theme.typography.sizes.xl, fontWeight: '800', flex: 1 },
  modalContent: { padding: theme.spacing.lg, gap: theme.spacing.md },
  modalSubtitle: { color: theme.colors.text, fontWeight: '700' },
  applicantCard: { gap: theme.spacing.md },
  row: { flexDirection: 'row', gap: theme.spacing.md, alignItems: 'center' },
  grow: { flex: 1 },
  applicantName: { color: theme.colors.text, fontWeight: '700' },
  applicantMeta: { color: theme.colors.muted, fontSize: theme.typography.sizes.xs },
});
