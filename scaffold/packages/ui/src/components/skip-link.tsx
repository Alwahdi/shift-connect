import * as React from "react";
import { cn } from "../lib/utils";

/**
 * Accessibility: Skip-to-content link
 * Visible only on keyboard focus.
 */
export function SkipLink({
  href = "#main-content",
  children = "Skip to content",
  className,
}: {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground focus:shadow-lg",
        className
      )}
    >
      {children}
    </a>
  );
}
