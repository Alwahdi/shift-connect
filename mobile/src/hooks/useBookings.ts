import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/src/lib/supabase';
import type { Booking } from '@/src/types';

export function useBookings({ role, entityId }: { role: 'clinic' | 'professional'; entityId?: string }) {
  return useQuery<Booking[]>({
    queryKey: ['bookings', role, entityId],
    enabled: Boolean(entityId),
    queryFn: async () => {
      const column = role === 'clinic' ? 'clinic_id' : 'professional_id';
      const { data, error } = await supabase
        .from('bookings')
        .select('*, shift:shifts(*), clinic:clinics(*), professional:profiles(*)')
        .eq(column, entityId!)
        .order('id', { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []) as Booking[];
    },
  });
}
