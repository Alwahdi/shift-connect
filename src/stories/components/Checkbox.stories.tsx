import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Checkbox component for multiple selection options. Built on Radix UI with full accessibility support.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: () => <Checkbox />,
};

export const Checked: Story = {
  render: () => <Checkbox defaultChecked />,
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox disabled />
      <Checkbox disabled defaultChecked />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};

export const CertificationFilter: Story = {
  name: "Certification Filter",
  render: () => (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">Required Certifications</h4>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox id="cert-rda" defaultChecked />
          <Label htmlFor="cert-rda">RDA (Registered Dental Assistant)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="cert-cpr" defaultChecked />
          <Label htmlFor="cert-cpr">CPR Certified</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="cert-xray" />
          <Label htmlFor="cert-xray">X-Ray Certified</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="cert-nitrous" />
          <Label htmlFor="cert-nitrous">Nitrous Oxide Certified</Label>
        </div>
      </div>
    </div>
  ),
};

export const AvailabilityDays: Story = {
  name: "Availability Days",
  render: () => (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">Available Days</h4>
      <div className="flex flex-wrap gap-3">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
          <div key={day} className="flex items-center space-x-2">
            <Checkbox id={`day-${day}`} defaultChecked={index < 5} />
            <Label htmlFor={`day-${day}`} className="text-sm">{day}</Label>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const ShiftPreferences: Story = {
  name: "Shift Preferences",
  render: () => (
    <div className="space-y-4 max-w-sm">
      <h4 className="font-medium">Shift Preferences</h4>
      <div className="space-y-3">
        <div className="flex items-start space-x-3 p-3 border rounded-lg">
          <Checkbox id="pref-urgent" className="mt-0.5" />
          <div>
            <Label htmlFor="pref-urgent" className="font-medium">Urgent Shifts Only</Label>
            <p className="text-sm text-muted-foreground">Higher pay, short notice</p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-3 border rounded-lg">
          <Checkbox id="pref-fullday" defaultChecked className="mt-0.5" />
          <div>
            <Label htmlFor="pref-fullday" className="font-medium">Full Day Shifts</Label>
            <p className="text-sm text-muted-foreground">8+ hours</p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-3 border rounded-lg">
          <Checkbox id="pref-halfday" defaultChecked className="mt-0.5" />
          <div>
            <Label htmlFor="pref-halfday" className="font-medium">Half Day Shifts</Label>
            <p className="text-sm text-muted-foreground">4-6 hours</p>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const TermsAgreement: Story = {
  name: "Terms Agreement",
  render: () => (
    <div className="space-y-4 max-w-md p-4 border rounded-xl bg-card">
      <div className="flex items-start space-x-3">
        <Checkbox id="agree-terms" className="mt-0.5" />
        <div>
          <Label htmlFor="agree-terms" className="font-medium">
            I agree to the Terms of Service
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            By checking this box, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
      <div className="flex items-start space-x-3">
        <Checkbox id="agree-background" className="mt-0.5" />
        <div>
          <Label htmlFor="agree-background" className="font-medium">
            Authorize Background Check
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            I authorize SyndeoCare to conduct a background verification check.
          </p>
        </div>
      </div>
    </div>
  ),
};
