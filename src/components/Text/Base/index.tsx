import clsx from "clsx";
import React from "react";

export type TextBaseComponentProps = {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
  className?: string;
};

export const Base: React.FC<TextBaseComponentProps> = ({
  children,
  as: Component = "p",
  className,
}) => {
  const baseStyles = {
    h1: "text-2xl font-bold text-gray-700 dark:text-gray-100",
    h2: "text-xl font-semibold text-foreground",
    h3: "text-lg font-semibold text-foreground",
    h4: "text-md font-medium text-foreground",
    h5: "text-base font-medium text-foreground",
    h6: "text-sm font-medium text-foreground",
    p: "text-foreground",
  };

  const styles = baseStyles[Component as keyof typeof baseStyles] || "";

  return <Component className={clsx(styles, className)}>{children}</Component>;
};
