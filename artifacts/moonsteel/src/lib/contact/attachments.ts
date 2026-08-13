import { CONTACT_DRAWING_ACCEPT } from "@/lib/contact/details";

export const CONTACT_ATTACHMENT_BUCKET = "contact-attachments";
export const CONTACT_ATTACHMENT_MAX_FILES = 10;
export const CONTACT_ATTACHMENT_MAX_FILE_BYTES = 25 * 1024 * 1024;
export const CONTACT_ATTACHMENT_MAX_TOTAL_BYTES = 50 * 1024 * 1024;
/** Raw file bytes. Base64 encoding adds ~33%; Zoho/Gmail messages cap around 25 MB. */
export const CONTACT_EMAIL_ATTACH_MAX_BYTES = 10 * 1024 * 1024;

const MIME_BY_EXTENSION: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".zip": "application/zip",
  ".dwg": "application/acad",
  ".dxf": "image/vnd.dxf",
  ".step": "application/step",
  ".stp": "application/step",
  ".iges": "model/iges",
  ".igs": "model/iges",
  ".stl": "model/stl",
};

export type ContactAttachmentMeta = {
  name: string;
  path: string;
  size: number;
  contentType: string;
};

export function allowedAttachmentExtensions() {
  return CONTACT_DRAWING_ACCEPT.split(",")
    .map((token) => token.trim().toLowerCase())
    .filter((token) => token.startsWith("."));
}

export function attachmentExtension(fileName: string) {
  const base = fileName.replace(/\\/g, "/").split("/").pop() ?? fileName;
  const dot = base.lastIndexOf(".");
  if (dot < 0) return "";
  return base.slice(dot).toLowerCase();
}

export function isAllowedAttachmentName(fileName: string) {
  return allowedAttachmentExtensions().includes(attachmentExtension(fileName));
}

export function mimeForAttachment(fileName: string, fallback?: string) {
  if (fallback && fallback !== "application/octet-stream") return fallback;
  return MIME_BY_EXTENSION[attachmentExtension(fileName)] ?? "application/octet-stream";
}

export function sanitizeAttachmentFileName(fileName: string) {
  const base = fileName.replace(/\\/g, "/").split("/").pop()?.trim() || "file";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/_+/g, "_").slice(0, 180);
  return cleaned || "file";
}

export function uniqueAttachmentFileName(fileName: string, used: Set<string>) {
  const sanitized = sanitizeAttachmentFileName(fileName);
  const ext = attachmentExtension(sanitized);
  const stem = ext ? sanitized.slice(0, -ext.length) : sanitized;
  let candidate = sanitized;
  let n = 2;
  while (used.has(candidate.toLowerCase())) {
    candidate = `${stem}-${n}${ext}`;
    n += 1;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

export function totalAttachmentBytes(sizes: number[]) {
  return sizes.reduce((sum, size) => sum + size, 0);
}

export function shouldAttachFilesToEmail(sizes: number[]) {
  const total = totalAttachmentBytes(sizes);
  return sizes.length > 0 && total > 0 && total <= CONTACT_EMAIL_ATTACH_MAX_BYTES;
}

export function formatAttachmentBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isContactAttachmentPath(path: string) {
  return /^inquiries\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[^/]+$/i.test(
    path
  );
}

export function parseContactAttachments(value: unknown): ContactAttachmentMeta[] {
  const raw = typeof value === "string" ? safeJsonParse(value) : value;
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const name = typeof row.name === "string" ? row.name : "";
    const path = typeof row.path === "string" ? row.path : "";
    const size = typeof row.size === "number" && Number.isFinite(row.size) ? row.size : 0;
    const contentType = typeof row.contentType === "string" ? row.contentType : "application/octet-stream";
    if (!name || !path || !isContactAttachmentPath(path)) return [];
    return [{ name, path, size, contentType }];
  });
}

export function attachmentsFromInquiryFields(fileUrls: unknown, fileName?: string | null) {
  const fromUrls = parseContactAttachments(fileUrls);
  if (fromUrls.length > 0) return fromUrls;
  if (fileName?.trim().startsWith("[")) return parseContactAttachments(fileName);
  return [];
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

export function validateAttachmentLimits(files: Array<{ name: string; size: number }>) {
  if (files.length > CONTACT_ATTACHMENT_MAX_FILES) {
    return `You can attach up to ${CONTACT_ATTACHMENT_MAX_FILES} files.`;
  }

  const total = totalAttachmentBytes(files.map((file) => file.size));
  if (total > CONTACT_ATTACHMENT_MAX_TOTAL_BYTES) {
    return `Attachments must be under ${formatAttachmentBytes(CONTACT_ATTACHMENT_MAX_TOTAL_BYTES)} in total.`;
  }

  for (const file of files) {
    if (!isAllowedAttachmentName(file.name)) {
      return `${file.name} is not an accepted drawing or CAD type.`;
    }
    if (file.size <= 0) {
      return `${file.name} is empty.`;
    }
    if (file.size > CONTACT_ATTACHMENT_MAX_FILE_BYTES) {
      return `${file.name} is over ${formatAttachmentBytes(CONTACT_ATTACHMENT_MAX_FILE_BYTES)}.`;
    }
  }

  return null;
}
