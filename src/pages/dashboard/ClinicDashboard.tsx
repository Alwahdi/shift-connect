import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Heart, 
  Bell, 
  User, 
  Calendar, 
  Clock, 
  DollarSign,
  Star,
  Plus,
  Users,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Building2
} from "lucide-react";
import { Link } from "react-router-dom";

const activeShifts = [
  {
    id: "s1",
    role: "Registered Nurse",
    date: "Jan 15, 2026",
    time: "7:00 AM - 7:00 PM",
    rate: "$55/hr",
    status: "matching",
    applicants: 4,
  },
  {
    id: "s2",
    role: "Licensed Vocational Nurse",
    date: "Jan 16, 2026",
    time: "3:00 PM - 11:00 PM",
    rate: "$42/hr",
    status: "confirmed",
    professional: "Maria G.",
  },
  {
    id: "s3",
    role: "Certified Nursing Assistant",
    date: "Jan 17, 2026",
    time: "7:00 AM - 3:00 PM",
    rate: "$28/hr",
    status: "pending",
    applicants: 2,
  },
];

const recentActivity = [
  {
    id: "a1",
    type: "booking_confirmed",
    message: "Maria G. confirmed for LVN shift on Jan 16",
    time: "2 hours ago",
  },
  {
    id: "a2",
    type: "new_applicant",
    message: "New application for RN shift on Jan 15",
    time: "4 hours ago",
  },
  {
    id: "a3",
    type: "shift_completed",
    message: "CNA shift completed - Rating submitted",
    time: "1 day ago",
  },
];

const ClinicDashboard = () => {
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
              <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary">
                <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-accent-foreground" />
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
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Bay Area Medical Center</h1>
            <p className="text-muted-foreground">Manage your shifts and staff needs.</p>
          </div>
          <Button variant="accent" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Post New Shift
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Active Shifts", value: "8", icon: Calendar },
            { label: "This Month Spend", value: "$12,450", icon: DollarSign },
            { label: "Staff Rating", value: "4.8★", icon: Star },
            { label: "Fill Rate", value: "94%", icon: Users },
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Shifts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Active Shifts</h2>
              <Link to="/dashboard/shifts" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {activeShifts.map((shift, index) => (
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
                        <h3 className="font-medium text-foreground">{shift.role}</h3>
                        {shift.status === "matching" && (
                          <Badge className="bg-warning/10 text-warning border-warning/20">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Matching
                          </Badge>
                        )}
                        {shift.status === "confirmed" && (
                          <Badge className="bg-success/10 text-success border-success/20">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Confirmed
                          </Badge>
                        )}
                        {shift.status === "pending" && (
                          <Badge variant="secondary">Pending Review</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {shift.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {shift.time}
                        </span>
                        <span className="font-medium text-foreground">{shift.rate}</span>
                      </div>
                      {shift.professional && (
                        <p className="text-sm text-success mt-2">
                          Assigned to: {shift.professional}
                        </p>
                      )}
                      {shift.applicants && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {shift.applicants} applicants waiting for review
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 shadow-card">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.type === "booking_confirmed" 
                        ? "bg-success/10" 
                        : activity.type === "new_applicant"
                        ? "bg-primary/10"
                        : "bg-secondary"
                    }`}>
                      {activity.type === "booking_confirmed" && (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      )}
                      {activity.type === "new_applicant" && (
                        <User className="w-4 h-4 text-primary" />
                      )}
                      {activity.type === "shift_completed" && (
                        <Star className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ClinicDashboard;
