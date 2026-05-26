import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TextInput, Pressable, ActivityIndicator, Modal, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
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

const ROLE_OPTIONS = [
  'Registered Nurse (RN)', 'Licensed Practical Nurse (LPN)', 'CNA', 'Medical Assistant (MA)',
  'Dental Hygienist', 'Dental Assistant', 'Physical Therapist', 'Occupational Therapist',
  'Radiologic Technologist', 'Phlebotomist', 'Medical Receptionist', 'Other',
];

export default function ShiftsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user, userRole } = useAuth();
  const { profileId } = useProfile();
  const insets = useSafeAreaInsets();

  // Professional filters
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [expandedShift, setExpandedShift] = useState<string | null>(null);
  const [minRate, setMinRate] = useState('');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [manageShift, setManageShift] = useState<any>(null);

  // Professional: find shifts
  const { data: proShifts, isLoading: proLoading, refetch: refetchPro } = useQuery({
    queryKey: ['shifts', search, selectedRole, minRate, dateRange, userRole, profileId],
    enabled: userRole === 'professional' && !!profileId,
    queryFn: async () => {
      let query = supabase
        .from('shifts')
        .select('*, clinics(id, name, logo_url, rating_avg), bookings(id, status, professional_id)')
        .eq('is_filled', false)
        .gte('shift_date', (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })())
        .order('shift_date', { ascending: true });
      if (selectedRole) query = query.eq('role_required', selectedRole);
      if (search.trim()) query = query.or(`title.ilike.%${search}%,location_address.ilike.%${search}%`);
      if (minRate) query = query.gte('hourly_rate', parseFloat(minRate));
      // Date range filter — use local date to avoid UTC offset showing expired shifts
      const today = new Date();
      const localDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      if (dateRange === 'today') {
        query = query.eq('shift_date', localDate(today));
      } else if (dateRange === 'week') {
        const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7);
        query = query.gte('shift_date', localDate(today)).lte('shift_date', localDate(weekEnd));
      } else if (dateRange === 'month') {
        const monthEnd = new Date(today); monthEnd.setDate(today.getDate() + 30);
        query = query.gte('shift_date', localDate(today)).lte('shift_date', localDate(monthEnd));
      }
      const { data } = await query.limit(30);
      return data || [];
    },
    staleTime: 60 * 1000,
  });

  // Clinic: own posted shifts
  const { data: clinicShifts, isLoading: clinicLoading, refetch: refetchClinic } = useQuery({
    queryKey: ['clinic-shifts', userRole, profileId],
    enabled: userRole === 'clinic' && !!profileId,
    queryFn: async () => {
      let query = supabase
        .from('shifts')
        .select('*, bookings(id, status), clinics(name, logo_url)')
        .eq('clinic_id', profileId)
        .order('shift_date', { ascending: true });
      const { data } = await query.limit(50);
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
        status: 'requested',
      });
      if (error) throw error;
      Toast.show({ type: 'success', text1: t('common.success'), text2: t('shifts.applied') });
      refetchPro();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: t('common.error'), text2: err.message });
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (userRole === 'professional') await refetchPro();
    else if (userRole === 'clinic') await refetchClinic();
    setRefreshing(false);
  }, [userRole, refetchPro, refetchClinic]);

  // Professional shift card
  const renderProShift = ({ item }: { item: any }) => {
    const myBooking = item.bookings?.find((b: any) => b.professional_id === profileId);
    const isAccepted = myBooking?.status === 'accepted' || myBooking?.status === 'confirmed';
    const hasApplied = !!myBooking;
    return (
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

      <View style={{ flexDirection: 'row', gap: 8, marginTop: Spacing.sm, flexWrap: 'wrap' }}>
        <Badge label={item.role_required || 'General'} variant="primary" />
        {hasApplied && <Badge label={myBooking.status} variant={isAccepted ? 'success' : 'warning'} />}
      </View>

      {expandedShift === item.id && (
        <View style={[styles.expanded, { borderTopColor: colors.border }]}> 
          {item.description && (
            <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>
          )}
          {isAccepted && (
            <Button
              title="View Clinic Profile"
              onPress={() => router.push(`/clinic/${item.clinics?.id || item.clinic_id}`)}
              fullWidth
              size="md"
              variant="outline"
              style={{ marginBottom: Spacing.sm }}
              icon={<Ionicons name="business-outline" size={18} color={colors.primary} />}
            />
          )}
          {!hasApplied && (
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
  };

  // Clinic shift card
  const renderClinicShift = ({ item }: { item: any }) => {
    const filled = item.is_filled;
    const applicants = item.bookings?.length || 0;
    return (
      <Card
        variant="elevated"
        style={styles.shiftCard}
        onPress={() => setManageShift(item)}
      >
        <View style={styles.shiftHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.shiftTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
            <Text style={[styles.clinicName, { color: colors.textSecondary }]}>Applicants: {applicants}</Text>
          </View>
          <View style={styles.rateContainer}>
            <Text style={[styles.rate, { color: filled ? colors.textTertiary : colors.primary }]}>{filled ? t('shifts.filled') : t('shifts.open')}</Text>
          </View>
        </View>
        <View style={styles.shiftMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{formatDate(item.shift_date)}</Text>
          </View>
        </View>
      </Card>
    );
  };

  // UI
  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}> 
      {userRole === 'professional' && (
        <>
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

          {/* Filters */}
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.xl, marginBottom: Spacing.md }}>
            <FlatList
              horizontal
              data={[null, ...ROLE_OPTIONS]}
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
                    {item ? item : t('shifts.allRoles')}
                  </Text>
                </Pressable>
              )}
            />
            {/* Min Rate */}
            <TextInput
              value={minRate}
              onChangeText={setMinRate}
              placeholder={t('shifts.filterByRate')}
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              style={{ minWidth: 80, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 8, color: colors.text }}
            />
            {/* Date Range */}
            <FlatList
              horizontal
              data={['today', 'week', 'month', 'all']}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setDateRange(item as any)}
                  style={{
                    backgroundColor: dateRange === item ? colors.primary : colors.surfaceVariant,
                    borderRadius: 16,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    marginLeft: 4,
                  }}
                >
                  <Text style={{ color: dateRange === item ? '#FFF' : colors.textSecondary, fontSize: 13 }}>{t(`shifts.${item}`) || item}</Text>
                </Pressable>
              )}
            />
          </View>

          {/* Shifts List */}
          <FlatList
            data={proShifts}
            keyExtractor={(item) => item.id}
            renderItem={renderProShift}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            ListEmptyComponent={
              proLoading ? (
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
        </>
      )}

      {userRole === 'clinic' && (
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, marginVertical: Spacing.md }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>{t('shifts.postedShifts')}</Text>
            <Button title={t('shifts.createNew')} onPress={() => setShowCreateModal(true)} variant="primary" size="sm" />
          </View>
          <FlatList
            data={clinicShifts}
            keyExtractor={(item) => item.id}
            renderItem={renderClinicShift}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            ListEmptyComponent={
              clinicLoading ? (
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
          {/* Create Shift Modal */}
          <CreateShiftModal
            visible={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            profileId={profileId}
            colors={colors}
            t={t}
            onSuccess={() => refetchClinic()}
          />
          {/* Manage Shift Modal */}
          {manageShift && (
            <ShiftManageModal
              shift={manageShift}
              visible={!!manageShift}
              onClose={() => setManageShift(null)}
              profileId={profileId}
              colors={colors}
              t={t}
              onUpdate={() => refetchClinic()}
            />
          )}
        </>
      )}
    </View>
  );
}

// ----- MiniCalendar -----
function MiniCalendar({ value, onChange, colors }: { value: string; onChange: (d: string) => void; colors: any }) {
  const today = new Date();
  const initDate = value ? new Date(value + 'T12:00:00') : today;
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());

  const pad = (n: number) => String(n).padStart(2, '0');
  const localStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayStr = localStr(today);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <TouchableOpacity onPress={prevMonth} hitSlop={8} style={{ padding: 4 }}>
          <Text style={{ color: colors.primary, fontSize: 18 }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: 'center', fontWeight: '700', color: colors.text }}>{MONTHS[viewMonth]} {viewYear}</Text>
        <TouchableOpacity onPress={nextMonth} hitSlop={8} style={{ padding: 4 }}>
          <Text style={{ color: colors.primary, fontSize: 18 }}>›</Text>
        </TouchableOpacity>
      </View>
      {/* Day names */}
      <View style={{ flexDirection: 'row', marginBottom: 4 }}>
        {DAYS.map(d => <Text key={d} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: colors.textTertiary, fontWeight: '600' }}>{d}</Text>)}
      </View>
      {/* Cells */}
      {Array.from({ length: cells.length / 7 }, (_, row) => (
        <View key={row} style={{ flexDirection: 'row' }}>
          {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
            if (!day) return <View key={col} style={{ flex: 1, height: 36 }} />;
            const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
            const isSelected = dateStr === value;
            const isToday = dateStr === todayStr;
            const isPast = dateStr < todayStr;
            return (
              <TouchableOpacity key={col} onPress={() => !isPast && onChange(dateStr)} disabled={isPast}
                style={{ flex: 1, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18,
                  backgroundColor: isSelected ? colors.primary : 'transparent' }}>
                <Text style={{ fontSize: 13, fontWeight: isSelected || isToday ? '700' : '400',
                  color: isPast ? colors.textTertiary : isSelected ? '#fff' : isToday ? colors.primary : colors.text }}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ----- TimePicker -----
function TimePicker({ value, onChange, colors }: { value: string; onChange: (t: string) => void; colors: any }) {
  const [h, m] = value.split(':').map(Number);
  const pad = (n: number) => String(n).padStart(2, '0');
  const addHour = (delta: number) => onChange(`${pad((h + delta + 24) % 24)}:${pad(m)}`);
  const addMin = (delta: number) => onChange(`${pad(h)}:${pad((m + delta + 60) % 60)}`);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      backgroundColor: colors.card, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity onPress={() => addHour(1)} hitSlop={8}><Text style={{ color: colors.primary, fontSize: 22, fontWeight: '700' }}>▲</Text></TouchableOpacity>
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, width: 44, textAlign: 'center' }}>{pad(h)}</Text>
        <TouchableOpacity onPress={() => addHour(-1)} hitSlop={8}><Text style={{ color: colors.primary, fontSize: 22, fontWeight: '700' }}>▼</Text></TouchableOpacity>
      </View>
      <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>:</Text>
      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity onPress={() => addMin(15)} hitSlop={8}><Text style={{ color: colors.primary, fontSize: 22, fontWeight: '700' }}>▲</Text></TouchableOpacity>
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, width: 44, textAlign: 'center' }}>{pad(m)}</Text>
        <TouchableOpacity onPress={() => addMin(-15)} hitSlop={8}><Text style={{ color: colors.primary, fontSize: 22, fontWeight: '700' }}>▼</Text></TouchableOpacity>
      </View>
    </View>
  );
}

// ----- CreateShiftModal -----
function CreateShiftModal({ visible, onClose, profileId, colors, t, onSuccess }: any) {
  const [form, setForm] = useState({
    role_required: '',
    title: '',
    shift_date: '',
    start_time: '08:00',
    end_time: '16:00',
    hourly_rate: '',
    location_address: '',
    description: '',
    is_urgent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [rolePickerOpen, setRolePickerOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);

  const handleSubmit = async () => {
    if (!form.role_required || !form.shift_date || !form.hourly_rate) {
      Toast.show({ type: 'error', text1: t('common.error'), text2: t('shifts.fields.roleRequired') });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('shifts').insert({
        clinic_id: profileId,
        title: form.title || form.role_required,
        role_required: form.role_required,
        shift_date: form.shift_date,
        start_time: form.start_time,
        end_time: form.end_time,
        hourly_rate: parseFloat(form.hourly_rate),
        location_address: form.location_address || null,
        description: form.description || null,
        is_urgent: form.is_urgent,
      });
      if (error) throw error;
      Toast.show({ type: 'success', text1: t('shifts.shiftPosted') });
      onSuccess?.();
      onClose();
      setForm({ role_required: '', title: '', shift_date: '', start_time: '08:00', end_time: '16:00', hourly_rate: '', location_address: '', description: '', is_urgent: false });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: t('common.error'), text2: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = { borderWidth: 1, borderColor: colors.border, borderRadius: BorderRadius.md, padding: Spacing.md, color: colors.text, backgroundColor: colors.inputBackground };
  const labelStyle = { color: colors.textSecondary, fontSize: Typography.sizes.sm, marginBottom: 4 };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: Spacing.xl, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }}>
          <Text style={{ flex: 1, fontSize: Typography.sizes.xl, fontWeight: '700', color: colors.text }}>{t('shifts.createNew')}</Text>
          <Pressable onPress={onClose} hitSlop={8}><Ionicons name="close" size={24} color={colors.text} /></Pressable>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.xl, gap: Spacing.md }} keyboardShouldPersistTaps="handled">
          {/* Role */}
          <Text style={labelStyle}>{t('shifts.role')} *</Text>
          <Pressable onPress={() => setRolePickerOpen(!rolePickerOpen)}
            style={{ borderWidth: 1, borderColor: colors.border, borderRadius: BorderRadius.md, padding: Spacing.md, backgroundColor: colors.inputBackground, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ flex: 1, color: form.role_required ? colors.text : colors.textTertiary }}>{form.role_required || t('shifts.selectRole')}</Text>
            <Ionicons name={rolePickerOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textTertiary} />
          </Pressable>
          {rolePickerOpen && (
            <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: BorderRadius.md, backgroundColor: colors.card, height: 220 }}>
              <FlatList data={ROLE_OPTIONS} keyExtractor={r => r} nestedScrollEnabled keyboardShouldPersistTaps="handled"
                renderItem={({ item: r }) => (
                  <Pressable onPress={() => { setForm(f => ({ ...f, role_required: r })); setRolePickerOpen(false); }}
                    style={{ padding: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }}>
                    <Text style={{ color: form.role_required === r ? colors.primary : colors.text, fontWeight: form.role_required === r ? '600' : '400' }}>{r}</Text>
                  </Pressable>
                )} />
            </View>
          )}
          {/* Title */}
          <Text style={labelStyle}>{t('shifts.title')} ({t('common.optional')})</Text>
          <TextInput value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))}
            placeholder={form.role_required || t('shifts.title')} placeholderTextColor={colors.textTertiary} style={inputStyle} />
          {/* Date */}
          <Text style={labelStyle}>{t('shifts.date')} *</Text>
          <Pressable onPress={() => { setShowDatePicker(!showDatePicker); setShowStartTime(false); setShowEndTime(false); }}
            style={{ borderWidth: 1, borderColor: showDatePicker ? colors.primary : colors.border, borderRadius: BorderRadius.md, padding: Spacing.md, backgroundColor: colors.inputBackground, flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={16} color={colors.textTertiary} style={{ marginRight: 8 }} />
            <Text style={{ color: form.shift_date ? colors.text : colors.textTertiary }}>{form.shift_date || 'Select date'}</Text>
          </Pressable>
          {showDatePicker && (
            <MiniCalendar value={form.shift_date} onChange={d => { setForm(f => ({ ...f, shift_date: d })); setShowDatePicker(false); }} colors={colors} />
          )}
          {/* Start/End Time */}
          <View style={{ flexDirection: 'row', gap: Spacing.md }}>
            <View style={{ flex: 1 }}>
              <Text style={labelStyle}>{t('shifts.startTime')}</Text>
              <Pressable onPress={() => { setShowStartTime(!showStartTime); setShowEndTime(false); setShowDatePicker(false); }}
                style={{ borderWidth: 1, borderColor: showStartTime ? colors.primary : colors.border, borderRadius: BorderRadius.md, padding: Spacing.md, backgroundColor: colors.inputBackground, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="time-outline" size={16} color={colors.textTertiary} />
                <Text style={{ color: colors.text }}>{form.start_time}</Text>
              </Pressable>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={labelStyle}>{t('shifts.endTime')}</Text>
              <Pressable onPress={() => { setShowEndTime(!showEndTime); setShowStartTime(false); setShowDatePicker(false); }}
                style={{ borderWidth: 1, borderColor: showEndTime ? colors.primary : colors.border, borderRadius: BorderRadius.md, padding: Spacing.md, backgroundColor: colors.inputBackground, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="time-outline" size={16} color={colors.textTertiary} />
                <Text style={{ color: colors.text }}>{form.end_time}</Text>
              </Pressable>
            </View>
          </View>
          {showStartTime && <TimePicker value={form.start_time} onChange={v => setForm(f => ({ ...f, start_time: v }))} colors={colors} />}
          {showEndTime && <TimePicker value={form.end_time} onChange={v => setForm(f => ({ ...f, end_time: v }))} colors={colors} />}
          {/* Rate */}
          <Text style={labelStyle}>{t('shifts.rate')} ($/hr) *</Text>
          <TextInput value={form.hourly_rate} onChangeText={v => setForm(f => ({ ...f, hourly_rate: v }))} placeholder="45.00"
            placeholderTextColor={colors.textTertiary} keyboardType="decimal-pad" style={inputStyle} />
          {/* Location */}
          <Text style={labelStyle}>{t('shifts.location')}</Text>
          <TextInput value={form.location_address} onChangeText={v => setForm(f => ({ ...f, location_address: v }))} placeholder="123 Main St"
            placeholderTextColor={colors.textTertiary} style={inputStyle} />
          {/* Description */}
          <Text style={labelStyle}>{t('shifts.description')}</Text>
          <TextInput value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} placeholder="Details about the shift..."
            placeholderTextColor={colors.textTertiary} multiline numberOfLines={3}
            style={[inputStyle, { textAlignVertical: 'top', minHeight: 80 }]} />
          {/* Urgent */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, borderRadius: BorderRadius.md, backgroundColor: colors.error + '10', borderWidth: 1, borderColor: colors.error + '30' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={{ color: colors.text, fontWeight: '500' }}>{t('shifts.isUrgent')}</Text>
            </View>
            <Switch value={form.is_urgent} onValueChange={v => setForm(f => ({ ...f, is_urgent: v }))} />
          </View>
        </ScrollView>
        <View style={{ padding: Spacing.xl, flexDirection: 'row', gap: Spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }}>
          <Button title={t('common.cancel')} onPress={onClose} variant="outline" style={{ flex: 1 }} />
          <Button title={submitting ? '...' : t('shifts.createNew')} onPress={handleSubmit} disabled={submitting} variant="primary" style={{ flex: 1 }} />
        </View>
      </View>
    </Modal>
  );
}

// ----- ShiftManageModal -----
function ShiftManageModal({ shift, visible, onClose, profileId, colors, t, onUpdate }: any) {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  React.useEffect(() => {
    if (visible && shift?.id) fetchApplicants();
  }, [visible, shift?.id]);

  const fetchApplicants = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select('id, status, created_at, professional:profiles(id, full_name, avatar_url, rating_avg, specialties, verification_status)')
      .eq('shift_id', shift.id)
      .order('created_at', { ascending: false });
    setApplicants(data || []);
    setLoading(false);
  };

  const handleAccept = async (bookingId: string) => {
    setUpdating(bookingId);
    const { error } = await supabase.from('bookings').update({ status: 'accepted' }).eq('id', bookingId);
    if (!error) { Toast.show({ type: 'success', text1: t('applicant.accepted') }); fetchApplicants(); onUpdate?.(); }
    else Toast.show({ type: 'error', text1: error.message });
    setUpdating(null);
  };

  const handleDecline = async (bookingId: string) => {
    setUpdating(bookingId);
    const { error } = await supabase.from('bookings').update({ status: 'declined' }).eq('id', bookingId);
    if (!error) { Toast.show({ type: 'info', text1: t('applicant.declined') }); fetchApplicants(); onUpdate?.(); }
    else Toast.show({ type: 'error', text1: error.message });
    setUpdating(null);
  };

  if (!shift) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: Spacing.xl, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: Typography.sizes.lg, fontWeight: '700', color: colors.text }} numberOfLines={1}>{shift.title || shift.role_required}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: Typography.sizes.sm }}>{formatDate(shift.shift_date)} • {shift.start_time} – {shift.end_time}</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={8}><Ionicons name="close" size={24} color={colors.text} /></Pressable>
        </View>
        {/* Shift summary */}
        <View style={{ flexDirection: 'row', padding: Spacing.xl, gap: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }}>
          <View style={{ flex: 1, backgroundColor: colors.surfaceVariant, borderRadius: BorderRadius.md, padding: Spacing.sm, alignItems: 'center' }}>
            <Text style={{ color: colors.textTertiary, fontSize: Typography.sizes.xs }}>{t('shifts.rate')}</Text>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>{formatCurrency(shift.hourly_rate)}/hr</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.surfaceVariant, borderRadius: BorderRadius.md, padding: Spacing.sm, alignItems: 'center' }}>
            <Text style={{ color: colors.textTertiary, fontSize: Typography.sizes.xs }}>{t('shifts.filled')}</Text>
            <Text style={{ color: shift.is_filled ? colors.success : colors.warning, fontWeight: '700' }}>{shift.is_filled ? 'Yes' : 'No'}</Text>
          </View>
        </View>
        {/* Applicants */}
        <Text style={{ padding: Spacing.xl, paddingBottom: Spacing.sm, fontWeight: '600', color: colors.text, fontSize: Typography.sizes.base }}>{t('shifts.applicants') || 'Applicants'}</Text>
        {loading ? (
          <View style={{ alignItems: 'center', padding: Spacing.xl }}><ActivityIndicator color={colors.primary} /></View>
        ) : applicants.length === 0 ? (
          <Text style={{ color: colors.textTertiary, textAlign: 'center', padding: Spacing.xl }}>{t('shifts.noApplicants') || 'No applicants yet'}</Text>
        ) : (
          <FlatList
            data={applicants}
            keyExtractor={a => a.id}
            contentContainerStyle={{ paddingHorizontal: Spacing.xl }}
            renderItem={({ item }) => {
              const pro = item.professional as any;
              const isPending = item.status === 'requested';
              return (
                <Card variant="outlined" style={{ marginBottom: Spacing.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontWeight: '600' }}>{pro?.full_name || 'Professional'}</Text>
                      {pro?.rating_avg > 0 && <Text style={{ color: colors.textSecondary, fontSize: Typography.sizes.sm }}>★ {pro.rating_avg.toFixed(1)}</Text>}
                    </View>
                    <TouchableOpacity onPress={() => { onClose(); router.push(`/professional/${pro?.id}`); }}
                      style={{ padding: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginRight: 4 }}>
                      <Ionicons name="person-outline" size={16} color={colors.primary} />
                    </TouchableOpacity>
                    <Badge label={item.status} variant={item.status === 'accepted' ? 'success' : item.status === 'declined' ? 'error' : 'warning'} size="sm" />
                  </View>
                  {isPending && (
                    <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm }}>
                      <Button title={updating === item.id ? '...' : t('applicant.accept')} onPress={() => handleAccept(item.id)} disabled={!!updating} variant="primary" size="sm" style={{ flex: 1 }} />
                      <Button title={updating === item.id ? '...' : t('applicant.decline')} onPress={() => handleDecline(item.id)} disabled={!!updating} variant="outline" size="sm" style={{ flex: 1 }} />
                    </View>
                  )}
                </Card>
              );
            }}
          />
        )}
      </View>
    </Modal>
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
