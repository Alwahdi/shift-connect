import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Heart, ArrowRight, Mail, Plus, Settings, Trash2 } from "lucide-react";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link", "hero", "accent", "brand", "hero-outline", "success", "sky"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "xl", "icon"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
    size: "default",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 max-w-3xl">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="hero">Hero</Button>
      <Button variant="accent">Accent</Button>
      <Button variant="brand">Brand</Button>
      <Button variant="hero-outline">Hero Outline</Button>
      <Button variant="success">Success</Button>
      <Button variant="sky">Sky</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
      <Button size="icon"><Heart className="w-4 h-4" /></Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>
        <Mail className="w-4 h-4" />
        Send Email
      </Button>
      <Button variant="hero">
        Get Started
        <ArrowRight className="w-4 h-4" />
      </Button>
      <Button variant="accent">
        <Plus className="w-4 h-4" />
        Add New
      </Button>
      <Button variant="destructive">
        <Trash2 className="w-4 h-4" />
        Delete
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button disabled>Default</Button>
      <Button variant="hero" disabled>Hero</Button>
      <Button variant="outline" disabled>Outline</Button>
    </div>
  ),
};

export const LoadingStates: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <LoadingButton isLoading loadingText="Loading...">
        Submit
      </LoadingButton>
      <LoadingButton isLoading variant="hero" loadingText="Processing...">
        Continue
      </LoadingButton>
      <LoadingButton isSuccess successText="Done!">
        Success
      </LoadingButton>
    </div>
  ),
};

export const GradientButtons: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-2">Premium gradient buttons for CTAs</p>
      <div className="flex flex-wrap gap-4">
        <Button variant="hero" size="lg">
          Hero Primary
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Button variant="accent" size="lg">
          Accent Teal
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Button variant="brand" size="lg">
          Brand Gradient
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Button variant="sky" size="lg">
          Sky Blue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  ),
};

export const ButtonGroups: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex">
        <Button variant="outline" className="rounded-e-none border-e-0">Left</Button>
        <Button variant="outline" className="rounded-none border-e-0">Center</Button>
        <Button variant="outline" className="rounded-s-none">Right</Button>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="icon"><Settings className="w-4 h-4" /></Button>
        <Button variant="secondary" size="icon"><Heart className="w-4 h-4" /></Button>
        <Button variant="secondary" size="icon"><Mail className="w-4 h-4" /></Button>
      </div>
    </div>
  ),
};
