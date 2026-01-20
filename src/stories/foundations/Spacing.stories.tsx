import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Foundations/Spacing",
  parameters: {
    layout: "padded",
  },
};

export default meta;

const SpacingBlock = ({ size, pixels, className }: { size: string; pixels: string; className: string }) => (
  <div className="flex items-center gap-4">
    <span className="text-xs text-muted-foreground font-mono w-16">{size}</span>
    <div className={`${className} bg-primary rounded`} style={{ height: "24px" }} />
    <span className="text-sm text-muted-foreground">{pixels}</span>
  </div>
);

/**
 * ## Spacing Scale
 * Consistent spacing values based on 4px grid system.
 */
export const SpacingScale: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Spacing Scale</h2>
        <p className="text-muted-foreground mb-6">
          All spacing values are based on a 4px grid system for visual consistency.
        </p>
        <div className="space-y-3 max-w-lg">
          <SpacingBlock size="0.5" pixels="2px" className="w-0.5" />
          <SpacingBlock size="1" pixels="4px" className="w-1" />
          <SpacingBlock size="2" pixels="8px" className="w-2" />
          <SpacingBlock size="3" pixels="12px" className="w-3" />
          <SpacingBlock size="4" pixels="16px" className="w-4" />
          <SpacingBlock size="5" pixels="20px" className="w-5" />
          <SpacingBlock size="6" pixels="24px" className="w-6" />
          <SpacingBlock size="8" pixels="32px" className="w-8" />
          <SpacingBlock size="10" pixels="40px" className="w-10" />
          <SpacingBlock size="12" pixels="48px" className="w-12" />
          <SpacingBlock size="16" pixels="64px" className="w-16" />
          <SpacingBlock size="20" pixels="80px" className="w-20" />
          <SpacingBlock size="24" pixels="96px" className="w-24" />
        </div>
      </div>
    </div>
  ),
};

/**
 * ## Touch Targets
 * Minimum touch target sizes for mobile accessibility (44px minimum).
 */
export const TouchTargets: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Touch Targets</h2>
        <p className="text-muted-foreground mb-6">
          All interactive elements must meet minimum 44x44px touch targets for accessibility.
        </p>
        <div className="flex gap-6 items-end">
          <div className="flex flex-col items-center gap-2">
            <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center text-primary-foreground text-xs font-medium">
              44px
            </div>
            <span className="text-xs text-muted-foreground">min-h-touch</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-accent-foreground text-xs font-medium">
              48px
            </div>
            <span className="text-xs text-muted-foreground">min-h-touch-lg</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-success rounded-xl flex items-center justify-center text-success-foreground text-xs font-medium">
              56px
            </div>
            <span className="text-xs text-muted-foreground">h-14</span>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * ## Container Widths
 * Maximum container widths for content layout.
 */
export const ContainerWidths: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Container Widths</h2>
        <div className="space-y-4">
          <div>
            <span className="text-xs text-muted-foreground font-mono">max-w-md (448px)</span>
            <div className="w-full max-w-md h-8 bg-muted rounded mt-1" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-mono">max-w-lg (512px)</span>
            <div className="w-full max-w-lg h-8 bg-muted rounded mt-1" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-mono">max-w-xl (576px)</span>
            <div className="w-full max-w-xl h-8 bg-muted rounded mt-1" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-mono">max-w-2xl (672px)</span>
            <div className="w-full max-w-2xl h-8 bg-muted rounded mt-1" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-mono">container (1400px)</span>
            <div className="w-full max-w-[1400px] h-8 bg-primary/20 rounded mt-1" />
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * ## Section Spacing
 * Vertical spacing patterns for page sections.
 */
export const SectionSpacing: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Section Spacing</h2>
        <p className="text-muted-foreground mb-6">
          Consistent vertical rhythm for page sections.
        </p>
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="bg-muted p-4 flex items-center justify-center">
            <span className="text-sm text-muted-foreground">Header</span>
          </div>
          <div className="py-16 md:py-24 bg-background flex items-center justify-center border-y border-border">
            <div className="text-center">
              <span className="text-sm text-muted-foreground">Hero Section</span>
              <p className="text-xs text-muted-foreground mt-1">py-16 md:py-24</p>
            </div>
          </div>
          <div className="py-12 md:py-16 bg-muted flex items-center justify-center">
            <div className="text-center">
              <span className="text-sm text-muted-foreground">Content Section</span>
              <p className="text-xs text-muted-foreground mt-1">py-12 md:py-16</p>
            </div>
          </div>
          <div className="py-8 md:py-12 bg-background flex items-center justify-center border-t border-border">
            <div className="text-center">
              <span className="text-sm text-muted-foreground">Compact Section</span>
              <p className="text-xs text-muted-foreground mt-1">py-8 md:py-12</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * ## Gap System
 * Consistent gap values for flexbox and grid layouts.
 */
export const GapSystem: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Gap System</h2>
        <div className="space-y-6">
          <div>
            <span className="text-xs text-muted-foreground font-mono mb-2 block">gap-2 (8px)</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 bg-primary rounded" />
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-mono mb-2 block">gap-4 (16px)</span>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 bg-accent rounded" />
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-mono mb-2 block">gap-6 (24px)</span>
            <div className="flex gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 bg-success rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};
