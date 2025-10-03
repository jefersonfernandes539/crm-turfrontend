import React from "react";

import { cn } from "@/utils/lib/utils";

import { Base, TextBaseComponentProps } from "../Base";

export const Subtitle: React.FC<TextBaseComponentProps> = ({
  children,
  className,
  ...rest
}) => {
  return (
    <Base as="h3" className={cn("font-medium", className)} {...rest}>
      {children}
    </Base>
  );
};
