import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Toggle switch component for boolean settings. Accessible with keyboard navigation and screen reader support.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: () => <Switch />,
};

export const Checked: Story = {
  render: () => <Switch defaultChecked />,
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Switch disabled />
      <Switch disabled defaultChecked />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
};

export const AvailabilityToggle: Story = {
  name: "Availability Toggle",
  render: () => {
    const [isAvailable, setIsAvailable] = useState(true);
    
    return (
      <div className="flex items-center justify-between p-4 border rounded-xl bg-card max-w-sm">
        <div className="space-y-0.5">
          <Label htmlFor="available" className="text-base font-medium">Available for Shifts</Label>
          <p className="text-sm text-muted-foreground">
            {isAvailable ? "You'll appear in search results" : "You won't receive shift offers"}
          </p>
        </div>
        <Switch 
          id="available" 
          checked={isAvailable}
          onCheckedChange={setIsAvailable}
        />
      </div>
    );
  },
};

export const NotificationSettings: Story = {
  name: "Notification Settings",
  render: () => (
    <div className="space-y-4 max-w-md">
      <h3 className="text-lg font-semibold">Notifications</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifs">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive shift updates via email</p>
          </div>
          <Switch id="email-notifs" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sms-notifs">SMS Notifications</Label>
            <p className="text-sm text-muted-foreground">Get text alerts for urgent shifts</p>
          </div>
          <Switch id="sms-notifs" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-notifs">Push Notifications</Label>
            <p className="text-sm text-muted-foreground">Browser and mobile push alerts</p>
          </div>
          <Switch id="push-notifs" />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="marketing">Marketing Emails</Label>
            <p className="text-sm text-muted-foreground">News and feature announcements</p>
          </div>
          <Switch id="marketing" />
        </div>
      </div>
    </div>
  ),
};

export const UrgentShiftAlerts: Story = {
  name: "Urgent Shift Alerts",
  render: () => {
    const [enabled, setEnabled] = useState(false);
    
    return (
      <div className={`flex items-center justify-between p-4 rounded-xl border-2 max-w-sm transition-colors ${enabled ? 'border-warning bg-warning/5' : 'border-border bg-card'}`}>
        <div className="space-y-0.5">
          <Label htmlFor="urgent" className="text-base font-medium flex items-center gap-2">
            Urgent Shift Alerts
            {enabled && <span className="text-xs bg-warning text-warning-foreground px-2 py-0.5 rounded-full">Active</span>}
          </Label>
          <p className="text-sm text-muted-foreground">
            Get notified about last-minute openings
          </p>
        </div>
        <Switch 
          id="urgent" 
          checked={enabled}
          onCheckedChange={setEnabled}
        />
      </div>
    );
  },
};
