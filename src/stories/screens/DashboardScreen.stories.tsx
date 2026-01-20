import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, Clock, DollarSign, MapPin, TrendingUp, Users, 
  Briefcase, Star, Bell, ChevronRight, Plus
} from "lucide-react";

const meta: Meta = {
  title: "Screens/Dashboard",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Dashboard screens for professionals and clinics showing stats, shifts, and quick actions.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const ProfessionalDashboardComponent = () => {
  const stats = [
    { label: "Completed Shifts", value: "24", icon: Briefcase, trend: "+12%" },
    { label: "Total Earnings", value: "$3,240", icon: DollarSign, trend: "+8%" },
    { label: "Avg Rating", value: "4.9", icon: Star, trend: "+0.2" },
    { label: "Hours Worked", value: "186h", icon: Clock, trend: "+15%" },
  ];

  const upcomingShifts = [
    { 
      clinic: "Downtown Medical Center", 
      date: "Today", 
      time: "09:00 - 17:00",
      role: "Dental Hygienist",
      rate: "$45/hr",
      status: "confirmed"
    },
    { 
      clinic: "City Health Clinic", 
      date: "Tomorrow", 
      time: "08:00 - 14:00",
      role: "Dental Assistant",
      rate: "$38/hr",
      status: "pending"
    },
    { 
      clinic: "Family Dental Care", 
      date: "Jan 22", 
      time: "10:00 - 18:00",
      role: "Dental Hygienist",
      rate: "$48/hr",
      status: "confirmed"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-semibold">SyndeoCare</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Welcome back, Sarah!</h1>
          <p className="text-muted-foreground">Here's what's happening with your shifts today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-5 h-5 text-muted-foreground" />
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="w-3 h-3 me-1" />
                    {stat.trend}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming Shifts */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">Upcoming Shifts</CardTitle>
                  <CardDescription>Your scheduled shifts for this week</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 me-2" />
                  View Calendar
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingShifts.map((shift, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{shift.clinic}</h4>
                        <Badge variant={shift.status === "confirmed" ? "default" : "secondary"}>
                          {shift.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {shift.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {shift.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          {shift.rate}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Profile */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="default" className="w-full justify-start">
                  <MapPin className="w-4 h-4 me-2" />
                  Find Nearby Shifts
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 me-2" />
                  Update Availability
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 me-2" />
                  View Profile
                </Button>
              </CardContent>
            </Card>

            {/* Profile Completion */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Profile Completion</CardTitle>
                <CardDescription>Complete your profile to get more shifts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Add your certifications to complete your profile
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

const ClinicDashboardComponent = () => {
  const stats = [
    { label: "Active Shifts", value: "8", icon: Briefcase },
    { label: "Applicants", value: "24", icon: Users },
    { label: "This Month", value: "$12,450", icon: DollarSign },
    { label: "Avg Rating", value: "4.8", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-semibold">SyndeoCare</span>
            <Badge variant="secondary">Clinic</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button>
              <Plus className="w-4 h-4 me-2" />
              Post Shift
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>DC</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Downtown Medical Center</h1>
          <p className="text-muted-foreground">Manage your shifts and find qualified professionals.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active Shifts */}
        <Card>
          <CardHeader>
            <CardTitle>Active Shifts</CardTitle>
            <CardDescription>Shifts that need professionals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>View and manage your active shifts here</p>
              <Button className="mt-4">
                <Plus className="w-4 h-4 me-2" />
                Create First Shift
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export const ProfessionalDashboard: Story = {
  render: () => <ProfessionalDashboardComponent />,
  parameters: {
    docs: {
      description: {
        story: "Dashboard for healthcare professionals showing their shifts, earnings, and quick actions.",
      },
    },
  },
};

export const ClinicDashboard: Story = {
  render: () => <ClinicDashboardComponent />,
  parameters: {
    docs: {
      description: {
        story: "Dashboard for clinics to manage shifts and view applicants.",
      },
    },
  },
};
