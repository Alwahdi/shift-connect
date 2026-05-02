import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface UseBookingRealtimeProps {
  professionalId?: string;
  clinicId?: string;
  onBookingUpdate?: () => void;
}

export const useBookingRealtime = ({
  professionalId,
  clinicId,
  onBookingUpdate,
}: UseBookingRealtimeProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleBookingChange = useCallback(
    (payload: any) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      // Determine notification message based on event type and status
      let title = "";
      let description = "";

      if (eventType === "INSERT") {
        title = t("notifications.newBookingRequest");
        description = t("notifications.newBookingDesc");
      } else if (eventType === "UPDATE") {
        const newStatus = newRecord?.status;
        const oldStatus = oldRecord?.status;

        if (newStatus !== oldStatus) {
          switch (newStatus) {
            case "accepted":
              title = t("notifications.bookingAccepted");
              description = t("notifications.bookingAcceptedDesc");
              break;
            case "declined":
              title = t("notifications.bookingDeclined");
              description = t("notifications.bookingDeclinedDesc");
              break;
            case "confirmed":
              title = t("notifications.bookingConfirmed");
              description = t("notifications.bookingConfirmedDesc");
              break;
            case "checked_in":
              title = t("notifications.checkedIn");
              description = t("notifications.checkedInDesc");
              break;
            case "checked_out":
              title = t("notifications.checkedOut");
              description = t("notifications.checkedOutDesc");
              break;
            case "completed":
              title = t("notifications.shiftCompleted");
              description = t("notifications.shiftCompletedDesc");
              break;
            case "cancelled":
              title = t("notifications.bookingCancelled");
              description = t("notifications.bookingCancelledDesc");
              break;
            default:
              title = t("notifications.bookingUpdated");
              description = t("notifications.bookingUpdatedDesc");
          }
        }
      }

      if (title) {
        toast({
          title,
          description,
        });
      }

      // Trigger refresh callback
      onBookingUpdate?.();
    },
    [toast, t, onBookingUpdate]
  );

  useEffect(() => {
    if (!professionalId && !clinicId) return;

    const filter = professionalId
      ? `professional_id=eq.${professionalId}`
      : `clinic_id=eq.${clinicId}`;

    const channel = supabase
      .channel("booking-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter,
        },
        handleBookingChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [professionalId, clinicId, handleBookingChange]);
};
