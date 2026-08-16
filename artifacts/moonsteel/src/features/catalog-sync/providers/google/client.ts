import { humanizeGoogleError, SyncError, SYNC_ERROR_CODES } from "../../core/errors";

const MERCHANT_API = "https://merchantapi.googleapis.com";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

export async function refreshGoogleAccessToken(credentials: Record<string, unknown>) {
  const refreshToken = credentials.refreshToken;
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (typeof refreshToken !== "string" || !refreshToken) {
    throw new SyncError("Google connection expired. Please reconnect Merchant Center.", {
      code: SYNC_ERROR_CODES.TOKEN_EXPIRED,
    });
  }
  if (!clientId || !clientSecret) {
    throw new SyncError("Google OAuth client credentials are not configured on the server.", {
      code: SYNC_ERROR_CODES.DISCONNECTED,
    });
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  let response: Response;
  try {
    response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch (error) {
    throw new SyncError("Could not reach Google to refresh the access token.", {
      code: SYNC_ERROR_CODES.NETWORK,
      retryable: true,
      detail: error instanceof Error ? error.message : String(error),
    });
  }

  const json = (await response.json()) as { access_token?: string; error?: string; error_description?: string };
  if (!response.ok || !json.access_token) {
    throw new SyncError("Google connection expired. Please reconnect Merchant Center.", {
      code: SYNC_ERROR_CODES.TOKEN_EXPIRED,
      detail: json.error_description || json.error,
    });
  }
  return json.access_token;
}

export async function googleMerchantRequest<T>(
  path: string,
  options: {
    accessToken: string;
    method?: string;
    search?: Record<string, string | undefined>;
    body?: unknown;
  }
): Promise<T> {
  const url = new URL(path.startsWith("http") ? path : `${MERCHANT_API}${path}`);
  for (const [key, value] of Object.entries(options.search ?? {})) {
    if (value) url.searchParams.set(key, value);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        Authorization: `Bearer ${options.accessToken}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (error) {
    throw new SyncError("Could not reach Google Merchant API.", {
      code: SYNC_ERROR_CODES.NETWORK,
      retryable: true,
      detail: error instanceof Error ? error.message : String(error),
    });
  }

  if (response.status === 204) return {} as T;
  const json = (await response.json().catch(() => ({}))) as T & {
    error?: { message?: string; status?: string };
  };
  if (!response.ok) {
    throw humanizeGoogleError(response.status, json.error?.message);
  }
  return json;
}
