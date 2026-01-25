import type { Meta, StoryObj } from "@storybook/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Filter, MapPin } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

const meta: Meta<typeof Popover> = {
  title: "Components/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Popover component for displaying floating content triggered by a button or other element. Useful for date pickers, quick actions, and contextual information.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-muted-foreground">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Width</Label>
              <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input id="height" defaultValue="25px" className="col-span-2 h-8" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const DatePicker: Story = {
  name: "Date Picker",
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  },
};

export const QuickFilters: Story = {
  name: "Quick Filters",
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Quick Filters
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-3">
          <h4 className="font-medium">Quick Filters</h4>
          <div className="space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              🔥 Urgent shifts only
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              📅 This week
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              💰 High paying ($50+/hr)
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              📍 Within 10 miles
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const LocationPicker: Story = {
  name: "Location Picker",
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
          <MapPin className="mr-2 h-4 w-4" />
          San Francisco, CA
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Search Location</h4>
            <Input placeholder="Enter city or zip code..." />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Recent locations</p>
            <div className="space-y-1">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <MapPin className="mr-2 h-4 w-4" />
                San Francisco, CA
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <MapPin className="mr-2 h-4 w-4" />
                Oakland, CA
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <MapPin className="mr-2 h-4 w-4" />
                San Jose, CA
              </Button>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full">
            Use my current location
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const NotificationPreview: Story = {
  name: "Notification Preview",
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          🔔
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Notifications</h4>
            <Button variant="ghost" size="sm">Mark all read</Button>
          </div>
          <div className="space-y-3">
            <div className="flex gap-3 p-2 rounded-lg bg-muted/50">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                ✓
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Shift Confirmed</p>
                <p className="text-xs text-muted-foreground">Bright Smiles - Jan 25</p>
              </div>
            </div>
            <div className="flex gap-3 p-2 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-warning flex items-center justify-center text-warning-foreground text-xs">
                🔥
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New Urgent Shift</p>
                <p className="text-xs text-muted-foreground">5 miles away • $55/hr</p>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
