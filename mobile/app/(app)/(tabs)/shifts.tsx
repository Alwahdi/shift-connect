import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SearchBar } from '@/components/ui/SearchBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';
import { spacing, typography, borderRadius, colors as themeColors } from '@/constants/theme';
import { formatShiftDate, formatShiftTime, formatHourlyRate } from '@/lib/utils';

export default function ShiftsScreen() {
  const { user, userRole } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      if (userRole === 'professional') {
        const { data } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
        return data;
      }
      const { data } = await supabase.from('clinics').select('id').eq('user_id', user.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: shifts, isLoading } = useQuery({
    queryKey: ['shifts', userRole, profile?.id, search],
    queryFn: async () => {
      if (userRole === 'clinic' && profile) {
        let query = supabase
          .from('shifts')
          .select('*, bookings(count)')
          .eq('clinic_id', profile.id)
          .order('created_at', { ascending: false });
        if (search) query = query.ilike('title', `%${search}%`);
        const { data } = await query;
        return data || [];
      } else {
        let query = supabase
          .from('shifts')
          .select('*, clinics(name, logo_url, verification_status)')
          .eq('is_filled', false)
          .gte('shift_date', new Date().toISOString().split('T')[0])
          .order('shift_date', { ascending: true });
        if (search) query = query.ilike('title', `%${search}%`);
        const { data } = await query;
        return data || [];
      }
    },
    enabled: !!user && (userRole === 'professional' || !!profile),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['shifts'] });
    setRefreshing(false);
  }, [queryClient]);

  const renderShiftCard = ({ item }: { item: any }) => (
    <Card
      variant="default"
      onPress={() => router.push(`/(app)/shift/${item.id}`)}
      style={styles.shiftCard}
    >
      <View style={styles.shiftHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.bodyMedium, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          {userRole === 'professional' && item.clinics && (
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              {item.clinics.name}
            </Text>
          )}
        </View>
        <View style={styles.rateContainer}>
          <Text style={[typography.h4, { color: colors.primary }]}>
            {formatHourlyRate(item.hourly_rate)}
          </Text>
        </View>
      </View>

      <View style={styles.shiftMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
            {formatShiftDate(item.shift_date)}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
            {formatShiftTime(item.start_time, item.end_time)}
          </Text>
        </View>
      </View>

      {item.location_name && (
        <View style={styles.metaItem}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]} numberOfLines={1}>
            {item.location_name}{item.location_city ? `, ${item.location_city}` : ''}
          </Text>
        </View>
      )}

      <View style={styles.shiftFooter}>
        <View style={styles.badges}>
          {item.is_urgent && <Badge text="Urgent" variant="warning" size="sm" />}
          {item.role_required && <Badge text={item.role_required} variant="accent" size="sm" />}
          {userRole === 'clinic' && (
            <Badge
              text={`${item.current_applicants || 0} applicants`}
              variant="default"
              size="sm"
            />
          )}
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.headerBar}>
        <Text style={[typography.h2, { color: colors.text }]}>
          {userRole === 'clinic' ? 'My Shifts' : 'Find Shifts'}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search shifts..."
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </View>
      ) : (
        <FlatList
          data={shifts}
          keyExtractor={(item) => item.id}
          renderItem={renderShiftCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="briefcase-outline"
              title={userRole === 'clinic' ? 'No shifts posted' : 'No shifts available'}
              description={
                userRole === 'clinic'
                  ? 'Create your first shift to start finding professionals'
                  : 'Check back later for new opportunities'
              }
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  searchContainer: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
  },
  loadingContainer: {
    paddingHorizontal: spacing.base,
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: 120,
  },
  shiftCard: {
    marginBottom: spacing.md,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  rateContainer: {
    alignItems: 'flex-end',
  },
  shiftMeta: {
    flexDirection: 'row',
    gap: spacing.base,
    marginTop: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  shiftFooter: {
    marginTop: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
