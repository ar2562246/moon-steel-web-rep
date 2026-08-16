import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const PREFIX = "v1";

function getKey() {
  const secret = process.env.SYNC_CREDENTIALS_ENCRYPTION_KEY?.trim();
  if (!secret || secret.length < 16) {
    throw new Error("SYNC_CREDENTIALS_ENCRYPTION_KEY is required to store platform credentials.");
  }
  return createHash("sha256").update(secret).digest();
}

export function hasEncryptionKey() {
  return Boolean(process.env.SYNC_CREDENTIALS_ENCRYPTION_KEY?.trim());
}

export function encryptJson(value: Record<string, unknown>) {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encoded = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [PREFIX, iv.toString("base64url"), tag.toString("base64url"), encoded.toString("base64url")].join(".");
}

export function decryptJson(payload: string): Record<string, unknown> {
  const [version, ivPart, tagPart, dataPart] = payload.split(".");
  if (version !== PREFIX || !ivPart || !tagPart || !dataPart) {
    throw new Error("Stored credentials are unreadable. Reconnect the platform.");
  }
  const key = getKey();
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivPart, "base64url"));
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  const decoded = Buffer.concat([
    decipher.update(Buffer.from(dataPart, "base64url")),
    decipher.final(),
  ]).toString("utf8");
  const parsed = JSON.parse(decoded) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Stored credentials are invalid. Reconnect the platform.");
  }
  return parsed as Record<string, unknown>;
}
