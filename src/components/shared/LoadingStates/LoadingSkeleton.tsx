"use client";

import { cn } from "@/lib/utils";

export interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export function LoadingSkeleton({
  className,
  count = 1,
}: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse bg-gray-200 rounded",
            className || "h-20 w-full"
          )}
        />
      ))}
    </>
  );
}

export function ProductListSkeleton() {
  return (
    <div className="space-y-4 p-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-24 bg-gray-200 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-24" />
      ))}
    </div>
  );
}

