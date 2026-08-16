import { describe, expect, it } from "vitest";
import { catalogProductUrl, catalogPublicOrigin, isPublicCatalogUrl, PRODUCTION_SITE_URL } from "./site";

describe("catalog public URLs", () => {
  it("always uses the live Moon Steel origin", () => {
    expect(catalogPublicOrigin()).toBe(PRODUCTION_SITE_URL);
    expect(catalogProductUrl("/products/stainless-steel-grease-trap-33-gpm")).toBe(
      "https://moonsteelfab.com/products/stainless-steel-grease-trap-33-gpm"
    );
  });

  it("rejects localhost and http links", () => {
    expect(isPublicCatalogUrl("http://localhost:3000/products/hand-wash-sink")).toBe(false);
    expect(isPublicCatalogUrl("https://moonsteelfab.com/products/hand-wash-sink")).toBe(true);
  });
});
