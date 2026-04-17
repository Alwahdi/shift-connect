import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { Card, Badge, Button, EmptyState } from '@/components/ui';
import { Spacing, Typography } from '@/config/theme';
import { formatDate, formatTime } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';

export default function BookingsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { userRole } = useAuth();
  const { profileId } = useProfile();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['bookings', profileId, userRole, activeTab],
    queryFn: async () => {
      if (!profileId) return [];
      const filterCol = userRole === 'professional' ? 'professional_id' : 'clinic_id';
      let query = supabase
        .from('bookings')
        .select('*, shifts(title, shift_date, start_time, end_time, hourly_rate, location_address, role_required), profiles(full_name, avatar_url), clinics(name, logo_url)')
        .eq(filterCol, profileId)
        .order('created_at', { ascending: false });

      if (activeTab === 'upcoming') {
        query = query.in('status', ['pending', 'accepted', 'confirmed', 'checked_in']);
      } else {
        query = query.in('status', ['completed', 'cancelled', 'declined', 'checked_out']);
      }

      const { data } = await query.limit(30);
      return data || [];
    },
    enabled: !!profileId,
    staleTime: 60 * 1000,
  });

  const handleAction = async (bookingId: string, action: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const { error } = await supabase
        .from('bookings')
        .update({
          status: action,
          ...(action === 'checked_in' ? { check_in_time: new Date().toISOString() } : {}),
          ...(action === 'checked_out' ? { check_out_time: new Date().toISOString() } : {}),
        })
        .eq('id', bookingId);
      if (error) throw error;
      Toast.show({ type: 'success', text1: t('common.success') });
      refetch();
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: t('common.error'), text2: err.message });
    }
  };

  const confirmCancel = (bookingId: string) => {
    Alert.alert(t('bookings.cancel'), t('bookings.cancelConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.confirm'), style: 'destructive', onPress: () => handleAction(bookingId, 'cancelled') },
    ]);
  };

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed': case 'completed': case 'checked_in': case 'checked_out': return 'success' as const;
      case 'pending': case 'accepted': return 'warning' as const;
      case 'declined': case 'cancelled': return 'error' as const;
      default: return 'default' as const;
    }
  };

  const renderBooking = ({ item }: { item: any }) => (
    <Card variant="elevated" style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.bookingTitle, { color: colors.text }]} numberOfLines={1}>
            {item.shifts?.title || 'Shift'}
          </Text>
          <Text style={[styles.bookingClinic, { color: colors.textSecondary }]}>
            {userRole === 'professional' ? item.clinics?.name : item.profiles?.full_name || 'Professional'}
          </Text>
        </View>
        <Badge label={t(`bookings.${item.status}`)} variant={getStatusBadgeVariant(item.status)} />
      </View>

      <View style={styles.bookingMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {formatDate(item.shifts?.shift_date || item.created_at)}
          </Text>
        </View>
        {item.shifts?.start_time && (
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {formatTime(item.shifts.start_time)} - {formatTime(item.shifts.end_time)}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      {item.status === 'pending' && userRole === 'clinic' && (
        <View style={styles.actions}>
          <Button title={t('bookings.accepted')} size="sm" onPress={() => handleAction(item.id, 'accepted')} style={{ flex: 1 }} />
          <Button title={t('bookings.declined')} size="sm" variant="destructive" onPress={() => handleAction(item.id, 'declined')} style={{ flex: 1 }} />
        </View>
      )}
      {item.status === 'confirmed' && userRole === 'professional' && (
        <View style={styles.actions}>
          <Button
            title={t('bookings.checkIn')}
            size="sm"
            onPress={() => handleAction(item.id, 'checked_in')}
            fullWidth
            icon={<Ionicons name="log-in-outline" size={16} color="#FFF" />}
          />
        </View>
      )}
      {item.status === 'checked_in' && userRole === 'professional' && (
        <View style={styles.actions}>
          <Button
            title={t('bookings.checkOut')}
            size="sm"
            variant="secondary"
            onPress={() => handleAction(item.id, 'checked_out')}
            fullWidth
            icon={<Ionicons name="log-out-outline" size={16} color={colors.text} />}
          />
        </View>
      )}
      {['pending', 'accepted', 'confirmed'].includes(item.status) && (
        <Pressable onPress={() => confirmCancel(item.id)} style={styles.cancelLink}>
          <Text style={[styles.cancelText, { color: colors.error }]}>{t('bookings.cancel')}</Text>
        </Pressable>
      )}
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text style={[styles.screenTitle, { color: colors.text }]}>{t('bookings.myBookings')}</Text>

      {/* Tab Selector */}
      <View style={[styles.tabs, { borderColor: colors.border }]}>
        {(['upcoming', 'past'] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => { setActiveTab(tab); Haptics.selectionAsync(); }}
            style={[styles.tab, activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary : colors.textTertiary }]}>
              {t(`bookings.${tab}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBooking}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: Spacing['3xl'] }}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={{ color: colors.textSecondary, marginTop: Spacing.md, fontSize: Typography.sizes.sm }}>
                {t('common.loading')}
              </Text>
            </View>
          ) : (
            <EmptyState icon="clipboard-outline" title={t('bookings.noBookings')} description={t('bookings.noBookingsDesc')} />
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  screenTitle: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold, paddingHorizontal: Spacing.xl, paddingTop: Spacing.base, paddingBottom: Spacing.md },
  tabs: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: Spacing.md },
  tab: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
  tabText: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold },
  listContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing['3xl'] },
  bookingCard: { marginBottom: Spacing.md },
  bookingHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing.sm },
  bookingTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, marginBottom: 2 },
  bookingClinic: { fontSize: Typography.sizes.sm },
  bookingMeta: { gap: 6, marginBottom: Spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: Typography.sizes.sm },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  cancelLink: { marginTop: Spacing.sm, alignItems: 'center' },
  cancelText: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
});
