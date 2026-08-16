import { describe, expect, it } from "vitest";
import { verifyWhatsAppBusinessAccount } from "./account";
import { isWhatsAppBusinessAccountId } from "./ids";

describe("isWhatsAppBusinessAccountId", () => {
  it("accepts numeric Cloud API WABA IDs", () => {
    expect(isWhatsAppBusinessAccountId("224395622680651")).toBe(true);
  });

  it("rejects product UUIDs and non-numeric values", () => {
    expect(isWhatsAppBusinessAccountId("e3762d7b-f3dd-4f73-880d-999b822256c6")).toBe(false);
    expect(isWhatsAppBusinessAccountId("")).toBe(false);
    expect(isWhatsAppBusinessAccountId("abc")).toBe(false);
  });
});

describe("verifyWhatsAppBusinessAccount", () => {
  it("rejects a product UUID without calling Graph", async () => {
    await expect(
      verifyWhatsAppBusinessAccount({
        accessToken: "token",
        wabaId: "e3762d7b-f3dd-4f73-880d-999b822256c6",
        catalogId: "1468696146495798",
      })
    ).resolves.toEqual({
      ok: false,
      error: expect.stringContaining("not a WhatsApp Business Account"),
    });
  });
});
