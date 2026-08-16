import { isSyncError, SYNC_ERROR_CODES, SyncError } from "../../core/errors";
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

export async function registerMerchantGcp(options: {
  accessToken: string;
  accountId: string;
  developerEmail?: string;
}) {
  const body = options.developerEmail?.trim() ? { developerEmail: options.developerEmail.trim() } : {};
  return googleMerchantRequest(
    `https://merchantapi.googleapis.com/accounts/v1/accounts/${options.accountId}/developerRegistration:registerGcp`,
    {
      accessToken: options.accessToken,
      method: "POST",
      body,
    }
  );
}

export async function listMerchantDataSources(accessToken: string, accountId: string) {
  const json = await googleMerchantRequest<{
    dataSources?: Array<{ name?: string; dataSourceId?: string | number; displayName?: string }>;
  }>(`https://merchantapi.googleapis.com/datasources/v1/accounts/${accountId}/dataSources`, { accessToken });
  return (json.dataSources ?? []).flatMap((source) => {
    const id = parseMerchantAccountId(source.dataSourceId ?? source.name?.split("/").pop());
    if (!id) return [];
    return [{ id, name: source.displayName?.trim() || `Data source ${id}` }];
  });
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
    if (!isSyncError(error) || error.code !== SYNC_ERROR_CODES.PERMISSION) throw error;
    try {
      await registerMerchantGcp({
        accessToken: options.accessToken,
        accountId,
        developerEmail: options.developerEmail,
      });
    } catch (registerError) {
      if (isSyncError(registerError) && registerError.code === SYNC_ERROR_CODES.PERMISSION) {
        throw registerError;
      }
    }
    return getMerchantAccount(options.accessToken, accountId);
  }
}

export async function bootstrapGoogleMerchant(options: {
  accessToken: string;
  merchantId?: string | null;
  dataSource?: string | null;
  developerEmail?: string;
}) {
  const developerEmail = options.developerEmail?.trim() || process.env.GOOGLE_MERCHANT_DEVELOPER_EMAIL?.trim();
  let merchantId = parseMerchantAccountId(options.merchantId ?? "");
  let accounts: MerchantAccountSummary[] = [];

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
  if (!dataSource) {
    const sources = await listMerchantDataSources(options.accessToken, merchantId).catch(() => []);
    dataSource = sources[0]?.id ?? "";
  }

  return {
    merchantId,
    merchantName: account.accountName || matched?.name || `Merchant ${merchantId}`,
    dataSource: dataSource || null,
    accounts,
  };
}

