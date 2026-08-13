function guessExtension(blob: Blob, fallback = "jpg") {
  const type = blob.type.toLowerCase();
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  if (type.includes("gif")) return "gif";
  if (type.includes("jpeg") || type.includes("jpg")) return "jpg";
  return fallback;
}

export function fileNameFromImageSrc(src: string, fallback = "image") {
  try {
    if (src.startsWith("blob:") || src.startsWith("data:")) return `${fallback}.jpg`;
    const pathname = new URL(src, window.location.origin).pathname;
    const base = pathname.split("/").pop() || fallback;
    return base.includes(".") ? base : `${base}.jpg`;
  } catch {
    return `${fallback}.jpg`;
  }
}

export async function fetchImageBlob(src: string): Promise<Blob> {
  const response = await fetch(src);
  if (!response.ok) throw new Error("Could not load this image.");
  return response.blob();
}

async function blobToPng(blob: Blob): Promise<Blob> {
  if (blob.type === "image/png") return blob;

  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not decode this image."));
      img.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not prepare the image for copying.");
    ctx.drawImage(image, 0, 0);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((next) => {
        if (!next) reject(new Error("Could not convert this image for the clipboard."));
        else resolve(next);
      }, "image/png");
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function downloadImageSrc(src: string, fileName?: string) {
  const blob = await fetchImageBlob(src);
  const name =
    fileName ??
    fileNameFromImageSrc(src, `image-${Date.now()}`).replace(
      /\.[^.]+$/,
      `.${guessExtension(blob)}`
    );
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export type CopyImageResult = {
  mode: "image" | "url";
};

/**
 * Copy an image to the clipboard.
 * Uses ClipboardItem + Promise so `write()` starts during the click gesture
 * (fetch/convert can finish after without losing permission).
 * Falls back to copying the image URL when image clipboard is blocked.
 */
export async function copyImageSrc(src: string): Promise<CopyImageResult> {
  const canWriteImage = Boolean(navigator.clipboard?.write) && typeof ClipboardItem !== "undefined";

  if (canWriteImage) {
    try {
      const pngPromise = (async () => {
        const blob = await fetchImageBlob(src);
        return blobToPng(blob);
      })();

      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": pngPromise,
        }),
      ]);
      return { mode: "image" };
    } catch {
      // Fall through to URL copy.
    }
  }

  if (navigator.clipboard?.writeText) {
    const absolute =
      src.startsWith("blob:") || src.startsWith("data:")
        ? src
        : new URL(src, window.location.origin).toString();

    if (!absolute.startsWith("blob:")) {
      await navigator.clipboard.writeText(absolute);
      return { mode: "url" };
    }
  }

  throw new Error("Could not copy this image. Use Download instead.");
}
