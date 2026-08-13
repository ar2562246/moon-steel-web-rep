"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import {
  FlipHorizontal2,
  FlipVertical2,
  ImageDown,
  Copy,
  Download,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  aspectValue,
  exportEditedImage,
  type ImageEditAspect,
} from "@/features/admin/lib/editImage";
import {
  copyImageSrc,
  downloadImageSrc,
} from "@/features/admin/lib/adminImageActions";
import { WEB_43_MAX_HEIGHT, WEB_43_MAX_WIDTH } from "@/features/admin/lib/optimizeImageToWeb43";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type AdminImageEditDialogProps = {
  open: boolean;
  imageSrc: string | null;
  fileName?: string;
  onOpenChange: (open: boolean) => void;
  onSave: (file: File) => void;
};

const ASPECT_OPTIONS: { id: ImageEditAspect; label: string }[] = [
  { id: "4:3", label: "4:3" },
  { id: "1:1", label: "Square" },
  { id: "free", label: "Free" },
];

async function bakeFlip(src: string, flipHorizontal: boolean, flipVertical: boolean) {
  if (!flipHorizontal && !flipVertical) return src;

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not flip this image."));
    img.src = src;
  });

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare the flip canvas.");

  ctx.translate(flipHorizontal ? canvas.width : 0, flipVertical ? canvas.height : 0);
  ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
  ctx.drawImage(image, 0, 0);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((next) => {
      if (!next) reject(new Error("Could not export the flipped image."));
      else resolve(next);
    }, "image/jpeg", 0.95);
  });

  return URL.createObjectURL(blob);
}

export function AdminImageEditDialog({
  open,
  imageSrc,
  fileName = "product-image.jpg",
  onOpenChange,
  onSave,
}: AdminImageEditDialogProps) {
  const { toast } = useToast();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<ImageEditAspect>("4:3");
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [workingSrc, setWorkingSrc] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetTransforms = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setAspect("4:3");
    setFlipHorizontal(false);
    setFlipVertical(false);
    setBrightness(100);
    setContrast(100);
    setCroppedAreaPixels(null);
    setError(null);
    setIsSaving(false);
  }, []);

  useEffect(() => {
    if (!open || !imageSrc) {
      setWorkingSrc((previous) => {
        if (previous && previous.startsWith("blob:")) URL.revokeObjectURL(previous);
        return null;
      });
      return;
    }
    resetTransforms();
    setWorkingSrc(imageSrc);
  }, [open, imageSrc, resetTransforms]);

  useEffect(() => {
    if (!open || !imageSrc) return;
    let cancelled = false;

    void (async () => {
      try {
        const next = await bakeFlip(imageSrc, flipHorizontal, flipVertical);
        if (cancelled) {
          if (next !== imageSrc && next.startsWith("blob:")) URL.revokeObjectURL(next);
          return;
        }
        setWorkingSrc((previous) => {
          if (previous && previous !== imageSrc && previous.startsWith("blob:")) {
            URL.revokeObjectURL(previous);
          }
          return next;
        });
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not flip this image.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [flipHorizontal, flipVertical, imageSrc, open]);

  const mediaStyle = useMemo(
    () => ({
      filter: `brightness(${brightness}%) contrast(${contrast}%)`,
    }),
    [brightness, contrast]
  );

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const applyWeb43Preset = () => {
    setAspect("4:3");
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setBrightness(100);
    setContrast(100);
  };

  const handleSave = async () => {
    if (!workingSrc || !croppedAreaPixels) return;
    setIsSaving(true);
    setError(null);
    try {
      const file = await exportEditedImage(workingSrc, {
        crop: croppedAreaPixels,
        rotation,
        flipHorizontal: false,
        flipVertical: false,
        brightness,
        contrast,
        fitWeb43Max: aspect === "4:3",
        fileName,
      });
      onSave(file);
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the edited image.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    const src = workingSrc ?? imageSrc;
    if (!src) return;
    try {
      await copyImageSrc(src);
      toast({ title: "Image copied", description: "Paste it anywhere that accepts images." });
    } catch (e) {
      toast({
        title: "Copy failed",
        description: e instanceof Error ? e.message : "Could not copy this image.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    const src = workingSrc ?? imageSrc;
    if (!src) return;
    try {
      await downloadImageSrc(src, fileName);
      toast({ title: "Image saved", description: "Check your downloads folder." });
    } catch (e) {
      toast({
        title: "Download failed",
        description: e instanceof Error ? e.message : "Could not save this image.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92dvh] w-[min(96vw,56rem)] max-w-none flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 space-y-1 border-b border-border px-4 py-3 pr-12 text-left sm:px-5">
          <DialogTitle>Edit image</DialogTitle>
          <DialogDescription>
            Crop, zoom, rotate, flip, and adjust brightness or contrast. 4:3 saves up to{" "}
            {WEB_43_MAX_WIDTH} × {WEB_43_MAX_HEIGHT}. Use Copy or Download to keep a local copy.
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="relative min-h-[18rem] bg-black sm:min-h-[22rem] lg:min-h-[28rem]">
            {workingSrc ? (
              <Cropper
                image={workingSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={aspectValue(aspect)}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                showGrid
                objectFit="contain"
                style={{ mediaStyle }}
              />
            ) : null}
          </div>

          <div className="min-h-0 space-y-4 overflow-y-auto border-t border-border p-4 lg:border-l lg:border-t-0">
            <div className="space-y-2">
              <Label>Aspect</Label>
              <div className="flex flex-wrap gap-2">
                {ASPECT_OPTIONS.map((option) => (
                  <Button
                    key={option.id}
                    type="button"
                    size="sm"
                    variant={aspect === option.id ? "default" : "outline"}
                    onClick={() => setAspect(option.id)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Zoom</Label>
                <span className="text-xs tabular-nums text-muted-foreground">{zoom.toFixed(2)}×</span>
              </div>
              <Slider
                min={1}
                max={3}
                step={0.01}
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0] ?? 1)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Rotate</Label>
                <span className="text-xs tabular-nums text-muted-foreground">{rotation}°</span>
              </div>
              <Slider
                min={-180}
                max={180}
                step={1}
                value={[rotation]}
                onValueChange={(value) => setRotation(value[0] ?? 0)}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setRotation((current) => current - 90)}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  −90°
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setRotation((current) => current + 90)}
                >
                  <RotateCw className="mr-1.5 h-3.5 w-3.5" />
                  +90°
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Flip</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={flipHorizontal ? "default" : "outline"}
                  onClick={() => setFlipHorizontal((current) => !current)}
                >
                  <FlipHorizontal2 className="mr-1.5 h-3.5 w-3.5" />
                  Horizontal
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={flipVertical ? "default" : "outline"}
                  onClick={() => setFlipVertical((current) => !current)}
                >
                  <FlipVertical2 className="mr-1.5 h-3.5 w-3.5" />
                  Vertical
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Brightness</Label>
                <span className="text-xs tabular-nums text-muted-foreground">{brightness}%</span>
              </div>
              <Slider
                min={50}
                max={150}
                step={1}
                value={[brightness]}
                onValueChange={(value) => setBrightness(value[0] ?? 100)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Contrast</Label>
                <span className="text-xs tabular-nums text-muted-foreground">{contrast}%</span>
              </div>
              <Slider
                min={50}
                max={150}
                step={1}
                value={[contrast]}
                onValueChange={(value) => setContrast(value[0] ?? 100)}
              />
            </div>

            <Button type="button" variant="outline" className="w-full" onClick={applyWeb43Preset}>
              <ImageDown className="mr-2 h-3.5 w-3.5" />
              Reset to web 4:3
            </Button>

            <Button type="button" variant="ghost" className="w-full" onClick={resetTransforms}>
              Reset all
            </Button>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-border px-4 py-3 sm:justify-between sm:px-5">
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => void handleCopy()} disabled={!imageSrc || isSaving}>
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Copy
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleDownload()}
              disabled={!imageSrc || isSaving}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Download
            </Button>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={!workingSrc || !croppedAreaPixels || isSaving}
              className={cn(isSaving && "opacity-80")}
            >
              {isSaving ? "Saving..." : "Apply to photo"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
