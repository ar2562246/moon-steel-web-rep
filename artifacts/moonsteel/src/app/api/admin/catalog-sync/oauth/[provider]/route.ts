import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import {
  STATE_COOKIE,
  createOAuthState,
  googleOAuthUrl,
  metaOAuthUrl,
  oauthCookieOptions,
  oauthPublicOrigin,
  oauthRedirectUri,
} from "@/features/catalog-sync/connections/oauth";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ provider: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { provider } = await context.params;
  if (provider !== "meta" && provider !== "google" && provider !== "whatsapp") {
    return NextResponse.json({ error: "Unsupported OAuth provider." }, { status: 400 });
  }

  const oauthProvider = provider === "whatsapp" ? "meta" : provider;
  const origin = oauthPublicOrigin(request);
  const redirectUri = oauthRedirectUri(oauthProvider, origin);
  const state = createOAuthState(oauthProvider);
  const store = await cookies();
  store.set(STATE_COOKIE, state, oauthCookieOptions());

  try {
    const url = oauthProvider === "google" ? googleOAuthUrl(state, redirectUri) : metaOAuthUrl(state, redirectUri);
    return NextResponse.redirect(url);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "OAuth is not configured." },
      { status: 500 }
    );
  }
}
