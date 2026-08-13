"use client";

import { cn } from "@/lib/utils";
import {
  formatAspectRatio,
  formatFileSize,
  useImageResolution,
} from "@/features/admin/components/useImageResolution";

type AdminImagePreviewProps = {
  src: string;
  alt?: string;
  file?: File | null;
  className?: string;
  imgClassName?: string;
};

export function ImageResolutionBadge({
  src,
  file,
  className,
}: {
  src?: string | null;
  file?: File | null;
  className?: string;
}) {
  const resolution = useImageResolution(src);
  if (!src) return null;

  return (
    <div
      className={cn(
        "pointer-events-none rounded bg-black/75 px-2 py-1 text-[11px] leading-tight text-white",
        className
      )}
    >
      {resolution ? (
        <>
          <p className="font-medium tabular-nums">
            {resolution.width} × {resolution.height}
          </p>
          <p className="text-white/80">
            {formatAspectRatio(resolution.width, resolution.height)}
            {file ? ` · ${formatFileSize(file.size)}` : ""}
          </p>
        </>
      ) : (
        <p>Reading size…</p>
      )}
    </div>
  );
}

export function AdminImagePreview({
  src,
  alt = "",
  file,
  className,
  imgClassName,
}: AdminImagePreviewProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={cn("h-full w-full", imgClassName)} />
      <ImageResolutionBadge src={src} file={file} className="absolute bottom-2 left-2" />
    </div>
  );
}
