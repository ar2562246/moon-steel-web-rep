"use client";

import { useState, type ReactNode } from "react";
import { Copy, Download, Pencil } from "lucide-react";
import { AdminImageEditDialog } from "@/features/admin/components/AdminImageEditDialog";
import {
  AdminImageActionBar,
  AdminImageActionButton,
} from "@/features/admin/components/AdminImageActions";
import { ImageResolutionBadge } from "@/features/admin/components/AdminImagePreview";
import {
  copyImageSrc,
  downloadImageSrc,
  fileNameFromImageSrc,
} from "@/features/admin/lib/adminImageActions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type AdminEditableImageProps = {
  src: string;
  file?: File | null;
  fileName?: string;
  alt?: string;
  /** Applied to the image frame (e.g. aspect-[4/3] w-full). */
  className?: string;
  imgClassName?: string;
  disabled?: boolean;
  /** Built-in copy / download / edit cluster. Default true. */
  showActions?: boolean;
  /** Extra controls in the below-image toolbar. */
  extraActions?: ReactNode;
  /** Reorder / secondary controls in the below-image toolbar. */
  footerActions?: ReactNode;
  /** Optional badge overlaid on the image (e.g. Cover). */
  badge?: ReactNode;
  onEdited: (file: File) => void | Promise<void>;
};

export function AdminEditableImage({
  src,
  file,
  fileName,
  alt = "",
  className,
  imgClassName,
  disabled = false,
  showActions = true,
  extraActions,
  footerActions,
  badge,
  onEdited,
}: AdminEditableImageProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<"copy" | "download" | null>(null);
  const resolvedName = fileName || file?.name || fileNameFromImageSrc(src);
  const hasToolbar = showActions || Boolean(extraActions) || Boolean(footerActions);

  const onCopy = async () => {
    setBusy("copy");
    try {
      await copyImageSrc(src);
      toast({ title: "Image copied", description: "Paste it anywhere that accepts images." });
    } catch (e) {
      toast({
        title: "Copy failed",
        description: e instanceof Error ? e.message : "Could not copy this image.",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const onDownload = async () => {
    setBusy("download");
    try {
      await downloadImageSrc(src, resolvedName);
      toast({ title: "Image saved", description: "Check your downloads folder." });
    } catch (e) {
      toast({
        title: "Download failed",
        description: e instanceof Error ? e.message : "Could not save this image.",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <div className="flex w-full flex-col gap-2">
        <div className={cn("group relative overflow-hidden bg-muted", className)}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen(true)}
            className="absolute inset-0 z-0 block size-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Edit image"
            title="Click to edit"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className={cn("pointer-events-none size-full", imgClassName ?? "object-cover")}
            />
          </button>

          {badge ? <div className="pointer-events-none absolute left-2 top-2 z-10">{badge}</div> : null}

          <ImageResolutionBadge
            src={src}
            file={file}
            className="pointer-events-none absolute bottom-2 left-2 z-10"
          />
        </div>

        {hasToolbar ? (
          <AdminImageActionBar className="justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {showActions ? (
                <>
                  <AdminImageActionButton
                    tone="copy"
                    disabled={disabled || busy !== null}
                    onClick={() => void onCopy()}
                    aria-label="Copy image"
                    title="Copy"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </AdminImageActionButton>
                  <AdminImageActionButton
                    tone="download"
                    disabled={disabled || busy !== null}
                    onClick={() => void onDownload()}
                    aria-label="Download image"
                    title="Download"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </AdminImageActionButton>
                  <AdminImageActionButton
                    tone="edit"
                    disabled={disabled}
                    onClick={() => setOpen(true)}
                    aria-label="Edit image"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </AdminImageActionButton>
                </>
              ) : null}
              {extraActions}
            </div>
            {footerActions ? <div className="flex flex-wrap items-center gap-1.5">{footerActions}</div> : null}
          </AdminImageActionBar>
        ) : null}
      </div>

      <AdminImageEditDialog
        open={open}
        imageSrc={src}
        fileName={resolvedName}
        onOpenChange={setOpen}
        onSave={(next) => {
          void (async () => {
            await onEdited(next);
            setOpen(false);
          })();
        }}
      />
    </>
  );
}
