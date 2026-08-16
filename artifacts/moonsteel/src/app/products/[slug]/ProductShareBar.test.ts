import { describe, expect, it } from "vitest";
import { productSharePayload } from "./ProductShareBar";

describe("productSharePayload", () => {
  it("builds a public Moon Steel product URL and caption", () => {
    expect(
      productSharePayload({
        slug: "hand-wash-sink",
        name: "Hand Wash Sink",
        path: "/products/hand-wash-sink",
      })
    ).toEqual({
      url: "https://moonsteelfab.com/products/hand-wash-sink",
      text: "Hand Wash Sink — Moon Steel Fabricators",
      message: "Hand Wash Sink — Moon Steel Fabricators\nhttps://moonsteelfab.com/products/hand-wash-sink",
    });
  });
});
