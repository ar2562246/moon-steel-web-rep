import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import {
  STATE_COOKIE,
  createOAuthState,
  googleOAuthUrl,
  metaOAuthUrl,
  oauthCookieOptions,
  oauthRedirectUri,
} from "@/features/catalog-sync/connections/oauth";
import { getSiteUrl } from "@/lib/site";

export const runtime = "nodejs";

function originFrom(request: Request) {
  if (process.env.NODE_ENV !== "production") return new URL(request.url).origin;
  return getSiteUrl();
}

export async function GET(request: Request, context: { params: Promise<{ provider: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { provider } = await context.params;
  if (provider !== "meta" && provider !== "google" && provider !== "whatsapp") {
    return NextResponse.json({ error: "Unsupported OAuth provider." }, { status: 400 });
  }

  const oauthProvider = provider === "whatsapp" ? "meta" : provider;
  const origin = originFrom(request);
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
