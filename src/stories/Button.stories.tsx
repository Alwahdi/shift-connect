import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, Loader2 } from "lucide-react";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
        "hero",
        "accent",
        "brand",
        "success",
        "sky",
        "hero-outline",
      ],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
  },
};

export const Hero: Story = {
  args: {
    children: "Get Started",
    variant: "hero",
    size: "lg",
  },
};

export const Accent: Story = {
  args: {
    children: "Learn More",
    variant: "accent",
  },
};

export const Brand: Story = {
  args: {
    children: "Brand Button",
    variant: "brand",
  },
};

export const Success: Story = {
  args: {
    children: "Success",
    variant: "success",
  },
};

export const Destructive: Story = {
  args: {
    children: "Delete",
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

export const Ghost: Story = {
  args: {
    children: "Ghost",
    variant: "ghost",
  },
};

export const Link: Story = {
  args: {
    children: "Link Button",
    variant: "link",
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Mail className="mr-2 h-4 w-4" /> Login with Email
      </>
    ),
    variant: "default",
  },
};

export const IconOnly: Story = {
  args: {
    children: <ArrowRight className="h-4 w-4" />,
    variant: "outline",
    size: "icon",
  },
};

export const Loading: Story = {
  args: {
    children: (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
      </>
    ),
    disabled: true,
  },
};

export const Small: Story = {
  args: {
    children: "Small",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    children: "Large Button",
    size: "lg",
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled",
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="hero">Hero</Button>
      <Button variant="accent">Accent</Button>
      <Button variant="brand">Brand</Button>
      <Button variant="success">Success</Button>
      <Button variant="sky">Sky</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="hero-outline">Hero Outline</Button>
    </div>
  ),
};
