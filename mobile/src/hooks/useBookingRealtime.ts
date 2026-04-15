import { useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";

interface Props {
  professionalId?: string;
  clinicId?: string;
  onBookingUpdate?: () => void;
}

export const useBookingRealtime = ({ professionalId, clinicId, onBookingUpdate }: Props) => {
  const handleChange = useCallback((payload: any) => {
    const status = payload.new?.status;
    const messages: Record<string, string> = {
      accepted: "Booking Accepted", declined: "Booking Declined",
      confirmed: "Booking Confirmed", checked_in: "Checked In",
      checked_out: "Checked Out", completed: "Shift Completed",
      cancelled: "Booking Cancelled",
    };
    if (status && messages[status]) {
      Toast.show({ type: status === "declined" || status === "cancelled" ? "error" : "success", text1: messages[status] });
    }
    onBookingUpdate?.();
  }, [onBookingUpdate]);

  useEffect(() => {
    if (!professionalId && !clinicId) return;
    const filter = professionalId ? `professional_id=eq.${professionalId}` : `clinic_id=eq.${clinicId}`;
    const channel = supabase.channel("booking-changes").on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter }, handleChange).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [professionalId, clinicId, handleChange]);
};
