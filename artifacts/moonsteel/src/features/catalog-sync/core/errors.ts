export const SYNC_ERROR_CODES = {
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  DISCONNECTED: "DISCONNECTED",
  RATE_LIMITED: "RATE_LIMITED",
  NETWORK: "NETWORK",
  VALIDATION: "VALIDATION",
  UNSUPPORTED: "UNSUPPORTED",
  NOT_FOUND: "NOT_FOUND",
  PERMISSION: "PERMISSION",
  IMAGE_REJECTED: "IMAGE_REJECTED",
  MISSING_PRICE: "MISSING_PRICE",
  MISSING_IMAGE: "MISSING_IMAGE",
  UNKNOWN: "UNKNOWN",
} as const;

export type SyncErrorCode = (typeof SYNC_ERROR_CODES)[keyof typeof SYNC_ERROR_CODES];

export class SyncError extends Error {
  readonly code: SyncErrorCode;
  readonly retryable: boolean;
  readonly detail?: string;

  constructor(message: string, options: { code: SyncErrorCode; retryable?: boolean; detail?: string } ) {
    super(message);
    this.name = "SyncError";
    this.code = options.code;
    this.retryable = options.retryable ?? false;
    this.detail = options.detail;
  }
}

export function isSyncError(error: unknown): error is SyncError {
  return error instanceof SyncError;
}

export function toSyncError(error: unknown, fallback = "The platform request failed."): SyncError {
  if (isSyncError(error)) return error;
  if (error instanceof Error) {
    return new SyncError(error.message || fallback, {
      code: SYNC_ERROR_CODES.UNKNOWN,
      retryable: false,
      detail: error.message,
    });
  }
  return new SyncError(fallback, { code: SYNC_ERROR_CODES.UNKNOWN, retryable: false });
}

export function humanizeMetaError(code: number | string | undefined, message?: string): SyncError {
  const numeric = typeof code === "string" ? Number(code) : code;
  if (numeric === 190) {
    return new SyncError("Facebook connection expired. Please reconnect your Meta account.", {
      code: SYNC_ERROR_CODES.TOKEN_EXPIRED,
      retryable: false,
      detail: message,
    });
  }
  if (numeric === 200) {
    return new SyncError("Meta denied this action. Check catalog and page permissions in Business Manager.", {
      code: SYNC_ERROR_CODES.PERMISSION,
      retryable: false,
      detail: message,
    });
  }
  if (numeric === 80014 || numeric === 4 || numeric === 17 || numeric === 613) {
    return new SyncError("Meta is rate-limiting catalog updates. The job will retry shortly.", {
      code: SYNC_ERROR_CODES.RATE_LIMITED,
      retryable: true,
      detail: message,
    });
  }
  if (numeric === 100) {
    const imageIssue = /image/i.test(message ?? "");
    return new SyncError(
      imageIssue
        ? "Meta rejected this product because the image does not meet the platform requirements."
        : message || "Meta rejected this product. Check required catalog fields.",
      {
        code: imageIssue ? SYNC_ERROR_CODES.IMAGE_REJECTED : SYNC_ERROR_CODES.VALIDATION,
        retryable: false,
        detail: message,
      }
    );
  }
  return new SyncError(message || "Meta catalog request failed.", {
    code: SYNC_ERROR_CODES.UNKNOWN,
    retryable: false,
    detail: message,
  });
}

export function isUnregisteredGcpMessage(message?: string) {
  const text = (message || "").toLowerCase();
  return (
    text.includes("not registered") ||
    text.includes("register_as_a_developer") ||
    (text.includes("gcp project") && text.includes("merchant account"))
  );
}

export function isAlreadyRegisteredGcpMessage(message?: string) {
  const text = (message || "").toLowerCase();
  return text.includes("already_registered") || text.includes("already registered");
}

export function humanizeGoogleError(status: number | undefined, message?: string): SyncError {
  if (isUnregisteredGcpMessage(message)) {
    return new SyncError(googlePermissionMessage(message), {
      code: SYNC_ERROR_CODES.PERMISSION,
      retryable: false,
      detail: message,
    });
  }
  if (status === 401) {
    return new SyncError("Google login expired. Click Connect Google — Test connection cannot renew a revoked token.", {
      code: SYNC_ERROR_CODES.TOKEN_EXPIRED,
      retryable: false,
      detail: message,
    });
  }
  if (status === 403) {
    return new SyncError(googlePermissionMessage(message), {
      code: SYNC_ERROR_CODES.PERMISSION,
      retryable: false,
      detail: message,
    });
  }
  if (status === 429) {
    return new SyncError("Google is rate-limiting product updates. The job will retry shortly.", {
      code: SYNC_ERROR_CODES.RATE_LIMITED,
      retryable: true,
      detail: message,
    });
  }
  if (status === 400) {
    return new SyncError(message || "Google rejected this product. Check required Merchant Center fields.", {
      code: SYNC_ERROR_CODES.VALIDATION,
      retryable: false,
      detail: message,
    });
  }
  return new SyncError(message || "Google Merchant request failed.", {
    code: SYNC_ERROR_CODES.UNKNOWN,
    retryable: false,
    detail: message,
  });
}

export function googlePermissionMessage(message?: string) {
  const text = (message || "").toLowerCase();
  const enableUrl = message?.match(/https:\/\/console\.[^\s]+/i)?.[0]?.replace(/[.,)]+$/, "");
  const project = message?.match(/in project ([a-z0-9-]+)/i)?.[1];
  if (text.includes("has not been used") || text.includes("disabled") || text.includes("enable it by visiting")) {
    const link =
      enableUrl ||
      `https://console.cloud.google.com/apis/library/merchantapi.googleapis.com${project ? `?project=${project}` : ""}`;
    return `Enable Merchant API${project ? ` in Cloud project ${project}` : ""}: open ${link} , click Enable, wait a minute, then Test connection.`;
  }
  if (
    isUnregisteredGcpMessage(message) ||
    text.includes("api developer") ||
    text.includes("registergcp") ||
    text.includes("developer registration")
  ) {
    return "This Google Cloud project is not registered with Merchant Center. Click Connect Google using a Merchant Center Admin account so Moon Steel can register the Cloud project.";
  }
  const detail = message?.trim();
  return detail
    ? `Google denied Merchant Center access. Sign in with a Google account that is Admin on that Merchant Center, confirm the Merchant ID, and verify the website. Google said: ${detail}`
    : "Google denied Merchant Center access. Sign in with a Google account that is Admin on Merchant Center, enable Merchant API, and confirm the Merchant ID.";
}
