import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Avatar component for displaying user profile images with fallback initials. Supports various sizes and can be grouped.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="Dr. Sarah Johnson" />
      <AvatarFallback>SJ</AvatarFallback>
    </Avatar>
  ),
};

export const WithFallback: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="/broken-image.jpg" alt="User" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar className="h-8 w-8">
        <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" />
        <AvatarFallback className="text-xs">SM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" />
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar className="h-14 w-14">
        <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" />
        <AvatarFallback className="text-lg">LG</AvatarFallback>
      </Avatar>
      <Avatar className="h-20 w-20">
        <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" />
        <AvatarFallback className="text-xl">XL</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const Group: Story = {
  name: "Avatar Group",
  render: () => (
    <div className="flex -space-x-4">
      <Avatar className="border-2 border-background">
        <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" />
        <AvatarFallback>SJ</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background">
        <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" />
        <AvatarFallback>MK</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background">
        <AvatarImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" />
        <AvatarFallback>EC</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background">
        <AvatarFallback className="bg-muted text-muted-foreground">+5</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const WithStatus: Story = {
  name: "With Status Indicator",
  render: () => (
    <div className="flex items-center gap-6">
      <div className="relative">
        <Avatar>
          <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" />
          <AvatarFallback>SJ</AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-background" />
      </div>
      <div className="relative">
        <Avatar>
          <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" />
          <AvatarFallback>MK</AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-warning border-2 border-background" />
      </div>
      <div className="relative">
        <Avatar>
          <AvatarImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" />
          <AvatarFallback>EC</AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-muted border-2 border-background" />
      </div>
    </div>
  ),
};

export const ClinicLogo: Story = {
  name: "Clinic Logo Avatar",
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar className="h-12 w-12 rounded-xl">
        <AvatarFallback className="rounded-xl bg-primary text-primary-foreground">BS</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold">Bright Smiles Dental</p>
        <p className="text-sm text-muted-foreground">Downtown Location</p>
      </div>
    </div>
  ),
};

export const ProfessionalCard: Story = {
  name: "Professional Card Layout",
  render: () => (
    <div className="flex items-center gap-4 p-4 border rounded-xl bg-card">
      <Avatar className="h-14 w-14">
        <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" />
        <AvatarFallback>SJ</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-semibold">Dr. Sarah Johnson</p>
        <p className="text-sm text-muted-foreground">Dental Hygienist</p>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">Verified</span>
          <span className="text-xs text-muted-foreground">• 4.9 ★</span>
        </div>
      </div>
    </div>
  ),
};
