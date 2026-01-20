import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Search, Mail, Phone } from "lucide-react";

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Email" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    disabled: true,
  },
};

export const WithIcon: Story = {
  render: () => (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input className="pl-10" placeholder="Search shifts..." />
    </div>
  ),
};

export const EmailInput: Story = {
  render: () => (
    <div className="relative w-full max-w-sm">
      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input type="email" className="pl-10" placeholder="name@example.com" />
    </div>
  ),
};

export const PhoneInput: Story = {
  render: () => (
    <div className="relative w-full max-w-sm">
      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input type="tel" className="pl-10" placeholder="+966 5XX XXX XXXX" />
    </div>
  ),
};

export const Password: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-2">
      <Label htmlFor="password">Password</Label>
      <PasswordInput id="password" placeholder="Enter password" />
    </div>
  ),
};

export const PasswordWithStrength: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-2">
      <Label htmlFor="password-strength">Password with Strength Indicator</Label>
      <PasswordInput id="password-strength" showStrength placeholder="Enter a strong password" />
      <p className="text-xs text-muted-foreground">
        Password should be at least 8 characters with uppercase, lowercase, numbers, and symbols.
      </p>
    </div>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="error-input" className="text-destructive">Email</Label>
      <Input 
        type="email" 
        id="error-input" 
        placeholder="Email" 
        className="border-destructive focus-visible:ring-destructive"
        defaultValue="invalid-email"
      />
      <p className="text-sm text-destructive">Please enter a valid email address</p>
    </div>
  ),
};

export const SuccessState: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="success-input" className="text-green-600">Email</Label>
      <Input 
        type="email" 
        id="success-input" 
        placeholder="Email" 
        className="border-green-500 focus-visible:ring-green-500"
        defaultValue="valid@example.com"
      />
      <p className="text-sm text-green-600">Email is valid</p>
    </div>
  ),
};

export const FormGroup: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullname">Full Name</Label>
        <Input id="fullname" placeholder="John Doe" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-form">Email</Label>
        <Input type="email" id="email-form" placeholder="name@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone-form">Phone</Label>
        <Input type="tel" id="phone-form" placeholder="+966 5XX XXX XXXX" />
      </div>
    </div>
  ),
};
