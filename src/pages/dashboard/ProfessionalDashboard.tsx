import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  DollarSign,
  Star,
  Filter,
  Search,
  ChevronRight,
  Building2,
  Loader2,
  MapPin,
  FileText,
  Upload
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsGrid from "@/components/dashboard/StatsGrid";
import OnboardingBanner from "@/components/dashboard/OnboardingBanner";

interface Shift {
  id: string;
  title: string;
  role_required: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  hourly_rate: number;
  location_address: string;
  is_urgent: boolean;
  clinic: {
    name: string;
  };
}

interface Profile {
  id: string;
  full_name: string;
  rating_avg: number;
  verification_status: string;
  onboarding_completed: boolean;
}

interface Document {
  id: string;
  status: string;
}

const ProfessionalDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, userRole, signOut, isLoading: authLoading, isOnboardingComplete } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      if (!user || userRole !== "professional") {
        navigate("/auth");
        return;
      }
      if (!isOnboardingComplete) {
        navigate("/onboarding/professional");
        return;
      }
    }
  }, [user, userRole, authLoading, isOnboardingComplete, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name, rating_avg, verification_status, onboarding_completed")
          .eq("user_id", user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }

        // Fetch user documents
        const { data: docsData } = await supabase
          .from("documents")
          .select("id, status")
          .eq("user_id", user.id);

        if (docsData) {
          setDocuments(docsData);
        }

        // Fetch available shifts
        const { data: shiftsData } = await supabase
          .from("shifts")
          .select(`
            id,
            title,
            role_required,
            shift_date,
            start_time,
            end_time,
            hourly_rate,
            location_address,
            is_urgent,
            clinic:clinics(name)
          `)
          .eq("is_filled", false)
          .gte("shift_date", new Date().toISOString().split("T")[0])
          .order("shift_date", { ascending: true })
          .limit(10);

        if (shiftsData) {
          setShifts(shiftsData as unknown as Shift[]);
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingDocs = documents.filter(d => d.status === "pending").length;
  const totalDocs = documents.length;

  const stats = [
    { label: "This Month", value: "$0", icon: DollarSign },
    { label: "Shifts Completed", value: "0", icon: Calendar },
    { label: "Avg Rating", value: profile?.rating_avg ? `${profile.rating_avg}★` : "N/A", icon: Star },
    { label: "Documents", value: `${totalDocs}`, icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader type="professional" onSignOut={handleSignOut} />

      <main className="container mx-auto px-4 py-6">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Welcome back, {profile?.full_name?.split(" ")[0] || "Professional"}!
          </h1>
          <p className="text-muted-foreground">Find your next shift or check your upcoming bookings.</p>
        </motion.div>

        {/* Onboarding/Verification Banner */}
        <OnboardingBanner
          type="professional"
          onboardingComplete={profile?.onboarding_completed || false}
          verificationStatus={profile?.verification_status || "pending"}
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
                <h3 className="font-semibold text-foreground mb-1">Get Verified to Apply for Shifts</h3>
                <p className="text-sm text-muted-foreground">Upload your credentials to start receiving shift opportunities.</p>
              </div>
              <Button asChild>
                <Link to="/onboarding/professional">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Documents
                </Link>
              </Button>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <StatsGrid stats={stats} variant="primary" />

        {/* Available Shifts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Available Shifts</h2>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search shifts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Shift Cards */}
          {shifts.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center shadow-card">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">No shifts available</h3>
              <p className="text-sm text-muted-foreground">
                {profile?.verification_status !== "verified" 
                  ? "Complete your verification to see available shifts."
                  : "Check back soon for new opportunities in your area."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {shifts.filter(shift => 
                shift.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                shift.role_required?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                shift.clinic?.name?.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((shift, index) => (
                <motion.div
                  key={shift.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="bg-card rounded-xl border border-border p-4 shadow-card hover:shadow-card-hover hover:border-primary/20 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground truncate">{shift.clinic?.name || "Clinic"}</h3>
                          {shift.is_urgent && (
                            <Badge variant="destructive" className="text-xs">Urgent</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{shift.role_required}</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(shift.shift_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {shift.start_time} - {shift.end_time}
                          </span>
                          {shift.location_address && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {shift.location_address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-primary">${shift.hourly_rate}/hr</p>
                      <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default ProfessionalDashboard;
