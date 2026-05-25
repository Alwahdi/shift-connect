import { useInfiniteQuery } from '@tanstack/react-query';

import { supabase } from '@/src/lib/supabase';
import type { Shift } from '@/src/types';

type UseShiftsOptions = {
  mode: 'clinic' | 'professional';
  clinicId?: string;
  search?: string;
  filter?: 'all' | 'active' | 'filled' | 'urgent';
  role?: string;
  minRate?: number;
  maxRate?: number;
  date?: string;
  pageSize?: number;
};

export function useShifts(options: UseShiftsOptions) {
  const pageSize = options.pageSize ?? 10;

  return useInfiniteQuery<Shift[]>({
    queryKey: ['shifts', options],
    enabled: options.mode === 'professional' || Boolean(options.clinicId),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => (lastPage.length === pageSize ? pages.length : undefined),
    queryFn: async ({ pageParam }) => {
      const page = pageParam as number;
      let query = supabase
        .from('shifts')
        .select(options.mode === 'professional' ? '*, clinic:clinics(*)' : '*')
        .range(page * pageSize, page * pageSize + pageSize - 1)
        .order('shift_date', { ascending: options.mode === 'professional' });

      if (options.mode === 'clinic' && options.clinicId) {
        query = query.eq('clinic_id', options.clinicId);
      }

      if (options.mode === 'professional') {
        query = query.eq('is_filled', false);
      }

      if (options.search) {
        query = query.or(`title.ilike.%${options.search}%,role_required.ilike.%${options.search}%,location_address.ilike.%${options.search}%`);
      }

      if (options.role) {
        query = query.ilike('role_required', `%${options.role}%`);
      }

      if (typeof options.minRate === 'number' && options.minRate > 0) {
        query = query.gte('hourly_rate', options.minRate);
      }

      if (typeof options.maxRate === 'number' && options.maxRate > 0) {
        query = query.lte('hourly_rate', options.maxRate);
      }

      if (options.date) {
        query = query.eq('shift_date', options.date);
      }

      if (options.filter === 'active') {
        query = query.eq('is_filled', false);
      }

      if (options.filter === 'filled') {
        query = query.eq('is_filled', true);
      }

      if (options.filter === 'urgent') {
        query = query.eq('is_urgent', true);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      const shifts = (data ?? []) as unknown as Shift[];

      if (options.mode === 'clinic' && shifts.length > 0) {
        const shiftIds = shifts.map((shift) => shift.id);
        const { data: bookings } = await supabase.from('bookings').select('shift_id').in('shift_id', shiftIds);
        const counts = (bookings ?? []).reduce<Record<string, number>>((accumulator, booking: { shift_id: string }) => {
          accumulator[booking.shift_id] = (accumulator[booking.shift_id] ?? 0) + 1;
          return accumulator;
        }, {});

        return shifts.map((shift) => ({
          ...shift,
          applicantCount: counts[shift.id] ?? 0,
        }));
      }

      return shifts;
    },
  });
}
