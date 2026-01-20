import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, InputWithIcon } from "@/components/ui/form-field";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Keyboard, 
  MousePointer2,
  Volume2,
  Palette,
  Type
} from "lucide-react";

const meta: Meta = {
  title: "Patterns/Accessibility",
  parameters: {
    layout: "padded",
  },
};

export default meta;

const WCAGItem = ({ 
  title, 
  description, 
  status, 
  wcagLevel 
}: { 
  title: string; 
  description: string; 
  status: "pass" | "fail" | "warning"; 
  wcagLevel: string;
}) => (
  <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border">
    <div className={`mt-0.5 ${
      status === "pass" ? "text-success" : 
      status === "fail" ? "text-destructive" : 
      "text-warning"
    }`}>
      {status === "pass" && <CheckCircle2 className="w-5 h-5" />}
      {status === "fail" && <XCircle className="w-5 h-5" />}
      {status === "warning" && <AlertTriangle className="w-5 h-5" />}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <h4 className="font-medium text-foreground">{title}</h4>
        <Badge variant="outline" className="text-xs">{wcagLevel}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

/**
 * ## WCAG 2.2 Compliance
 * Our design system is built with accessibility at its core.
 */
export const WCAGCompliance: StoryObj = {
  render: () => (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">WCAG 2.2 Compliance</h2>
        <p className="text-muted-foreground mb-6">
          SyndeoCare Design System targets WCAG 2.2 AA compliance. Below is an overview of 
          accessibility features built into every component.
        </p>
      </div>

      <div className="grid gap-3">
        <WCAGItem 
          title="Color Contrast"
          description="All text meets minimum 4.5:1 contrast ratio for normal text and 3:1 for large text."
          status="pass"
          wcagLevel="AA 1.4.3"
        />
        <WCAGItem 
          title="Focus Indicators"
          description="Visible focus rings on all interactive elements with 2px offset for clarity."
          status="pass"
          wcagLevel="AA 2.4.7"
        />
        <WCAGItem 
          title="Touch Targets"
          description="Minimum 44x44px touch targets for all interactive elements."
          status="pass"
          wcagLevel="AAA 2.5.5"
        />
        <WCAGItem 
          title="Form Labels"
          description="All form inputs have associated labels with proper htmlFor/id relationships."
          status="pass"
          wcagLevel="A 1.3.1"
        />
        <WCAGItem 
          title="Error Identification"
          description="Form errors are clearly identified with color, icons, and text descriptions."
          status="pass"
          wcagLevel="A 3.3.1"
        />
        <WCAGItem 
          title="Motion Preferences"
          description="Animations respect prefers-reduced-motion media query."
          status="pass"
          wcagLevel="AA 2.3.3"
        />
      </div>
    </div>
  ),
};

/**
 * ## Keyboard Navigation
 * All components are fully keyboard accessible.
 */
export const KeyboardNavigation: StoryObj = {
  render: () => (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Keyboard Navigation</h2>
        <p className="text-muted-foreground mb-6">
          All interactive elements can be accessed and operated using only a keyboard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-primary" />
            Keyboard Shortcuts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-start py-2 font-medium text-foreground">Key</th>
                <th className="text-start py-2 font-medium text-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b">
                <td className="py-3"><kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Tab</kbd></td>
                <td className="py-3 text-muted-foreground">Move focus to next interactive element</td>
              </tr>
              <tr className="border-b">
                <td className="py-3"><kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Shift + Tab</kbd></td>
                <td className="py-3 text-muted-foreground">Move focus to previous interactive element</td>
              </tr>
              <tr className="border-b">
                <td className="py-3"><kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Enter</kbd></td>
                <td className="py-3 text-muted-foreground">Activate buttons, submit forms</td>
              </tr>
              <tr className="border-b">
                <td className="py-3"><kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Space</kbd></td>
                <td className="py-3 text-muted-foreground">Toggle checkboxes, activate buttons</td>
              </tr>
              <tr className="border-b">
                <td className="py-3"><kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Escape</kbd></td>
                <td className="py-3 text-muted-foreground">Close modals, dismiss dropdowns</td>
              </tr>
              <tr>
                <td className="py-3"><kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Arrow Keys</kbd></td>
                <td className="py-3 text-muted-foreground">Navigate within components (tabs, menus)</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="font-semibold mb-4 text-foreground">Try It: Focus Navigation</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Use Tab to navigate through these elements. Notice the visible focus rings.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button>First Button</Button>
          <Button variant="outline">Second Button</Button>
          <Input className="w-48" placeholder="Input field" />
          <div className="flex items-center gap-2">
            <Checkbox id="kb-check" />
            <Label htmlFor="kb-check">Checkbox</Label>
          </div>
          <Button variant="hero">Last Button</Button>
        </div>
      </div>
    </div>
  ),
};

/**
 * ## ARIA Patterns
 * Proper ARIA attributes for screen reader support.
 */
export const ARIAPatterns: StoryObj = {
  render: () => (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">ARIA Patterns</h2>
        <p className="text-muted-foreground mb-6">
          Our components follow WAI-ARIA design patterns for screen reader compatibility.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-primary" />
              Form Field with ARIA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto mb-4">
              <code>{`<FormField 
  label="Email" 
  htmlFor="email" 
  error="Invalid email"
  required
>
  <Input 
    id="email"
    aria-invalid="true"
    aria-describedby="email-error"
  />
</FormField>

// Renders with:
// - aria-invalid for error state
// - aria-describedby linking to error message
// - aria-required for required fields`}</code>
            </pre>
            <FormField 
              label="Email Address" 
              htmlFor="aria-demo" 
              error="Please enter a valid email"
              required
            >
              <Input 
                id="aria-demo" 
                defaultValue="invalid"
                className="border-destructive"
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Visually Hidden Labels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto mb-4">
              <code>{`// For icon-only buttons, use sr-only class
<Button variant="ghost" size="icon">
  <Settings className="w-4 h-4" />
  <span className="sr-only">Open settings</span>
</Button>`}</code>
            </pre>
            <p className="text-sm text-muted-foreground">
              The <code className="px-1 py-0.5 bg-muted rounded text-xs">sr-only</code> class 
              hides content visually but keeps it accessible to screen readers.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
};

/**
 * ## Color Accessibility
 * Color contrast and color-blind friendly design.
 */
export const ColorAccessibility: StoryObj = {
  render: () => (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Color Accessibility</h2>
        <p className="text-muted-foreground mb-6">
          Colors are designed to meet contrast requirements and remain distinguishable for 
          users with color vision deficiencies.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Contrast Ratios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center gap-4">
              <div className="w-24 h-12 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">Text</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Primary on Background</p>
                <p className="text-sm text-muted-foreground">Ratio: 4.8:1 ✓ AA Pass</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 h-12 bg-foreground rounded flex items-center justify-center">
                <span className="text-background text-sm font-medium">Text</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Foreground on Background</p>
                <p className="text-sm text-muted-foreground">Ratio: 12.6:1 ✓ AAA Pass</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 h-12 bg-muted-foreground rounded flex items-center justify-center">
                <span className="text-background text-sm font-medium">Text</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Muted on Background</p>
                <p className="text-sm text-muted-foreground">Ratio: 4.5:1 ✓ AA Pass</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="p-6 rounded-xl bg-accent/10 border border-accent/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-accent mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground mb-1">Color is Not the Only Indicator</h4>
            <p className="text-sm text-muted-foreground">
              We never rely on color alone to convey information. Errors include icons and text, 
              status badges include descriptive labels, and interactive states have multiple 
              visual cues.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};
