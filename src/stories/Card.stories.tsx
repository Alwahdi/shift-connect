import type { Meta, StoryObj } from "@storybook/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, DollarSign } from "lucide-react";

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content with some text explaining what this card is about.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const ShiftCard: Story = {
  render: () => (
    <Card className="w-[350px] hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Dental Hygienist</CardTitle>
            <CardDescription>SyndeoCare Clinic</CardDescription>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Urgent
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Tomorrow, 9:00 AM - 5:00 PM</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>Downtown Medical Center</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <DollarSign className="h-4 w-4" />
          <span>$45/hour</span>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button className="flex-1" variant="hero">Apply Now</Button>
        <Button variant="outline">Details</Button>
      </CardFooter>
    </Card>
  ),
};

export const ProfileCard: Story = {
  render: () => (
    <Card className="w-[300px] text-center">
      <CardHeader>
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
          JD
        </div>
        <CardTitle className="mt-4">John Doe</CardTitle>
        <CardDescription>Dental Hygienist</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center gap-4 text-sm">
          <div>
            <p className="font-bold text-primary">4.9</p>
            <p className="text-muted-foreground">Rating</p>
          </div>
          <div>
            <p className="font-bold text-primary">156</p>
            <p className="text-muted-foreground">Shifts</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="accent">View Profile</Button>
      </CardFooter>
    </Card>
  ),
};

export const FeatureCard: Story = {
  render: () => (
    <Card className="w-[300px] border-none bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
          <Calendar className="h-6 w-6" />
        </div>
        <CardTitle className="mt-4">Flexible Scheduling</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">
          Choose shifts that fit your schedule. Work when you want, where you want.
        </CardDescription>
      </CardContent>
    </Card>
  ),
};

export const GlassCard: Story = {
  render: () => (
    <div className="p-8 bg-gradient-to-br from-primary to-secondary rounded-xl">
      <Card className="w-[300px] bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle>Glass Morphism</CardTitle>
          <CardDescription className="text-white/70">
            A modern glass effect card
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-white/90">
            This card demonstrates the glass morphism effect with a gradient background.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
            Learn More
          </Button>
        </CardFooter>
      </Card>
    </div>
  ),
};
