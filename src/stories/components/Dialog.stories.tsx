import type { Meta, StoryObj } from "@storybook/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

const meta: Meta<typeof Dialog> = {
  title: "Components/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Modal dialog component for displaying content that requires user attention or interaction. Built on Radix UI Dialog with full accessibility support.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" defaultValue="Dr. Sarah Johnson" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="specialty" className="text-right">
              Specialty
            </Label>
            <Input id="specialty" defaultValue="Dental Hygienist" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" variant="hero">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Confirmation: Story = {
  name: "Confirmation Dialog",
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Cancel Shift</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Cancel This Shift?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. The clinic will be notified.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            You are about to cancel your shift on <strong>January 25, 2026</strong> at <strong>Bright Smiles Dental</strong>. 
            A cancellation fee may apply if cancelled within 24 hours.
          </p>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline">Keep Shift</Button>
          <Button variant="destructive">Yes, Cancel Shift</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Success: Story = {
  name: "Success Dialog",
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="hero">Book Shift</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] text-center">
        <div className="flex flex-col items-center py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-center">Booking Confirmed!</DialogTitle>
            <DialogDescription className="text-center">
              Your shift has been successfully booked. You'll receive a confirmation email shortly.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 p-4 bg-muted rounded-xl w-full">
            <div className="text-sm space-y-1">
              <p><strong>Date:</strong> January 25, 2026</p>
              <p><strong>Time:</strong> 9:00 AM - 5:00 PM</p>
              <p><strong>Location:</strong> Bright Smiles Dental</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="hero" className="w-full">View My Shifts</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Information: Story = {
  name: "Information Dialog",
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>About Shift Rates</DialogTitle>
          <DialogDescription>
            Understanding how pay rates work on SyndeoCare
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-1">Base Rate</h4>
            <p className="text-sm text-muted-foreground">
              The hourly rate set by the clinic for this shift position.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">Urgent Shifts</h4>
            <p className="text-sm text-muted-foreground">
              Shifts marked as urgent may offer premium rates, typically 15-25% higher than standard.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">Weekend & Holiday</h4>
            <p className="text-sm text-muted-foreground">
              Some clinics offer enhanced rates for weekend and holiday shifts.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const FormDialog: Story = {
  name: "Form Dialog",
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="brand">Create New Shift</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Shift</DialogTitle>
          <DialogDescription>
            Fill in the details below to post a new shift for professionals.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Shift Title</Label>
            <Input id="title" placeholder="e.g., Dental Hygienist - Full Day" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rate">Hourly Rate ($)</Label>
              <Input id="rate" type="number" placeholder="45" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start">Start Time</Label>
              <Input id="start" type="time" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end">End Time</Label>
              <Input id="end" type="time" />
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="hero">Create Shift</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
