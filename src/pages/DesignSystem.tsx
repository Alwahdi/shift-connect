import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Home, Loader2, AlertCircle } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function DesignSystem() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Check if Storybook is available
  useEffect(() => {
    const checkStorybook = async () => {
      try {
        const response = await fetch('/storybook/index.html', { method: 'HEAD' });
        if (!response.ok) {
          setHasError(true);
        }
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Small delay to allow iframe to load
    const timer = setTimeout(checkStorybook, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div>
                <h1 className="font-bold text-lg">SyndeoCare</h1>
                <p className="text-xs text-muted-foreground">Design System</p>
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

        {/* Error State */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-lg">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-warning" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Storybook Not Built</h2>
            <p className="text-muted-foreground mb-6">
              The Storybook design system needs to be built before it can be viewed here.
              Run the following command in your terminal:
            </p>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm mb-6">
              npm run build-storybook
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Or run Storybook in development mode:
            </p>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm mb-6">
              npm run storybook
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" asChild>
                <a href="http://localhost:6006" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 me-2" />
                  Open Storybook (Dev)
                </a>
              </Button>
              <Button asChild>
                <a href="/">
                  <Home className="w-4 h-4 me-2" />
                  Back to App
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between h-12 px-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="font-semibold text-sm">SyndeoCare Design System</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <a href="/">
                <Home className="w-4 h-4" />
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="http://localhost:6006" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading Design System...</p>
          </div>
        </div>
      )}

      {/* Storybook Iframe */}
      <iframe
        src="/storybook/index.html"
        className={`flex-1 w-full border-0 ${isLoading ? 'invisible' : 'visible'}`}
        title="SyndeoCare Design System - Storybook"
        onLoad={() => setIsLoading(false)}
        style={{ minHeight: 'calc(100vh - 48px)' }}
      />
    </div>
  );
}
