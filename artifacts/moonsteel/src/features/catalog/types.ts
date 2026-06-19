export type CatalogCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at?: string;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  details: string;
  image_url: string;
  image_urls?: string[];
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at?: string;
  categories: CatalogCategorySummary[];
  path: string;
};

export type CatalogCategorySummary = Pick<CatalogCategory, "id" | "slug" | "name">;

export const CATALOG_CATEGORY_SELECT =
  "id,slug,name,description,sort_order,published,created_at,updated_at";

export const CATALOG_PRODUCT_SELECT = `
  id,slug,name,details,image_url,image_urls,sort_order,published,created_at,updated_at,
  catalog_product_categories (
    catalog_categories (
      id, slug, name
    )
  )
`;

export type CatalogProductRow = Omit<CatalogProduct, "categories" | "path"> & {
  catalog_product_categories?: {
    catalog_categories: CatalogCategorySummary | CatalogCategorySummary[] | null;
  }[];
};
