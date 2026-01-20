import type { Meta, StoryObj } from "@storybook/react";
import { designTokens } from "@/design-system/tokens";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

const meta: Meta = {
  title: "Foundations/Design Tokens",
  parameters: {
    layout: "padded",
  },
};

export default meta;

const TokenValue = ({ name, value, type }: { name: string; value: string; type: string }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
      onClick={handleCopy}
    >
      <div className="flex items-center gap-3">
        {type === "color" && (
          <div 
            className="w-8 h-8 rounded-md border border-border"
            style={{ backgroundColor: value }}
          />
        )}
        {type === "spacing" && (
          <div 
            className="h-8 bg-primary/20 rounded"
            style={{ width: value }}
          />
        )}
        <div>
          <p className="font-mono text-sm font-medium text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{value}</p>
        </div>
      </div>
      {copied ? (
        <Check className="w-4 h-4 text-success" />
      ) : (
        <Copy className="w-4 h-4 text-muted-foreground" />
      )}
    </div>
  );
};

// Helper to extract color values from nested structure
const colorSamples = [
  { name: "color.green.500", value: "hsl(87, 52%, 47%)" },
  { name: "color.teal.500", value: "hsl(179, 53%, 50%)" },
  { name: "color.neutral.900", value: "hsl(220, 22%, 12%)" },
  { name: "color.neutral.0", value: "hsl(0, 0%, 100%)" },
  { name: "color.red.500", value: "hsl(0, 84%, 60%)" },
  { name: "color.amber.500", value: "hsl(38, 92%, 50%)" },
  { name: "color.emerald.500", value: "hsl(160, 84%, 39%)" },
  { name: "color.sky.500", value: "hsl(199, 89%, 48%)" },
];

const spacingSamples = [
  { name: "spacing.1", value: "0.25rem", desc: "4px" },
  { name: "spacing.2", value: "0.5rem", desc: "8px" },
  { name: "spacing.4", value: "1rem", desc: "16px" },
  { name: "spacing.6", value: "1.5rem", desc: "24px" },
  { name: "spacing.8", value: "2rem", desc: "32px" },
  { name: "spacing.12", value: "3rem", desc: "48px" },
  { name: "spacing.16", value: "4rem", desc: "64px" },
];

/**
 * ## Primitive Tokens
 * Raw design values that form the foundation of the system.
 * These are direct values without semantic meaning.
 */
export const Primitives: StoryObj = {
  render: () => (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Primitive Tokens (Layer 1)</h2>
        <p className="text-muted-foreground mb-6">
          Raw values that serve as the foundation. Never use primitives directly in components — 
          always reference through semantic tokens.
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4 text-foreground">Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {colorSamples.map((item) => (
            <TokenValue key={item.name} name={item.name} value={item.value} type="color" />
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4 text-foreground">Spacing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {spacingSamples.map((item) => (
            <TokenValue key={item.name} name={item.name} value={item.value} type="spacing" />
          ))}
        </div>
      </div>
    </div>
  ),
};

/**
 * ## Semantic Tokens
 * Intent-based tokens that provide meaning to the primitives.
 * These are what you use in your components.
 */
export const Semantics: StoryObj = {
  render: () => (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Semantic Tokens (Layer 2)</h2>
        <p className="text-muted-foreground mb-6">
          Intent-based tokens that give meaning to primitives. Use these in your components.
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4 text-foreground">Action Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 rounded-lg bg-primary text-primary-foreground">
            <p className="font-medium">action.primary</p>
            <p className="text-sm opacity-80">Primary actions, CTAs</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary text-secondary-foreground">
            <p className="font-medium">action.secondary</p>
            <p className="text-sm opacity-80">Secondary actions</p>
          </div>
          <div className="p-4 rounded-lg bg-destructive text-destructive-foreground">
            <p className="font-medium">action.destructive</p>
            <p className="text-sm opacity-80">Dangerous actions</p>
          </div>
          <div className="p-4 rounded-lg bg-muted text-muted-foreground">
            <p className="font-medium">action.muted</p>
            <p className="text-sm opacity-80">Subtle actions</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-foreground">Feedback Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-lg bg-success text-success-foreground text-center">
            <p className="font-medium">Success</p>
          </div>
          <div className="p-4 rounded-lg bg-warning text-warning-foreground text-center">
            <p className="font-medium">Warning</p>
          </div>
          <div className="p-4 rounded-lg bg-destructive text-destructive-foreground text-center">
            <p className="font-medium">Error</p>
          </div>
          <div className="p-4 rounded-lg bg-sky text-sky-foreground text-center">
            <p className="font-medium">Info</p>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * ## Component Tokens
 * Tokens specific to individual components, ensuring consistency.
 */
export const Components: StoryObj = {
  render: () => (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Component Tokens (Layer 3)</h2>
        <p className="text-muted-foreground mb-6">
          Component-specific tokens that define sizing, spacing, and styling for each UI element.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-border bg-card">
          <h3 className="font-semibold mb-4 text-foreground">Button Sizes</h3>
          <div className="space-y-2 font-mono text-sm">
            <p className="text-muted-foreground">button.size.sm → 32px</p>
            <p className="text-muted-foreground">button.size.default → 40px</p>
            <p className="text-muted-foreground">button.size.lg → 48px</p>
            <p className="text-muted-foreground">button.size.xl → 56px</p>
          </div>
        </div>
        
        <div className="p-6 rounded-xl border border-border bg-card">
          <h3 className="font-semibold mb-4 text-foreground">Card Styles</h3>
          <div className="space-y-2 font-mono text-sm">
            <p className="text-muted-foreground">card.padding → 24px</p>
            <p className="text-muted-foreground">card.radius → 16px</p>
            <p className="text-muted-foreground">card.shadow → shadow-card</p>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card">
          <h3 className="font-semibold mb-4 text-foreground">Input Styles</h3>
          <div className="space-y-2 font-mono text-sm">
            <p className="text-muted-foreground">input.height → 44px</p>
            <p className="text-muted-foreground">input.padding → 16px</p>
            <p className="text-muted-foreground">input.radius → 12px</p>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card">
          <h3 className="font-semibold mb-4 text-foreground">Badge Styles</h3>
          <div className="space-y-2 font-mono text-sm">
            <p className="text-muted-foreground">badge.padding.x → 12px</p>
            <p className="text-muted-foreground">badge.padding.y → 4px</p>
            <p className="text-muted-foreground">badge.radius → 9999px</p>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * ## Token Export
 * Machine-readable JSON export for tooling and AI agents.
 */
export const TokenExport: StoryObj = {
  render: () => (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Machine-Readable Export</h2>
        <p className="text-muted-foreground mb-6">
          Export tokens as JSON for use with AI agents, Style Dictionary, or other tooling.
        </p>
      </div>
      
      <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
        <code className="text-foreground">
{`import { designTokens } from "@/design-system/tokens";
import { exportAsJSON } from "@/design-system/export/tokens.json";

// Access tokens programmatically
const primaryColor = designTokens.primitives.color.primary.$value;

// Export for external tools
const jsonExport = exportAsJSON();
`}
        </code>
      </pre>

      <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
        <p className="text-sm text-foreground">
          <strong>💡 Tip:</strong> Use the{" "}
          <code className="px-1 py-0.5 bg-muted rounded text-xs">designTokens</code> export 
          to build AI-powered design tools that stay on-brand.
        </p>
      </div>
    </div>
  ),
};
