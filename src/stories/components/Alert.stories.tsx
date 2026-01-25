import type { Meta, StoryObj } from "@storybook/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Info, XCircle, Bell } from "lucide-react";

const meta: Meta<typeof Alert> = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Alert component for displaying important messages to users. Supports informational, success, warning, and error variants.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  render: () => (
    <Alert className="max-w-md">
      <Info className="h-4 w-4" />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the cli.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive" className="max-w-md">
      <XCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  render: () => (
    <Alert className="max-w-md border-success bg-success/10">
      <CheckCircle className="h-4 w-4 text-success" />
      <AlertTitle className="text-success">Success!</AlertTitle>
      <AlertDescription>
        Your shift has been booked successfully. Check your email for confirmation.
      </AlertDescription>
    </Alert>
  ),
};

export const Warning: Story = {
  render: () => (
    <Alert className="max-w-md border-warning bg-warning/10">
      <AlertTriangle className="h-4 w-4 text-warning" />
      <AlertTitle className="text-warning">Attention</AlertTitle>
      <AlertDescription>
        Your license expires in 30 days. Please upload a renewed copy.
      </AlertDescription>
    </Alert>
  ),
};

export const Information: Story = {
  render: () => (
    <Alert className="max-w-md border-accent bg-accent/10">
      <Info className="h-4 w-4 text-accent" />
      <AlertTitle className="text-accent">New Feature</AlertTitle>
      <AlertDescription>
        You can now set recurring availability in your profile settings.
      </AlertDescription>
    </Alert>
  ),
};

export const ShiftReminder: Story = {
  name: "Shift Reminder",
  render: () => (
    <Alert className="max-w-lg border-primary bg-primary/5">
      <Bell className="h-4 w-4 text-primary" />
      <AlertTitle>Upcoming Shift</AlertTitle>
      <AlertDescription>
        You have a shift at <strong>Bright Smiles Dental</strong> tomorrow at 9:00 AM. 
        Don't forget to check in when you arrive!
      </AlertDescription>
    </Alert>
  ),
};

export const VerificationPending: Story = {
  name: "Verification Pending",
  render: () => (
    <Alert className="max-w-lg border-warning bg-warning/5">
      <AlertTriangle className="h-4 w-4 text-warning" />
      <AlertTitle>Verification In Progress</AlertTitle>
      <AlertDescription>
        Your documents are being reviewed. This typically takes 1-2 business days. 
        You'll be notified once the review is complete.
      </AlertDescription>
    </Alert>
  ),
};

export const AllVariants: Story = {
  name: "All Variants",
  render: () => (
    <div className="space-y-4 max-w-lg">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>This is an informational message.</AlertDescription>
      </Alert>
      
      <Alert className="border-success bg-success/10">
        <CheckCircle className="h-4 w-4 text-success" />
        <AlertTitle className="text-success">Success</AlertTitle>
        <AlertDescription>This is a success message.</AlertDescription>
      </Alert>
      
      <Alert className="border-warning bg-warning/10">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <AlertTitle className="text-warning">Warning</AlertTitle>
        <AlertDescription>This is a warning message.</AlertDescription>
      </Alert>
      
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>This is an error message.</AlertDescription>
      </Alert>
    </div>
  ),
};
