import { describe, expect, it } from "vitest";
import { decryptJson, encryptJson } from "./crypto";

describe("credential encryption", () => {
  it("round-trips JSON and never stores plaintext", () => {
    process.env.SYNC_CREDENTIALS_ENCRYPTION_KEY = "unit-test-encryption-key-value";
    const payload = { accessToken: "secret-token", refreshToken: "refresh" };
    const encrypted = encryptJson(payload);
    expect(encrypted.startsWith("v1.")).toBe(true);
    expect(encrypted.includes("secret-token")).toBe(false);
    expect(decryptJson(encrypted)).toEqual(payload);
  });
});
