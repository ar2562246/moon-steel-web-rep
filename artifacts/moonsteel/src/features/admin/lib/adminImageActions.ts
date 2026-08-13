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

export async function copyImageSrc(src: string) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
    throw new Error("Copy image is not supported in this browser.");
  }

  const blob = await fetchImageBlob(src);
  const png = await blobToPng(blob);
  await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
}
