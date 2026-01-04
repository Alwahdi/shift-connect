import { useState } from "react";
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
  Building2
} from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";

const shifts = [
  {
    id: "1",
    clinic: "Bay Area Medical Center",
    role: "Registered Nurse",
    date: "Jan 15, 2026",
    time: "7:00 AM - 7:00 PM",
    rate: "$55/hr",
    distance: "3.2 mi",
    urgent: true,
    verified: true,
  },
  {
    id: "2",
    clinic: "Pacific Heights Clinic",
    role: "Licensed Vocational Nurse",
    date: "Jan 16, 2026",
    time: "3:00 PM - 11:00 PM",
    rate: "$42/hr",
    distance: "5.8 mi",
    urgent: false,
    verified: true,
  },
  {
    id: "3",
    clinic: "Golden Gate Senior Care",
    role: "Certified Nursing Assistant",
    date: "Jan 17, 2026",
    time: "7:00 AM - 3:00 PM",
    rate: "$28/hr",
    distance: "2.1 mi",
    urgent: false,
    verified: true,
  },
  {
    id: "4",
    clinic: "Mission District Health",
    role: "Registered Nurse",
    date: "Jan 18, 2026",
    time: "11:00 PM - 7:00 AM",
    rate: "$65/hr",
    distance: "4.5 mi",
    urgent: true,
    verified: true,
  },
];

const upcomingBookings = [
  {
    id: "b1",
    clinic: "Sunset Medical Group",
    role: "Registered Nurse",
    date: "Today",
    time: "7:00 AM - 7:00 PM",
    status: "confirmed",
  },
  {
    id: "b2",
    clinic: "Marina Health Center",
    role: "Registered Nurse",
    date: "Tomorrow",
    time: "7:00 AM - 3:00 PM",
    status: "confirmed",
  },
];

const ProfessionalDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

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
              <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              </button>
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
          <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back, Sarah!</h1>
          <p className="text-muted-foreground">Find your next shift or check your upcoming bookings.</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "This Month", value: "$4,280", icon: DollarSign },
            { label: "Shifts Completed", value: "12", icon: Calendar },
            { label: "Avg Rating", value: "4.9★", icon: Star },
            { label: "Profile Views", value: "28", icon: User },
          ].map((stat, i) => (
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

        {/* Upcoming Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Bookings</h2>
            <Link to="/dashboard/bookings" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-card rounded-xl border border-border p-4 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{booking.clinic}</h3>
                      <p className="text-sm text-muted-foreground">{booking.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{booking.date}</p>
                    <p className="text-sm text-muted-foreground">{booking.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                        <h3 className="font-medium text-foreground truncate">{shift.clinic}</h3>
                        {shift.urgent && (
                          <Badge variant="destructive" className="text-xs">Urgent</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{shift.role}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {shift.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {shift.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {shift.distance}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-primary">{shift.rate}</p>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ProfessionalDashboard;
