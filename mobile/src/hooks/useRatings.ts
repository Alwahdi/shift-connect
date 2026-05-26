import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/src/lib/supabase';

export type RatingRow = {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
};

/** Check whether the current user has already rated a given booking. */
export function useExistingRating({ bookingId, reviewerId }: { bookingId?: string; reviewerId?: string }) {
  return useQuery<RatingRow | null>({
    queryKey: ['rating', bookingId, reviewerId],
    enabled: Boolean(bookingId) && Boolean(reviewerId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('booking_id', bookingId!)
        .eq('reviewer_id', reviewerId!)
        .maybeSingle();
      if (error) throw error;
      return (data as RatingRow | null) ?? null;
    },
  });
}

export function useSubmitRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      bookingId: string;
      reviewerId: string;
      revieweeId: string;
      rating: number;
      comment: string;
    }) => {
      const { error } = await supabase.from('ratings').insert({
        booking_id: input.bookingId,
        reviewer_id: input.reviewerId,
        reviewee_id: input.revieweeId,
        rating: input.rating,
        comment: input.comment || null,
      });
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rating', variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
