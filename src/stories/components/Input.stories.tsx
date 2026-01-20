import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField, InputWithIcon } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { Mail, Search, User, Phone, DollarSign, MapPin } from "lucide-react";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  render: () => (
    <Input placeholder="Enter text..." className="w-[300px]" />
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="email">Email Address</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <InputWithIcon icon={Mail}>
        <Input placeholder="Email address" />
      </InputWithIcon>
      <InputWithIcon icon={Search}>
        <Input placeholder="Search..." />
      </InputWithIcon>
      <InputWithIcon icon={MapPin}>
        <Input placeholder="Location" />
      </InputWithIcon>
    </div>
  ),
};

export const FormFields: Story = {
  render: () => (
    <div className="w-[350px] space-y-4">
      <FormField label="Full Name" htmlFor="name" required>
        <InputWithIcon icon={User}>
          <Input id="name" placeholder="John Doe" />
        </InputWithIcon>
      </FormField>
      <FormField label="Email" htmlFor="email" required>
        <InputWithIcon icon={Mail}>
          <Input id="email" type="email" placeholder="you@example.com" />
        </InputWithIcon>
      </FormField>
      <FormField label="Phone" htmlFor="phone" hint="Optional">
        <InputWithIcon icon={Phone}>
          <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
        </InputWithIcon>
      </FormField>
    </div>
  ),
};

export const PasswordWithStrength: Story = {
  render: () => (
    <div className="w-[350px] space-y-4">
      <FormField label="Password" htmlFor="password" required>
        <PasswordInput
          id="password"
          placeholder="Create a password"
          showStrength
        />
      </FormField>
      <p className="text-xs text-muted-foreground">
        Try typing to see the strength indicator
      </p>
    </div>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <div className="w-[350px] space-y-4">
      <FormField
        label="Email Address"
        htmlFor="email-error"
        error="Please enter a valid email address"
        required
      >
        <InputWithIcon icon={Mail}>
          <Input
            id="email-error"
            type="email"
            placeholder="you@example.com"
            defaultValue="invalid-email"
            className="border-destructive focus-visible:ring-destructive"
          />
        </InputWithIcon>
      </FormField>
    </div>
  ),
};

export const SuccessState: Story = {
  render: () => (
    <div className="w-[350px] space-y-4">
      <FormField
        label="Email Address"
        htmlFor="email-success"
        hint="Email is available"
        required
      >
        <InputWithIcon icon={Mail}>
          <Input
            id="email-success"
            type="email"
            placeholder="you@example.com"
            defaultValue="user@example.com"
            className="border-success focus-visible:ring-success"
          />
        </InputWithIcon>
      </FormField>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <Input placeholder="Disabled input" disabled />
      <Input placeholder="Read only input" readOnly defaultValue="Cannot edit" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground mb-1 block">Default (h-11)</Label>
        <Input placeholder="Default size" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground mb-1 block">Large (h-13 / 52px)</Label>
        <Input placeholder="Large size" className="h-13 text-base" />
      </div>
    </div>
  ),
};

export const CurrencyInput: Story = {
  render: () => (
    <div className="w-[200px]">
      <FormField label="Hourly Rate" htmlFor="rate" required>
        <div className="relative">
          <DollarSign className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="rate"
            type="number"
            placeholder="0.00"
            className="ps-9"
          />
          <span className="absolute end-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            /hr
          </span>
        </div>
      </FormField>
    </div>
  ),
};
