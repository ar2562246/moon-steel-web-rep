import {
  isAlreadyRegisteredGcpMessage,
  isSyncError,
  isUnregisteredGcpMessage,
  SYNC_ERROR_CODES,
  SyncError,
} from "../../core/errors";
import { googleMerchantRequest } from "./client";

export type MerchantAccountSummary = {
  id: string;
  name: string;
};

type AccountResource = {
  name?: string;
  accountId?: string | number;
  accountName?: string;
};

export function parseMerchantAccountId(value: string | number | undefined) {
  if (value == null) return "";
  const text = String(value).trim();
  const fromName = text.match(/accounts\/(\d+)/i);
  if (fromName?.[1]) return fromName[1];
  return text.replace(/\D/g, "") || text;
}

export function summarizeMerchantAccount(account: AccountResource): MerchantAccountSummary | null {
  const id = parseMerchantAccountId(account.accountId ?? account.name);
  if (!id) return null;
  return { id, name: account.accountName?.trim() || `Merchant ${id}` };
}

export async function listMerchantAccounts(accessToken: string): Promise<MerchantAccountSummary[]> {
  const json = await googleMerchantRequest<{ accounts?: AccountResource[] }>(
    "https://merchantapi.googleapis.com/accounts/v1/accounts",
    { accessToken, search: { pageSize: "50" } }
  );
  return (json.accounts ?? []).flatMap((account) => {
    const summary = summarizeMerchantAccount(account);
    return summary ? [summary] : [];
  });
}

export async function getMerchantAccount(accessToken: string, accountId: string) {
  return googleMerchantRequest<AccountResource>(
    `https://merchantapi.googleapis.com/accounts/v1/accounts/${accountId}`,
    { accessToken }
  );
}

function googleErrorText(error: unknown) {
  if (isSyncError(error)) return `${error.message} ${error.detail || ""}`;
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function googleUserEmail(accessToken: string) {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = (await response.json().catch(() => ({}))) as { email?: string };
  return json.email?.trim() || "";
}

export async function registerMerchantGcp(options: {
  accessToken: string;
  accountId: string;
  developerEmail?: string;
}) {
  const body = options.developerEmail?.trim() ? { developerEmail: options.developerEmail.trim() } : {};
  try {
    return await googleMerchantRequest(
      `https://merchantapi.googleapis.com/accounts/v1/accounts/${options.accountId}/developerRegistration:registerGcp`,
      {
        accessToken: options.accessToken,
        method: "POST",
        body,
      }
    );
  } catch (error) {
    if (isAlreadyRegisteredGcpMessage(googleErrorText(error))) return {};
    throw error;
  }
}

export type MerchantDataSourceSummary = {
  id: string;
  name: string;
  input?: string;
};

export async function listMerchantDataSources(accessToken: string, accountId: string) {
  const json = await googleMerchantRequest<{
    dataSources?: Array<{
      name?: string;
      dataSourceId?: string | number;
      displayName?: string;
      input?: string;
    }>;
  }>(`https://merchantapi.googleapis.com/datasources/v1/accounts/${accountId}/dataSources`, { accessToken });
  return (json.dataSources ?? []).flatMap((source) => {
    const id = parseMerchantAccountId(source.dataSourceId ?? source.name?.split("/").pop());
    if (!id) return [];
    return [{ id, name: source.displayName?.trim() || `Data source ${id}`, input: source.input }] satisfies MerchantDataSourceSummary[];
  });
}

export function pickApiProductDataSource(sources: MerchantDataSourceSummary[], preferredId?: string) {
  const api = sources.filter((source) => !source.input || source.input === "API");
  if (preferredId && api.some((source) => source.id === preferredId)) return preferredId;
  return api[0]?.id ?? "";
}

export async function ensureApiProductDataSource(options: {
  accessToken: string;
  accountId: string;
  preferredId?: string | null;
}) {
  const sources = await listMerchantDataSources(options.accessToken, options.accountId).catch(() => []);
  const existing = pickApiProductDataSource(sources, parseMerchantAccountId(options.preferredId ?? ""));
  if (existing) return existing;

  const created = await googleMerchantRequest<{ name?: string; dataSourceId?: string | number }>(
    `https://merchantapi.googleapis.com/datasources/v1/accounts/${options.accountId}/dataSources`,
    {
      accessToken: options.accessToken,
      method: "POST",
      body: {
        displayName: "Moon Steel API",
        primaryProductDataSource: {},
      },
    }
  );
  return parseMerchantAccountId(created.dataSourceId ?? created.name?.split("/").pop());
}

export async function ensureMerchantAccountAccess(options: {
  accessToken: string;
  accountId: string;
  developerEmail?: string;
}) {
  const accountId = parseMerchantAccountId(options.accountId);
  if (!accountId) {
    throw new SyncError("Select a Google Merchant Center account before syncing.", {
      code: SYNC_ERROR_CODES.VALIDATION,
    });
  }

  try {
    return await getMerchantAccount(options.accessToken, accountId);
  } catch (error) {
    const canRegister =
      isUnregisteredGcpMessage(googleErrorText(error)) ||
      (isSyncError(error) && error.code === SYNC_ERROR_CODES.PERMISSION);
    if (!canRegister) throw error;
    await registerMerchantGcp({
      accessToken: options.accessToken,
      accountId,
      developerEmail: options.developerEmail,
    });
    try {
      return await getMerchantAccount(options.accessToken, accountId);
    } catch {
      return { accountId, accountName: `Merchant ${accountId}` };
    }
  }
}

export async function bootstrapGoogleMerchant(options: {
  accessToken: string;
  merchantId?: string | null;
  dataSource?: string | null;
  developerEmail?: string;
}) {
  const developerEmail =
    options.developerEmail?.trim() ||
    process.env.GOOGLE_MERCHANT_DEVELOPER_EMAIL?.trim() ||
    (await googleUserEmail(options.accessToken).catch(() => ""));
  let merchantId = parseMerchantAccountId(options.merchantId ?? "");
  let accounts: MerchantAccountSummary[] = [];

  if (merchantId) {
    try {
      await registerMerchantGcp({
        accessToken: options.accessToken,
        accountId: merchantId,
        developerEmail,
      });
    } catch (error) {
      if (isSyncError(error) && error.code === SYNC_ERROR_CODES.PERMISSION && !isUnregisteredGcpMessage(googleErrorText(error))) {
        throw error;
      }
    }
  }

  try {
    accounts = await listMerchantAccounts(options.accessToken);
  } catch (error) {
    if (merchantId) {
      await ensureMerchantAccountAccess({
        accessToken: options.accessToken,
        accountId: merchantId,
        developerEmail,
      });
      accounts = await listMerchantAccounts(options.accessToken).catch(() => []);
    } else if (isUnregisteredGcpMessage(googleErrorText(error))) {
      throw new SyncError(
        "Enter the Merchant Center ID, then click Connect Google with an Admin account so this Cloud project can be registered.",
        { code: SYNC_ERROR_CODES.PERMISSION, detail: isSyncError(error) ? error.detail : undefined }
      );
    } else {
      throw error;
    }
  }

  if (!merchantId) merchantId = accounts[0]?.id ?? "";
  if (!merchantId) {
    throw new SyncError(
      "This Google login has no Merchant Center account. Sign in with the Google account that is Admin in Merchant Center.",
      { code: SYNC_ERROR_CODES.PERMISSION }
    );
  }

  if (!accounts.some((account) => account.id === merchantId)) {
    await ensureMerchantAccountAccess({
      accessToken: options.accessToken,
      accountId: merchantId,
      developerEmail,
    });
    accounts = await listMerchantAccounts(options.accessToken).catch(() => accounts);
  }

  const matched = accounts.find((account) => account.id === merchantId);
  const account = matched
    ? { accountName: matched.name, accountId: matched.id }
    : await ensureMerchantAccountAccess({
        accessToken: options.accessToken,
        accountId: merchantId,
        developerEmail,
      });

  let dataSource = parseMerchantAccountId(options.dataSource ?? "");
  try {
    dataSource = await ensureApiProductDataSource({
      accessToken: options.accessToken,
      accountId: merchantId,
      preferredId: dataSource,
    });
  } catch {
    if (!dataSource) {
      const sources = await listMerchantDataSources(options.accessToken, merchantId).catch(() => []);
      dataSource = pickApiProductDataSource(sources) || sources[0]?.id || "";
    }
  }

  return {
    merchantId,
    merchantName: account.accountName || matched?.name || `Merchant ${merchantId}`,
    dataSource: dataSource || null,
    accounts,
  };
}

