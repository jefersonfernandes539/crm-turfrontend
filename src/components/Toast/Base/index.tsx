"use client";

import { cn } from "@/utils/lib/utils";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import React from "react";
import { toast, ToasterProps } from "sonner";
import ButtonAction from "./Actions";

type ToastVariant = "default" | "error" | "success" | "warning";

interface CustomToastProps {
  description: string;
  title?: string;
  duration?: number;
  position?: ToasterProps["position"];
  closeButton?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: ToastVariant;
}

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        error:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
        success: "group border-green-500 bg-green-500 text-white",
        warning: "group border-yellow-500 bg-yellow-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const Base: React.FC<CustomToastProps> = ({
  title,
  description,
  duration = 3000,
  position = "top-right",
  closeButton = true,
  action,
  variant = "default",
}) => {
  const showToast = () => {
    toast.custom(
      (id: string | number) => (
        <div
          className={cn(
            toastVariants({ variant }),
            "relative w-full md:min-w-[360px] ml-auto"
          )}
        >
          <div className="flex flex-col items-start">
            {title && (
              <div className="text-sm font-semibold [&+div]:text-xs">
                {title}
              </div>
            )}
            <div className="opacity-90 text-sm">{description}</div>
          </div>

          {action && (
            <div className="ml-4">
              <ButtonAction
                onClick={() => {
                  action.onClick();
                  toast.dismiss(id);
                }}
                variant={variant}
              >
                {action.label}
              </ButtonAction>
            </div>
          )}

          {closeButton && (
            <button
              onClick={() => toast.dismiss(id)}
              className="absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ),
      {
        duration,
        position,
      }
    );
  };

  return <>{showToast()}</>;
};
