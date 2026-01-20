import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Check, Copy, Sun, Moon, Type, Palette, Layout, Layers, MousePointer2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useTheme } from "@/contexts/ThemeContext";
import syndeoCarelogo from "@/assets/syndeocare-logo.png";
import syndeoCareLogo白色 from "@/assets/syndeocare-logo-white.png";

// Color palette with HSL values
const BRAND_COLORS = {
  primary: {
    name: "Primary Green",
    hsl: "87 52% 47%",
    hex: "#7CB53D",
    usage: "Primary actions, CTAs, links",
  },
  secondary: {
    name: "Secondary Teal",
    hsl: "179 53% 50%",
    hex: "#3BC4C3",
    usage: "Secondary actions, accents, highlights",
  },
  primaryDark: {
    name: "Dark Green",
    hsl: "87 52% 35%",
    hex: "#5A9E2E",
    usage: "Hover states, dark mode primary",
  },
  tealDark: {
    name: "Dark Teal",
    hsl: "179 53% 40%",
    hex: "#2AA89A",
    usage: "Hover states, dark mode secondary",
  },
};

const SEMANTIC_COLORS = {
  success: { name: "Success", hsl: "179 53% 50%", hex: "#3BC4C3" },
  warning: { name: "Warning", hsl: "38 92% 50%", hex: "#F59E0B" },
  destructive: { name: "Destructive", hsl: "0 84% 60%", hex: "#EF4444" },
  muted: { name: "Muted", hsl: "210 40% 96%", hex: "#F1F5F9" },
};

const GRADIENTS = [
  { name: "Primary", class: "gradient-primary", description: "Green gradient for primary CTAs" },
  { name: "Secondary", class: "gradient-secondary", description: "Teal gradient for secondary actions" },
  { name: "Brand", class: "gradient-brand", description: "Green to Teal signature gradient" },
  { name: "Hero", class: "gradient-hero", description: "Dark charcoal for hero sections" },
  { name: "Sky", class: "gradient-sky", description: "Blue gradient for informational elements" },
  { name: "Accent", class: "gradient-accent", description: "Teal accent gradient" },
];

const TYPOGRAPHY = [
  { level: "H1", size: "text-5xl md:text-6xl", weight: "font-bold", sample: "Main Heading" },
  { level: "H2", size: "text-4xl md:text-5xl", weight: "font-bold", sample: "Section Title" },
  { level: "H3", size: "text-2xl md:text-3xl", weight: "font-semibold", sample: "Card Title" },
  { level: "H4", size: "text-xl md:text-2xl", weight: "font-semibold", sample: "Subsection" },
  { level: "Body", size: "text-base", weight: "font-normal", sample: "Body text for paragraphs and content." },
  { level: "Small", size: "text-sm", weight: "font-normal", sample: "Small helper text and captions" },
  { level: "Caption", size: "text-xs", weight: "font-medium", sample: "CAPTION TEXT" },
];

const ColorSwatch = ({ color, label }: { color: { name: string; hsl: string; hex: string; usage?: string }; label: string }) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      className="group relative"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div 
        className="w-full aspect-[4/3] rounded-2xl shadow-lg mb-3 cursor-pointer relative overflow-hidden"
        style={{ backgroundColor: color.hex }}
        onClick={() => copyToClipboard(color.hex)}
      >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          {copied ? (
            <Check className="w-6 h-6 text-white drop-shadow-lg" />
          ) : (
            <Copy className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
          )}
        </div>
      </div>
      <h4 className="font-semibold text-foreground">{color.name}</h4>
      <p className="text-sm text-muted-foreground font-mono">{color.hex}</p>
      <p className="text-xs text-muted-foreground mt-1">HSL: {color.hsl}</p>
      {color.usage && <p className="text-xs text-muted-foreground/70 mt-1">{color.usage}</p>}
    </motion.div>
  );
};

const BrandGuide = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [sampleInput, setSampleInput] = useState("");
  const [samplePassword, setSamplePassword] = useState("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="gradient-hero text-white pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Brand Guidelines
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              SyndeoCare <span className="text-gradient-brand">Design System</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              A comprehensive guide to our brand identity, color palette, typography, and UI components.
            </p>
            
            {/* Logo Display */}
            <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-xl">
                <img src={syndeoCarelogo} alt="SyndeoCare Logo" className="h-16 md:h-20" />
                <p className="text-xs text-muted-foreground mt-3">On Light Background</p>
              </div>
              <div className="bg-[#1A1A2E] rounded-2xl p-8 shadow-xl">
                <img src={syndeoCareLogo白色} alt="SyndeoCare Logo White" className="h-16 md:h-20" />
                <p className="text-xs text-white/60 mt-3">On Dark Background</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-16">
        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="w-full max-w-2xl mx-auto grid grid-cols-2 md:grid-cols-5 mb-12 h-auto p-1">
            <TabsTrigger value="colors" className="flex items-center gap-2 py-3">
              <Palette className="w-4 h-4" /> Colors
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center gap-2 py-3">
              <Type className="w-4 h-4" /> Typography
            </TabsTrigger>
            <TabsTrigger value="components" className="flex items-center gap-2 py-3">
              <Layers className="w-4 h-4" /> Components
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-2 py-3">
              <Layout className="w-4 h-4" /> Patterns
            </TabsTrigger>
            <TabsTrigger value="interactions" className="flex items-center gap-2 py-3">
              <MousePointer2 className="w-4 h-4" /> Motion
            </TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="colors">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-16">
              {/* Theme Toggle */}
              <motion.div variants={itemVariants} className="flex items-center justify-center gap-4">
                <Sun className="w-5 h-5 text-muted-foreground" />
                <Switch 
                  checked={theme === "dark"} 
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
                <Moon className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground ml-2">
                  Preview in {theme === "dark" ? "Dark" : "Light"} Mode
                </span>
              </motion.div>

              {/* Brand Colors */}
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Brand Colors</h2>
                <p className="text-muted-foreground mb-8">Primary colors derived from the SyndeoCare logo</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {Object.entries(BRAND_COLORS).map(([key, color]) => (
                    <ColorSwatch key={key} color={color} label={key} />
                  ))}
                </div>
              </motion.div>

              {/* Semantic Colors */}
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Semantic Colors</h2>
                <p className="text-muted-foreground mb-8">Functional colors for feedback and status</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {Object.entries(SEMANTIC_COLORS).map(([key, color]) => (
                    <ColorSwatch key={key} color={color} label={key} />
                  ))}
                </div>
              </motion.div>

              {/* Gradients */}
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Gradients</h2>
                <p className="text-muted-foreground mb-8">Brand gradients for visual impact</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {GRADIENTS.map((gradient) => (
                    <div key={gradient.name} className="group">
                      <div className={`w-full h-32 rounded-2xl shadow-lg mb-3 ${gradient.class}`} />
                      <h4 className="font-semibold text-foreground">{gradient.name}</h4>
                      <p className="text-sm text-muted-foreground">{gradient.description}</p>
                      <code className="text-xs text-primary font-mono">.{gradient.class}</code>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-12">
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Typography Scale</h2>
                <p className="text-muted-foreground mb-8">DM Sans for headings, Cairo for Arabic text</p>
                
                <div className="space-y-8">
                  {TYPOGRAPHY.map((type) => (
                    <div key={type.level} className="border-b border-border pb-6">
                      <div className="flex items-baseline gap-4 mb-2">
                        <Badge variant="secondary" className="font-mono">{type.level}</Badge>
                        <span className="text-xs text-muted-foreground font-mono">{type.size} {type.weight}</span>
                      </div>
                      <p className={`${type.size} ${type.weight} text-foreground`}>{type.sample}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Text Colors</h2>
                <p className="text-muted-foreground mb-8">Semantic text color tokens</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <p className="text-foreground">text-foreground - Primary text</p>
                      <p className="text-muted-foreground">text-muted-foreground - Secondary text</p>
                      <p className="text-primary">text-primary - Brand color text</p>
                      <p className="text-destructive">text-destructive - Error text</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#1A1A2E]">
                    <CardContent className="pt-6 space-y-4">
                      <p className="text-white">text-white - On dark backgrounds</p>
                      <p className="text-white/80">text-white/80 - Secondary on dark</p>
                      <p className="text-white/60">text-white/60 - Muted on dark</p>
                      <p className="text-gradient-brand font-bold">text-gradient-brand - Brand gradient</p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-16">
              {/* Buttons */}
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Buttons</h2>
                <p className="text-muted-foreground mb-8">All button variants and sizes</p>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Variants</CardTitle>
                    <CardDescription>Different button styles for various actions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-wrap gap-4">
                      <Button variant="default">Default</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="link">Link</Button>
                      <Button variant="destructive">Destructive</Button>
                    </div>
                    <Separator />
                    <div className="flex flex-wrap gap-4">
                      <Button variant="hero">Hero CTA</Button>
                      <Button variant="accent">Accent</Button>
                      <Button variant="brand">Brand</Button>
                      <Button variant="success">Success</Button>
                      <Button variant="sky">Sky</Button>
                      <Button variant="hero-outline">Hero Outline</Button>
                    </div>
                    <Separator />
                    <div className="flex flex-wrap items-center gap-4">
                      <Button size="sm">Small</Button>
                      <Button size="default">Default</Button>
                      <Button size="lg">Large</Button>
                      <Button size="xl">Extra Large</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Form Elements */}
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Form Elements</h2>
                <p className="text-muted-foreground mb-8">Input fields, password inputs, and form controls</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Text Inputs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="default">Default Input</Label>
                        <Input 
                          id="default" 
                          placeholder="Enter text..." 
                          value={sampleInput}
                          onChange={(e) => setSampleInput(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="disabled">Disabled Input</Label>
                        <Input id="disabled" placeholder="Disabled" disabled />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Password Input</CardTitle>
                      <CardDescription>With strength indicator</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Label htmlFor="password">Password</Label>
                      <PasswordInput 
                        id="password"
                        value={samplePassword}
                        onChange={(e) => setSamplePassword(e.target.value)}
                        showStrength
                        placeholder="Enter password..."
                      />
                    </CardContent>
                  </Card>
                </div>
              </motion.div>

              {/* Cards */}
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Cards</h2>
                <p className="text-muted-foreground mb-8">Card patterns for content containers</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Default Card</CardTitle>
                      <CardDescription>Standard content card</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Card content goes here with proper spacing and typography.</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                    <CardHeader>
                      <CardTitle>Interactive Card</CardTitle>
                      <CardDescription>Hover for effect</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">This card lifts on hover with a subtle animation.</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-primary/20 shadow-lg">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center mb-4 shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle>Feature Card</CardTitle>
                      <CardDescription>With gradient icon</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Featured content with visual emphasis.</p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>

              {/* Badges */}
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Badges</h2>
                <p className="text-muted-foreground mb-8">Status indicators and labels</p>
                
                <div className="flex flex-wrap gap-4">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge className="bg-primary/10 text-primary border-primary/20">Custom Green</Badge>
                  <Badge className="bg-[#3BC4C3]/10 text-[#3BC4C3] border-[#3BC4C3]/20">Custom Teal</Badge>
                </div>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-16">
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Spacing Scale</h2>
                <p className="text-muted-foreground mb-8">Consistent spacing based on 4px grid</p>
                
                <div className="flex items-end gap-4 flex-wrap">
                  {[4, 8, 12, 16, 24, 32, 48, 64].map((size) => (
                    <div key={size} className="text-center">
                      <div 
                        className="bg-primary rounded mb-2" 
                        style={{ width: size, height: size }}
                      />
                      <span className="text-xs text-muted-foreground">{size}px</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Border Radius</h2>
                <p className="text-muted-foreground mb-8">Rounded corner scale</p>
                
                <div className="flex items-center gap-6 flex-wrap">
                  {[
                    { name: "sm", value: "0.25rem" },
                    { name: "md", value: "0.375rem" },
                    { name: "lg", value: "0.75rem" },
                    { name: "xl", value: "1rem" },
                    { name: "2xl", value: "1.5rem" },
                    { name: "3xl", value: "2rem" },
                    { name: "full", value: "9999px" },
                  ].map((radius) => (
                    <div key={radius.name} className="text-center">
                      <div 
                        className="w-16 h-16 bg-primary mb-2" 
                        style={{ borderRadius: radius.value }}
                      />
                      <span className="text-xs text-muted-foreground">{radius.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Shadows</h2>
                <p className="text-muted-foreground mb-8">Elevation and depth</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {["shadow-sm", "shadow-md", "shadow-lg", "shadow-xl"].map((shadow) => (
                    <div key={shadow} className="text-center">
                      <div className={`w-full h-24 bg-card rounded-xl ${shadow} mb-3`} />
                      <span className="text-sm text-muted-foreground font-mono">{shadow}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* Interactions Tab */}
          <TabsContent value="interactions">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-16">
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Hover Effects</h2>
                <p className="text-muted-foreground mb-8">Interactive states and transitions</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div 
                    className="p-6 bg-card border border-border rounded-2xl cursor-pointer"
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <h4 className="font-semibold mb-2">Lift Effect</h4>
                    <p className="text-sm text-muted-foreground">Card lifts up with subtle scale on hover</p>
                  </motion.div>
                  
                  <motion.div 
                    className="p-6 bg-card border border-border rounded-2xl cursor-pointer"
                    whileHover={{ boxShadow: "0 20px 50px -12px hsl(var(--primary) / 0.25)" }}
                  >
                    <h4 className="font-semibold mb-2">Glow Effect</h4>
                    <p className="text-sm text-muted-foreground">Brand-colored shadow glow on hover</p>
                  </motion.div>
                  
                  <motion.div 
                    className="p-6 bg-card border border-border rounded-2xl cursor-pointer group"
                    whileHover={{ borderColor: "hsl(var(--primary))" }}
                  >
                    <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors">Border Highlight</h4>
                    <p className="text-sm text-muted-foreground">Border color changes to brand on hover</p>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Button States</h2>
                <p className="text-muted-foreground mb-8">Press and hover feedback</p>
                
                <div className="flex gap-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="hero" size="lg">Press Me</Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="brand" size="lg">Brand Action</Button>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Page Transitions</h2>
                <p className="text-muted-foreground mb-8">Entrance and exit animations</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="pt-6">
                      <code className="text-sm font-mono text-primary">animate-fade-in</code>
                      <p className="text-sm text-muted-foreground mt-2">Fade in with slight upward movement</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <code className="text-sm font-mono text-primary">animate-scale-in</code>
                      <p className="text-sm text-muted-foreground mt-2">Scale up from 95% with fade</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <code className="text-sm font-mono text-primary">animate-slide-in-right</code>
                      <p className="text-sm text-muted-foreground mt-2">Slide in from right edge</p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default BrandGuide;
