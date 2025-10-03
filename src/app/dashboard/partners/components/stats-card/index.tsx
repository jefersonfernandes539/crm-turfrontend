"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  value: string | number;
  color?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  title,
  value,
  color = "text-foreground",
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          {Icon && (
            <Icon
              className={`w-6 h-6 ${
                color === "text-foreground" ? "text-secondary" : color
              }`}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
