import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/common/Button';
import { EmptyState } from '@/src/components/common/EmptyState';
import { ErrorState } from '@/src/components/common/ErrorState';
import { Input } from '@/src/components/common/Input';
import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';
import { FLOATING_TAB_BOTTOM_INSET } from '@/src/components/navigation/FloatingTabBar';
import { ShiftCard } from '@/src/components/shifts/ShiftCard';
import { theme } from '@/src/constants/theme';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useShifts } from '@/src/hooks/useShifts';

export default function BrowseShiftsScreen() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [date, setDate] = useState('');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');

  const debouncedSearch = useDebounce(search, 350);
  const debouncedRole = useDebounce(role, 350);

  const query = useShifts({
    mode: 'professional',
    search: debouncedSearch,
    role: debouncedRole,
    date,
    minRate: minRate ? Number(minRate) : undefined,
    maxRate: maxRate ? Number(maxRate) : undefined,
  });

  const shifts = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);

  const onRefresh = useCallback(() => { query.refetch().catch(() => undefined); }, [query]);

  if (query.isLoading) {
    return <LoadingSpinner fullScreen label="Loading open shifts..." />;
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <FlatList
        data={shifts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        onEndReached={() => { if (query.hasNextPage && !query.isFetchingNextPage) { query.fetchNextPage().catch(() => undefined); } }}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={query.isFetching && !query.isLoading}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Browse shifts</Text>
            <Input label={undefined} placeholder="Search role, title, clinic…" value={search} onChangeText={setSearch} />
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Input label={undefined} placeholder="Role filter" value={role} onChangeText={setRole} />
              </View>
              <View style={styles.flex1}>
                <Input label={undefined} placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Input label={undefined} placeholder="Min $/hr" keyboardType="numeric" value={minRate} onChangeText={setMinRate} />
              </View>
              <View style={styles.flex1}>
                <Input label={undefined} placeholder="Max $/hr" keyboardType="numeric" value={maxRate} onChangeText={setMaxRate} />
              </View>
            </View>
            {query.isError ? <ErrorState onRetry={onRefresh} /> : null}
          </View>
        }
        ListFooterComponent={
          query.isFetchingNextPage ? <LoadingSpinner label="Loading more shifts…" /> : null
        }
        ListEmptyComponent={
          !query.isError ? (
            <EmptyState title="No shifts found" description="Adjust your search or filters to find more opportunities." />
          ) : null
        }
        renderItem={({ item: shift }) => (
          <ShiftCard
            shift={shift}
            clinicName={shift.clinic?.name}
            onPress={() => router.push(`/shift/${shift.id}`)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: FLOATING_TAB_BOTTOM_INSET },
  header: { gap: theme.spacing.md, marginBottom: theme.spacing.sm },
  title: { color: theme.colors.text, fontSize: theme.typography.sizes.xxl, fontWeight: '800' },
  row: { flexDirection: 'row', gap: theme.spacing.md },
  flex1: { flex: 1 },
  separator: { height: theme.spacing.md },
});
