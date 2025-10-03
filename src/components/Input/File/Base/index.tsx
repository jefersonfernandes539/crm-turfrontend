"use client";

import { Upload } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { cn } from "@/utils/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FileInputWithAddonProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  acceptedFileTypes?: string;
  // maxSize?: number;
  onUpload?: (file: File) => Promise<void>;
}

export const Base: React.FC<FileInputWithAddonProps> = ({
  className,
  onChange,
  acceptedFileTypes = "*",
  // maxSize = 1024 * 1024 * 2, // 2MB
  onUpload,
  ...props
}) => {
  const [file, setFile] = React.useState<File | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // if (selectedFile.size > maxSize) {
      //   toast.error(t("max-size-error", { size: formatBytes(maxSize) }));
      //   return;
      // }
      setFile(selectedFile);
      if (onChange) {
        onChange(event);
      }
      if (onUpload) {
        onUpload(selectedFile).catch(() => {
          toast.error("upload-error");
        });
      }
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  // const formatBytes = (bytes: number) => {
  //   if (bytes === 0) return "0 Bytes";
  //   const k = 1024;
  //   const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  //   const i = Math.floor(Math.log(bytes) / Math.log(k));
  //   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  // };

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <div className="flex">
        <Button
          type="button"
          variant="secondary"
          className="rounded-r-none"
          onClick={handleClick}
        >
          <Upload className="w-4 h-4" />
        </Button>
        <Input
          readOnly
          value={file ? file.name : "select-file"}
          className="rounded-l-none"
          onClick={handleClick}
        />
        <Input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept={acceptedFileTypes}
          {...props}
        />
      </div>
      {/* <p className="text-xs text-muted-foreground">
        {t("max-file-size", { size: formatBytes(maxSize) })}
      </p> */}
    </div>
  );
};
