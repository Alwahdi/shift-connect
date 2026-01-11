import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
}

/**
 * Skeleton for shift/job cards
 */
export const ShiftCardSkeleton = ({ className }: SkeletonCardProps) => (
  <div className={cn(
    "bg-card rounded-2xl border border-border p-4 shadow-card animate-pulse",
    className
  )}>
    <div className="flex items-start gap-4">
      <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-24" />
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
  </div>
);

/**
 * Skeleton for stats cards
 */
export const StatsCardSkeleton = ({ className }: SkeletonCardProps) => (
  <div className={cn(
    "bg-card rounded-2xl border border-border p-4 shadow-card animate-pulse",
    className
  )}>
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton for profile cards
 */
export const ProfileCardSkeleton = ({ className }: SkeletonCardProps) => (
  <div className={cn(
    "bg-card rounded-2xl border border-border p-6 shadow-card animate-pulse",
    className
  )}>
    <div className="flex items-center gap-4 mb-4">
      <Skeleton className="w-16 h-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

/**
 * Skeleton for document cards
 */
export const DocumentCardSkeleton = ({ className }: SkeletonCardProps) => (
  <div className={cn(
    "bg-card rounded-2xl border border-border p-4 shadow-card animate-pulse",
    className
  )}>
    <div className="flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  </div>
);

/**
 * Skeleton for list items
 */
export const ListItemSkeleton = ({ className }: SkeletonCardProps) => (
  <div className={cn(
    "flex items-center justify-between p-3 rounded-xl bg-secondary/50 animate-pulse",
    className
  )}>
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-24" />
    </div>
    <Skeleton className="h-6 w-16 rounded-full" />
  </div>
);

/**
 * Grid of skeleton cards
 */
export const SkeletonGrid = ({ 
  count = 4, 
  columns = "grid-cols-2 md:grid-cols-4",
  CardComponent = StatsCardSkeleton,
}: { 
  count?: number;
  columns?: string;
  CardComponent?: React.ComponentType<SkeletonCardProps>;
}) => (
  <div className={cn("grid gap-4", columns)}>
    {Array.from({ length: count }).map((_, i) => (
      <CardComponent key={i} />
    ))}
  </div>
);
