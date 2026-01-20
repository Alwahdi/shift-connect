import type { Meta, StoryObj } from "@storybook/react";

const ColorSwatch = ({ name, cssVar, hex }: { name: string; cssVar: string; hex: string }) => (
  <div className="flex items-center gap-4 p-3 rounded-lg border">
    <div 
      className="w-12 h-12 rounded-lg shadow-inner" 
      style={{ backgroundColor: `hsl(var(${cssVar}))` }}
    />
    <div>
      <p className="font-medium">{name}</p>
      <p className="text-sm text-muted-foreground">{cssVar}</p>
      <p className="text-xs font-mono text-muted-foreground">{hex}</p>
    </div>
  </div>
);

const GradientSwatch = ({ name, cssVar }: { name: string; cssVar: string }) => (
  <div className="flex items-center gap-4 p-3 rounded-lg border">
    <div 
      className="w-24 h-12 rounded-lg shadow-inner" 
      style={{ background: `var(${cssVar})` }}
    />
    <div>
      <p className="font-medium">{name}</p>
      <p className="text-sm text-muted-foreground">{cssVar}</p>
    </div>
  </div>
);

const meta = {
  title: "Design System/Colors",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const BrandColors: Story = {
  render: () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Brand Colors</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ColorSwatch name="Primary (Green)" cssVar="--primary" hex="#7CB53D" />
        <ColorSwatch name="Secondary (Teal)" cssVar="--secondary" hex="#3BC4C3" />
        <ColorSwatch name="Accent" cssVar="--accent" hex="#3BC4C3" />
      </div>
    </div>
  ),
};

export const SemanticColors: Story = {
  render: () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Semantic Colors</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ColorSwatch name="Background" cssVar="--background" hex="#FFFFFF" />
        <ColorSwatch name="Foreground" cssVar="--foreground" hex="#1A1A2E" />
        <ColorSwatch name="Muted" cssVar="--muted" hex="#F5F5F5" />
        <ColorSwatch name="Muted Foreground" cssVar="--muted-foreground" hex="#6B7280" />
        <ColorSwatch name="Border" cssVar="--border" hex="#E5E7EB" />
        <ColorSwatch name="Ring" cssVar="--ring" hex="#7CB53D" />
      </div>
    </div>
  ),
};

export const StatusColors: Story = {
  render: () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Status Colors</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ColorSwatch name="Destructive" cssVar="--destructive" hex="#EF4444" />
        <div className="flex items-center gap-4 p-3 rounded-lg border">
          <div className="w-12 h-12 rounded-lg shadow-inner bg-green-500" />
          <div>
            <p className="font-medium">Success</p>
            <p className="text-sm text-muted-foreground">green-500</p>
            <p className="text-xs font-mono text-muted-foreground">#22C55E</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-3 rounded-lg border">
          <div className="w-12 h-12 rounded-lg shadow-inner bg-yellow-500" />
          <div>
            <p className="font-medium">Warning</p>
            <p className="text-sm text-muted-foreground">yellow-500</p>
            <p className="text-xs font-mono text-muted-foreground">#EAB308</p>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const Gradients: Story = {
  render: () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gradients</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GradientSwatch name="Primary Gradient" cssVar="--gradient-primary" />
        <GradientSwatch name="Secondary Gradient" cssVar="--gradient-secondary" />
        <GradientSwatch name="Brand Gradient" cssVar="--gradient-brand" />
        <GradientSwatch name="Hero Gradient" cssVar="--gradient-hero" />
        <GradientSwatch name="Sky Gradient" cssVar="--gradient-sky" />
        <GradientSwatch name="Accent Gradient" cssVar="--gradient-accent" />
      </div>
    </div>
  ),
};

export const DarkModeColors: Story = {
  render: () => (
    <div className="space-y-6 dark bg-background p-6 rounded-xl">
      <h2 className="text-2xl font-bold text-foreground">Dark Mode Colors</h2>
      <p className="text-muted-foreground">Preview of dark mode color scheme</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 p-3 rounded-lg border border-border">
          <div className="w-12 h-12 rounded-lg shadow-inner bg-[#1A1A2E]" />
          <div>
            <p className="font-medium text-foreground">Background</p>
            <p className="text-sm text-muted-foreground">#1A1A2E</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-3 rounded-lg border border-border">
          <div className="w-12 h-12 rounded-lg shadow-inner bg-[#F5F5F5]" />
          <div>
            <p className="font-medium text-foreground">Foreground</p>
            <p className="text-sm text-muted-foreground">#F5F5F5</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-3 rounded-lg border border-border">
          <div className="w-12 h-12 rounded-lg shadow-inner bg-[#2D2D44]" />
          <div>
            <p className="font-medium text-foreground">Card</p>
            <p className="text-sm text-muted-foreground">#2D2D44</p>
          </div>
        </div>
      </div>
    </div>
  ),
};
