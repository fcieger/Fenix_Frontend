"use client";

import { StatsCard, StatsCardProps } from "./StatsCard";

export interface StatsGridProps {
  stats: StatsCardProps[];
  className?: string;
}

export function StatsGrid({ stats, className }: StatsGridProps) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 ${className || ""}`}
    >
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}

