import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { Card, Badge, Button, EmptyState } from '@/components/ui';
import { Spacing, Typography, BorderRadius } from '@/config/theme';
import { formatDate, formatTime, formatCurrency } from '@/lib/utils';
import Toast from 'react-native-toast-message';

export default function ShiftsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user, userRole } = useAuth();
  const { profileId } = useProfile();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [expandedShift, setExpandedShift] = useState<string | null>(null);

  const roles = ['nurse', 'doctor', 'dentist', 'pharmacist', 'therapist', 'technician'];

  const { data: shifts, isLoading, refetch } = useQuery({
    queryKey: ['shifts', search, selectedRole],
    queryFn: async () => {
      let query = supabase
        .from('shifts')
        .select('*, clinics(name, logo_url, rating_avg)')
        .eq('is_filled', false)
        .order('created_at', { ascending: false });

      if (selectedRole) query = query.eq('role_required', selectedRole);
      if (search.trim()) query = query.or(`title.ilike.%${search}%,location_address.ilike.%${search}%`);

      const { data } = await query.limit(30);
      return data || [];
    },
    staleTime: 60 * 1000,
  });

  const handleApply = async (shiftId: string, clinicId: string) => {
    if (!profileId) return;
    try {
      const { error } = await supabase.from('bookings').insert({
        professional_id: profileId,
        clinic_id: clinicId,
        shift_id: shiftId,
        status: 'pending',
      });
      if (error) throw error;
      Toast.show({ type: 'success', text1: t('common.success'), text2: t('shifts.applied') });
      refetch();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: t('common.error'), text2: err.message });
    }
  };

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderShift = ({ item }: { item: any }) => (
    <Card
      variant="elevated"
      style={styles.shiftCard}
      onPress={() => setExpandedShift(expandedShift === item.id ? null : item.id)}
    >
      <View style={styles.shiftHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={[styles.shiftTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
            {item.is_urgent && <Badge label={t('shifts.urgent')} variant="error" size="sm" />}
          </View>
          <Text style={[styles.clinicName, { color: colors.textSecondary }]}>
            {item.clinics?.name || 'Clinic'}
          </Text>
        </View>
        <View style={styles.rateContainer}>
          <Text style={[styles.rate, { color: colors.primary }]}>{formatCurrency(item.hourly_rate)}</Text>
          <Text style={[styles.rateUnit, { color: colors.textTertiary }]}>{t('shifts.hourly')}</Text>
        </View>
      </View>

      <View style={styles.shiftMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>{formatDate(item.shift_date)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {formatTime(item.start_time)} - {formatTime(item.end_time)}
          </Text>
        </View>
        {item.location_address && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={colors.textTertiary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.location_address}
            </Text>
          </View>
        )}
      </View>

      <Badge label={item.role_required || 'General'} variant="primary" style={{ marginTop: Spacing.sm }} />

      {expandedShift === item.id && (
        <View style={[styles.expanded, { borderTopColor: colors.border }]}>
          {item.description && (
            <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>
          )}
          {userRole === 'professional' && (
            <Button
              title={t('shifts.apply')}
              onPress={() => handleApply(item.id, item.clinic_id)}
              fullWidth
              size="md"
              icon={<Ionicons name="paper-plane-outline" size={18} color="#FFF" />}
            />
          )}
        </View>
      )}
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { paddingHorizontal: Spacing.xl }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textTertiary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t('shifts.searchPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Role Filter */}
      <FlatList
        horizontal
        data={[null, ...roles]}
        keyExtractor={(item) => item || 'all'}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelectedRole(item)}
            style={[
              styles.filterChip,
              {
                backgroundColor: selectedRole === item ? colors.primary : colors.surfaceVariant,
                borderColor: selectedRole === item ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[
              styles.filterText,
              { color: selectedRole === item ? '#FFF' : colors.textSecondary },
            ]}>
              {item ? t(`roles.${item}`) : t('shifts.allRoles')}
            </Text>
          </Pressable>
        )}
      />

      {/* Shifts List */}
      <FlatList
        data={shifts}
        keyExtractor={(item) => item.id}
        renderItem={renderShift}
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
            <EmptyState icon="calendar-outline" title={t('shifts.noShifts')} description={t('shifts.noShiftsDesc')} />
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { paddingVertical: Spacing.md },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md, height: 48, borderWidth: 1, gap: Spacing.sm,
  },
  searchInput: { flex: 1, fontSize: Typography.sizes.base },
  filterList: { paddingHorizontal: Spacing.xl, gap: Spacing.sm, paddingBottom: Spacing.md },
  filterChip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterText: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
  listContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing['3xl'] },
  shiftCard: { marginBottom: Spacing.md },
  shiftHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  shiftTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold },
  clinicName: { fontSize: Typography.sizes.sm, marginTop: 2 },
  rateContainer: { alignItems: 'flex-end' },
  rate: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold },
  rateUnit: { fontSize: Typography.sizes.xs },
  shiftMeta: { gap: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: Typography.sizes.sm },
  expanded: { marginTop: Spacing.md, gap: Spacing.md, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.md },
  description: { fontSize: Typography.sizes.sm, lineHeight: 20 },
});
