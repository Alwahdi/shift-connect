import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  Palette, Type, Ruler, Layers, MousePointer2, Layout, Square, 
  FormInput, Bell, MessageSquare, ChevronRight, Sun, Moon, Copy, Check,
  Menu, X, Home, Loader2, Heart, Star, AlertCircle, CheckCircle2,
  XCircle, Clock, MapPin, DollarSign, User, Phone, Mail, Search,
  FileText, Settings, Eye, Upload, Download, Trash2, Edit, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormField, InputWithIcon } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { LoadingButton } from "@/components/ui/loading-button";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { toast } from "sonner";

// Navigation structure
const navigation = [
  {
    category: "Foundations",
    items: [
      { id: "colors", label: "Colors", icon: Palette },
      { id: "typography", label: "Typography", icon: Type },
      { id: "spacing", label: "Spacing", icon: Ruler },
      { id: "shadows", label: "Shadows & Effects", icon: Layers },
    ],
  },
  {
    category: "Components",
    items: [
      { id: "buttons", label: "Buttons", icon: MousePointer2 },
      { id: "cards", label: "Cards", icon: Layout },
      { id: "badges", label: "Badges", icon: Square },
      { id: "inputs", label: "Form Inputs", icon: FormInput },
      { id: "feedback", label: "Feedback", icon: Bell },
      { id: "data-display", label: "Data Display", icon: FileText },
    ],
  },
  {
    category: "Patterns",
    items: [
      { id: "forms", label: "Forms", icon: Settings },
      { id: "loading", label: "Loading States", icon: Loader2 },
    ],
  },
];

// Color Swatch Component
const ColorSwatch = ({ name, variable, hex, className }: { name: string; variable: string; hex: string; className?: string }) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(variable);
    setCopied(true);
    toast.success(`Copied ${variable}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="group cursor-pointer"
      onClick={copyToClipboard}
    >
      <div 
        className={cn(
          "h-20 rounded-xl mb-3 ring-1 ring-border/50 transition-all",
          "group-hover:ring-2 group-hover:ring-primary/50 group-hover:scale-105",
          className
        )}
        style={{ backgroundColor: `hsl(var(${variable}))` }}
      />
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">{name}</p>
          <p className="text-xs text-muted-foreground font-mono">{variable}</p>
        </div>
        {copied ? (
          <Check className="w-4 h-4 text-success" />
        ) : (
          <Copy className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </div>
  );
};

// Section Component
const Section = ({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) => (
  <section id={id} className="scroll-mt-8">
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
    {children}
  </section>
);

// Subsection Component
const Subsection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-10">
    <h3 className="text-lg font-semibold mb-4 pb-2 border-b">{title}</h3>
    {children}
  </div>
);

// Code Preview Component
const CodePreview = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  
  return (
    <div className="relative mt-4">
      <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </Button>
    </div>
  );
};

export default function DesignSystem() {
  const [activeSection, setActiveSection] = useState("colors");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme } = useTheme();

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div>
                <h1 className="font-bold text-lg">SyndeoCare</h1>
                <p className="text-xs text-muted-foreground">Design System v1.0</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild>
              <a href="/">
                <Home className="w-4 h-4 me-2" />
                Back to App
              </a>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside 
          className={cn(
            "fixed lg:sticky top-16 h-[calc(100vh-4rem)] bg-card border-e z-40",
            "transition-all duration-300",
            sidebarOpen ? "w-64" : "w-0 lg:w-64 overflow-hidden"
          )}
        >
          <ScrollArea className="h-full py-6">
            <nav className="px-4 space-y-6">
              {navigation.map((group) => (
                <div key={group.category}>
                  <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.category}
                  </h3>
                  <ul className="space-y-1">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => scrollToSection(item.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                            activeSection === item.id
                              ? "bg-primary text-primary-foreground font-medium"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-1 min-w-0 transition-all duration-300",
          sidebarOpen ? "lg:ps-0" : "lg:ps-0"
        )}>
          <div className="max-w-5xl mx-auto px-6 py-10 space-y-20">
            
            {/* ==================== COLORS ==================== */}
            <Section 
              id="colors" 
              title="Colors"
              description="SyndeoCare's color system is built on Green and Teal, representing healthcare trust and growth."
            >
              <Subsection title="Brand Colors">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <ColorSwatch name="Primary Green" variable="--primary" hex="#7CB53D" />
                  <ColorSwatch name="Accent Teal" variable="--accent" hex="#3BC4C3" />
                  <ColorSwatch name="Success" variable="--success" hex="#10B981" />
                  <ColorSwatch name="Warning" variable="--warning" hex="#F59E0B" />
                </div>
              </Subsection>

              <Subsection title="Semantic Colors">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <ColorSwatch name="Background" variable="--background" hex="#FFFFFF" />
                  <ColorSwatch name="Foreground" variable="--foreground" hex="#1E2939" />
                  <ColorSwatch name="Card" variable="--card" hex="#FFFFFF" />
                  <ColorSwatch name="Muted" variable="--muted" hex="#F4F5F4" />
                  <ColorSwatch name="Border" variable="--border" hex="#E5E7E5" />
                  <ColorSwatch name="Secondary" variable="--secondary" hex="#F0F5E9" />
                  <ColorSwatch name="Destructive" variable="--destructive" hex="#EF4444" />
                  <ColorSwatch name="Sky" variable="--sky" hex="#0EA5E9" />
                </div>
              </Subsection>

              <Subsection title="Gradients">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <div className="h-24 rounded-xl gradient-primary mb-3" />
                    <p className="font-medium text-sm">Primary Gradient</p>
                    <p className="text-xs text-muted-foreground font-mono">.gradient-primary</p>
                  </div>
                  <div>
                    <div className="h-24 rounded-xl gradient-accent mb-3" />
                    <p className="font-medium text-sm">Accent Gradient</p>
                    <p className="text-xs text-muted-foreground font-mono">.gradient-accent</p>
                  </div>
                  <div>
                    <div className="h-24 rounded-xl gradient-brand mb-3" />
                    <p className="font-medium text-sm">Brand Gradient</p>
                    <p className="text-xs text-muted-foreground font-mono">.gradient-brand</p>
                  </div>
                  <div>
                    <div className="h-24 rounded-xl gradient-hero mb-3" />
                    <p className="font-medium text-sm">Hero Gradient</p>
                    <p className="text-xs text-muted-foreground font-mono">.gradient-hero</p>
                  </div>
                  <div>
                    <div className="h-24 rounded-xl gradient-sky mb-3" />
                    <p className="font-medium text-sm">Sky Gradient</p>
                    <p className="text-xs text-muted-foreground font-mono">.gradient-sky</p>
                  </div>
                </div>
              </Subsection>

              <Subsection title="Sidebar Colors (Dark)">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-2xl bg-sidebar">
                  <div>
                    <div className="h-16 rounded-lg mb-2" style={{ backgroundColor: 'hsl(var(--sidebar-background))' }} />
                    <p className="font-medium text-sm text-sidebar-foreground">Sidebar BG</p>
                  </div>
                  <div>
                    <div className="h-16 rounded-lg mb-2" style={{ backgroundColor: 'hsl(var(--sidebar-primary))' }} />
                    <p className="font-medium text-sm text-sidebar-foreground">Sidebar Primary</p>
                  </div>
                  <div>
                    <div className="h-16 rounded-lg mb-2" style={{ backgroundColor: 'hsl(var(--sidebar-accent))' }} />
                    <p className="font-medium text-sm text-sidebar-foreground">Sidebar Accent</p>
                  </div>
                  <div>
                    <div className="h-16 rounded-lg mb-2 border" style={{ backgroundColor: 'hsl(var(--sidebar-border))' }} />
                    <p className="font-medium text-sm text-sidebar-foreground">Sidebar Border</p>
                  </div>
                </div>
              </Subsection>
            </Section>

            {/* ==================== TYPOGRAPHY ==================== */}
            <Section 
              id="typography" 
              title="Typography"
              description="DM Sans for English, Cairo for Arabic. Clean, professional, and highly readable."
            >
              <Subsection title="Heading Scale">
                <div className="space-y-6">
                  <div className="pb-4 border-b">
                    <span className="text-xs text-muted-foreground font-mono mb-2 block">heading-1 / text-6xl</span>
                    <h1 className="heading-1">The quick brown fox</h1>
                  </div>
                  <div className="pb-4 border-b">
                    <span className="text-xs text-muted-foreground font-mono mb-2 block">heading-2 / text-5xl</span>
                    <h2 className="heading-2">The quick brown fox</h2>
                  </div>
                  <div className="pb-4 border-b">
                    <span className="text-xs text-muted-foreground font-mono mb-2 block">heading-3 / text-3xl</span>
                    <h3 className="heading-3">The quick brown fox</h3>
                  </div>
                  <div className="pb-4 border-b">
                    <span className="text-xs text-muted-foreground font-mono mb-2 block">heading-4 / text-xl</span>
                    <h4 className="heading-4">The quick brown fox</h4>
                  </div>
                </div>
              </Subsection>

              <Subsection title="Body Text">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-muted-foreground font-mono mb-2 block">.body-large</span>
                    <p className="body-large">Large body text for introductions and key messages.</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground font-mono mb-2 block">.body-default</span>
                    <p className="body-default">Default body text for general content and descriptions.</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground font-mono mb-2 block">.body-small</span>
                    <p className="body-small">Small body text for secondary information and captions.</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground font-mono mb-2 block">.caption</span>
                    <p className="caption">Caption text for labels and metadata.</p>
                  </div>
                </div>
              </Subsection>

              <Subsection title="Arabic Typography (Cairo)">
                <div dir="rtl" className="p-6 rounded-2xl bg-muted/50 space-y-4" style={{ fontFamily: 'Cairo, sans-serif' }}>
                  <h2 className="text-3xl font-bold">مرحباً بكم في سينديو كير</h2>
                  <p className="text-lg text-muted-foreground">نظام متكامل لربط العيادات بالمتخصصين في الرعاية الصحية.</p>
                  <p className="text-base">هذا النص يستخدم خط Cairo المصمم خصيصاً للغة العربية.</p>
                </div>
              </Subsection>

              <Subsection title="Text Gradients">
                <div className="space-y-4">
                  <p className="text-3xl font-bold text-gradient-primary">Primary Gradient Text</p>
                  <p className="text-3xl font-bold text-gradient-brand">Brand Gradient Text</p>
                  <p className="text-3xl font-bold text-gradient-accent">Accent Gradient Text</p>
                </div>
              </Subsection>
            </Section>

            {/* ==================== SPACING ==================== */}
            <Section 
              id="spacing" 
              title="Spacing"
              description="Consistent spacing system based on 4px grid."
            >
              <Subsection title="Spacing Scale">
                <div className="space-y-3">
                  {[
                    { name: "xs", value: "4px", class: "w-1" },
                    { name: "sm", value: "8px", class: "w-2" },
                    { name: "md", value: "16px", class: "w-4" },
                    { name: "lg", value: "24px", class: "w-6" },
                    { name: "xl", value: "32px", class: "w-8" },
                    { name: "2xl", value: "48px", class: "w-12" },
                    { name: "3xl", value: "64px", class: "w-16" },
                  ].map((space) => (
                    <div key={space.name} className="flex items-center gap-4">
                      <span className="w-12 text-sm font-mono text-muted-foreground">{space.name}</span>
                      <div className={cn("h-4 rounded bg-primary", space.class)} />
                      <span className="text-sm">{space.value}</span>
                    </div>
                  ))}
                </div>
              </Subsection>

              <Subsection title="Touch Targets">
                <p className="text-muted-foreground mb-4">Minimum 44x44px for accessibility compliance.</p>
                <div className="flex items-end gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                      <span className="text-xs">44px</span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-2">Minimum</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center text-accent-foreground">
                      <span className="text-xs">48px</span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-2">Comfortable</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-lg bg-success flex items-center justify-center text-success-foreground">
                      <span className="text-xs">56px</span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-2">Large</span>
                  </div>
                </div>
              </Subsection>
            </Section>

            {/* ==================== SHADOWS ==================== */}
            <Section 
              id="shadows" 
              title="Shadows & Effects"
              description="Layered shadow system for depth and elevation."
            >
              <Subsection title="Shadow Scale">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="p-6 rounded-2xl bg-card" style={{ boxShadow: 'var(--shadow-sm)' }}>
                    <p className="font-medium">Small</p>
                    <p className="text-xs text-muted-foreground font-mono">--shadow-sm</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-card" style={{ boxShadow: 'var(--shadow-md)' }}>
                    <p className="font-medium">Medium</p>
                    <p className="text-xs text-muted-foreground font-mono">--shadow-md</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-card" style={{ boxShadow: 'var(--shadow-lg)' }}>
                    <p className="font-medium">Large</p>
                    <p className="text-xs text-muted-foreground font-mono">--shadow-lg</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-card" style={{ boxShadow: 'var(--shadow-xl)' }}>
                    <p className="font-medium">Extra Large</p>
                    <p className="text-xs text-muted-foreground font-mono">--shadow-xl</p>
                  </div>
                </div>
              </Subsection>

              <Subsection title="Glow Effects">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl bg-card shadow-glow">
                    <p className="font-medium">Green Glow</p>
                    <p className="text-xs text-muted-foreground font-mono">.shadow-glow</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-card shadow-glow-teal">
                    <p className="font-medium">Teal Glow</p>
                    <p className="text-xs text-muted-foreground font-mono">.shadow-glow-teal</p>
                  </div>
                </div>
              </Subsection>

              <Subsection title="Glass Effects">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 rounded-2xl gradient-hero">
                  <div className="p-6 rounded-xl glass text-white">
                    <p className="font-medium">Glass Light</p>
                    <p className="text-xs opacity-70 font-mono">.glass</p>
                  </div>
                  <div className="p-6 rounded-xl glass-dark text-white">
                    <p className="font-medium">Glass Dark</p>
                    <p className="text-xs opacity-70 font-mono">.glass-dark</p>
                  </div>
                  <div className="p-6 rounded-xl glass-brand text-white">
                    <p className="font-medium">Glass Brand</p>
                    <p className="text-xs opacity-70 font-mono">.glass-brand</p>
                  </div>
                </div>
              </Subsection>

              <Subsection title="Border Radius">
                <div className="flex items-end gap-4 flex-wrap">
                  {[
                    { name: "sm", class: "rounded-sm" },
                    { name: "md", class: "rounded-md" },
                    { name: "lg", class: "rounded-lg" },
                    { name: "xl", class: "rounded-xl" },
                    { name: "2xl", class: "rounded-2xl" },
                    { name: "3xl", class: "rounded-3xl" },
                    { name: "full", class: "rounded-full" },
                  ].map((radius) => (
                    <div key={radius.name} className="flex flex-col items-center">
                      <div className={cn("w-16 h-16 bg-primary", radius.class)} />
                      <span className="text-xs text-muted-foreground mt-2">{radius.name}</span>
                    </div>
                  ))}
                </div>
              </Subsection>
            </Section>

            {/* ==================== BUTTONS ==================== */}
            <Section 
              id="buttons" 
              title="Buttons"
              description="Comprehensive button system with multiple variants and sizes."
            >
              <Subsection title="Variants">
                <div className="flex flex-wrap gap-3">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="success">Success</Button>
                </div>
              </Subsection>

              <Subsection title="Gradient Variants">
                <div className="flex flex-wrap gap-3">
                  <Button variant="hero">Hero (Primary)</Button>
                  <Button variant="accent">Accent (Teal)</Button>
                  <Button variant="brand">Brand (Green→Teal)</Button>
                  <Button variant="sky">Sky (Blue)</Button>
                  <Button variant="hero-outline">Hero Outline</Button>
                </div>
              </Subsection>

              <Subsection title="Sizes">
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                  <Button size="icon"><Plus className="w-4 h-4" /></Button>
                </div>
              </Subsection>

              <Subsection title="With Icons">
                <div className="flex flex-wrap gap-3">
                  <Button><Plus className="w-4 h-4" /> Create New</Button>
                  <Button variant="outline"><Download className="w-4 h-4" /> Download</Button>
                  <Button variant="destructive"><Trash2 className="w-4 h-4" /> Delete</Button>
                  <Button variant="success"><CheckCircle2 className="w-4 h-4" /> Approve</Button>
                </div>
              </Subsection>

              <Subsection title="States">
                <div className="flex flex-wrap gap-3">
                  <Button disabled>Disabled</Button>
                  <LoadingButton isLoading>Loading</LoadingButton>
                  <LoadingButton isLoading loadingText="Saving...">Save</LoadingButton>
                </div>
              </Subsection>
            </Section>

            {/* ==================== CARDS ==================== */}
            <Section 
              id="cards" 
              title="Cards"
              description="Flexible card components for various content types."
            >
              <Subsection title="Basic Cards">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Default Card</CardTitle>
                      <CardDescription>Standard card for content display.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Card content goes here.</p>
                    </CardContent>
                  </Card>
                  
                  <Card interactive>
                    <CardHeader>
                      <CardTitle>Interactive Card</CardTitle>
                      <CardDescription>Hover for elevation effect.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Click or tap to interact.</p>
                    </CardContent>
                  </Card>

                  <Card className="gradient-brand text-white">
                    <CardHeader>
                      <CardTitle className="text-white">Gradient Card</CardTitle>
                      <CardDescription className="text-white/80">Premium styling.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-white/80">Featured content.</p>
                    </CardContent>
                  </Card>
                </div>
              </Subsection>

              <Subsection title="Shift Card Example">
                <Card interactive className="max-w-md">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">Morning Shift</h4>
                          <Badge variant="urgent">Urgent</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Downtown Medical Clinic</p>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> 8:00 AM - 2:00 PM
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" /> $45/hr
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-primary font-semibold">$270</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Subsection>

              <Subsection title="Stats Cards">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Shifts", value: "156", icon: Clock, color: "bg-primary/10 text-primary" },
                    { label: "Earnings", value: "$12,450", icon: DollarSign, color: "bg-success/10 text-success" },
                    { label: "Rating", value: "4.9", icon: Star, color: "bg-warning/10 text-warning" },
                    { label: "Clinics", value: "24", icon: MapPin, color: "bg-accent/10 text-accent" },
                  ].map((stat) => (
                    <Card key={stat.label}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.color)}>
                            <stat.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </Subsection>
            </Section>

            {/* ==================== BADGES ==================== */}
            <Section 
              id="badges" 
              title="Badges"
              description="Status indicators and labels."
            >
              <Subsection title="Variants">
                <div className="flex flex-wrap gap-3">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </Subsection>

              <Subsection title="Status Badges">
                <div className="flex flex-wrap gap-3">
                  <Badge variant="success">Verified</Badge>
                  <Badge variant="warning">Pending</Badge>
                  <Badge variant="destructive">Rejected</Badge>
                  <Badge variant="urgent">Urgent</Badge>
                  <Badge variant="info">Info</Badge>
                </div>
              </Subsection>

              <Subsection title="Role Badges">
                <div className="flex flex-wrap gap-3">
                  <Badge variant="role-nurse">Nurse</Badge>
                  <Badge variant="role-dentist">Dentist</Badge>
                  <Badge variant="role-hygienist">Hygienist</Badge>
                  <Badge variant="role-assistant">Assistant</Badge>
                </div>
              </Subsection>
            </Section>

            {/* ==================== INPUTS ==================== */}
            <Section 
              id="inputs" 
              title="Form Inputs"
              description="Accessible form controls with validation states."
            >
              <Subsection title="Basic Inputs">
                <div className="max-w-md space-y-4">
                  <div>
                    <Label htmlFor="basic">Basic Input</Label>
                    <Input id="basic" placeholder="Enter text..." className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="disabled">Disabled Input</Label>
                    <Input id="disabled" placeholder="Disabled" disabled className="mt-1.5" />
                  </div>
                </div>
              </Subsection>

              <Subsection title="With Icons">
                <div className="max-w-md space-y-4">
                  <InputWithIcon icon={Mail}>
                    <Input placeholder="Email address" />
                  </InputWithIcon>
                  <InputWithIcon icon={Search}>
                    <Input placeholder="Search..." />
                  </InputWithIcon>
                  <InputWithIcon icon={MapPin}>
                    <Input placeholder="Location" />
                  </InputWithIcon>
                </div>
              </Subsection>

              <Subsection title="Form Fields with Validation">
                <div className="max-w-md space-y-4">
                  <FormField label="Full Name" htmlFor="name" required>
                    <InputWithIcon icon={User}>
                      <Input id="name" placeholder="John Doe" />
                    </InputWithIcon>
                  </FormField>
                  
                  <FormField label="Email" htmlFor="email" required error="Please enter a valid email">
                    <InputWithIcon icon={Mail}>
                      <Input id="email" type="email" defaultValue="invalid" className="border-destructive" />
                    </InputWithIcon>
                  </FormField>
                  
                  <FormField label="Phone" htmlFor="phone" hint="Optional field">
                    <InputWithIcon icon={Phone}>
                      <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                    </InputWithIcon>
                  </FormField>
                </div>
              </Subsection>

              <Subsection title="Password with Strength">
                <div className="max-w-md">
                  <FormField label="Password" htmlFor="password" required>
                    <PasswordInput id="password" placeholder="Create a password" showStrength />
                  </FormField>
                </div>
              </Subsection>

              <Subsection title="Checkboxes & Switches">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms">Accept terms and conditions</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch id="notifications" />
                    <Label htmlFor="notifications">Enable notifications</Label>
                  </div>
                </div>
              </Subsection>
            </Section>

            {/* ==================== FEEDBACK ==================== */}
            <Section 
              id="feedback" 
              title="Feedback"
              description="Toast notifications and progress indicators."
            >
              <Subsection title="Toast Notifications">
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => toast.success("Success! Action completed.")}>
                    Success Toast
                  </Button>
                  <Button variant="destructive" onClick={() => toast.error("Error! Something went wrong.")}>
                    Error Toast
                  </Button>
                  <Button variant="outline" onClick={() => toast.info("Info: Check out this tip.")}>
                    Info Toast
                  </Button>
                  <Button variant="secondary" onClick={() => toast.warning("Warning: Please review.")}>
                    Warning Toast
                  </Button>
                </div>
              </Subsection>

              <Subsection title="Progress">
                <div className="max-w-md space-y-4">
                  <div>
                    <p className="text-sm mb-2">25% Complete</p>
                    <Progress value={25} />
                  </div>
                  <div>
                    <p className="text-sm mb-2">50% Complete</p>
                    <Progress value={50} />
                  </div>
                  <div>
                    <p className="text-sm mb-2">75% Complete</p>
                    <Progress value={75} />
                  </div>
                  <div>
                    <p className="text-sm mb-2">100% Complete</p>
                    <Progress value={100} />
                  </div>
                </div>
              </Subsection>
            </Section>

            {/* ==================== DATA DISPLAY ==================== */}
            <Section 
              id="data-display" 
              title="Data Display"
              description="Avatars, tabs, and data presentation components."
            >
              <Subsection title="Avatars">
                <div className="flex items-center gap-4">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Avatar className="w-16 h-16">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className="text-xl">SC</AvatarFallback>
                  </Avatar>
                </div>
              </Subsection>

              <Subsection title="Tabs">
                <Tabs defaultValue="overview" className="max-w-lg">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="shifts">Shifts</TabsTrigger>
                    <TabsTrigger value="earnings">Earnings</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="mt-4 p-4 rounded-lg bg-muted/50">
                    <p className="text-sm">Overview content goes here.</p>
                  </TabsContent>
                  <TabsContent value="shifts" className="mt-4 p-4 rounded-lg bg-muted/50">
                    <p className="text-sm">Shifts content goes here.</p>
                  </TabsContent>
                  <TabsContent value="earnings" className="mt-4 p-4 rounded-lg bg-muted/50">
                    <p className="text-sm">Earnings content goes here.</p>
                  </TabsContent>
                </Tabs>
              </Subsection>

              <Subsection title="Separator">
                <div className="space-y-4 max-w-md">
                  <p>Content above</p>
                  <Separator />
                  <p>Content below</p>
                </div>
              </Subsection>
            </Section>

            {/* ==================== FORMS ==================== */}
            <Section 
              id="forms" 
              title="Form Patterns"
              description="Complete form layouts and validation patterns."
            >
              <Subsection title="Login Form">
                <Card className="max-w-sm">
                  <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>Enter your credentials to access your account.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField label="Email" htmlFor="login-email" required>
                      <InputWithIcon icon={Mail}>
                        <Input id="login-email" type="email" placeholder="you@example.com" />
                      </InputWithIcon>
                    </FormField>
                    <FormField label="Password" htmlFor="login-password" required>
                      <PasswordInput id="login-password" placeholder="Enter password" />
                    </FormField>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox id="remember" />
                        <Label htmlFor="remember" className="text-sm">Remember me</Label>
                      </div>
                      <Button variant="link" className="px-0">Forgot password?</Button>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="hero">Sign In</Button>
                  </CardFooter>
                </Card>
              </Subsection>
            </Section>

            {/* ==================== LOADING ==================== */}
            <Section 
              id="loading" 
              title="Loading States"
              description="Skeleton loaders and loading indicators."
            >
              <Subsection title="Skeleton Examples">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </Subsection>

              <Subsection title="Loading Buttons">
                <div className="flex flex-wrap gap-3">
                  <LoadingButton isLoading size="sm">Small</LoadingButton>
                  <LoadingButton isLoading>Default</LoadingButton>
                  <LoadingButton isLoading size="lg">Large</LoadingButton>
                  <LoadingButton isLoading variant="outline">Outline</LoadingButton>
                </div>
              </Subsection>
            </Section>

          </div>
        </main>
      </div>
    </div>
  );
}
