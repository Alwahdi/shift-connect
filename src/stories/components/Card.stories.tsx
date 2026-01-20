import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, DollarSign, MapPin, Building2, Star, Heart } from "lucide-react";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">This is the card content area where you can add any content.</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Card className="w-[350px]" interactive>
      <CardHeader>
        <CardTitle>Clickable Card</CardTitle>
        <CardDescription>Hover to see the effect</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Interactive cards have hover states for better UX.</p>
      </CardContent>
    </Card>
  ),
};

export const ShiftCard: Story = {
  render: () => (
    <Card className="w-[400px]" interactive>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">Registered Nurse</h3>
              <Badge variant="default" className="text-xs">Urgent</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">City Medical Center</p>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Jan 25, 2026
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                8:00 AM - 4:00 PM
              </span>
              <span className="flex items-center gap-1 text-primary font-medium">
                <DollarSign className="w-3.5 h-3.5" />
                $45/hr
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
};

export const ProfileCard: Story = {
  render: () => (
    <Card className="w-[320px]">
      <CardContent className="p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-brand mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">JD</span>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-1">Jane Doe</h3>
        <p className="text-muted-foreground mb-3">Registered Nurse</p>
        <div className="flex items-center justify-center gap-1 mb-4">
          <Star className="w-4 h-4 text-warning fill-warning" />
          <span className="font-medium">4.9</span>
          <span className="text-muted-foreground">(127 reviews)</span>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1">View Profile</Button>
          <Button variant="outline" size="icon">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  ),
};

export const FeatureCard: Story = {
  render: () => (
    <Card className="w-[300px] overflow-hidden group" interactive>
      <div className="h-2 gradient-brand" />
      <CardContent className="p-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
          <Calendar className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Smart Scheduling</h3>
        <p className="text-muted-foreground text-sm">
          AI-powered scheduling that matches your availability with the best opportunities.
        </p>
      </CardContent>
    </Card>
  ),
};

export const GlassCard: Story = {
  render: () => (
    <div className="gradient-hero p-8 rounded-xl">
      <Card className="w-[350px] glass border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Glass Effect</CardTitle>
          <CardDescription className="text-white/70">Beautiful blur effect for dark backgrounds</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-white/80">
            Use glass cards on gradient or image backgrounds for a modern look.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Learn More
          </Button>
        </CardFooter>
      </Card>
    </div>
  ),
};

export const StatsCard: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 max-w-md">
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">$4,250</p>
          <p className="text-sm text-muted-foreground">Monthly Earnings</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-accent/10 mx-auto mb-3 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-accent" />
          </div>
          <p className="text-2xl font-bold text-foreground">24</p>
          <p className="text-sm text-muted-foreground">Shifts Completed</p>
        </CardContent>
      </Card>
    </div>
  ),
};
