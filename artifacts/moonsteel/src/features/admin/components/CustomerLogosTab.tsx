"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageDown, Trash2 } from "lucide-react";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { AdminEditableImage } from "@/features/admin/components/AdminEditableImage";
import { AdminImageActionButton } from "@/features/admin/components/AdminImageActions";
import {
  AdminDetailSkeleton,
  AdminMasterDetail,
  AdminSidebarCard,
  AdminSidebarEmpty,
  AdminSidebarSkeleton,
  AdminSidebarThumb,
  adminSidebarBodyClass,
  adminSidebarMutedClass,
  adminSidebarTitleClass,
} from "@/features/admin/components/AdminMasterDetail";
import { useCustomerLogos } from "@/features/admin/hooks/useCustomerLogos";
import { fetchLogoSliderSpeed, saveLogoSliderSpeed } from "@/features/admin/services/customerLogos";
import {
  optimizeImageToWebLogo,
  WEB_LOGO_MAX_HEIGHT,
  WEB_LOGO_MAX_WIDTH,
} from "@/features/admin/lib/optimizeImageToWeb43";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { CustomerLogo } from "@/features/admin/types";
import { logoAltFromUrl } from "@/lib/logo-alt";

export function CustomerLogosTab() {
  const { toast } = useToast();
  const { logos, isLoading, isUploading, error, upload, uploadMany, remove } = useCustomerLogos();
  const [selectedLogo, setSelectedLogo] = useState<CustomerLogo | null>(null);
  const [isUploadingView, setIsUploadingView] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [sliderSpeed, setSliderSpeed] = useState(52);
  const [isSavingSpeed, setIsSavingSpeed] = useState(false);
  const [speedError, setSpeedError] = useState<string | null>(null);
  const [optimizingKey, setOptimizingKey] = useState<string | null>(null);

  const isEditorOpen = isUploadingView || Boolean(selectedLogo);

  const previewUrls = useMemo(
    () =>
      selectedFiles.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [selectedFiles]
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [previewUrls]);

  useEffect(() => {
    fetchLogoSliderSpeed()
      .then((seconds) => setSliderSpeed(seconds))
      .catch(() => {
        // Keep default speed when setting cannot be loaded.
      });
  }, []);

  const addLogoFiles = (files: File[]) => {
    setSelectedFiles((current) => {
      const next = [...current];
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        if (next.some((existing) => existing.name === file.name && existing.size === file.size)) continue;
        next.push(file);
      }
      return next;
    });
  };

  const startUpload = () => {
    setSelectedLogo(null);
    setSelectedFiles([]);
    setIsUploadingView(true);
  };

  const startEdit = (logo: CustomerLogo) => {
    setIsUploadingView(false);
    setSelectedFiles([]);
    setSelectedLogo(logo);
  };

  const closeEditor = () => {
    setSelectedLogo(null);
    setIsUploadingView(false);
    setSelectedFiles([]);
  };

  const onUpload = async () => {
    if (selectedFiles.length === 0) return;
    try {
      const prepared: File[] = [];
      for (const file of selectedFiles) {
        const result = await optimizeImageToWebLogo(file, file.name);
        prepared.push(result.status === "optimized" ? result.file : file);
      }
      await uploadMany(prepared);
      setSelectedFiles([]);
      setIsUploadingView(false);
    } catch (e) {
      toast({
        title: "Could not prepare logos",
        description: e instanceof Error ? e.message : "Try a smaller image file.",
        variant: "destructive",
      });
    }
  };

  const replaceSelectedFile = (index: number, file: File) => {
    setSelectedFiles((current) => current.map((existing, i) => (i === index ? file : existing)));
  };

  const onOptimizePreview = async (index: number) => {
    const file = selectedFiles[index];
    if (!file) return;
    setOptimizingKey(`preview-${index}`);
    try {
      const result = await optimizeImageToWebLogo(file, file.name);
      if (result.status === "already-standard") {
        toast({
          title: "Already thumbnail size",
          description: `${result.width} × ${result.height} is within ${WEB_LOGO_MAX_WIDTH} × ${WEB_LOGO_MAX_HEIGHT}.`,
        });
        return;
      }
      replaceSelectedFile(index, result.file);
      toast({
        title: "Resized to thumbnail",
        description: `${result.previousWidth} × ${result.previousHeight} → ${result.width} × ${result.height}. Upload to save.`,
      });
    } catch (e) {
      toast({
        title: "Could not resize logo",
        description: e instanceof Error ? e.message : "Try another file.",
        variant: "destructive",
      });
    } finally {
      setOptimizingKey(null);
    }
  };

  const onOptimizeSavedLogo = async (logo: CustomerLogo) => {
    setOptimizingKey(logo.id);
    try {
      const result = await optimizeImageToWebLogo(logo.image_url, `customer-logo-${logo.id}.png`);
      if (result.status === "already-standard") {
        toast({
          title: "Already thumbnail size",
          description: `${result.width} × ${result.height} is within ${WEB_LOGO_MAX_WIDTH} × ${WEB_LOGO_MAX_HEIGHT}.`,
        });
        return;
      }
      const created = await upload(result.file);
      if (!created) {
        toast({
          title: "Update failed",
          description: "Could not upload the resized logo.",
          variant: "destructive",
        });
        return;
      }
      const ok = await remove(logo);
      setSelectedLogo(created);
      toast({
        title: ok ? "Logo resized" : "Resized logo uploaded",
        description: `${result.previousWidth} × ${result.previousHeight} → ${result.width} × ${result.height}.`,
      });
    } catch (e) {
      toast({
        title: "Could not resize logo",
        description: e instanceof Error ? e.message : "Try downloading and re-uploading the file.",
        variant: "destructive",
      });
    } finally {
      setOptimizingKey(null);
    }
  };

  const onDelete = async (logo: CustomerLogo) => {
    const ok = await remove(logo);
    if (!ok) return;
    if (selectedLogo?.id === logo.id) closeEditor();
  };

  const onSaveSpeed = async () => {
    setSpeedError(null);
    setIsSavingSpeed(true);
    try {
      const saved = await saveLogoSliderSpeed(sliderSpeed);
      setSliderSpeed(saved);
    } catch (e) {
      setSpeedError(e instanceof Error ? e.message : "Failed to save speed.");
    } finally {
      setIsSavingSpeed(false);
    }
  };

  return (
    <AdminMasterDetail
      title="Customer Logos"
      description="Logos in the homepage slider. Keep them small — they only display as thumbnails."
      addLabel="Add Logos"
      onAdd={startUpload}
      onBack={closeEditor}
      formId={isUploadingView ? "admin-logo-upload-form" : undefined}
      canSubmit={selectedFiles.length > 0}
      isSaving={isUploading}
      submitLabel={
        selectedFiles.length > 1 ? `Upload ${selectedFiles.length} Logos` : "Upload Logo"
      }
      error={error}
      notice={
        <div className="layer-2 rounded-lg p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Logo Slider Speed</p>
            <span className="text-xs text-muted-foreground">{sliderSpeed}s per loop</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={12}
              max={120}
              step={1}
              value={sliderSpeed}
              onChange={(e) => setSliderSpeed(Number(e.target.value))}
              className="w-full"
            />
            <Button type="button" size="sm" onClick={() => void onSaveSpeed()} disabled={isSavingSpeed}>
              {isSavingSpeed ? "Saving..." : "Save"}
            </Button>
          </div>
          {speedError ? <p className="mt-2 text-xs text-destructive">{speedError}</p> : null}
        </div>
      }
      sidebar={
        isLoading ? (
          <AdminSidebarSkeleton withImage />
        ) : logos.length === 0 ? (
          <AdminSidebarEmpty>No logos uploaded yet.</AdminSidebarEmpty>
        ) : (
          logos.map((logo) => {
            const selected = !isUploadingView && selectedLogo?.id === logo.id;
            return (
              <AdminSidebarCard
                key={logo.id}
                selected={selected}
                compact
                onClick={() => startEdit(logo)}
              >
                <AdminSidebarThumb
                  src={logo.image_url}
                  alt={logoAltFromUrl(logo.image_url)}
                  contain
                  className="min-h-[4.5rem] w-28 self-stretch bg-background"
                />
                <div className={adminSidebarBodyClass()}>
                  <p className={adminSidebarTitleClass(selected)}>Customer logo</p>
                  <p className={adminSidebarMutedClass(selected)}>
                    {new Date(logo.created_at).toLocaleDateString()}
                  </p>
                </div>
              </AdminSidebarCard>
            );
          })
        )
      }
      detailTitle={isUploadingView ? "Add logos" : selectedLogo ? "Logo detail" : "Logo detail"}
      detailDescription={
        !isEditorOpen
          ? "Choose a logo from the sidebar, or add new files."
          : isUploadingView
            ? "Drop image files or pick them from your computer."
            : "Preview at thumbnail size, resize, or delete this logo."
      }
      detailActions={
        selectedLogo && !isUploadingView ? (
          <Button variant="outline" size="sm" type="button" onClick={() => void onDelete(selectedLogo)}>
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete
          </Button>
        ) : null
      }
      isEditorOpen={isEditorOpen}
      skeleton={<AdminDetailSkeleton withImage />}
    >
      {isUploadingView ? (
        <form
          id="admin-logo-upload-form"
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void onUpload();
          }}
        >
          <FileDropzone
            accept="image/*"
            multiple
            label="Drop logos here or click to browse"
            hint={`Multiple image files · resized to ${WEB_LOGO_MAX_WIDTH}×${WEB_LOGO_MAX_HEIGHT} on upload`}
            onFiles={addLogoFiles}
          />
          {previewUrls.length > 0 ? (
            <div className="layer-2 grid grid-cols-2 gap-3 rounded-lg p-4 sm:grid-cols-3">
              {previewUrls.map((item, index) => (
                <AdminEditableImage
                  key={`${item.name}-${item.url}`}
                  src={item.url}
                  alt={`Preview ${item.name}`}
                  file={selectedFiles[index]}
                  fileName={item.name}
                  variant="logo"
                  className="layer-1 h-24 w-full rounded-md bg-background"
                  imgClassName="object-contain p-2"
                  extraActions={
                    <AdminImageActionButton
                      tone="optimize"
                      disabled={optimizingKey !== null}
                      onClick={(event) => {
                        event.stopPropagation();
                        void onOptimizePreview(index);
                      }}
                      aria-label="Resize to thumbnail"
                      title={`Thumbnail · max ${WEB_LOGO_MAX_WIDTH}×${WEB_LOGO_MAX_HEIGHT}`}
                    >
                      <ImageDown className="h-3.5 w-3.5" />
                    </AdminImageActionButton>
                  }
                  onEdited={(file) => {
                    replaceSelectedFile(index, file);
                    toast({
                      title: "Logo edited",
                      description: "Upload to save the edited logo.",
                    });
                  }}
                />
              ))}
            </div>
          ) : null}
        </form>
      ) : selectedLogo ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Shown as a small thumbnail on the site. Keep files at or below {WEB_LOGO_MAX_WIDTH} ×{" "}
            {WEB_LOGO_MAX_HEIGHT}.
          </p>
          <AdminEditableImage
            src={selectedLogo.image_url}
            alt={logoAltFromUrl(selectedLogo.image_url)}
            fileName={`customer-logo-${selectedLogo.id}.png`}
            variant="logo"
            className="layer-2 h-[7.5rem] w-[13rem] max-w-full rounded-lg bg-background"
            imgClassName="object-contain p-3"
            extraActions={
              <AdminImageActionButton
                tone="optimize"
                disabled={optimizingKey !== null}
                onClick={(event) => {
                  event.stopPropagation();
                  void onOptimizeSavedLogo(selectedLogo);
                }}
                aria-label="Resize to thumbnail"
                title={`Thumbnail · max ${WEB_LOGO_MAX_WIDTH}×${WEB_LOGO_MAX_HEIGHT}`}
              >
                <ImageDown className="h-3.5 w-3.5" />
              </AdminImageActionButton>
            }
            onEdited={async (file) => {
              const created = await upload(file);
              if (!created) {
                toast({
                  title: "Update failed",
                  description: "Could not upload the edited logo.",
                  variant: "destructive",
                });
                return;
              }
              const ok = await remove(selectedLogo);
              setSelectedLogo(created);
              toast({
                title: ok ? "Logo updated" : "Logo uploaded",
                description: ok
                  ? "Edited logo replaced the previous file."
                  : "Edited logo uploaded; remove the old one if it still appears.",
              });
            }}
          />
        </div>
      ) : null}
    </AdminMasterDetail>
  );
}
