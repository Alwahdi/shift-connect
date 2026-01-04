import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Heart, 
  Bell, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign,
  Star,
  Filter,
  Search,
  ChevronRight,
  CheckCircle2,
  Building2,
  LogOut,
  Loader2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
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
}

const ProfessionalDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, userRole, signOut, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && (!user || userRole !== "professional")) {
      navigate("/auth");
    }
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name, rating_avg, verification_status")
          .eq("user_id", user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
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

    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary-foreground" />
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
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
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
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Welcome back, {profile?.full_name?.split(" ")[0] || "Professional"}!
          </h1>
          <p className="text-muted-foreground">Find your next shift or check your upcoming bookings.</p>
        </motion.div>

        {/* Verification Banner */}
        {profile?.verification_status === "pending" && (
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
                <p className="text-sm text-muted-foreground">Upload your documents to start receiving shift invites.</p>
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
            { label: "This Month", value: "$0", icon: DollarSign },
            { label: "Shifts Completed", value: "0", icon: Calendar },
            { label: "Avg Rating", value: profile?.rating_avg ? `${profile.rating_avg}★` : "N/A", icon: Star },
            { label: "Profile Views", value: "0", icon: User },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

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
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">No shifts available</h3>
              <p className="text-sm text-muted-foreground">
                Check back soon for new opportunities in your area.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {shifts.map((shift, index) => (
                <motion.div
                  key={shift.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
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
