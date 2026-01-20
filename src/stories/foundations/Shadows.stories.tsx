import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Foundations/Shadows",
  parameters: {
    layout: "padded",
  },
};

export default meta;

const ShadowCard = ({ name, className, cssVar }: { name: string; className: string; cssVar: string }) => (
  <div className="flex flex-col items-center gap-3">
    <div className={`w-32 h-32 bg-card rounded-xl ${className} flex items-center justify-center`}>
      <span className="text-xs text-muted-foreground text-center px-2">{cssVar}</span>
    </div>
    <span className="text-sm font-medium text-foreground">{name}</span>
  </div>
);

/**
 * ## Shadow Scale
 * Elevation system using shadows for visual hierarchy.
 */
export const ShadowScale: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Shadow Scale</h2>
        <p className="text-muted-foreground mb-6">
          Use shadows to create depth and establish visual hierarchy.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-4">
          <ShadowCard name="Small" className="shadow-sm" cssVar="--shadow-sm" />
          <ShadowCard name="Medium" className="shadow-md" cssVar="--shadow-md" />
          <ShadowCard name="Large" className="shadow-lg" cssVar="--shadow-lg" />
          <ShadowCard name="Extra Large" className="shadow-xl" cssVar="--shadow-xl" />
        </div>
      </div>
    </div>
  ),
};

/**
 * ## Card Shadows
 * Specialized shadows for card components with hover states.
 */
export const CardShadows: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Card Shadows</h2>
        <p className="text-muted-foreground mb-6">
          Custom shadow for cards with subtle elevation.
        </p>
        <div className="flex gap-8 items-center py-4">
          <div className="flex flex-col items-center gap-3">
            <div className="w-48 h-32 bg-card rounded-xl shadow-card border border-border flex items-center justify-center">
              <span className="text-sm text-muted-foreground">Default</span>
            </div>
            <span className="text-sm font-medium text-foreground">.shadow-card</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-48 h-32 bg-card rounded-xl shadow-card-hover border border-border flex items-center justify-center">
              <span className="text-sm text-muted-foreground">Hover</span>
            </div>
            <span className="text-sm font-medium text-foreground">.shadow-card-hover</span>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * ## Glow Effects
 * Brand-colored glow shadows for emphasis.
 */
export const GlowEffects: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Glow Effects</h2>
        <p className="text-muted-foreground mb-6">
          Use glow shadows to highlight important elements.
        </p>
        <div className="flex gap-8 items-center py-4">
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-32 bg-card rounded-xl shadow-glow flex items-center justify-center border border-primary/20">
              <span className="text-sm text-primary font-medium">Primary</span>
            </div>
            <span className="text-sm font-medium text-foreground">.shadow-glow</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-32 bg-card rounded-xl shadow-glow-teal flex items-center justify-center border border-accent/20">
              <span className="text-sm text-accent font-medium">Teal</span>
            </div>
            <span className="text-sm font-medium text-foreground">.shadow-glow-teal</span>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * ## Border Radius
 * Consistent border radius values for rounded corners.
 */
export const BorderRadius: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Border Radius</h2>
        <div className="flex gap-6 items-end py-4 flex-wrap">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-primary rounded-sm" />
            <span className="text-xs text-muted-foreground">rounded-sm</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-primary rounded-md" />
            <span className="text-xs text-muted-foreground">rounded-md</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-primary rounded-lg" />
            <span className="text-xs text-muted-foreground">rounded-lg</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-primary rounded-xl" />
            <span className="text-xs text-muted-foreground">rounded-xl</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-primary rounded-2xl" />
            <span className="text-xs text-muted-foreground">rounded-2xl</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-primary rounded-3xl" />
            <span className="text-xs text-muted-foreground">rounded-3xl</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-primary rounded-full" />
            <span className="text-xs text-muted-foreground">rounded-full</span>
          </div>
        </div>
      </div>
    </div>
  ),
};
