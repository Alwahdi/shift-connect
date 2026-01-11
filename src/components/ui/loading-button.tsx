import * as React from "react";
import { Loader2, Check } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  isSuccess?: boolean;
  loadingText?: string;
  successText?: string;
}

/**
 * Enhanced button with loading and success states
 * Provides immediate feedback to user actions (UX Principle #5: Feedback Is Mandatory)
 */
export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      children,
      isLoading,
      isSuccess,
      loadingText,
      successText,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    // Auto-reset success state after 2 seconds
    const [showSuccess, setShowSuccess] = React.useState(false);

    React.useEffect(() => {
      if (isSuccess) {
        setShowSuccess(true);
        const timer = setTimeout(() => setShowSuccess(false), 2000);
        return () => clearTimeout(timer);
      }
    }, [isSuccess]);

    const displayState = showSuccess ? "success" : isLoading ? "loading" : "idle";

    return (
      <Button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "relative transition-all duration-300",
          showSuccess && "bg-success hover:bg-success",
          className
        )}
        {...props}
      >
        {/* Loading State */}
        <span
          className={cn(
            "flex items-center gap-2 transition-opacity duration-200",
            displayState === "loading" ? "opacity-100" : "opacity-0 absolute"
          )}
          aria-hidden={displayState !== "loading"}
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          {loadingText && <span>{loadingText}</span>}
        </span>

        {/* Success State */}
        <span
          className={cn(
            "flex items-center gap-2 transition-opacity duration-200",
            displayState === "success" ? "opacity-100" : "opacity-0 absolute"
          )}
          aria-hidden={displayState !== "success"}
        >
          <Check className="w-4 h-4" />
          {successText && <span>{successText}</span>}
        </span>

        {/* Default State */}
        <span
          className={cn(
            "flex items-center gap-2 transition-opacity duration-200",
            displayState === "idle" ? "opacity-100" : "opacity-0 absolute"
          )}
          aria-hidden={displayState !== "idle"}
        >
          {children}
        </span>

        {/* Screen reader announcement */}
        <span className="sr-only" role="status" aria-live="polite">
          {displayState === "loading" && (loadingText || "Loading...")}
          {displayState === "success" && (successText || "Success!")}
        </span>
      </Button>
    );
  }
);
LoadingButton.displayName = "LoadingButton";

export default LoadingButton;
