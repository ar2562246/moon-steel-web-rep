import { describe, expect, it } from "vitest";
import { oauthPublicOrigin, oauthRedirectUri } from "./oauth";

describe("oauthPublicOrigin", () => {
  it("rewrites the 0.0.0.0 bind address to localhost for Google/Meta redirect URIs", () => {
    const request = new Request("http://0.0.0.0:3000/api/admin/catalog-sync/oauth/google", {
      headers: { host: "0.0.0.0:3000" },
    });
    expect(oauthPublicOrigin(request)).toBe("http://localhost:3000");
    expect(oauthRedirectUri("google", oauthPublicOrigin(request))).toBe(
      "http://localhost:3000/api/admin/catalog-sync/oauth/google/callback"
    );
  });

  it("rewrites 127.0.0.1 to localhost so it matches the Google Cloud URI", () => {
    const request = new Request("http://127.0.0.1:3000/api/admin/catalog-sync/oauth/google", {
      headers: { host: "127.0.0.1:3000" },
    });
    expect(oauthPublicOrigin(request)).toBe("http://localhost:3000");
  });
});
