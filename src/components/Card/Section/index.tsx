"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  id?: string;
  title?: string;
  description?: string;
  button?: React.ReactNode;
  mainClassName?: string;
  contentClassName?: string;
}

export const Section: React.FC<SectionProps> = ({
  children,
  id,
  title,
  description,
  button,
  mainClassName,
  contentClassName,
}) => {
  return (
    <Card id={id} className={cn("", mainClassName)}>
      {(title || description || button) && (
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="grid gap-2">
            {title && <CardTitle>{title}</CardTitle>}
            {description && (
              <CardDescription className="text-sm text-gray-500">
                {description}
              </CardDescription>
            )}
          </div>
          {button && button}
        </CardHeader>
      )}
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
};
