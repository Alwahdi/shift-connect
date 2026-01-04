import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  MapPin, 
  Building2, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Shield,
  FileText,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

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
  required_certifications: string[] | null;
  is_urgent: boolean;
  clinic: {
    id: string;
    name: string;
    address: string | null;
    rating_avg: number | null;
  };
}

interface ShiftDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift | null;
  profileId: string;
  verificationStatus: string;
  onApplicationSuccess?: () => void;
}

const ShiftDetailModal = ({
  open,
  onOpenChange,
  shift,
  profileId,
  verificationStatus,
  onApplicationSuccess,
}: ShiftDetailModalProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const { toast } = useToast();

  if (!shift) return null;

  const isVerified = verificationStatus === "verified";

  const handleApply = async () => {
    if (!isVerified) {
      toast({
        variant: "destructive",
        title: t("shifts.modal.verificationRequired"),
        description: t("shifts.modal.verificationRequiredDesc"),
      });
      return;
    }

    setIsApplying(true);
    try {
      // Check if already applied
      const { data: existing } = await supabase
        .from("bookings")
        .select("id")
        .eq("shift_id", shift.id)
        .eq("professional_id", profileId)
        .single();

      if (existing) {
        toast({
          variant: "destructive",
          title: t("shifts.modal.alreadyApplied"),
          description: t("shifts.modal.alreadyAppliedDesc"),
        });
        setHasApplied(true);
        return;
      }

      // Create booking request
      const { error } = await supabase
        .from("bookings")
        .insert({
          shift_id: shift.id,
          professional_id: profileId,
          clinic_id: shift.clinic.id,
          status: "requested",
        });

      if (error) throw error;

      toast({
        title: t("shifts.applySuccess"),
        description: t("shifts.modal.applicantAcceptedDesc"),
      });

      setHasApplied(true);
      onApplicationSuccess?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("shifts.applyError"),
        description: error.message,
      });
    } finally {
      setIsApplying(false);
    }
  };

  const calculateShiftHours = () => {
    const [startH, startM] = shift.start_time.split(":").map(Number);
    const [endH, endM] = shift.end_time.split(":").map(Number);
    const hours = (endH * 60 + endM - startH * 60 - startM) / 60;
    return hours > 0 ? hours : 24 + hours;
  };

  const estimatedEarnings = (calculateShiftHours() * shift.hourly_rate).toFixed(0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {shift.clinic.name}
            {shift.is_urgent && (
              <Badge variant="destructive" className="text-xs">{t("common.urgent")}</Badge>
            )}
          </DialogTitle>
          <DialogDescription>{shift.role_required}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Key Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="w-4 h-4" />
                {t("shifts.date")}
              </div>
              <p className="font-medium text-foreground">
                {new Date(shift.shift_date).toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                {t("shifts.time")}
              </div>
              <p className="font-medium text-foreground">
                {shift.start_time} - {shift.end_time}
              </p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <DollarSign className="w-4 h-4" />
                {t("shifts.rate")}
              </div>
              <p className="font-medium text-foreground">${shift.hourly_rate}{t("common.perHour")}</p>
            </div>
            <div className="bg-primary/10 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <DollarSign className="w-4 h-4 text-primary" />
                {t("shifts.modal.estimated")}
              </div>
              <p className="font-bold text-primary">${estimatedEarnings}</p>
            </div>
          </div>

          {/* Location */}
          {shift.location_address && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">{t("shifts.location")}</p>
                <p className="text-sm text-muted-foreground">{shift.location_address}</p>
              </div>
            </div>
          )}

          {/* Description */}
          {shift.description && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-foreground mb-2">{t("shifts.description")}</p>
                <p className="text-sm text-muted-foreground">{shift.description}</p>
              </div>
            </>
          )}

          {/* Required Certifications */}
          {shift.required_certifications && shift.required_certifications.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t("shifts.fields.requiredCertifications")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {shift.required_certifications.map((cert, i) => (
                    <Badge key={i} variant="secondary">{cert}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Clinic Info */}
          <Separator />
          <Link 
            to={`/clinic/${shift.clinic.id}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                {shift.clinic.name}
              </p>
              {shift.clinic.address && (
                <p className="text-sm text-muted-foreground">{shift.clinic.address}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {shift.clinic.rating_avg && (
                <Badge variant="secondary" className="text-sm">
                  ★ {shift.clinic.rating_avg.toFixed(1)}
                </Badge>
              )}
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>

          {/* Verification Warning */}
          {!isVerified && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">{t("shifts.modal.verificationRequired")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("shifts.modal.verificationRequiredDesc")}
                </p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              {t("common.close")}
            </Button>
            <Button
              className="flex-1"
              disabled={!isVerified || isApplying || hasApplied}
              onClick={handleApply}
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  {t("shifts.modal.applying")}
                </>
              ) : hasApplied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 me-2" />
                  {t("shifts.applied")}
                </>
              ) : (
                t("shifts.modal.applyForShift")
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftDetailModal;