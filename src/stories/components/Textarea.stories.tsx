import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Multi-line text input component for longer form content like descriptions, notes, and messages.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  render: () => <Textarea placeholder="Type your message here..." className="max-w-md" />,
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-md gap-1.5">
      <Label htmlFor="bio">Bio</Label>
      <Textarea id="bio" placeholder="Tell us about yourself..." />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => <Textarea disabled placeholder="This textarea is disabled" className="max-w-md" />,
};

export const WithCharacterCount: Story = {
  name: "With Character Count",
  render: () => {
    const [value, setValue] = useState("");
    const maxLength = 500;
    
    return (
      <div className="grid w-full max-w-md gap-1.5">
        <Label htmlFor="description">Shift Description</Label>
        <Textarea 
          id="description"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Describe the shift requirements, duties, and any special instructions..."
          maxLength={maxLength}
        />
        <p className={`text-sm ${value.length > maxLength * 0.9 ? 'text-warning' : 'text-muted-foreground'}`}>
          {value.length}/{maxLength} characters
        </p>
      </div>
    );
  },
};

export const ShiftNotes: Story = {
  name: "Shift Notes",
  render: () => (
    <div className="grid w-full max-w-md gap-1.5">
      <Label htmlFor="notes">Additional Notes</Label>
      <Textarea 
        id="notes"
        placeholder="Add any special requirements or instructions for this shift..."
        className="min-h-[120px]"
      />
      <p className="text-xs text-muted-foreground">
        These notes will be visible to the professional before they apply.
      </p>
    </div>
  ),
};

export const ReviewComment: Story = {
  name: "Review Comment",
  render: () => (
    <div className="grid w-full max-w-md gap-1.5 p-4 border rounded-xl bg-card">
      <div className="flex items-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-xl cursor-pointer text-yellow-500">★</span>
        ))}
      </div>
      <Label htmlFor="review">Your Review</Label>
      <Textarea 
        id="review"
        placeholder="Share your experience working with this clinic..."
        className="min-h-[100px]"
      />
      <p className="text-xs text-muted-foreground">
        Your review helps other professionals make informed decisions.
      </p>
    </div>
  ),
};

export const CancellationReason: Story = {
  name: "Cancellation Reason",
  render: () => (
    <div className="grid w-full max-w-md gap-1.5">
      <Label htmlFor="reason" className="text-destructive">Cancellation Reason *</Label>
      <Textarea 
        id="reason"
        placeholder="Please explain why you need to cancel this shift..."
        className="min-h-[100px] border-destructive/50 focus:border-destructive"
      />
      <p className="text-xs text-muted-foreground">
        This information helps clinics understand cancellation patterns.
      </p>
    </div>
  ),
};
