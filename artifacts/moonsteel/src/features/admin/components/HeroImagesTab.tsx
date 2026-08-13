"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Download, Save, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminImagePreview } from "@/features/admin/components/AdminImagePreview";
import {
  AdminMasterDetail,
  AdminSidebarCard,
  AdminSidebarSkeleton,
  AdminSidebarThumb,
  adminSidebarMutedClass,
  adminSidebarTitleClass,
} from "@/features/admin/components/AdminMasterDetail";
import { useHeroImages } from "@/features/admin/hooks/useHeroImages";
import { useToast } from "@/hooks/use-toast";

const slots = [1, 2, 3, 4] as const;

export function HeroImagesTab() {
  const { toast } = useToast();
  const { bySlot, isLoading, isSaving, error, uploadForSlot, saveLabelForSlot, removeFromSlot } =
    useHeroImages();
  const [selectedSlot, setSelectedSlot] = useState<(typeof slots)[number]>(1);
  const [selected, setSelected] = useState<Record<number, File | null>>({
    1: null,
    2: null,
    3: null,
    4: null,
  });
  const [labels, setLabels] = useState<Record<number, string | undefined>>({
    1: undefined,
    2: undefined,
    3: undefined,
    4: undefined,
  });
  const [fileInputKeys, setFileInputKeys] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  });
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const previewUrls = useMemo(() => {
    const next: Record<number, string | null> = { 1: null, 2: null, 3: null, 4: null };
    slots.forEach((slot) => {
      const file = selected[slot];
      if (file) next[slot] = URL.createObjectURL(file);
    });
    return next;
  }, [selected]);

  useEffect(() => {
    return () => {
      slots.forEach((slot) => {
        const preview = previewUrls[slot];
        if (preview) URL.revokeObjectURL(preview);
      });
    };
  }, [previewUrls]);

  const onPickFile = (slot: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file || !file.type.startsWith("image/")) return;
    setSelected((prev) => ({ ...prev, [slot]: file }));
  };

  const onUpload = async (slot: number) => {
    const file = selected[slot];
    if (!file) return;
    const label = (labels[slot] ?? "").trim() || undefined;
    const ok = await uploadForSlot(slot, file, label);
    if (!ok) return;
    setSelected((prev) => ({ ...prev, [slot]: null }));
    setFileInputKeys((prev) => ({ ...prev, [slot]: prev[slot] + 1 }));
    toast({
      title: `Hero image ${slot} updated`,
      description: "Image uploaded successfully.",
    });
  };

  const onSaveLabel = async (slot: number) => {
    if (!bySlot.get(slot)) return;
    const label = (labels[slot] ?? "").trim() || undefined;
    const ok = await saveLabelForSlot(slot, label);
    if (!ok) return;
    toast({
      title: `Hero image ${slot} label saved`,
      description: "Label updated successfully.",
    });
  };

  const onClearSelection = (slot: number) => {
    setSelected((prev) => ({ ...prev, [slot]: null }));
    setFileInputKeys((prev) => ({ ...prev, [slot]: prev[slot] + 1 }));
  };

  const onDelete = async (slot: number) => {
    const ok = await removeFromSlot(slot);
    if (!ok) return;
    setSelected((prev) => ({ ...prev, [slot]: null }));
    setLabels((prev) => ({ ...prev, [slot]: undefined }));
    setFileInputKeys((prev) => ({ ...prev, [slot]: prev[slot] + 1 }));
    toast({
      title: `Hero image ${slot} removed`,
      description: "Image deleted successfully.",
    });
  };

  const downloadImageForSlot = async (slot: number) => {
    const existing = bySlot.get(slot);
    if (!existing?.image_url) return false;
    try {
      const response = await fetch(existing.image_url);
      if (!response.ok) throw new Error("Failed to fetch image.");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const urlPath = new URL(existing.image_url).pathname;
      const extension = urlPath.includes(".") ? urlPath.split(".").pop() : "jpg";
      const fileName = `hero-image-slot-${slot}.${extension}`;

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      return true;
    } catch {
      return false;
    }
  };

  const onDownload = async (slot: number) => {
    const ok = await downloadImageForSlot(slot);
    if (ok) return;
    toast({
      title: "Download failed",
      description: "Could not download this hero image. Please try again.",
      variant: "destructive",
    });
  };

  const onDownloadAll = async () => {
    const availableSlots = slots.filter((slot) => Boolean(bySlot.get(slot)?.image_url));
    if (availableSlots.length === 0) return;

    setIsDownloadingAll(true);
    let successCount = 0;

    for (const slot of availableSlots) {
      const ok = await downloadImageForSlot(slot);
      if (ok) successCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 120));
    }

    setIsDownloadingAll(false);

    if (successCount === availableSlots.length) {
      toast({
        title: "All hero images downloaded",
        description: `${successCount} files were downloaded.`,
      });
      return;
    }

    toast({
      title: "Some downloads failed",
      description: `${successCount}/${availableSlots.length} files were downloaded.`,
      variant: "destructive",
    });
  };

  const existing = bySlot.get(selectedSlot);
  const preview = previewUrls[selectedSlot];

  return (
    <AdminMasterDetail
      title="Hero Images"
      description="Upload or replace each of the 4 hero images shown in the homepage image rail."
      headerActions={
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isDownloadingAll || slots.every((slot) => !bySlot.get(slot)?.image_url)}
          onClick={() => void onDownloadAll()}
        >
          <Download className="mr-2 h-4 w-4" />
          {isDownloadingAll ? "Downloading..." : (
            <>
              <span className="sm:hidden">Download</span>
              <span className="hidden sm:inline">Download All</span>
            </>
          )}
        </Button>
      }
      keepListOnMobile
      error={error}
      sidebar={
        isLoading ? (
          <AdminSidebarSkeleton count={4} withImage />
        ) : (
          slots.map((slot) => {
            const item = bySlot.get(slot);
            const selected = selectedSlot === slot;
            const src = previewUrls[slot] ?? item?.image_url;
            return (
              <AdminSidebarCard key={slot} selected={selected} onClick={() => setSelectedSlot(slot)}>
                <AdminSidebarThumb
                  src={src}
                  alt={`Hero slot ${slot}`}
                  className="aspect-video w-full"
                />
                <div className="space-y-1 p-2.5">
                  <p className={adminSidebarTitleClass(selected)}>Hero Image {slot}</p>
                  <p className={adminSidebarMutedClass(selected)}>{item?.label || "No label"}</p>
                </div>
              </AdminSidebarCard>
            );
          })
        )
      }
      detailTitle={`Hero Image ${selectedSlot}`}
      detailDescription="Replace the photo, update the label, or download this slot."
      isEditorOpen
    >
      <div className="space-y-4">
        <div className="layer-2 flex h-40 items-center justify-center overflow-hidden rounded-lg sm:h-56">
          {preview ?? existing?.image_url ? (
            <AdminImagePreview
              src={(preview ?? existing?.image_url) as string}
              alt={`Hero slot ${selectedSlot}`}
              file={selected[selectedSlot]}
              className="h-40 w-full sm:h-56"
              imgClassName="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
              Empty image slot
            </div>
          )}
        </div>

        <input
          key={`hero-file-${selectedSlot}-${fileInputKeys[selectedSlot]}`}
          type="file"
          accept="image/*"
          onChange={onPickFile(selectedSlot)}
          className="layer-1 w-full rounded-md px-3 py-2 text-sm"
        />

        <Input
          type="text"
          placeholder="Image label (e.g. Prep & Sinks)"
          value={labels[selectedSlot] ?? existing?.label ?? ""}
          onChange={(e) => setLabels((prev) => ({ ...prev, [selectedSlot]: e.target.value }))}
        />

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            type="button"
            disabled={!selected[selectedSlot] || isSaving}
            onClick={() => void onUpload(selectedSlot)}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : existing ? "Replace" : "Upload"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!existing}
            onClick={() => void onDownload(selectedSlot)}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!existing || isSaving}
            onClick={() => void onSaveLabel(selectedSlot)}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Label
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!selected[selectedSlot] || isSaving}
            onClick={() => onClearSelection(selectedSlot)}
          >
            <X className="mr-2 h-4 w-4" />
            Clear Selection
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!existing || isSaving}
            onClick={() => void onDelete(selectedSlot)}
            className="col-span-2"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </AdminMasterDetail>
  );
}
