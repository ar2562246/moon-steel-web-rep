import { describe, expect, it } from "vitest";
import { parseMerchantAccountId, summarizeMerchantAccount } from "./accounts";
import { googlePermissionMessage } from "../../core/errors";

describe("parseMerchantAccountId", () => {
  it("accepts a numeric Merchant Center ID or accounts/{id} name", () => {
    expect(parseMerchantAccountId("643143560")).toBe("643143560");
    expect(parseMerchantAccountId("accounts/643143560")).toBe("643143560");
  });
});

describe("summarizeMerchantAccount", () => {
  it("uses the human-readable account name", () => {
    expect(
      summarizeMerchantAccount({ name: "accounts/643143560", accountId: "643143560", accountName: "Moon Steel" })
    ).toEqual({ id: "643143560", name: "Moon Steel" });
  });
});

describe("googlePermissionMessage", () => {
  it("tells the admin to enable Merchant API when the project has not used it", () => {
    expect(
      googlePermissionMessage("Merchant API has not been used in project moon-steel-fab-project before or it is disabled.")
    ).toContain("Enable Merchant API");
  });
});
