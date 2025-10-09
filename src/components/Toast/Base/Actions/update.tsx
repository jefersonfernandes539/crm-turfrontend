"use client";

import { toast } from "sonner";
import { cn } from "@/utils/lib/utils";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import React from "react";

type ToastVariant =
  | "default"
  | "error"
  | "success"
  | "warning"
  | "loading";

interface ToastUpdateProps {
  id: string | number;
  title?: string;
  description: string;
  duration?: number;
  variant?: ToastVariant;
}

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        error: "border-red-500 bg-red-500 text-white",
        success: "border-green-500 bg-green-500 text-white",
        warning: "border-yellow-500 bg-yellow-500 text-white",
        loading: "border-blue-500 bg-blue-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const Update = ({
  id,
  title,
  description,
  duration = 3000,
  variant = "default",
}: ToastUpdateProps) => {
  toast.custom(
    () => (
      <div
        className={cn(
          toastVariants({ variant }),
          "relative w-full md:min-w-[360px] ml-auto"
        )}
      >
        <div className="flex flex-col items-start">
          {title && (
            <div className="text-sm font-semibold [&+div]:text-xs">{title}</div>
          )}
          <div className="opacity-90 text-sm">{description}</div>
        </div>

        <button
          onClick={() => toast.dismiss(id)}
          className="absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100"
        >
          <X size={16} />
        </button>
      </div>
    ),
    { id, duration }
  );
};
