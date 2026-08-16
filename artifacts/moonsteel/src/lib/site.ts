/** Canonical public origin. Never a Vercel preview/deployment hostname. */
export const PRODUCTION_SITE_URL = "https://moonsteelfab.com";

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

/**
 * Public site origin for canonicals, Open Graph, JSON-LD, robots, and sitemap.
 * Production always uses https://moonsteelfab.com even if NEXT_PUBLIC_SITE_URL is
 * a Vercel hostname, www, trailing-slash, or mixed-case protocol (Https://).
 */
export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return PRODUCTION_SITE_URL;

  try {
    const url = new URL(stripTrailingSlash(raw));
    const host = url.hostname.toLowerCase();

    if (host.endsWith(".vercel.app")) return PRODUCTION_SITE_URL;
    if (host === "www.moonsteelfab.com" || host === "moonsteelfab.com") {
      return PRODUCTION_SITE_URL;
    }

    return `${url.protocol.toLowerCase()}//${url.host}`.replace(/\/+$/, "");
  } catch {
    return PRODUCTION_SITE_URL;
  }
}

/** Origin used for Meta/Google catalog `link` fields. Always the live site, never localhost. */
export function catalogPublicOrigin() {
  return PRODUCTION_SITE_URL;
}

/** Absolute URL for a site path (`/about` → `https://moonsteelfab.com/about`). */
export function absoluteUrl(path = "/", origin = getSiteUrl()) {
  if (!path || path === "/") return `${origin}/`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalized}`;
}

export function catalogProductUrl(path: string) {
  return absoluteUrl(path, catalogPublicOrigin());
}

export function isPublicCatalogUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1") return false;
    if (host.endsWith(".vercel.app")) return false;
    return true;
  } catch {
    return false;
  }
}
