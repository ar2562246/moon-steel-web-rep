import { describe, expect, it } from "vitest";
import { platformListingUrl } from "./platformListingUrl";
import type { CatalogSyncConnection, CatalogSyncState } from "@/features/admin/services/catalogSync";

function connection(config: Record<string, unknown>): CatalogSyncConnection {
  return {
    id: "conn-1",
    provider: "meta",
    accountKey: "default",
    displayName: "Meta",
    status: "connected",
    config,
    lastValidatedAt: null,
    lastError: null,
  };
}

function state(overrides: Partial<CatalogSyncState> = {}): CatalogSyncState {
  return {
    id: "state-1",
    productId: "e3762d7b-f3dd-4f73-880d-999b822256c6",
    platform: "facebook",
    status: "SYNCED",
    externalProductId: "e3762d7b-f3dd-4f73-880d-999b822256c6",
    externalUrl: null,
    lastSyncedAt: "2026-08-16T14:22:00Z",
    lastError: null,
    lastErrorCode: null,
    ...overrides,
  };
}

describe("platformListingUrl", () => {
  it("opens Meta listings through the admin view route so Graph can resolve the catalog item", () => {
    const platform = {
      id: "facebook",
      connection: connection({ catalogId: "1468696146495798", pageId: "216836508473000" }),
    };
    expect(platformListingUrl(platform, state())).toBe(
      "/api/admin/catalog-sync/view?platform=facebook&productId=e3762d7b-f3dd-4f73-880d-999b822256c6"
    );
    expect(platformListingUrl({ ...platform, id: "instagram" }, state({ platform: "instagram" }))).toContain(
      "platform=instagram"
    );
  });

  it("opens WhatsApp listings through the same catalog view route", () => {
    expect(
      platformListingUrl(
        { id: "whatsapp", connection: connection({ wabaId: "1234567890", catalogId: "1468696146495798" }) },
        state({ platform: "whatsapp" })
      )
    ).toBe(
      "/api/admin/catalog-sync/view?platform=whatsapp&productId=e3762d7b-f3dd-4f73-880d-999b822256c6"
    );
  });

  it("hides the link until the product has been synced", () => {
    expect(
      platformListingUrl(
        { id: "facebook", connection: connection({ catalogId: "1" }) },
        state({ status: "FAILED", externalProductId: null })
      )
    ).toBeNull();
  });
});
