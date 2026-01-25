import type { Meta, StoryObj } from "@storybook/react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Filter, Menu, X } from "lucide-react";

const meta: Meta<typeof Sheet> = {
  title: "Components/Sheet",
  component: Sheet,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Sheet component for displaying content in a slide-out panel from any edge of the screen. Useful for mobile navigation, filters, and detailed views.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue="Dr. Sarah Johnson" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="specialty">Specialty</Label>
            <Input id="specialty" defaultValue="Dental Hygienist" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button variant="hero">Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const LeftSide: Story = {
  name: "Left Side",
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 space-y-2">
          <a href="#" className="block py-2 px-3 rounded-lg hover:bg-muted">Dashboard</a>
          <a href="#" className="block py-2 px-3 rounded-lg hover:bg-muted">My Shifts</a>
          <a href="#" className="block py-2 px-3 rounded-lg hover:bg-muted">Find Shifts</a>
          <a href="#" className="block py-2 px-3 rounded-lg hover:bg-muted">Messages</a>
          <a href="#" className="block py-2 px-3 rounded-lg hover:bg-muted">Settings</a>
        </nav>
      </SheetContent>
    </Sheet>
  ),
};

export const FilterSheet: Story = {
  name: "Filter Sheet",
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Shifts</SheetTitle>
          <SheetDescription>
            Narrow down your search with these filters.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-3">
            <Label>Specialty</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="dental" defaultChecked />
                <label htmlFor="dental" className="text-sm">Dental Hygienist</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="assistant" />
                <label htmlFor="assistant" className="text-sm">Dental Assistant</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="nurse" />
                <label htmlFor="nurse" className="text-sm">Registered Nurse</label>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label>Hourly Rate</Label>
            <div className="px-2">
              <Slider defaultValue={[35, 75]} max={100} step={5} />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>$35</span>
                <span>$75</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label>Distance</Label>
            <div className="px-2">
              <Slider defaultValue={[25]} max={50} step={5} />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>0 miles</span>
                <span>25 miles</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label>Shift Type</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="urgent" />
                <label htmlFor="urgent" className="text-sm">Urgent only</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="fullday" defaultChecked />
                <label htmlFor="fullday" className="text-sm">Full day shifts</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="halfday" defaultChecked />
                <label htmlFor="halfday" className="text-sm">Half day shifts</label>
              </div>
            </div>
          </div>
        </div>
        <SheetFooter className="mt-8">
          <Button variant="outline" className="flex-1">Reset</Button>
          <Button variant="hero" className="flex-1">Apply Filters</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const BottomSheet: Story = {
  name: "Bottom Sheet (Mobile)",
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Bottom Sheet</Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Shift Details</SheetTitle>
          <SheetDescription>
            Dental Hygienist at Bright Smiles Dental
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">January 25, 2026</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Time</span>
            <span className="font-medium">9:00 AM - 5:00 PM</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Rate</span>
            <span className="font-medium text-primary">$45/hour</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Location</span>
            <span className="font-medium">123 Main St, San Francisco</span>
          </div>
        </div>
        <div className="mt-8">
          <Button variant="hero" className="w-full" size="lg">
            Apply for This Shift
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  ),
};
