import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getSiteUrl } from "@/lib/site";

const STATE_COOKIE = "ms_catalog_sync_oauth";

function signingSecret() {
  return (
    process.env.SYNC_CREDENTIALS_ENCRYPTION_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "dev-oauth-state"
  );
}

export function createOAuthState(provider: string) {
  const nonce = randomBytes(16).toString("hex");
  const payload = `${provider}.${nonce}.${Date.now()}`;
  const signature = createHmac("sha256", signingSecret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function verifyOAuthState(state: string, provider: string) {
  const parts = state.split(".");
  if (parts.length !== 4) return false;
  const [gotProvider, , timestamp, signature] = parts;
  if (gotProvider !== provider) return false;
  const age = Date.now() - Number(timestamp);
  if (!Number.isFinite(age) || age > 15 * 60 * 1000) return false;
  const payload = parts.slice(0, 3).join(".");
  const expected = createHmac("sha256", signingSecret()).update(payload).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function oauthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 15 * 60,
  };
}

export { STATE_COOKIE };

/** Browser-facing origin for OAuth. Dev server binds 0.0.0.0, which Google rejects. */
export function oauthPublicOrigin(request: Request) {
  if (process.env.NODE_ENV === "production") return getSiteUrl();

  const url = new URL(request.url);
  const headerHost = request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host;
  const hostname = headerHost.replace(/^\[|\]$/g, "").split("%")[0].split(":")[0];
  const port = headerHost.match(/:(\d+)$/)?.[1] || url.port || "3000";
  const loopback = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0" || hostname === "::" || hostname === "::1";
  if (loopback) return `http://localhost:${port}`;

  const protocol = (request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "")).replace(/:$/, "");
  return `${protocol}://${headerHost}`;
}

export function oauthRedirectUri(provider: string, requestOrigin?: string) {
  const origin = requestOrigin || getSiteUrl();
  return `${origin.replace(/\/+$/, "")}/api/admin/catalog-sync/oauth/${provider}/callback`;
}

export function metaOAuthUrl(state: string, redirectUri: string) {
  const appId = process.env.META_APP_ID;
  if (!appId) throw new Error("META_APP_ID is not configured.");
  const url = new URL("https://www.facebook.com/v22.0/dialog/oauth");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set(
    "scope",
    [
      "catalog_management",
      "business_management",
      "pages_show_list",
      "pages_read_engagement",
      "instagram_basic",
      "whatsapp_business_management",
    ].join(",")
  );
  return url.toString();
}

export function googleOAuthUrl(state: string, redirectUri: string) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId) throw new Error("GOOGLE_OAUTH_CLIENT_ID is not configured.");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set(
    "scope",
    ["https://www.googleapis.com/auth/content", "https://www.googleapis.com/auth/userinfo.email"].join(" ")
  );
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeMetaCode(code: string, redirectUri: string) {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) throw new Error("Meta app credentials are not configured.");

  const shortUrl = new URL("https://graph.facebook.com/v22.0/oauth/access_token");
  shortUrl.searchParams.set("client_id", appId);
  shortUrl.searchParams.set("client_secret", appSecret);
  shortUrl.searchParams.set("redirect_uri", redirectUri);
  shortUrl.searchParams.set("code", code);
  const shortRes = await fetch(shortUrl);
  const shortJson = (await shortRes.json()) as { access_token?: string; error?: { message?: string } };
  if (!shortJson.access_token) {
    throw new Error(shortJson.error?.message || "Meta authorization failed.");
  }

  const longUrl = new URL("https://graph.facebook.com/v22.0/oauth/access_token");
  longUrl.searchParams.set("grant_type", "fb_exchange_token");
  longUrl.searchParams.set("client_id", appId);
  longUrl.searchParams.set("client_secret", appSecret);
  longUrl.searchParams.set("fb_exchange_token", shortJson.access_token);
  const longRes = await fetch(longUrl);
  const longJson = (await longRes.json()) as { access_token?: string };
  return longJson.access_token || shortJson.access_token;
}

export async function exchangeGoogleCode(code: string, redirectUri: string) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Google OAuth client credentials are not configured.");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const json = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    error_description?: string;
  };
  if (!json.refresh_token && !json.access_token) {
    throw new Error(json.error_description || "Google authorization failed.");
  }
  return { accessToken: json.access_token, refreshToken: json.refresh_token };
}
