import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

const meta: Meta<typeof Progress> = {
  title: "Components/Progress",
  component: Progress,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Progress bar component for displaying completion status. Supports various sizes and animated loading states.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  render: () => <Progress value={60} className="w-[300px]" />,
};

export const Values: Story = {
  name: "Different Values",
  render: () => (
    <div className="space-y-4 w-[300px]">
      <div className="space-y-1">
        <p className="text-sm">0%</p>
        <Progress value={0} />
      </div>
      <div className="space-y-1">
        <p className="text-sm">25%</p>
        <Progress value={25} />
      </div>
      <div className="space-y-1">
        <p className="text-sm">50%</p>
        <Progress value={50} />
      </div>
      <div className="space-y-1">
        <p className="text-sm">75%</p>
        <Progress value={75} />
      </div>
      <div className="space-y-1">
        <p className="text-sm">100%</p>
        <Progress value={100} />
      </div>
    </div>
  ),
};

export const Animated: Story = {
  render: () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 10));
      }, 500);
      return () => clearInterval(timer);
    }, []);

    return (
      <div className="space-y-2 w-[300px]">
        <Progress value={progress} />
        <p className="text-sm text-muted-foreground text-center">{progress}%</p>
      </div>
    );
  },
};

export const OnboardingProgress: Story = {
  name: "Onboarding Progress",
  render: () => (
    <div className="space-y-4 w-full max-w-md p-6 border rounded-xl bg-card">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Profile Completion</h3>
        <span className="text-sm text-primary font-medium">75%</span>
      </div>
      <Progress value={75} />
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="h-4 w-4 rounded-full bg-success flex items-center justify-center text-success-foreground text-xs">✓</span>
          <span>Basic Information</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="h-4 w-4 rounded-full bg-success flex items-center justify-center text-success-foreground text-xs">✓</span>
          <span>Contact Details</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="h-4 w-4 rounded-full bg-success flex items-center justify-center text-success-foreground text-xs">✓</span>
          <span>Upload License</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-4 w-4 rounded-full border-2 border-muted-foreground"></span>
          <span>Verification Pending</span>
        </div>
      </div>
    </div>
  ),
};

export const DocumentUpload: Story = {
  name: "Document Upload Progress",
  render: () => (
    <div className="space-y-3 w-full max-w-sm p-4 border rounded-xl bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
            📄
          </div>
          <div>
            <p className="text-sm font-medium">dental_license.pdf</p>
            <p className="text-xs text-muted-foreground">Uploading...</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">67%</span>
      </div>
      <Progress value={67} />
    </div>
  ),
};

export const ShiftCompletion: Story = {
  name: "Shift Completion Tracker",
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <h3 className="font-semibold">This Week's Progress</h3>
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Shifts Completed</span>
            <span className="font-medium">4/5</span>
          </div>
          <Progress value={80} />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Hours Worked</span>
            <span className="font-medium">32/40</span>
          </div>
          <Progress value={80} />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Earnings Goal</span>
            <span className="font-medium">$1,440/$2,000</span>
          </div>
          <Progress value={72} />
        </div>
      </div>
    </div>
  ),
};
