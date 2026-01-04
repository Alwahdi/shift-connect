import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Heart, 
  Bell, 
  Calendar, 
  Clock, 
  DollarSign,
  Star,
  Plus,
  Users,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Building2,
  LogOut,
  Loader2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Shift {
  id: string;
  title: string;
  role_required: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  hourly_rate: number;
  is_filled: boolean;
  is_urgent: boolean;
}

interface Clinic {
  id: string;
  name: string;
  rating_avg: number;
  verification_status: string;
}

const ClinicDashboard = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, userRole, signOut, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && (!user || userRole !== "clinic")) {
      navigate("/auth");
    }
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch clinic
        const { data: clinicData } = await supabase
          .from("clinics")
          .select("id, name, rating_avg, verification_status")
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
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
                <Heart className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">SyndeoCare</span>
            </Link>

            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg hover:bg-secondary">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              </button>
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center">
                <Building2 className="w-4 h-4 text-accent-foreground" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">{clinic?.name || "Your Clinic"}</h1>
            <p className="text-muted-foreground">Manage your shifts and staff needs.</p>
          </div>
          <Button variant="accent" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Post New Shift
          </Button>
        </motion.div>

        {/* Verification Banner */}
        {clinic?.verification_status === "pending" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 p-4 rounded-xl bg-warning/10 border border-warning/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Complete Your Verification</h3>
                <p className="text-sm text-muted-foreground">Verify your clinic to start posting shifts.</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                Upload Documents
              </Button>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Active Shifts", value: shifts.filter(s => !s.is_filled).length.toString(), icon: Calendar },
            { label: "This Month Spend", value: "$0", icon: DollarSign },
            { label: "Staff Rating", value: clinic?.rating_avg ? `${clinic.rating_avg}★` : "N/A", icon: Star },
            { label: "Fill Rate", value: "0%", icon: Users },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Active Shifts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Your Shifts</h2>
          </div>

          {shifts.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">No shifts posted yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Post your first shift to start finding verified professionals.
              </p>
              <Button variant="accent">
                <Plus className="w-4 h-4 mr-2" />
                Post Your First Shift
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {shifts.map((shift, index) => (
                <motion.div
                  key={shift.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-card rounded-xl border border-border p-4 shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-foreground">{shift.role_required}</h3>
                        {shift.is_filled ? (
                          <Badge className="bg-success/10 text-success border-success/20">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Filled
                          </Badge>
                        ) : shift.is_urgent ? (
                          <Badge variant="destructive">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Urgent
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Open</Badge>
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
    </div>
  );
};

export default ClinicDashboard;
