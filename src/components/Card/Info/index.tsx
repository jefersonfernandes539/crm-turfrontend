"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils/lib/utils";

interface InfoCardProps {
  title: string;
  icon: React.ReactNode;
  value: string | number;
  info: string;
  className?: string;
}

export const Info: React.FC<InfoCardProps> = ({
  title,
  icon,
  value,
  info,
  className,
}) => {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{info}</p>
      </CardContent>
    </Card>
  );
};
