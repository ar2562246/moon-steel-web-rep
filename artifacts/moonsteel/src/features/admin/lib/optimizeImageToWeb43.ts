export const WEB_43_MAX_WIDTH = 1200;
export const WEB_43_MAX_HEIGHT = 900;
export const WEB_43_RATIO = 4 / 3;
const RATIO_TOLERANCE = 0.02;

export type OptimizeImageResult =
  | {
      status: "already-standard";
      width: number;
      height: number;
    }
  | {
      status: "optimized";
      file: File;
      width: number;
      height: number;
      previousWidth: number;
      previousHeight: number;
    };

function isFourByThree(width: number, height: number) {
  return Math.abs(width / height - WEB_43_RATIO) <= RATIO_TOLERANCE;
}

export function isWebStandard43(width: number, height: number) {
  return isFourByThree(width, height) && width <= WEB_43_MAX_WIDTH && height <= WEB_43_MAX_HEIGHT;
}

function cropToFourByThree(width: number, height: number) {
  const current = width / height;
  if (Math.abs(current - WEB_43_RATIO) <= RATIO_TOLERANCE) {
    return { sx: 0, sy: 0, sw: width, sh: height };
  }

  if (current > WEB_43_RATIO) {
    const sw = Math.round(height * WEB_43_RATIO);
    return { sx: Math.round((width - sw) / 2), sy: 0, sw, sh: height };
  }

  const sh = Math.round(width / WEB_43_RATIO);
  return { sx: 0, sy: Math.round((height - sh) / 2), sw: width, sh };
}

function fitWithinMax(width: number, height: number) {
  const scale = Math.min(1, WEB_43_MAX_WIDTH / width, WEB_43_MAX_HEIGHT / height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function blobFromSource(source: Blob | string) {
  if (typeof source !== "string") return source;
  const response = await fetch(source);
  if (!response.ok) {
    throw new Error("Could not load this image to resize it.");
  }
  return response.blob();
}

function loadImage(blob: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image."));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not export the resized image."));
          return;
        }
        resolve(blob);
      },
      type,
      quality
    );
  });
}

function fileNameForOutput(name: string) {
  const base = name.replace(/\.[^.]+$/, "") || "product-image";
  return `${base}-web43.jpg`;
}

export async function optimizeImageToWeb43(
  source: Blob | string,
  originalName = "product-image.jpg"
): Promise<OptimizeImageResult> {
  const blob = await blobFromSource(source);
  const image = await loadImage(blob);
  const previousWidth = image.naturalWidth;
  const previousHeight = image.naturalHeight;
  const crop = cropToFourByThree(previousWidth, previousHeight);
  const fitted = fitWithinMax(crop.sw, crop.sh);

  if (
    crop.sx === 0 &&
    crop.sy === 0 &&
    crop.sw === previousWidth &&
    crop.sh === previousHeight &&
    fitted.width === previousWidth &&
    fitted.height === previousHeight
  ) {
    return { status: "already-standard", width: previousWidth, height: previousHeight };
  }

  const canvas = document.createElement("canvas");
  canvas.width = fitted.width;
  canvas.height = fitted.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare the image canvas.");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, fitted.width, fitted.height);

  const type = "image/jpeg";
  const output = await canvasToBlob(canvas, type, 0.92);
  const file = new File([output], fileNameForOutput(originalName), { type });

  return {
    status: "optimized",
    file,
    width: fitted.width,
    height: fitted.height,
    previousWidth,
    previousHeight,
  };
}
