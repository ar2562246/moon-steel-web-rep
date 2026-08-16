import { humanizeMetaError, SyncError, SYNC_ERROR_CODES } from "../../core/errors";

export const META_GRAPH_VERSION = "v22.0";
export const META_GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

type GraphErrorBody = {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    error_user_title?: string;
    error_user_msg?: string;
  };
};

export async function metaGraphRequest<T>(
  path: string,
  options: {
    accessToken: string;
    method?: string;
    search?: Record<string, string | undefined>;
    body?: Record<string, unknown> | URLSearchParams;
  }
): Promise<T> {
  const url = new URL(path.startsWith("http") ? path : `${META_GRAPH_BASE}/${path.replace(/^\//, "")}`);
  url.searchParams.set("access_token", options.accessToken);
  for (const [key, value] of Object.entries(options.search ?? {})) {
    if (value) url.searchParams.set(key, value);
  }

  const method = options.method ?? "GET";
  const headers: Record<string, string> = {};
  let body: string | URLSearchParams | undefined;
  if (options.body instanceof URLSearchParams) {
    body = options.body;
  } else if (options.body) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    response = await fetch(url, { method, headers, body });
  } catch (error) {
    throw new SyncError("Could not reach Meta. Check the server network connection and try again.", {
      code: SYNC_ERROR_CODES.NETWORK,
      retryable: true,
      detail: error instanceof Error ? error.message : String(error),
    });
  }

  const json = (await response.json().catch(() => ({}))) as T & GraphErrorBody;
  if (!response.ok || json.error) {
    throw humanizeMetaError(json.error?.code, json.error?.error_user_msg || json.error?.message);
  }
  return json;
}

export function metaAccessToken(credentials: Record<string, unknown>) {
  const token = credentials.accessToken;
  if (typeof token !== "string" || !token) {
    throw new SyncError("Meta access token is missing. Reconnect the Meta account.", {
      code: SYNC_ERROR_CODES.TOKEN_EXPIRED,
    });
  }
  return token;
}
