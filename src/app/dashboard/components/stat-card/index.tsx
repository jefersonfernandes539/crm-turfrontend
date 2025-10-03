"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StatCardProps } from "@/types/Dashboard";

export const StatCard = ({
  title,
  value,
  icon,
  description,
  loading,
  onClick,
}: StatCardProps) => {
  return (
    <Card
      onClick={onClick}
      className={`transition-all duration-200 ${
        onClick
          ? "cursor-pointer hover:bg-muted/30 hover:shadow-md hover:scale-[1.02]"
          : ""
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-btj-muted">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-7 w-24 bg-btj-muted/20 animate-pulse rounded-md" />
            <div className="h-3 w-16 bg-btj-muted/20 animate-pulse rounded-md" />
          </div>
        ) : (
          <>
            <div
              className="text-2xl font-bold text-btj-text truncate"
              title={value}
            >
              {value}
            </div>
            <p className="text-xs text-btj-muted mt-1">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
