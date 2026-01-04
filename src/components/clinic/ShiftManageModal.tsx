import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  MapPin,
  Users,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import ApplicantCard from "./ApplicantCard";

interface Shift {
  id: string;
  title: string;
  role_required: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  hourly_rate: number;
  location_address: string | null;
  description: string | null;
  is_filled: boolean;
  is_urgent: boolean;
}

interface Applicant {
  id: string;
  status: string;
  created_at: string;
  professional: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    rating_avg: number | null;
    location_address: string | null;
    specialties: string[] | null;
    verification_status: string;
  };
}

interface ShiftManageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift | null;
  onUpdate?: () => void;
}

const ShiftManageModal = ({
  open,
  onOpenChange,
  shift,
  onUpdate,
}: ShiftManageModalProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && shift) {
      fetchApplicants();
    }
  }, [open, shift]);

  const fetchApplicants = async () => {
    if (!shift) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          status,
          created_at,
          professional:profiles!bookings_professional_id_fkey(
            id,
            full_name,
            avatar_url,
            rating_avg,
            location_address,
            specialties,
            verification_status
          )
        `)
        .eq("shift_id", shift.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplicants(data as unknown as Applicant[]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (bookingId: string) => {
    setUpdatingId(bookingId);
    try {
      // Accept this booking
      const { error: acceptError } = await supabase
        .from("bookings")
        .update({ status: "accepted" })
        .eq("id", bookingId);

      if (acceptError) throw acceptError;

      // Decline all other pending bookings for this shift
      const { error: declineError } = await supabase
        .from("bookings")
        .update({ status: "declined" })
        .eq("shift_id", shift!.id)
        .eq("status", "requested")
        .neq("id", bookingId);

      if (declineError) throw declineError;

      // Mark shift as filled
      const { error: fillError } = await supabase
        .from("shifts")
        .update({ is_filled: true })
        .eq("id", shift!.id);

      if (fillError) throw fillError;

      toast({
        title: t("shifts.modal.applicantAccepted"),
        description: t("shifts.modal.applicantAcceptedDesc"),
      });

      fetchApplicants();
      onUpdate?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: error.message,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDecline = async (bookingId: string) => {
    setUpdatingId(bookingId);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "declined" })
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: t("shifts.modal.applicantDeclined"),
        description: t("shifts.modal.applicantDeclinedDesc"),
      });

      fetchApplicants();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: error.message,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (!shift) return null;

  const pendingApplicants = applicants.filter(a => a.status === "requested");
  const acceptedApplicants = applicants.filter(a => a.status === "accepted" || a.status === "confirmed");
  const declinedApplicants = applicants.filter(a => a.status === "declined");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t("shifts.modal.manageShift")}
            {shift.is_filled ? (
              <Badge className="bg-success/10 text-success border-success/20">
                <CheckCircle2 className="w-3 h-3 me-1" />{t("shifts.filled")}
              </Badge>
            ) : shift.is_urgent ? (
              <Badge variant="destructive"><AlertCircle className="w-3 h-3 me-1" />{t("common.urgent")}</Badge>
            ) : (
              <Badge variant="secondary">{t("shifts.open")}</Badge>
            )}
          </DialogTitle>
          <DialogDescription>{shift.role_required}</DialogDescription>
        </DialogHeader>

        {/* Shift Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Calendar className="w-3 h-3" />
              {t("shifts.date")}
            </div>
            <p className="text-sm font-medium text-foreground">
              {new Date(shift.shift_date).toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Clock className="w-3 h-3" />
              {t("shifts.time")}
            </div>
            <p className="text-sm font-medium text-foreground">
              {shift.start_time} - {shift.end_time}
            </p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <DollarSign className="w-3 h-3" />
              {t("shifts.rate")}
            </div>
            <p className="text-sm font-medium text-foreground">${shift.hourly_rate}{t("common.perHour")}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Users className="w-3 h-3" />
              {t("dashboard.applicants")}
            </div>
            <p className="text-sm font-medium text-foreground">{applicants.length}</p>
          </div>
        </div>

        {shift.location_address && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <MapPin className="w-4 h-4" />
            {shift.location_address}
          </div>
        )}

        <Separator />

        {/* Applicants */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : applicants.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{t("shifts.modal.noApplicantsYet")}</p>
            <p className="text-sm text-muted-foreground">{t("shifts.modal.noApplicantsDesc")}</p>
          </div>
        ) : (
          <Tabs defaultValue="pending" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                {t("shifts.modal.pendingTab")}
                {pendingApplicants.length > 0 && (
                  <span className="ms-2 px-1.5 py-0.5 text-xs bg-warning text-warning-foreground rounded-full">
                    {pendingApplicants.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="accepted">
                {t("shifts.modal.acceptedTab")}
                {acceptedApplicants.length > 0 && (
                  <span className="ms-2 px-1.5 py-0.5 text-xs bg-success text-success-foreground rounded-full">
                    {acceptedApplicants.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="declined">{t("shifts.modal.declinedTab")} ({declinedApplicants.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-3 mt-4">
              {pendingApplicants.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">{t("shifts.modal.noPending")}</p>
              ) : (
                pendingApplicants.map(applicant => (
                  <ApplicantCard
                    key={applicant.id}
                    applicant={applicant}
                    isUpdating={updatingId === applicant.id}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="accepted" className="space-y-3 mt-4">
              {acceptedApplicants.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">{t("shifts.modal.noAccepted")}</p>
              ) : (
                acceptedApplicants.map(applicant => (
                  <ApplicantCard
                    key={applicant.id}
                    applicant={applicant}
                    isUpdating={false}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="declined" className="space-y-3 mt-4">
              {declinedApplicants.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">{t("shifts.modal.noDeclined")}</p>
              ) : (
                declinedApplicants.map(applicant => (
                  <ApplicantCard
                    key={applicant.id}
                    applicant={applicant}
                    isUpdating={false}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShiftManageModal;