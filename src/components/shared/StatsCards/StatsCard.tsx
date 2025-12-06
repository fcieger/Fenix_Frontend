"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  iconBgColor = "bg-purple-100",
  iconColor = "text-purple-600",
  trend,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-6 shadow-lg border border-gray-100",
        className
      )}
    >
      <div className="flex items-center">
        <div className={cn("p-3 rounded-xl", iconBgColor)}>
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p
              className={cn(
                "text-xs mt-1",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

