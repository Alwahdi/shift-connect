import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Design System/Typography",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Headings: Story = {
  render: () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold border-b pb-2">Headings (DM Sans)</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">H1 - 4xl/5xl (36px/48px)</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            The quick brown fox jumps
          </h1>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">H2 - 3xl (30px)</p>
          <h2 className="text-3xl font-bold tracking-tight">
            The quick brown fox jumps
          </h2>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">H3 - 2xl (24px)</p>
          <h3 className="text-2xl font-semibold tracking-tight">
            The quick brown fox jumps
          </h3>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">H4 - xl (20px)</p>
          <h4 className="text-xl font-semibold tracking-tight">
            The quick brown fox jumps
          </h4>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">H5 - lg (18px)</p>
          <h5 className="text-lg font-medium">
            The quick brown fox jumps
          </h5>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">H6 - base (16px)</p>
          <h6 className="text-base font-medium">
            The quick brown fox jumps
          </h6>
        </div>
      </div>
    </div>
  ),
};

export const BodyText: Story = {
  render: () => (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold border-b pb-2">Body Text</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Large (18px)</p>
          <p className="text-lg">
            SyndeoCare connects healthcare professionals with clinics for flexible shift work. 
            Our platform makes it easy to find opportunities that match your skills and schedule.
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Base (16px)</p>
          <p className="text-base">
            SyndeoCare connects healthcare professionals with clinics for flexible shift work. 
            Our platform makes it easy to find opportunities that match your skills and schedule.
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Small (14px)</p>
          <p className="text-sm">
            SyndeoCare connects healthcare professionals with clinics for flexible shift work. 
            Our platform makes it easy to find opportunities that match your skills and schedule.
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Extra Small (12px)</p>
          <p className="text-xs">
            SyndeoCare connects healthcare professionals with clinics for flexible shift work. 
            Our platform makes it easy to find opportunities that match your skills and schedule.
          </p>
        </div>
      </div>
    </div>
  ),
};

export const ArabicTypography: Story = {
  render: () => (
    <div className="space-y-6 max-w-2xl" dir="rtl">
      <h2 className="text-2xl font-bold border-b pb-2 font-cairo">الطباعة العربية (Cairo)</h2>
      <div className="space-y-4 font-cairo">
        <div>
          <p className="text-sm text-muted-foreground mb-1">عنوان كبير</p>
          <h1 className="text-4xl font-bold">
            سينديوكير للرعاية الصحية
          </h1>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">عنوان متوسط</p>
          <h2 className="text-2xl font-semibold">
            نربط المتخصصين بالعيادات
          </h2>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">نص عادي</p>
          <p className="text-base leading-relaxed">
            سينديوكير يربط متخصصي الرعاية الصحية بالعيادات للعمل المرن. 
            منصتنا تسهل العثور على فرص تتناسب مع مهاراتك وجدولك الزمني.
          </p>
        </div>
      </div>
    </div>
  ),
};

export const TextStyles: Story = {
  render: () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold border-b pb-2">Text Styles</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Muted</p>
          <p className="text-muted-foreground">This is muted text for secondary information</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Primary Color</p>
          <p className="text-primary font-medium">This text uses the primary green color</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Secondary Color</p>
          <p className="text-secondary-foreground font-medium">This text uses secondary styling</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Gradient Text</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Beautiful Gradient Text
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Link Style</p>
          <a href="#" className="text-primary hover:underline">This is a link style</a>
        </div>
      </div>
    </div>
  ),
};

export const FontWeights: Story = {
  render: () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold border-b pb-2">Font Weights</h2>
      <div className="space-y-3 text-xl">
        <p className="font-light">Light (300)</p>
        <p className="font-normal">Normal (400)</p>
        <p className="font-medium">Medium (500)</p>
        <p className="font-semibold">Semibold (600)</p>
        <p className="font-bold">Bold (700)</p>
      </div>
    </div>
  ),
};
