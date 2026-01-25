import type { Meta, StoryObj } from "@storybook/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Info, HelpCircle, Settings, Bell, Calendar } from "lucide-react";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: "Tooltip component for displaying additional information on hover. Built on Radix UI with accessibility support and customizable positioning.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a tooltip</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const Positions: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">Top</Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Tooltip on top</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">Right</Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Tooltip on right</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">Bottom</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Tooltip on bottom</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">Left</Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Tooltip on left</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const WithIcon: Story = {
  name: "With Icon Trigger",
  render: () => (
    <div className="flex items-center gap-2">
      <span className="text-sm">Hourly Rate</span>
      <Tooltip>
        <TooltipTrigger>
          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent>
          <p>This is the rate you'll earn per hour for this shift</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const RichContent: Story = {
  name: "Rich Content",
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon">
          <Info className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <div className="space-y-1">
          <p className="font-semibold">Verification Status</p>
          <p className="text-xs text-muted-foreground">
            Your documents are being reviewed. This usually takes 1-2 business days. 
            We'll notify you once the process is complete.
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  ),
};

export const IconBar: Story = {
  name: "Icon Bar with Tooltips",
  render: () => (
    <div className="flex items-center gap-2 p-2 border rounded-xl bg-card">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>View Calendar</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Notifications</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Settings</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const UrgentBadge: Story = {
  name: "Urgent Badge Tooltip",
  render: () => (
    <Tooltip>
      <TooltipTrigger>
        <span className="px-2 py-1 bg-warning text-warning-foreground text-xs font-medium rounded-full cursor-help">
          Urgent
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>This shift needs to be filled within 24 hours</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const VerifiedBadge: Story = {
  name: "Verified Badge Tooltip",
  render: () => (
    <Tooltip>
      <TooltipTrigger>
        <span className="px-2 py-1 bg-success/10 text-success text-xs font-medium rounded-full cursor-help flex items-center gap-1">
          ✓ Verified
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>This professional's credentials have been verified</p>
      </TooltipContent>
    </Tooltip>
  ),
};
