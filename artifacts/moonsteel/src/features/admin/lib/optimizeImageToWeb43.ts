export const WEB_43_MAX_WIDTH = 1200;
export const WEB_43_MAX_HEIGHT = 900;
export const WEB_43_RATIO = 4 / 3;

/** Hero strip is widescreen; keep files light for fast homepage loads. */
export const WEB_HERO_MAX_WIDTH = 1600;
export const WEB_HERO_MAX_HEIGHT = 900;
export const WEB_HERO_RATIO = 16 / 9;

/** Client logos only appear as small slider / grid thumbnails. */
export const WEB_LOGO_MAX_WIDTH = 480;
export const WEB_LOGO_MAX_HEIGHT = 160;

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

type OptimizeOptions = {
  ratio: number;
  maxWidth: number;
  maxHeight: number;
  fileSuffix: string;
  defaultName: string;
};

function matchesRatio(width: number, height: number, ratio: number) {
  return Math.abs(width / height - ratio) <= RATIO_TOLERANCE;
}

export function isWebStandard43(width: number, height: number) {
  return (
    matchesRatio(width, height, WEB_43_RATIO) &&
    width <= WEB_43_MAX_WIDTH &&
    height <= WEB_43_MAX_HEIGHT
  );
}

export function isWebStandardHero(width: number, height: number) {
  return (
    matchesRatio(width, height, WEB_HERO_RATIO) &&
    width <= WEB_HERO_MAX_WIDTH &&
    height <= WEB_HERO_MAX_HEIGHT
  );
}

export function isWebStandardLogo(width: number, height: number) {
  return width <= WEB_LOGO_MAX_WIDTH && height <= WEB_LOGO_MAX_HEIGHT;
}

function cropToRatio(width: number, height: number, ratio: number) {
  const current = width / height;
  if (Math.abs(current - ratio) <= RATIO_TOLERANCE) {
    return { sx: 0, sy: 0, sw: width, sh: height };
  }

  if (current > ratio) {
    const sw = Math.round(height * ratio);
    return { sx: Math.round((width - sw) / 2), sy: 0, sw, sh: height };
  }

  const sh = Math.round(width / ratio);
  return { sx: 0, sy: Math.round((height - sh) / 2), sw: width, sh };
}

function fitWithinMax(width: number, height: number, maxWidth: number, maxHeight: number) {
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
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

function fileNameForOutput(name: string, suffix: string, fallback: string, extension = "jpg") {
  const base = name.replace(/\.[^.]+$/, "") || fallback;
  return `${base}-${suffix}.${extension}`;
}

async function optimizeImageForWeb(
  source: Blob | string,
  originalName: string,
  options: OptimizeOptions
): Promise<OptimizeImageResult> {
  const blob = await blobFromSource(source);
  const image = await loadImage(blob);
  const previousWidth = image.naturalWidth;
  const previousHeight = image.naturalHeight;
  const crop = cropToRatio(previousWidth, previousHeight, options.ratio);
  const fitted = fitWithinMax(crop.sw, crop.sh, options.maxWidth, options.maxHeight);

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

  const output = await canvasToBlob(canvas, "image/jpeg", 0.85);
  const file = new File(
    [output],
    fileNameForOutput(originalName, options.fileSuffix, options.defaultName),
    { type: "image/jpeg" }
  );

  return {
    status: "optimized",
    file,
    width: fitted.width,
    height: fitted.height,
    previousWidth,
    previousHeight,
  };
}

export async function optimizeImageToWeb43(
  source: Blob | string,
  originalName = "product-image.jpg"
): Promise<OptimizeImageResult> {
  return optimizeImageForWeb(source, originalName, {
    ratio: WEB_43_RATIO,
    maxWidth: WEB_43_MAX_WIDTH,
    maxHeight: WEB_43_MAX_HEIGHT,
    fileSuffix: "web43",
    defaultName: "product-image",
  });
}

export async function optimizeImageToWebHero(
  source: Blob | string,
  originalName = "hero-image.jpg"
): Promise<OptimizeImageResult> {
  return optimizeImageForWeb(source, originalName, {
    ratio: WEB_HERO_RATIO,
    maxWidth: WEB_HERO_MAX_WIDTH,
    maxHeight: WEB_HERO_MAX_HEIGHT,
    fileSuffix: "web-hero",
    defaultName: "hero-image",
  });
}

export async function optimizeImageToWebLogo(
  source: Blob | string,
  originalName = "customer-logo.png"
): Promise<OptimizeImageResult> {
  const blob = await blobFromSource(source);
  const image = await loadImage(blob);
  const previousWidth = image.naturalWidth;
  const previousHeight = image.naturalHeight;
  const fitted = fitWithinMax(previousWidth, previousHeight, WEB_LOGO_MAX_WIDTH, WEB_LOGO_MAX_HEIGHT);

  if (fitted.width === previousWidth && fitted.height === previousHeight) {
    return { status: "already-standard", width: previousWidth, height: previousHeight };
  }

  const canvas = document.createElement("canvas");
  canvas.width = fitted.width;
  canvas.height = fitted.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare the image canvas.");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, 0, 0, fitted.width, fitted.height);

  const output = await canvasToBlob(canvas, "image/png", 1);
  const file = new File(
    [output],
    fileNameForOutput(originalName, "thumb", "customer-logo", "png"),
    { type: "image/png" }
  );

  return {
    status: "optimized",
    file,
    width: fitted.width,
    height: fitted.height,
    previousWidth,
    previousHeight,
  };
}
