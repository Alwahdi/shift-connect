import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, DollarSign } from "lucide-react";

const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Tabs component for organizing content into switchable panels. Built on Radix UI with keyboard navigation support.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="upcoming" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
        <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming" className="mt-4">
        <p className="text-sm text-muted-foreground">Your upcoming shifts will appear here.</p>
      </TabsContent>
      <TabsContent value="completed" className="mt-4">
        <p className="text-sm text-muted-foreground">Your completed shifts will appear here.</p>
      </TabsContent>
      <TabsContent value="cancelled" className="mt-4">
        <p className="text-sm text-muted-foreground">Your cancelled shifts will appear here.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const DashboardTabs: Story = {
  name: "Dashboard Tabs",
  render: () => (
    <Tabs defaultValue="shifts" className="w-full max-w-2xl">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="shifts">My Shifts</TabsTrigger>
        <TabsTrigger value="applications">Applications</TabsTrigger>
        <TabsTrigger value="earnings">Earnings</TabsTrigger>
      </TabsList>
      <TabsContent value="shifts" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Shifts</CardTitle>
            <CardDescription>You have 3 shifts scheduled this week.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Bright Smiles Dental</p>
                  <p className="text-sm text-muted-foreground">Jan 25, 9:00 AM - 5:00 PM</p>
                </div>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="applications" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Pending Applications</CardTitle>
            <CardDescription>2 applications awaiting response.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Your pending applications will appear here.</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="earnings" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Earnings Summary</CardTitle>
            <CardDescription>Your earnings for this month.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">$2,450.00</div>
            <p className="text-sm text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const ProfileTabs: Story = {
  name: "Profile Tabs",
  render: () => (
    <Tabs defaultValue="overview" className="w-full max-w-xl">
      <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
        <TabsTrigger 
          value="overview" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger 
          value="experience" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Experience
        </TabsTrigger>
        <TabsTrigger 
          value="documents" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Documents
        </TabsTrigger>
        <TabsTrigger 
          value="reviews" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Reviews
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-sm text-muted-foreground">
              Experienced dental hygienist with 5+ years in preventive care. 
              Passionate about patient education and maintaining the highest standards of care.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">Periodontal Care</span>
              <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">Pediatric Dentistry</span>
              <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">X-Ray Certified</span>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="experience" className="mt-6">
        <p className="text-sm text-muted-foreground">Work experience and certifications...</p>
      </TabsContent>
      <TabsContent value="documents" className="mt-6">
        <p className="text-sm text-muted-foreground">Uploaded documents and licenses...</p>
      </TabsContent>
      <TabsContent value="reviews" className="mt-6">
        <p className="text-sm text-muted-foreground">Reviews from clinics...</p>
      </TabsContent>
    </Tabs>
  ),
};

export const ShiftDetailTabs: Story = {
  name: "Shift Detail Tabs",
  render: () => (
    <Tabs defaultValue="details" className="w-full max-w-lg">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="details">Shift Details</TabsTrigger>
        <TabsTrigger value="clinic">About Clinic</TabsTrigger>
      </TabsList>
      <TabsContent value="details" className="mt-4 space-y-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">January 25, 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Time</p>
            <p className="font-medium">9:00 AM - 5:00 PM (8 hours)</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Pay Rate</p>
            <p className="font-medium">$45/hour ($360 total)</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Location</p>
            <p className="font-medium">123 Main St, San Francisco, CA</p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="clinic" className="mt-4">
        <div className="space-y-3">
          <h4 className="font-semibold">Bright Smiles Dental</h4>
          <p className="text-sm text-muted-foreground">
            Family-friendly dental practice serving the Bay Area for over 15 years. 
            Modern equipment and a welcoming atmosphere.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-yellow-500">★★★★★</span>
            <span className="text-sm text-muted-foreground">4.9 (128 reviews)</span>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  ),
};
