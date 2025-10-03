"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

interface DragnDropProps extends React.InputHTMLAttributes<HTMLInputElement> {
  acceptedFileTypes?: string;
  maxSize?: number;
  label?: string;
  onFileChange?: (base64: string, fileName: string) => void;
}

export const DragnDrop: React.FC<DragnDropProps> = ({
  className,
  onChange,
  onFileChange,
  acceptedFileTypes = "image/jpeg, image/png, image/webp",
  maxSize = 5 * 1024 * 1024, // 5MB
  label,
  ...props
}) => {
  const [preview, setPreview] = React.useState<string | null>(null);

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        if (file.size > maxSize) {
          toast.error(formatBytes(maxSize));
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setPreview(base64);
          if (onFileChange) {
            onFileChange(base64, file.name);
          }
          if (onChange) {
            onChange({
              target: { value: base64 },
            } as React.ChangeEvent<HTMLInputElement>);
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [maxSize, onChange, onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      [acceptedFileTypes]: [],
    },
    maxSize: maxSize,
    multiple: false,
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  return (
    <div
      className={`flex flex-col items-start gap-2 w-full max-w-md ${className}`}
    >
      {label && <Label htmlFor={props.id}>{label}</Label>}
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:bg-gray-50 dark:hover:bg-gray-800"
          }
        `}
      >
        <input {...getInputProps()} {...props} />
        {preview ? (
          <div className="relative w-full max-w-[200px] h-[200px] overflow-hidden rounded-lg">
            <Image
              src={preview || "/placeholder.svg"}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground/50" />
            <p className="mb-2 text-sm text-muted-foreground">
              {isDragActive ? "drop-image" : "drag-drop"}
            </p>
            <p className="text-xs text-muted-foreground">{"or"}</p>
            <Button variant="outline" className="mt-2" type="button">
              {"select-file"}
            </Button>
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-center text-muted-foreground">
        {formatBytes(maxSize)}
      </p>
    </div>
  );
};
