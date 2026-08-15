import type { Area } from "react-easy-crop";

export type ImageEditAspect = "free" | "4:3" | "1:1";

export type ImageEditExportOptions = {
  crop: Area;
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  brightness: number;
  contrast: number;
  quality?: number;
  fitMax?: { width: number; height: number };
  outputType?: "image/jpeg" | "image/png";
  fileName?: string;
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load this image for editing."));
    image.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not export the edited image."));
          return;
        }
        resolve(blob);
      },
      type,
      quality
    );
  });
}

function getRadianAngle(degree: number) {
  return (degree * Math.PI) / 180;
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

function applyBrightnessContrast(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  brightness: number,
  contrast: number
) {
  if (brightness === 100 && contrast === 100) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const b = (brightness - 100) * 2.55;
  const c = contrast / 100;
  const intercept = 128 * (1 - c);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, data[i] * c + intercept + b));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * c + intercept + b));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * c + intercept + b));
  }

  ctx.putImageData(imageData, 0, 0);
}

function fitWithinMax(width: number, height: number, maxWidth: number, maxHeight: number) {
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export function aspectValue(aspect: ImageEditAspect): number | undefined {
  if (aspect === "4:3") return 4 / 3;
  if (aspect === "1:1") return 1;
  return undefined;
}

export async function exportEditedImage(
  imageSrc: string,
  options: ImageEditExportOptions
): Promise<File> {
  const image = await loadImage(imageSrc);
  const {
    crop,
    rotation,
    flipHorizontal,
    flipVertical,
    brightness,
    contrast,
    quality = 0.92,
    fitMax,
    outputType = "image/jpeg",
    fileName = "product-image.jpg",
  } = options;

  const rotRad = getRadianAngle(rotation);
  const { width: boxWidth, height: boxHeight } = rotateSize(
    image.naturalWidth,
    image.naturalHeight,
    rotation
  );

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(boxWidth));
  canvas.height = Math.max(1, Math.round(boxHeight));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare the image canvas.");

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rotRad);
  ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
  ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const cropX = Math.max(0, Math.round(crop.x));
  const cropY = Math.max(0, Math.round(crop.y));
  const cropW = Math.max(1, Math.round(crop.width));
  const cropH = Math.max(1, Math.round(crop.height));

  let outW = cropW;
  let outH = cropH;
  if (fitMax) {
    const fitted = fitWithinMax(cropW, cropH, fitMax.width, fitMax.height);
    outW = fitted.width;
    outH = fitted.height;
  }

  const output = document.createElement("canvas");
  output.width = outW;
  output.height = outH;
  const outCtx = output.getContext("2d");
  if (!outCtx) throw new Error("Could not prepare the export canvas.");

  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = "high";
  outCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, outW, outH);
  applyBrightnessContrast(outCtx, outW, outH, brightness, contrast);

  const blob = await canvasToBlob(output, outputType, outputType === "image/png" ? 1 : quality);
  const base = fileName.replace(/\.[^.]+$/, "") || "product-image";
  const extension = outputType === "image/png" ? "png" : "jpg";
  return new File([blob], `${base}-edited.${extension}`, { type: outputType });
}
