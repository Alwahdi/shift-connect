import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";

const meta: Meta = {
  title: "Components/Toast",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Toast notifications for displaying brief messages to users. Supports success, error, warning, and informational variants with optional actions.",
      },
    },
  },
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
};

export default meta;
type Story = StoryObj;

const ToastDemo = ({ 
  variant, 
  title, 
  description, 
  action 
}: { 
  variant?: "default" | "destructive"; 
  title: string; 
  description?: string;
  action?: boolean;
}) => {
  const { toast } = useToast();

  return (
    <Button
      variant={variant === "destructive" ? "destructive" : "outline"}
      onClick={() => {
        toast({
          variant,
          title,
          description,
          action: action ? (
            <Button variant="outline" size="sm">Undo</Button>
          ) : undefined,
        });
      }}
    >
      Show {title}
    </Button>
  );
};

export const Default: Story = {
  render: () => (
    <ToastDemo 
      title="Shift Updated" 
      description="Your shift details have been saved." 
    />
  ),
};

export const Success: Story = {
  render: () => {
    const { toast } = useToast();
    return (
      <>
        <Button
          variant="hero"
          onClick={() => {
            toast({
              title: "Booking Confirmed",
              description: "Your shift on Jan 25 has been booked successfully.",
            });
          }}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Show Success Toast
        </Button>
        <Toaster />
      </>
    );
  },
};

export const Error: Story = {
  render: () => (
    <ToastDemo 
      variant="destructive"
      title="Booking Failed" 
      description="This shift is no longer available. Please try another." 
    />
  ),
};

export const Warning: Story = {
  render: () => {
    const { toast } = useToast();
    return (
      <>
        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: "Shift Starting Soon",
              description: "Your shift at Bright Smiles Dental starts in 30 minutes.",
            });
          }}
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          Show Warning Toast
        </Button>
        <Toaster />
      </>
    );
  },
};

export const WithAction: Story = {
  render: () => (
    <ToastDemo 
      title="Shift Cancelled" 
      description="Your shift has been cancelled."
      action
    />
  ),
};

export const Information: Story = {
  render: () => {
    const { toast } = useToast();
    return (
      <>
        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: "New Feature Available",
              description: "You can now set recurring availability in your profile.",
            });
          }}
        >
          <Info className="mr-2 h-4 w-4" />
          Show Info Toast
        </Button>
        <Toaster />
      </>
    );
  },
};

export const AllVariants: Story = {
  name: "All Variants",
  render: () => {
    const { toast } = useToast();
    
    const showToasts = () => {
      toast({ title: "Default Toast", description: "This is a default toast message." });
      setTimeout(() => {
        toast({ 
          title: "Success!", 
          description: "Your action was completed successfully." 
        });
      }, 1000);
      setTimeout(() => {
        toast({ 
          variant: "destructive",
          title: "Error", 
          description: "Something went wrong. Please try again." 
        });
      }, 2000);
    };

    return (
      <>
        <Button onClick={showToasts} variant="brand">
          Show All Toast Variants
        </Button>
        <Toaster />
      </>
    );
  },
};
