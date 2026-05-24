import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/common/Button';
import { EmptyState } from '@/src/components/common/EmptyState';
import { Input } from '@/src/components/common/Input';
import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';
import { ShiftCard } from '@/src/components/shifts/ShiftCard';
import { theme } from '@/src/constants/theme';
import { useShifts } from '@/src/hooks/useShifts';

export default function BrowseShiftsScreen() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [date, setDate] = useState('');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');

  const query = useShifts({
    mode: 'professional',
    search,
    role,
    date,
    minRate: minRate ? Number(minRate) : undefined,
    maxRate: maxRate ? Number(maxRate) : undefined,
  });

  const shifts = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);

  if (query.isLoading) {
    return <LoadingSpinner fullScreen label="Loading open shifts..." />;
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Browse shifts</Text>
        <Input label="Search shifts" placeholder="Role, shift title, clinic..." value={search} onChangeText={setSearch} />
        <View style={styles.row}>
          <Input label="Role filter" value={role} onChangeText={setRole} />
          <Input label="Date" placeholder="YYYY-MM-DD" value={date} onChangeText={setDate} />
        </View>
        <View style={styles.row}>
          <Input label="Min rate" keyboardType="numeric" value={minRate} onChangeText={setMinRate} />
          <Input label="Max rate" keyboardType="numeric" value={maxRate} onChangeText={setMaxRate} />
        </View>

        <View style={styles.list}>
          {shifts.length ? shifts.map((shift) => <ShiftCard key={shift.id} shift={shift} clinicName={shift.clinic?.name} onPress={() => router.push(`/shift/${shift.id}`)} />) : <EmptyState title="No shifts found" description="Adjust your search or filters to find more opportunities." />}
        </View>

        {query.hasNextPage ? <Button title="Load more" variant="outline" onPress={() => query.fetchNextPage()} loading={query.isFetchingNextPage} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.lg, gap: theme.spacing.md },
  title: { color: theme.colors.text, fontSize: theme.typography.sizes.xxl, fontWeight: '800' },
  row: { flexDirection: 'row', gap: theme.spacing.md },
  list: { gap: theme.spacing.md, marginTop: theme.spacing.sm },
});
