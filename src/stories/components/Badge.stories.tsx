import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, AlertCircle, Zap, Star } from "lucide-react";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: "Badge",
    variant: "default",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

export const StatusBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Verification Status</p>
      <div className="flex flex-wrap gap-3">
        <Badge className="bg-success text-success-foreground">
          <CheckCircle2 className="w-3 h-3 me-1" />
          Verified
        </Badge>
        <Badge className="bg-warning text-warning-foreground">
          <Clock className="w-3 h-3 me-1" />
          Pending
        </Badge>
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 me-1" />
          Rejected
        </Badge>
      </div>
    </div>
  ),
};

export const BookingStatus: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Booking Status</p>
      <div className="flex flex-wrap gap-3">
        <Badge variant="secondary">Requested</Badge>
        <Badge className="bg-sky text-sky-foreground">Accepted</Badge>
        <Badge className="bg-primary text-primary-foreground">Confirmed</Badge>
        <Badge className="bg-accent text-accent-foreground">Checked In</Badge>
        <Badge className="bg-success text-success-foreground">Completed</Badge>
        <Badge variant="destructive">Cancelled</Badge>
      </div>
    </div>
  ),
};

export const RoleBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Professional Roles</p>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Registered Nurse</Badge>
        <Badge variant="outline">LPN/LVN</Badge>
        <Badge variant="outline">CNA</Badge>
        <Badge variant="outline">Medical Assistant</Badge>
        <Badge variant="outline">Dental Hygienist</Badge>
        <Badge variant="outline">Physical Therapist</Badge>
      </div>
    </div>
  ),
};

export const UrgencyIndicators: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Shift Urgency</p>
      <div className="flex flex-wrap gap-3">
        <Badge className="bg-destructive text-destructive-foreground">
          <Zap className="w-3 h-3 me-1" />
          Urgent
        </Badge>
        <Badge className="bg-warning text-warning-foreground">
          <AlertCircle className="w-3 h-3 me-1" />
          High Priority
        </Badge>
        <Badge variant="secondary">Normal</Badge>
      </div>
    </div>
  ),
};

export const RatingBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Rating Badges</p>
      <div className="flex flex-wrap gap-3">
        <Badge className="bg-primary/10 text-primary border-primary/20">
          <Star className="w-3 h-3 me-1 fill-primary" />
          4.9
        </Badge>
        <Badge className="bg-warning/10 text-warning border-warning/20">
          <Star className="w-3 h-3 me-1 fill-warning" />
          Top Rated
        </Badge>
        <Badge className="bg-accent/10 text-accent border-accent/20">
          <Star className="w-3 h-3 me-1 fill-accent" />
          New
        </Badge>
      </div>
    </div>
  ),
};

export const CountBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Notification Counts</p>
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">📬</span>
          </div>
          <Badge className="absolute -top-2 -end-2 h-5 min-w-5 flex items-center justify-center p-0 text-xs bg-destructive">
            3
          </Badge>
        </div>
        <div className="relative">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">🔔</span>
          </div>
          <Badge className="absolute -top-2 -end-2 h-5 min-w-5 flex items-center justify-center p-0 text-xs bg-primary">
            12
          </Badge>
        </div>
        <div className="relative">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">💬</span>
          </div>
          <Badge className="absolute -top-2 -end-2 h-5 min-w-5 flex items-center justify-center p-0 text-xs bg-accent">
            99+
          </Badge>
        </div>
      </div>
    </div>
  ),
};
