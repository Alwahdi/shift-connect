import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Skeleton loading placeholders for content that is loading. Use to prevent layout shift and improve perceived performance.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: () => <Skeleton className="h-4 w-[250px]" />,
};

export const TextLines: Story = {
  name: "Text Lines",
  render: () => (
    <div className="space-y-2 w-[300px]">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[90%]" />
      <Skeleton className="h-4 w-[75%]" />
    </div>
  ),
};

export const Avatar: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-3 w-[100px]" />
      </div>
    </div>
  ),
};

export const ShiftCard: Story = {
  name: "Shift Card Skeleton",
  render: () => (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-[200px]" />
          <Skeleton className="h-6 w-[60px] rounded-full" />
        </div>
        <Skeleton className="h-4 w-[150px]" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-[120px]" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-[180px]" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  ),
};

export const ProfileCard: Story = {
  name: "Profile Card Skeleton",
  render: () => (
    <Card className="w-full max-w-sm">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="text-center space-y-2">
            <Skeleton className="h-5 w-[150px] mx-auto" />
            <Skeleton className="h-4 w-[100px] mx-auto" />
          </div>
          <div className="flex gap-2 w-full mt-2">
            <Skeleton className="h-6 w-[80px] rounded-full" />
            <Skeleton className="h-6 w-[60px] rounded-full" />
            <Skeleton className="h-6 w-[70px] rounded-full" />
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-4 w-[60px]" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[40px]" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-[70px]" />
            <Skeleton className="h-4 w-[80px]" />
          </div>
        </div>
      </CardContent>
    </Card>
  ),
};

export const TableRows: Story = {
  name: "Table Rows Skeleton",
  render: () => (
    <div className="w-full max-w-2xl border rounded-xl overflow-hidden">
      <div className="bg-muted p-4 flex gap-4">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-4 w-[60px]" />
      </div>
      {[1, 2, 3, 4, 5].map((row) => (
        <div key={row} className="p-4 flex gap-4 border-t">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[60px]" />
        </div>
      ))}
    </div>
  ),
};

export const DashboardGrid: Story = {
  name: "Dashboard Grid Skeleton",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
      {[1, 2, 3].map((card) => (
        <Card key={card}>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-8 w-[80px]" />
              <Skeleton className="h-3 w-[60px]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};

export const ListItems: Story = {
  name: "List Items Skeleton",
  render: () => (
    <div className="space-y-3 w-full max-w-md">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="flex items-center gap-3 p-3 border rounded-xl">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[180px]" />
            <Skeleton className="h-3 w-[120px]" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      ))}
    </div>
  ),
};
