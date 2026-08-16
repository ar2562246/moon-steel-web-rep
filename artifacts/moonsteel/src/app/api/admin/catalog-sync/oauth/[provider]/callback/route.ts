import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  STATE_COOKIE,
  exchangeGoogleCode,
  exchangeMetaCode,
  oauthRedirectUri,
  verifyOAuthState,
} from "@/features/catalog-sync/connections/oauth";
import { upsertConnection } from "@/features/catalog-sync/connections/store";
import { metaGraphRequest } from "@/features/catalog-sync/providers/meta/graph";
import { listMetaBusinessAssets } from "@/features/catalog-sync/providers/meta/assets";
import { getSiteUrl } from "@/lib/site";

export const runtime = "nodejs";

function originFrom(request: Request) {
  if (process.env.NODE_ENV !== "production") return new URL(request.url).origin;
  return getSiteUrl();
}

function adminRedirect(origin: string, query: Record<string, string>) {
  const url = new URL("/admin", origin);
  url.searchParams.set("tab", "social-channels");
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
  return NextResponse.redirect(url);
}

export async function GET(request: Request, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  const origin = originFrom(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error_description") || url.searchParams.get("error");

  const store = await cookies();
  const expected = store.get(STATE_COOKIE)?.value;
  store.delete(STATE_COOKIE);

  if (oauthError) return adminRedirect(origin, { sync_error: oauthError });
  if (!code || !state || !expected || state !== expected || !verifyOAuthState(state, provider)) {
    return adminRedirect(origin, { sync_error: "OAuth state mismatch. Try connecting again." });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };
  if (!user || profile?.role !== "admin") {
    return adminRedirect(origin, { sync_error: "Admin session required." });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return adminRedirect(origin, { sync_error: "Server is missing Supabase service credentials." });

  try {
    if (provider === "meta") {
      const accessToken = await exchangeMetaCode(code, oauthRedirectUri("meta", origin));
      const me = await metaGraphRequest<{ id: string; name?: string }>("me", {
        accessToken,
        search: { fields: "id,name" },
      });
      const pages = await metaGraphRequest<{
        data?: Array<{
          id: string;
          name?: string;
          username?: string;
          instagram_business_account?: { id: string; username?: string };
        }>;
      }>("me/accounts", {
        accessToken,
        search: { fields: "id,name,username,instagram_business_account{id,username}" },
      }).catch(() =>
        metaGraphRequest<{
          data?: Array<{
            id: string;
            name?: string;
            username?: string;
            instagram_business_account?: { id: string; username?: string };
          }>;
        }>("me/accounts", {
          accessToken,
          search: { fields: "id,name,instagram_business_account" },
        }).catch(() => ({
          data: [] as Array<{
            id: string;
            name?: string;
            username?: string;
            instagram_business_account?: { id: string; username?: string };
          }>,
        }))
      );

      const pageList = (pages.data ?? []).map((page) => ({
        id: page.id,
        name: page.name,
        username: page.username ?? null,
        instagramAccountId: page.instagram_business_account?.id ?? null,
        instagramUsername: page.instagram_business_account?.username ?? null,
      }));
      const { businesses, catalogs, wabas } = await listMetaBusinessAssets(accessToken, pageList);

      const page = pageList[0];
      const catalog = catalogs[0];
      await upsertConnection(admin, {
        provider: "meta",
        displayName: page?.name || me.name || "Meta",
        status: "connected",
        connectedBy: user.id,
        credentials: { accessToken, userId: me.id },
        config: {
          userId: me.id,
          pageId: page?.id ?? null,
          pageName: page?.name ?? null,
          pageUsername: page?.username ?? null,
          instagramAccountId: page?.instagramAccountId ?? null,
          instagramUsername: page?.instagramUsername ?? null,
          catalogId: catalog?.id ?? null,
          catalogName: catalog?.name ?? null,
          pages: pageList,
          catalogs,
          wabas,
          businesses: businesses.map((business) => ({ id: business.id, name: business.name })),
        },
      });
      return adminRedirect(origin, { sync_connected: "meta" });
    }

    if (provider === "google") {
      const tokens = await exchangeGoogleCode(code, oauthRedirectUri("google", origin));
      if (!tokens.refreshToken) {
        return adminRedirect(origin, {
          sync_error: "Google did not return a refresh token. Disconnect access in Google Account and connect again.",
        });
      }
      await upsertConnection(admin, {
        provider: "google",
        displayName: "Google Merchant Center",
        status: "connected",
        connectedBy: user.id,
        credentials: { refreshToken: tokens.refreshToken, accessToken: tokens.accessToken },
        config: {
          merchantId: process.env.GOOGLE_MERCHANT_ID || null,
          dataSource: process.env.GOOGLE_MERCHANT_DATASOURCE_ID || null,
          feedLabel: process.env.GOOGLE_MERCHANT_FEED_LABEL || "PK",
        },
      });
      return adminRedirect(origin, { sync_connected: "google" });
    }

    return adminRedirect(origin, { sync_error: "Unsupported OAuth provider." });
  } catch (error) {
    return adminRedirect(origin, {
      sync_error: error instanceof Error ? error.message : "OAuth connection failed.",
    });
  }
}
