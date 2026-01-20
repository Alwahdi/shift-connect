import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Foundations/Typography",
  parameters: {
    layout: "padded",
  },
};

export default meta;

/**
 * ## Heading Scale
 * Responsive heading styles using DM Sans font family.
 */
export const HeadingScale: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-muted-foreground mb-6">Heading Scale</h2>
        <div className="space-y-6">
          <div className="border-b border-border pb-4">
            <span className="text-xs text-muted-foreground font-mono">.heading-1 / text-6xl</span>
            <h1 className="heading-1">The quick brown fox</h1>
          </div>
          <div className="border-b border-border pb-4">
            <span className="text-xs text-muted-foreground font-mono">.heading-2 / text-5xl</span>
            <h2 className="heading-2">The quick brown fox</h2>
          </div>
          <div className="border-b border-border pb-4">
            <span className="text-xs text-muted-foreground font-mono">.heading-3 / text-3xl</span>
            <h3 className="heading-3">The quick brown fox</h3>
          </div>
          <div className="border-b border-border pb-4">
            <span className="text-xs text-muted-foreground font-mono">.heading-4 / text-xl</span>
            <h4 className="heading-4">The quick brown fox</h4>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * ## Body Text
 * Body text styles with different sizes and colors.
 */
export const BodyText: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-muted-foreground mb-6">Body Text Styles</h2>
        <div className="space-y-6">
          <div className="border-b border-border pb-4">
            <span className="text-xs text-muted-foreground font-mono">.body-large / text-xl</span>
            <p className="body-large">
              SyndeoCare connects healthcare professionals with clinics seamlessly. 
              Our platform streamlines the staffing process for everyone involved.
            </p>
          </div>
          <div className="border-b border-border pb-4">
            <span className="text-xs text-muted-foreground font-mono">.body-default / text-base</span>
            <p className="body-default">
              SyndeoCare connects healthcare professionals with clinics seamlessly. 
              Our platform streamlines the staffing process for everyone involved.
            </p>
          </div>
          <div className="border-b border-border pb-4">
            <span className="text-xs text-muted-foreground font-mono">.body-small / text-sm</span>
            <p className="body-small">
              SyndeoCare connects healthcare professionals with clinics seamlessly. 
              Our platform streamlines the staffing process for everyone involved.
            </p>
          </div>
          <div className="border-b border-border pb-4">
            <span className="text-xs text-muted-foreground font-mono">.caption / text-xs</span>
            <p className="caption">
              Last updated: January 20, 2026 • Terms and conditions apply
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * ## Arabic Typography
 * Arabic text using Cairo font family with RTL support.
 */
export const ArabicTypography: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-muted-foreground mb-6">Arabic Typography (Cairo)</h2>
        <div dir="rtl" className="space-y-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
          <div className="border-b border-border pb-4">
            <span className="text-xs text-muted-foreground font-mono" dir="ltr">Heading - Arabic</span>
            <h1 className="text-4xl font-bold text-foreground">سينديوكير للرعاية الصحية</h1>
          </div>
          <div className="border-b border-border pb-4">
            <span className="text-xs text-muted-foreground font-mono" dir="ltr">Body - Arabic</span>
            <p className="text-lg text-muted-foreground leading-relaxed">
              نربط المتخصصين في الرعاية الصحية بالعيادات بسلاسة. 
              منصتنا تبسط عملية التوظيف للجميع.
            </p>
          </div>
          <div className="border-b border-border pb-4">
            <span className="text-xs text-muted-foreground font-mono" dir="ltr">Small - Arabic</span>
            <p className="text-sm text-muted-foreground">
              آخر تحديث: ٢٠ يناير ٢٠٢٦ • تطبق الشروط والأحكام
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * ## Font Weights
 * Available font weights in DM Sans.
 */
export const FontWeights: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-muted-foreground mb-6">Font Weights</h2>
        <div className="space-y-4">
          <div className="flex items-baseline gap-4 border-b border-border pb-3">
            <span className="text-xs text-muted-foreground font-mono w-24">font-light</span>
            <span className="text-2xl font-light text-foreground">SyndeoCare</span>
          </div>
          <div className="flex items-baseline gap-4 border-b border-border pb-3">
            <span className="text-xs text-muted-foreground font-mono w-24">font-normal</span>
            <span className="text-2xl font-normal text-foreground">SyndeoCare</span>
          </div>
          <div className="flex items-baseline gap-4 border-b border-border pb-3">
            <span className="text-xs text-muted-foreground font-mono w-24">font-medium</span>
            <span className="text-2xl font-medium text-foreground">SyndeoCare</span>
          </div>
          <div className="flex items-baseline gap-4 border-b border-border pb-3">
            <span className="text-xs text-muted-foreground font-mono w-24">font-semibold</span>
            <span className="text-2xl font-semibold text-foreground">SyndeoCare</span>
          </div>
          <div className="flex items-baseline gap-4 border-b border-border pb-3">
            <span className="text-xs text-muted-foreground font-mono w-24">font-bold</span>
            <span className="text-2xl font-bold text-foreground">SyndeoCare</span>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * ## Text Colors
 * Text color utilities using semantic tokens.
 */
export const TextColors: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-muted-foreground mb-6">Text Colors</h2>
        <div className="space-y-3">
          <p className="text-lg text-foreground">text-foreground — Primary text color</p>
          <p className="text-lg text-muted-foreground">text-muted-foreground — Secondary text</p>
          <p className="text-lg text-primary">text-primary — Brand green</p>
          <p className="text-lg text-accent">text-accent — Brand teal</p>
          <p className="text-lg text-success">text-success — Success state</p>
          <p className="text-lg text-warning">text-warning — Warning state</p>
          <p className="text-lg text-destructive">text-destructive — Error state</p>
        </div>
      </div>
    </div>
  ),
};

/**
 * ## Gradient Text
 * Gradient text effects for headings and highlights.
 */
export const GradientText: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-muted-foreground mb-6">Gradient Text</h2>
        <div className="space-y-6">
          <div>
            <span className="text-xs text-muted-foreground font-mono">.text-gradient-primary</span>
            <h1 className="text-4xl font-bold text-gradient-primary">Healthcare Reimagined</h1>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-mono">.text-gradient-brand</span>
            <h1 className="text-4xl font-bold text-gradient-brand">From Green to Teal</h1>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-mono">.text-gradient-accent</span>
            <h1 className="text-4xl font-bold text-gradient-accent">Accent Highlight</h1>
          </div>
        </div>
      </div>
    </div>
  ),
};
