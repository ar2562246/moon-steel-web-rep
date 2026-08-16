import { describe, expect, it } from "vitest";
import { flattenBusinessCatalogs, uniqueNamedAssets } from "./assets";

describe("uniqueNamedAssets", () => {
  it("drops blanks and duplicates", () => {
    expect(
      uniqueNamedAssets([
        { id: "1", name: "A" },
        { id: "1", name: "A again" },
        { id: "", name: "skip" },
        { id: "2", name: "B" },
      ])
    ).toEqual([
      { id: "1", name: "A" },
      { id: "2", name: "B" },
    ]);
  });
});

describe("flattenBusinessCatalogs", () => {
  it("collects owned and client catalogs from businesses", () => {
    expect(
      flattenBusinessCatalogs([
        {
          id: "biz-1",
          name: "Moon Steel",
          owned_product_catalogs: { data: [{ id: "cat-1", name: "Main" }] },
          client_product_catalogs: { data: [{ id: "cat-2", name: "Agency" }] },
        },
        {
          id: "biz-2",
          owned_product_catalogs: { data: [{ id: "cat-1", name: "Main duplicate" }] },
        },
      ])
    ).toEqual([
      { id: "cat-1", name: "Main" },
      { id: "cat-2", name: "Agency" },
    ]);
  });
});
