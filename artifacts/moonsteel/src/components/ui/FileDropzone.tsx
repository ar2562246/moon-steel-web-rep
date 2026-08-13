"use client";

import { useState, type DragEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type FileDropzoneProps = {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  inputKey?: string | number;
  className?: string;
  label?: ReactNode;
  hint?: ReactNode;
  onFiles: (files: File[]) => void;
};

export function filterFilesByAccept(files: Iterable<File>, accept?: string) {
  const list = Array.from(files);
  if (!accept?.trim()) return list;

  const tokens = accept
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);

  return list.filter((file) => {
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    return tokens.some((token) => {
      if (token === "image/*") return type.startsWith("image/") || /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(name);
      if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1));
      if (token.startsWith(".")) return name.endsWith(token);
      return type === token;
    });
  });
}

export function hasFileDrag(event: DragEvent) {
  return Array.from(event.dataTransfer?.types ?? []).includes("Files");
}

export function FileDropzone({
  accept,
  multiple = true,
  disabled = false,
  inputKey,
  className,
  label = "Drop files here or click to browse",
  hint,
  onFiles,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const emit = (list: Iterable<File>) => {
    const files = filterFilesByAccept(list, accept);
    const next = multiple ? files : files.slice(0, 1);
    if (next.length === 0) return;
    onFiles(next);
  };

  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-5 text-center text-sm transition-colors",
        isDragging
          ? "border-primary bg-primary/5 text-primary"
          : "border-border bg-muted/40 text-muted-foreground hover:border-primary hover:bg-primary/5 hover:text-primary",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      onDragOver={(event) => {
        if (!hasFileDrag(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(event) => {
        if (!hasFileDrag(event)) return;
        event.preventDefault();
        setIsDragging(false);
        emit(event.dataTransfer.files);
      }}
    >
      <input
        key={inputKey}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          emit(event.target.files ?? []);
          event.target.value = "";
        }}
      />
      <span className="font-medium">{label}</span>
      {hint ? <span className="text-xs opacity-80">{hint}</span> : null}
    </label>
  );
}
