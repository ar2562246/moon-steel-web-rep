import { describe, expect, it } from "vitest";
import { parseMerchantAccountId, pickApiProductDataSource, summarizeMerchantAccount } from "./accounts";
import { googlePermissionMessage, humanizeGoogleError, isUnregisteredGcpMessage, SYNC_ERROR_CODES } from "../../core/errors";

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
    ).toContain("merchantapi.googleapis.com?project=moon-steel-fab-project");
  });
});

describe("pickApiProductDataSource", () => {
  it("prefers an API data source over a file feed", () => {
    expect(
      pickApiProductDataSource(
        [
          { id: "10707363488", name: "File feed", input: "FILE" },
          { id: "99", name: "Moon Steel API", input: "API" },
        ],
        "10707363488"
      )
    ).toBe("99");
  });
});

describe("unregistered GCP 401", () => {
  it("is not treated as an expired login", () => {
    const message =
      "GCP project with id moon-steel-fab-project and number 759525385837 is not registered with the merchant account.";
    expect(isUnregisteredGcpMessage(message)).toBe(true);
    const error = humanizeGoogleError(401, message);
    expect(error.code).toBe(SYNC_ERROR_CODES.PERMISSION);
    expect(error.message).toContain("register");
  });
});
