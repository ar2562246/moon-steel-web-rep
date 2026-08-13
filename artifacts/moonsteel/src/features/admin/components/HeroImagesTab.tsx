"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, ImageDown, Save, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileDropzone, filterFilesByAccept } from "@/components/ui/FileDropzone";
import { AdminEditableImage } from "@/features/admin/components/AdminEditableImage";
import { AdminImageActionButton } from "@/features/admin/components/AdminImageActions";
import {
  AdminMasterDetail,
  AdminSidebarCard,
  AdminSidebarSkeleton,
  AdminSidebarThumb,
  adminSidebarBodyClass,
  adminSidebarMutedClass,
  adminSidebarTitleClass,
} from "@/features/admin/components/AdminMasterDetail";
import { useHeroImages } from "@/features/admin/hooks/useHeroImages";
import { downloadImageSrc } from "@/features/admin/lib/adminImageActions";
import {
  optimizeImageToWebHero,
  WEB_HERO_MAX_HEIGHT,
  WEB_HERO_MAX_WIDTH,
} from "@/features/admin/lib/optimizeImageToWeb43";
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
  const [isOptimizing, setIsOptimizing] = useState(false);

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

  const assignImageFiles = (files: File[], startSlot: number) => {
    const images = filterFilesByAccept(files, "image/*");
    if (images.length === 0) return;

    setSelected((prev) => {
      const next = { ...prev };
      const emptySlots = slots.filter(
        (slot) => slot !== startSlot && !next[slot] && !bySlot.get(slot),
      );
      const order = [startSlot, ...emptySlots];
      images.forEach((file, index) => {
        const slot = order[index];
        if (slot) next[slot] = file;
      });
      return next;
    });
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

  const onOptimizeForWeb = async (slot: number) => {
    const pending = selected[slot];
    const existingImage = bySlot.get(slot);
    const source = pending ?? existingImage?.image_url;
    if (!source) return;

    setIsOptimizing(true);
    try {
      const name =
        pending?.name ||
        (typeof source === "string" ? `hero-image-slot-${slot}.jpg` : "hero-image.jpg");
      const result = await optimizeImageToWebHero(source, name);

      if (result.status === "already-standard") {
        toast({
          title: "Already web-ready",
          description: `${result.width}×${result.height} is within ${WEB_HERO_MAX_WIDTH}×${WEB_HERO_MAX_HEIGHT} at 16:9.`,
        });
        return;
      }

      setSelected((prev) => ({ ...prev, [slot]: result.file }));
      toast({
        title: "Optimized for web",
        description: `${result.previousWidth}×${result.previousHeight} → ${result.width}×${result.height}. Click ${existingImage ? "Replace" : "Upload"} to save.`,
      });
    } catch (e) {
      toast({
        title: "Optimize failed",
        description: e instanceof Error ? e.message : "Could not optimize this hero image.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
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
    const pending = previewUrls[slot];
    const src = pending ?? existing?.image_url;
    if (!src) return false;
    try {
      await downloadImageSrc(src, `hero-image-slot-${slot}.jpg`);
      return true;
    } catch {
      return false;
    }
  };

  const onDownloadAll = async () => {
    const availableSlots = slots.filter(
      (slot) => Boolean(previewUrls[slot] || bySlot.get(slot)?.image_url)
    );
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
  const displaySrc = preview ?? existing?.image_url ?? null;
  const pendingFile = selected[selectedSlot];
  const labelValue = labels[selectedSlot] ?? existing?.label ?? "";

  return (
    <AdminMasterDetail
      title="Hero Images"
      description="Upload or replace each of the 4 hero images shown in the homepage image rail."
      headerActions={
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={
            isDownloadingAll ||
            slots.every((slot) => !previewUrls[slot] && !bySlot.get(slot)?.image_url)
          }
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
            const isSelected = selectedSlot === slot;
            const src = previewUrls[slot] ?? item?.image_url;
            return (
              <AdminSidebarCard
                key={slot}
                selected={isSelected}
                compact
                onClick={() => setSelectedSlot(slot)}
              >
                <AdminSidebarThumb
                  src={src}
                  alt={`Hero slot ${slot}`}
                  className="h-16 w-[5.5rem]"
                />
                <div className={adminSidebarBodyClass()}>
                  <p className={adminSidebarTitleClass(isSelected)}>Hero Image {slot}</p>
                  <p className={adminSidebarMutedClass(isSelected)}>
                    {selected[slot] ? "Pending upload" : item?.label || "Empty slot"}
                  </p>
                </div>
              </AdminSidebarCard>
            );
          })
        )
      }
      detailTitle={`Hero Image ${selectedSlot}`}
      detailDescription="Click the photo to edit. Replace, label, or delete this homepage slot."
      detailActions={
        <>
          {pendingFile ? (
            <Button
              type="button"
              size="sm"
              disabled={isSaving}
              onClick={() => void onUpload(selectedSlot)}
            >
              <Upload className="mr-2 h-3.5 w-3.5" />
              {isSaving ? "Saving..." : existing ? "Replace" : "Upload"}
            </Button>
          ) : null}
          {existing ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={() => void onDelete(selectedSlot)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </Button>
          ) : null}
        </>
      }
      isEditorOpen
    >
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label>Photo</Label>
            <div className="flex items-center gap-2">
              {displaySrc ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isOptimizing || isSaving}
                  onClick={() => void onOptimizeForWeb(selectedSlot)}
                >
                  <ImageDown className="mr-2 h-3.5 w-3.5" />
                  {isOptimizing ? "Optimizing…" : "Make web ready"}
                </Button>
              ) : null}
              {pendingFile ? (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  Unsaved edit — click {existing ? "Replace" : "Upload"}
                </span>
              ) : null}
            </div>
          </div>

          {displaySrc ? (
            <AdminEditableImage
              src={displaySrc}
              alt={`Hero slot ${selectedSlot}`}
              file={pendingFile}
              fileName={pendingFile?.name || `hero-image-slot-${selectedSlot}.jpg`}
              className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted"
              imgClassName="object-cover"
              disabled={isOptimizing || isSaving}
              extraActions={
                <AdminImageActionButton
                  tone="optimize"
                  disabled={isOptimizing || isSaving}
                  onClick={(event) => {
                    event.stopPropagation();
                    void onOptimizeForWeb(selectedSlot);
                  }}
                  aria-label="Make web ready"
                  title={`Web ready · max ${WEB_HERO_MAX_WIDTH}×${WEB_HERO_MAX_HEIGHT} 16:9`}
                >
                  <ImageDown className="h-3.5 w-3.5" />
                </AdminImageActionButton>
              }
              onEdited={(file) => {
                setSelected((prev) => ({ ...prev, [selectedSlot]: file }));
                toast({
                  title: "Hero image edited",
                  description: `Click ${existing ? "Replace" : "Upload"} to save it to this slot.`,
                });
              }}
            />
          ) : (
            <FileDropzone
              accept="image/*"
              multiple
              inputKey={`hero-empty-${selectedSlot}-${fileInputKeys[selectedSlot]}`}
              className="aspect-video rounded-xl"
              label="Drop hero photos or click"
              hint={`Widescreen 16:9 · extra files fill empty slots · up to ${WEB_HERO_MAX_WIDTH}×${WEB_HERO_MAX_HEIGHT}`}
              onFiles={(files) => assignImageFiles(files, selectedSlot)}
            />
          )}
          {displaySrc ? (
            <p className="text-xs text-muted-foreground">
              Use <span className="font-medium text-foreground">Make web ready</span> to crop to 16:9
              and shrink to max {WEB_HERO_MAX_WIDTH}×{WEB_HERO_MAX_HEIGHT} JPEG for faster homepage
              loads.
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`hero-label-${selectedSlot}`}>Label</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id={`hero-label-${selectedSlot}`}
              type="text"
              placeholder="e.g. Prep & Sinks"
              value={labelValue}
              onChange={(e) => setLabels((prev) => ({ ...prev, [selectedSlot]: e.target.value }))}
            />
            <Button
              type="button"
              variant="outline"
              disabled={!existing || isSaving}
              onClick={() => void onSaveLabel(selectedSlot)}
              className="sm:shrink-0"
            >
              <Save className="mr-2 h-4 w-4" />
              Save label
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Replace file</Label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <FileDropzone
              accept="image/*"
              multiple
              inputKey={`hero-file-${selectedSlot}-${fileInputKeys[selectedSlot]}`}
              className="w-full py-4"
              label="Drop a replacement, or several to fill empty slots"
              hint="First file replaces this slot"
              onFiles={(files) => assignImageFiles(files, selectedSlot)}
            />
            {pendingFile ? (
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => onClearSelection(selectedSlot)}
                className="sm:shrink-0"
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            ) : null}
          </div>
          {pendingFile ? (
            <p className="text-xs text-muted-foreground">
              Selected: <span className="font-medium text-foreground">{pendingFile.name}</span>
            </p>
          ) : null}
        </div>
      </div>
    </AdminMasterDetail>
  );
}
