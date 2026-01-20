import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Foundations/Colors",
  parameters: {
    layout: "padded",
  },
};

export default meta;

const ColorSwatch = ({ 
  name, 
  cssVar, 
  className, 
  textClass = "text-foreground" 
}: { 
  name: string; 
  cssVar: string; 
  className: string;
  textClass?: string;
}) => (
  <div className="flex flex-col gap-2">
    <div className={`w-full h-20 rounded-xl ${className} shadow-md flex items-center justify-center`}>
      <span className={`text-sm font-medium ${textClass}`}>{cssVar}</span>
    </div>
    <span className="text-sm font-medium text-foreground">{name}</span>
  </div>
);

const GradientSwatch = ({ name, className }: { name: string; className: string }) => (
  <div className="flex flex-col gap-2">
    <div className={`w-full h-24 rounded-xl ${className} shadow-lg`} />
    <span className="text-sm font-medium text-foreground">{name}</span>
  </div>
);

/**
 * ## Brand Colors
 * SyndeoCare's primary color palette built around Green (#7CB53D) and Teal (#3BC4C3).
 */
export const BrandColors: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Brand Colors</h2>
        <p className="text-muted-foreground mb-6">
          Primary Green represents growth and healthcare. Accent Teal adds energy and trust.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorSwatch 
            name="Primary Green" 
            cssVar="--primary" 
            className="bg-primary" 
            textClass="text-primary-foreground"
          />
          <ColorSwatch 
            name="Primary Foreground" 
            cssVar="--primary-foreground" 
            className="bg-primary-foreground border border-border" 
          />
          <ColorSwatch 
            name="Accent Teal" 
            cssVar="--accent" 
            className="bg-accent" 
            textClass="text-accent-foreground"
          />
          <ColorSwatch 
            name="Accent Foreground" 
            cssVar="--accent-foreground" 
            className="bg-accent-foreground border border-border" 
          />
        </div>
      </div>
    </div>
  ),
};

/**
 * ## Semantic Colors
 * Colors with specific meaning for UI states and feedback.
 */
export const SemanticColors: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Semantic Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorSwatch 
            name="Success" 
            cssVar="--success" 
            className="bg-success" 
            textClass="text-success-foreground"
          />
          <ColorSwatch 
            name="Warning" 
            cssVar="--warning" 
            className="bg-warning" 
            textClass="text-warning-foreground"
          />
          <ColorSwatch 
            name="Destructive" 
            cssVar="--destructive" 
            className="bg-destructive" 
            textClass="text-destructive-foreground"
          />
          <ColorSwatch 
            name="Sky Blue" 
            cssVar="--sky" 
            className="bg-sky" 
            textClass="text-sky-foreground"
          />
        </div>
      </div>
    </div>
  ),
};

/**
 * ## Neutral Colors
 * Background, foreground, and muted colors for UI structure.
 */
export const NeutralColors: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Neutral Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorSwatch 
            name="Background" 
            cssVar="--background" 
            className="bg-background border border-border" 
          />
          <ColorSwatch 
            name="Foreground" 
            cssVar="--foreground" 
            className="bg-foreground" 
            textClass="text-background"
          />
          <ColorSwatch 
            name="Card" 
            cssVar="--card" 
            className="bg-card border border-border" 
          />
          <ColorSwatch 
            name="Muted" 
            cssVar="--muted" 
            className="bg-muted" 
          />
          <ColorSwatch 
            name="Muted Foreground" 
            cssVar="--muted-foreground" 
            className="bg-muted-foreground" 
            textClass="text-background"
          />
          <ColorSwatch 
            name="Secondary" 
            cssVar="--secondary" 
            className="bg-secondary" 
          />
          <ColorSwatch 
            name="Border" 
            cssVar="--border" 
            className="bg-border" 
          />
          <ColorSwatch 
            name="Ring" 
            cssVar="--ring" 
            className="bg-ring" 
            textClass="text-white"
          />
        </div>
      </div>
    </div>
  ),
};

/**
 * ## Gradients
 * Brand gradients for hero sections, buttons, and special elements.
 */
export const Gradients: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Gradients</h2>
        <p className="text-muted-foreground mb-6">
          Use gradients for emphasis and visual hierarchy.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GradientSwatch name="Primary Gradient" className="gradient-primary" />
          <GradientSwatch name="Accent Gradient" className="gradient-accent" />
          <GradientSwatch name="Brand Gradient" className="gradient-brand" />
          <GradientSwatch name="Hero Gradient" className="gradient-hero" />
          <GradientSwatch name="Sky Gradient" className="gradient-sky" />
        </div>
      </div>
    </div>
  ),
};

/**
 * ## Sidebar Colors
 * Dark theme colors for navigation sidebar.
 */
export const SidebarColors: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Sidebar Colors</h2>
        <p className="text-muted-foreground mb-6">
          Dark professional theme for navigation elements.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorSwatch 
            name="Sidebar Background" 
            cssVar="--sidebar-background" 
            className="bg-sidebar" 
            textClass="text-sidebar-foreground"
          />
          <ColorSwatch 
            name="Sidebar Foreground" 
            cssVar="--sidebar-foreground" 
            className="bg-sidebar-foreground" 
            textClass="text-sidebar"
          />
          <ColorSwatch 
            name="Sidebar Primary" 
            cssVar="--sidebar-primary" 
            className="bg-sidebar-primary" 
            textClass="text-sidebar-primary-foreground"
          />
          <ColorSwatch 
            name="Sidebar Accent" 
            cssVar="--sidebar-accent" 
            className="bg-sidebar-accent" 
            textClass="text-sidebar-accent-foreground"
          />
        </div>
      </div>
    </div>
  ),
};

/**
 * ## Dark Mode Preview
 * Preview of how colors adapt in dark mode.
 */
export const DarkModePreview: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Dark Mode Preview</h2>
        <p className="text-muted-foreground mb-6">
          Toggle dark mode in Storybook toolbar to see color adaptations.
        </p>
        <div className="dark p-6 rounded-2xl bg-background border border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorSwatch 
              name="Primary (Dark)" 
              cssVar="hsl(87, 60%, 55%)" 
              className="bg-primary" 
              textClass="text-primary-foreground"
            />
            <ColorSwatch 
              name="Accent (Dark)" 
              cssVar="hsl(179, 55%, 55%)" 
              className="bg-accent" 
              textClass="text-accent-foreground"
            />
            <ColorSwatch 
              name="Background (Dark)" 
              cssVar="hsl(220, 20%, 8%)" 
              className="bg-background border border-border" 
              textClass="text-foreground"
            />
            <ColorSwatch 
              name="Card (Dark)" 
              cssVar="hsl(220, 18%, 11%)" 
              className="bg-card border border-border" 
              textClass="text-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  ),
};
