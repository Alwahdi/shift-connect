import type { Meta, StoryObj } from "@storybook/react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "A customizable select component built on Radix UI primitives with full keyboard navigation and accessibility support.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a specialty" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Healthcare Specialties</SelectLabel>
          <SelectItem value="dental-hygienist">Dental Hygienist</SelectItem>
          <SelectItem value="dental-assistant">Dental Assistant</SelectItem>
          <SelectItem value="registered-nurse">Registered Nurse</SelectItem>
          <SelectItem value="medical-assistant">Medical Assistant</SelectItem>
          <SelectItem value="phlebotomist">Phlebotomist</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="specialty">Specialty</Label>
      <Select>
        <SelectTrigger id="specialty">
          <SelectValue placeholder="Select your specialty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="dental-hygienist">Dental Hygienist</SelectItem>
          <SelectItem value="dental-assistant">Dental Assistant</SelectItem>
          <SelectItem value="registered-nurse">Registered Nurse</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Dental</SelectLabel>
          <SelectItem value="dental-hygienist">Dental Hygienist</SelectItem>
          <SelectItem value="dental-assistant">Dental Assistant</SelectItem>
          <SelectItem value="dentist">Dentist</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Medical</SelectLabel>
          <SelectItem value="registered-nurse">Registered Nurse</SelectItem>
          <SelectItem value="medical-assistant">Medical Assistant</SelectItem>
          <SelectItem value="physician">Physician</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Administrative</SelectLabel>
          <SelectItem value="office-manager">Office Manager</SelectItem>
          <SelectItem value="receptionist">Receptionist</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a specialty" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="dental-hygienist">Dental Hygienist</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithDefaultValue: Story = {
  render: () => (
    <Select defaultValue="registered-nurse">
      <SelectTrigger className="w-[280px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="dental-hygienist">Dental Hygienist</SelectItem>
        <SelectItem value="dental-assistant">Dental Assistant</SelectItem>
        <SelectItem value="registered-nurse">Registered Nurse</SelectItem>
        <SelectItem value="medical-assistant">Medical Assistant</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const ShiftDuration: Story = {
  name: "Shift Duration Select",
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="duration">Shift Duration</Label>
      <Select defaultValue="8">
        <SelectTrigger id="duration">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="4">4 hours</SelectItem>
          <SelectItem value="6">6 hours</SelectItem>
          <SelectItem value="8">8 hours (Full day)</SelectItem>
          <SelectItem value="10">10 hours</SelectItem>
          <SelectItem value="12">12 hours</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};
