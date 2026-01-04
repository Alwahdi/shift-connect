import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  DollarSign,
  Star,
  Plus,
  Users,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Loader2,
  FileText,
  Upload,
  Building2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsGrid from "@/components/dashboard/StatsGrid";
import OnboardingBanner from "@/components/dashboard/OnboardingBanner";
import CreateShiftModal from "@/components/clinic/CreateShiftModal";
import ShiftManageModal from "@/components/clinic/ShiftManageModal";

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

interface Clinic {
  id: string;
  name: string;
  rating_avg: number;
  verification_status: string;
  onboarding_completed: boolean;
  logo_url: string | null;
}

interface Document {
  id: string;
  status: string;
}

const ClinicDashboard = () => {
  const { t } = useTranslation();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateShift, setShowCreateShift] = useState(false);
  const [showManageShift, setShowManageShift] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [monthlySpend, setMonthlySpend] = useState(0);
  const { user, userRole, signOut, isLoading: authLoading, isOnboardingComplete } = useAuth();
  const navigate = useNavigate();

  const fetchShifts = async () => {
    if (!clinic?.id) return;
    const { data: shiftsData } = await supabase
      .from("shifts")
      .select("*")
      .eq("clinic_id", clinic.id)
      .order("shift_date", { ascending: true })
      .limit(10);

    if (shiftsData) {
      setShifts(shiftsData);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || userRole !== "clinic") {
        navigate("/auth");
        return;
      }
      if (!isOnboardingComplete) {
        navigate("/onboarding/clinic");
        return;
      }
    }
  }, [user, userRole, authLoading, isOnboardingComplete, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch clinic
        const { data: clinicData } = await supabase
          .from("clinics")
          .select("id, name, rating_avg, verification_status, onboarding_completed, logo_url")
          .eq("user_id", user.id)
          .single();

        if (clinicData) {
          setClinic(clinicData);

          // Fetch shifts for this clinic
          const { data: shiftsData } = await supabase
            .from("shifts")
            .select("*")
            .eq("clinic_id", clinicData.id)
            .order("shift_date", { ascending: true })
            .limit(10);

          if (shiftsData) {
            setShifts(shiftsData);
          }

          // Fetch completed bookings for this clinic this month to calculate spend
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);

          const { data: bookingsData } = await supabase
            .from("bookings")
            .select(`
              id,
              status,
              shift:shifts(hourly_rate, start_time, end_time)
            `)
            .eq("clinic_id", clinicData.id)
            .in("status", ["completed", "checked_out"])
            .gte("created_at", startOfMonth.toISOString());

          if (bookingsData) {
            let totalSpend = 0;
            bookingsData.forEach((booking: any) => {
              if (booking.shift) {
                const [startH, startM] = booking.shift.start_time.split(":").map(Number);
                const [endH, endM] = booking.shift.end_time.split(":").map(Number);
                const hours = (endH * 60 + endM - startH * 60 - startM) / 60;
                totalSpend += (hours > 0 ? hours : 24 + hours) * booking.shift.hourly_rate;
              }
            });
            setMonthlySpend(totalSpend);
          }
        }

        // Fetch clinic documents
        const { data: docsData } = await supabase
          .from("documents")
          .select("id, status")
          .eq("user_id", user.id);

        if (docsData) {
          setDocuments(docsData);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user && isOnboardingComplete) {
      fetchData();
    }
  }, [user, isOnboardingComplete]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const pendingDocs = documents.filter(d => d.status === "pending").length;
  const totalDocs = documents.length;
  const activeShifts = shifts.filter(s => !s.is_filled).length;

  const stats = [
    { label: t("dashboard.activeShifts"), value: activeShifts.toString(), icon: Calendar },
    { label: t("dashboard.stats.totalSpend"), value: `$${monthlySpend.toFixed(0)}`, icon: DollarSign },
    { label: t("dashboard.stats.avgRating"), value: clinic?.rating_avg ? `${clinic.rating_avg.toFixed(1)}★` : "N/A", icon: Star },
    { label: t("dashboard.stats.fillRate"), value: shifts.length > 0 ? `${Math.round((shifts.filter(s => s.is_filled).length / shifts.length) * 100)}%` : "0%", icon: Users },
  ];

  const canPostShifts = clinic?.verification_status === "verified" || totalDocs > 0;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader type="clinic" onSignOut={handleSignOut} avatarUrl={clinic?.logo_url} name={clinic?.name} />

      <main className="container mx-auto px-4 py-6">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6 flex-wrap gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">{clinic?.name || t("nav.forClinics")}</h1>
            <p className="text-muted-foreground">{t("dashboard.noShiftsDesc")}</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link to="/profile/clinic">
                <Building2 className="w-4 h-4 me-2" />
                {t("profile.clinicInfo")}
              </Link>
            </Button>
            <Button 
              variant="default" 
              size="lg"
              disabled={!canPostShifts}
              onClick={() => setShowCreateShift(true)}
              className="bg-accent hover:bg-accent/90"
            >
              <Plus className="w-5 h-5 me-2" />
              {t("shifts.create")}
            </Button>
          </div>
        </motion.div>

        {/* Onboarding/Verification Banner */}
        <OnboardingBanner
          type="clinic"
          onboardingComplete={clinic?.onboarding_completed || false}
          verificationStatus={clinic?.verification_status || "pending"}
          pendingDocuments={pendingDocs}
          totalDocuments={totalDocs}
        />

        {/* Quick Actions */}
        {totalDocs === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 p-6 rounded-xl bg-card border border-border shadow-card"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-semibold text-foreground mb-1">{t("dashboard.needsVerification")}</h3>
                <p className="text-sm text-muted-foreground">{t("onboarding.incompleteDesc")}</p>
              </div>
              <Button asChild className="bg-accent hover:bg-accent/90">
                <Link to="/profile/clinic?tab=documents">
                  <Upload className="w-4 h-4 me-2" />
                  {t("profile.uploadDocument")}
                </Link>
              </Button>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <StatsGrid stats={stats} variant="accent" />

        {/* Active Shifts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">{t("dashboard.myShifts")}</h2>
          </div>

          {shifts.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center shadow-card">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">{t("dashboard.noShifts")}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {canPostShifts 
                  ? t("dashboard.noShiftsDesc")
                  : t("dashboard.needsVerification")}
              </p>
              {canPostShifts ? (
                <Button className="bg-accent hover:bg-accent/90" onClick={() => setShowCreateShift(true)}>
                  <Plus className="w-4 h-4 me-2" />
                  {t("shifts.create")}
                </Button>
              ) : (
                <Button asChild className="bg-accent hover:bg-accent/90">
                  <Link to="/profile/clinic?tab=documents">
                    <FileText className="w-4 h-4 me-2" />
                    {t("dashboard.completeOnboarding")}
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {shifts.map((shift, index) => (
                <motion.div
                  key={shift.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="bg-card rounded-xl border border-border p-4 shadow-card hover:shadow-card-hover transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedShift(shift);
                    setShowManageShift(true);
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-foreground">{shift.role_required}</h3>
                        {shift.is_filled ? (
                          <Badge className="bg-success/10 text-success border-success/20">
                            <CheckCircle2 className="w-3 h-3 me-1" />
                            {t("shifts.filled")}
                          </Badge>
                        ) : shift.is_urgent ? (
                          <Badge variant="destructive">
                            <AlertCircle className="w-3 h-3 me-1" />
                            {t("common.urgent")}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">{t("shifts.apply")}</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(shift.shift_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {shift.start_time} - {shift.end_time}
                        </span>
                        <span className="font-medium text-foreground">${shift.hourly_rate}/hr</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Create Shift Modal */}
      {clinic && (
        <CreateShiftModal
          open={showCreateShift}
          onOpenChange={setShowCreateShift}
          clinicId={clinic.id}
          onSuccess={fetchShifts}
        />
      )}

      {/* Manage Shift Modal */}
      <ShiftManageModal
        open={showManageShift}
        onOpenChange={setShowManageShift}
        shift={selectedShift}
        onUpdate={fetchShifts}
      />
    </div>
  );
};

export default ClinicDashboard;
