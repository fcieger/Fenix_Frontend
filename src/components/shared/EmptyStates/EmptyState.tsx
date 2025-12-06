"use client";

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center py-12",
        className
      )}
    >
      <div className="text-center">
        <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-4">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction}>{actionLabel}</Button>
        )}
      </div>
    </div>
  );
}

