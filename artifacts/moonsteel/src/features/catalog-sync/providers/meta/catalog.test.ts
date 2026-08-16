import { describe, expect, it } from "vitest";
import {
  catalogListingRedirectUrl,
  digitsOnly,
  facebookShopUrl,
  instagramProfileUrl,
  metaCommerceManagerUrl,
  whatsappStorefrontUrl,
} from "./catalog";

describe("catalog listing URLs", () => {
  it("opens the stable Commerce Manager catalog, not the broken product_details path", () => {
    expect(metaCommerceManagerUrl("1468696146495798", "37744433698505548")).toBe(
      "https://business.facebook.com/commerce/catalogs/1468696146495798"
    );
  });

  it("builds Facebook Shop and Instagram profile URLs from usernames", () => {
    expect(facebookShopUrl({ pageUsername: "moonsteelfab" })).toBe("https://www.facebook.com/moonsteelfab/shop/");
    expect(instagramProfileUrl("@moonsteelfab")).toBe("https://www.instagram.com/moonsteelfab/");
  });

  it("builds WhatsApp catalog and product storefront URLs from E.164 digits", () => {
    expect(digitsOnly("+92 331 2562246")).toBe("923312562246");
    expect(whatsappStorefrontUrl({ phoneDigits: "923312562246" })).toBe("https://wa.me/c/923312562246");
    expect(whatsappStorefrontUrl({ phoneDigits: "923312562246", metaProductId: "37744433698505548" })).toBe(
      "https://wa.me/p/37744433698505548/923312562246"
    );
  });

  it("routes View by platform", () => {
    expect(
      catalogListingRedirectUrl({
        platformId: "facebook",
        catalogId: "1468696146495798",
        metaProductId: "37744433698505548",
      })
    ).toContain("/commerce/catalogs/1468696146495798");
    expect(
      catalogListingRedirectUrl({
        platformId: "instagram",
        catalogId: "1",
        instagramUsername: "moonsteelfab",
      })
    ).toBe("https://www.instagram.com/moonsteelfab/");
    expect(
      catalogListingRedirectUrl({
        platformId: "whatsapp",
        catalogId: "1",
        metaProductId: "37744433698505548",
        whatsappPhone: "923312562246",
      })
    ).toBe("https://wa.me/p/37744433698505548/923312562246");
  });
});
