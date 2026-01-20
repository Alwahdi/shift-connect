import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, InputWithIcon } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { Slider } from "@/components/ui/slider";
import { Mail, User, Phone, Search, DollarSign, MapPin, Lock } from "lucide-react";

const meta: Meta = {
  title: "Components/Form",
  parameters: {
    layout: "centered",
  },
};

export default meta;

/**
 * ## Text Inputs
 * Standard text input variations.
 */
export const TextInputs: StoryObj = {
  render: () => (
    <div className="w-[350px] space-y-4">
      <FormField label="Default Input" htmlFor="default">
        <Input id="default" placeholder="Enter text..." />
      </FormField>
      <FormField label="With Icon" htmlFor="icon">
        <InputWithIcon icon={Mail}>
          <Input id="icon" placeholder="Email address" />
        </InputWithIcon>
      </FormField>
      <FormField label="Large Input" htmlFor="large">
        <Input id="large" placeholder="Large size" className="h-13 text-base" />
      </FormField>
      <FormField label="Disabled" htmlFor="disabled">
        <Input id="disabled" placeholder="Disabled" disabled />
      </FormField>
    </div>
  ),
};

/**
 * ## Password Inputs
 * Password field with visibility toggle and strength indicator.
 */
export const PasswordInputs: StoryObj = {
  render: () => (
    <div className="w-[350px] space-y-6">
      <FormField label="Simple Password" htmlFor="pass-simple" required>
        <PasswordInput id="pass-simple" placeholder="Enter password" />
      </FormField>
      <FormField label="With Strength Indicator" htmlFor="pass-strength" required hint="Try typing to see strength">
        <PasswordInput id="pass-strength" placeholder="Create password" showStrength />
      </FormField>
    </div>
  ),
};

/**
 * ## Selection Controls
 * Checkboxes, switches, and radio groups.
 */
export const SelectionControls: StoryObj = {
  render: () => (
    <div className="w-[400px] space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-4 text-foreground">Checkboxes</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox id="check1" defaultChecked />
            <Label htmlFor="check1">Receive email notifications</Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="check2" />
            <Label htmlFor="check2">Enable SMS alerts</Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="check3" disabled />
            <Label htmlFor="check3" className="text-muted-foreground">Disabled option</Label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4 text-foreground">Switches</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="switch1">Dark mode</Label>
            <Switch id="switch1" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="switch2">Push notifications</Label>
            <Switch id="switch2" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="switch3" className="text-muted-foreground">Disabled switch</Label>
            <Switch id="switch3" disabled />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4 text-foreground">Radio Group</h3>
        <RadioGroup defaultValue="option2">
          <div className="flex items-center gap-3">
            <RadioGroupItem value="option1" id="r1" />
            <Label htmlFor="r1">Option A</Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="option2" id="r2" />
            <Label htmlFor="r2">Option B (default)</Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="option3" id="r3" />
            <Label htmlFor="r3">Option C</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  ),
};

/**
 * ## Select Dropdowns
 * Single and multi-select patterns.
 */
export const SelectDropdowns: StoryObj = {
  render: () => (
    <div className="w-[350px] space-y-4">
      <FormField label="Role" htmlFor="select-role" required>
        <Select>
          <SelectTrigger id="select-role">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nurse">Registered Nurse</SelectItem>
            <SelectItem value="dental">Dental Hygienist</SelectItem>
            <SelectItem value="assistant">Medical Assistant</SelectItem>
            <SelectItem value="therapist">Physical Therapist</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Experience Level" htmlFor="select-exp">
        <Select defaultValue="intermediate">
          <SelectTrigger id="select-exp">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
            <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
            <SelectItem value="senior">Senior (5-10 years)</SelectItem>
            <SelectItem value="expert">Expert (10+ years)</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Disabled Select" htmlFor="select-disabled">
        <Select disabled>
          <SelectTrigger id="select-disabled">
            <SelectValue placeholder="Cannot select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
    </div>
  ),
};

/**
 * ## Textarea
 * Multi-line text input.
 */
export const Textareas: StoryObj = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <FormField label="Bio" htmlFor="textarea-bio" hint="Write a brief description">
        <Textarea 
          id="textarea-bio" 
          placeholder="Tell us about yourself..."
          className="min-h-[120px]"
        />
      </FormField>
      <FormField label="Notes" htmlFor="textarea-notes">
        <Textarea 
          id="textarea-notes" 
          placeholder="Add any additional notes..."
          className="min-h-[80px]"
          defaultValue="This textarea has default content that can be edited."
        />
      </FormField>
    </div>
  ),
};

/**
 * ## Slider
 * Range selection control.
 */
export const Sliders: StoryObj = {
  render: () => (
    <div className="w-[350px] space-y-8">
      <div>
        <Label className="mb-4 block">Hourly Rate ($25-$100)</Label>
        <Slider defaultValue={[50]} max={100} min={25} step={5} />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>$25</span>
          <span>$100</span>
        </div>
      </div>
      <div>
        <Label className="mb-4 block">Distance Range (0-50 km)</Label>
        <Slider defaultValue={[10, 30]} max={50} step={5} />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>0 km</span>
          <span>50 km</span>
        </div>
      </div>
    </div>
  ),
};

/**
 * ## Form States
 * Error, success, and disabled states.
 */
export const FormStates: StoryObj = {
  render: () => (
    <div className="w-[350px] space-y-4">
      <FormField 
        label="Error State" 
        htmlFor="state-error" 
        error="This field is required"
        required
      >
        <Input id="state-error" className="border-destructive focus-visible:ring-destructive" />
      </FormField>
      
      <FormField 
        label="Success State" 
        htmlFor="state-success" 
        hint="✓ Username is available"
        required
      >
        <Input 
          id="state-success" 
          defaultValue="johndoe"
          className="border-success focus-visible:ring-success" 
        />
      </FormField>
      
      <FormField 
        label="With Hint" 
        htmlFor="state-hint" 
        hint="Must be at least 8 characters"
      >
        <Input id="state-hint" type="password" placeholder="Create password" />
      </FormField>
      
      <FormField label="Disabled State" htmlFor="state-disabled">
        <Input id="state-disabled" disabled defaultValue="Cannot edit" />
      </FormField>
    </div>
  ),
};
