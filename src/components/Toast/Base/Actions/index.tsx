import { cn } from "@/utils/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React from "react";

const buttonVariants = cva(
  "inline-flex h-8 items-center justify-center rounded-md px-3 mt-2 text-sm font-medium transition-colors focus:outline-none focus:ring-1 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-input bg-background shadow-sm text-primary hover:bg-accent hover:text-accent-foreground",
        success:
          "border border-green-50 bg-green-500 text-white shadow-sm hover:bg-green-600",
        warning:
          "border border-yellow-50 bg-yellow-500 text-white shadow-sm hover:bg-yellow-600",
        error:
          "border border-red-100 bg-red-500 dark:bg-destructive text-white shadow-sm hover:bg-red-600",
        loading:
          "border border-blue-200 bg-blue-500 text-white shadow-sm hover:bg-blue-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type ButtonActionProps = {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
} & VariantProps<typeof buttonVariants>;

const ButtonAction: React.FC<ButtonActionProps> = ({
  children,
  onClick,
  variant,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(buttonVariants({ variant }), className)}
    >
      {children}
    </button>
  );
};

export { ButtonAction };
export default ButtonAction;
