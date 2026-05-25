import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Modal, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/src/components/common/Avatar';
import { Badge } from '@/src/components/common/Badge';
import { Button } from '@/src/components/common/Button';
import { Card } from '@/src/components/common/Card';
import { ErrorState } from '@/src/components/common/ErrorState';
import { Input } from '@/src/components/common/Input';
import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';
import { FLOATING_TAB_BOTTOM_INSET } from '@/src/components/navigation/FloatingTabBar';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { useDebounce } from '@/src/hooks/useDebounce';
import { supabase } from '@/src/lib/supabase';
import type { Conversation, Profile } from '@/src/types';

export default function ClinicSearchScreen() {
  const { clinic } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Profile | null>(null);
  const [availableOnly, setAvailableOnly] = useState(true);
  const debouncedSearch = useDebounce(search, 350);

  const query = useQuery({
    queryKey: ['professionals', 'search', debouncedSearch, availableOnly],
    queryFn: async () => {
      let q = supabase
        .from('profiles')
        .select('*')
        .eq('onboarding_completed', true)
        .order('rating_avg', { ascending: false })
        .limit(50);

      if (availableOnly) {
        q = q.eq('is_available', true);
      }

      if (debouncedSearch.trim()) {
        const keyword = `%${debouncedSearch.trim()}%`;
        q = q.or(`full_name.ilike.${keyword},bio.ilike.${keyword}`);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
  });

  const professionals = query.data ?? [];

  const startConversation = async () => {
    if (!clinic || !selected) return;

    try {
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('clinic_id', clinic.id)
        .eq('professional_id', selected.id)
        .maybeSingle();

      if (existing) {
        setSelected(null);
        router.push(`/conversation/${(existing as Conversation).id}`);
        return;
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert({ clinic_id: clinic.id, professional_id: selected.id, last_message_at: new Date().toISOString() })
        .select('*')
        .single();

      if (error || !data) throw error ?? new Error('Conversation not created');

      setSelected(null);
      router.push(`/conversation/${(data as Conversation).id}`);
    } catch (error) {
      Alert.alert('Unable to start chat', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const onRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['professionals', 'search'] });
  }, [queryClient]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <FlatList
        data={professionals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={query.isFetching && !query.isLoading}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Search professionals</Text>
            <Input
              label={undefined}
              value={search}
              onChangeText={setSearch}
              placeholder="Search by name or bio…"
            />
            <View style={styles.toggleRow}>
              <Button
                title="Available only"
                variant={availableOnly ? 'primary' : 'outline'}
                size="sm"
                onPress={() => setAvailableOnly(true)}
              />
              <Button
                title="All professionals"
                variant={availableOnly ? 'outline' : 'primary'}
                size="sm"
                onPress={() => setAvailableOnly(false)}
              />
            </View>
            {query.isLoading ? <LoadingSpinner label="Searching professionals…" /> : null}
            {query.isError ? <ErrorState onRetry={onRefresh} /> : null}
          </View>
        }
        renderItem={({ item: professional }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <Avatar uri={professional.avatar_url} name={professional.full_name} />
              <View style={styles.grow}>
                <Text style={styles.name}>{professional.full_name}</Text>
                <Text style={styles.meta}>
                  {professional.specialties?.join(', ') || 'General healthcare professional'}
                </Text>
                <Text style={styles.meta}>
                  ${professional.hourly_rate ?? 0}/hr · {professional.rating_avg?.toFixed(1) ?? 'New'}★
                </Text>
              </View>
              <Badge
                label={professional.is_available ? 'Available' : 'Busy'}
                variant={professional.is_available ? 'success' : 'muted'}
              />
            </View>
            <Button title="View profile" variant="outline" onPress={() => setSelected(professional)} />
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <Modal
        visible={Boolean(selected)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            {selected ? (
              <ScrollView contentContainerStyle={styles.modalContent}>
                <View style={styles.row}>
                  <Avatar uri={selected.avatar_url} name={selected.full_name} size={64} />
                  <View style={styles.grow}>
                    <Text style={styles.modalTitle}>{selected.full_name}</Text>
                    <Text style={styles.meta}>{selected.specialties?.join(', ') || 'No specialties listed'}</Text>
                  </View>
                </View>
                <Text style={styles.bio}>{selected.bio || 'No bio added yet.'}</Text>
                <Text style={styles.meta}>Hourly rate: ${selected.hourly_rate ?? 0}/hr</Text>
                <Text style={styles.meta}>Verification: {selected.verification_status ?? 'pending'}</Text>
                <View style={styles.modalActions}>
                  <Button title="Message" onPress={startConversation} />
                  <Button title="Close" variant="outline" onPress={() => setSelected(null)} />
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: FLOATING_TAB_BOTTOM_INSET },
  header: { gap: theme.spacing.md, marginBottom: theme.spacing.sm },
  title: { color: theme.colors.text, fontSize: theme.typography.sizes.xxl, fontWeight: '800' },
  toggleRow: { flexDirection: 'row', gap: theme.spacing.sm },
  card: { gap: theme.spacing.md },
  separator: { height: theme.spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  grow: { flex: 1 },
  name: { color: theme.colors.text, fontWeight: '700', fontSize: theme.typography.sizes.md },
  meta: { color: theme.colors.muted, fontSize: theme.typography.sizes.sm, marginTop: 2 },
  overlay: { flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'flex-end' },
  modal: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    maxHeight: '78%',
  },
  modalContent: { padding: theme.spacing.lg, gap: theme.spacing.md },
  modalTitle: { color: theme.colors.text, fontSize: theme.typography.sizes.xl, fontWeight: '800' },
  bio: { color: theme.colors.text, lineHeight: 22 },
  modalActions: { flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' },
});
