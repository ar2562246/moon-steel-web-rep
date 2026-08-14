type Redirect = {
  source: string;
  destination: string;
  permanent: boolean;
};

function permanent(source: string, destination: string): Redirect {
  return { source, destination, permanent: true };
}

/**
 * Old WooCommerce URLs still indexed in Google Search Console.
 * Product slugs were kept; only the path prefix changed (/product → /products).
 */
export const legacyWordpressRedirects: Redirect[] = [
  permanent("/product/:slug", "/products/:slug"),
  permanent("/product/:slug/", "/products/:slug"),

  permanent("/product-category/grease-trap", "/grease-traps"),
  permanent("/product-category/grease-trap/", "/grease-traps"),
  permanent("/product-category/grease-traps", "/grease-traps"),
  permanent("/product-category/table", "/products?category=work-tables"),
  permanent("/product-category/table/", "/products?category=work-tables"),
  permanent("/product-category/tables", "/products?category=work-tables"),
  permanent("/product-category/cabinet", "/products?category=shelving-storage"),
  permanent("/product-category/cabinet/", "/products?category=shelving-storage"),
  permanent("/product-category/cabinets", "/products?category=shelving-storage"),
  permanent("/product-category/sink", "/products?category=commercial-sinks"),
  permanent("/product-category/sinks", "/products?category=commercial-sinks"),
  permanent("/product-category/hood", "/products?category=exhaust-hoods"),
  permanent("/product-category/exhaust-hood", "/products?category=exhaust-hoods"),
  permanent("/product-category/:slug", "/products"),
  permanent("/product-category/:slug/", "/products"),

  permanent("/product-tag/grating", "/products/floor-grating-drain-channel"),
  permanent("/product-tag/grating/", "/products/floor-grating-drain-channel"),
  permanent("/product-tag/316gradesteel", "/materials"),
  permanent("/product-tag/316gradesteel/", "/materials"),
  permanent("/product-tag/:slug", "/products"),
  permanent("/product-tag/:slug/", "/products"),

  permanent("/shop", "/products"),
  permanent("/shop/", "/products"),
  permanent("/shop/:path*", "/products"),

  permanent(
    "/the-benefits-of-using-a-stainless-steel-grease-trap-in-your-restaurant",
    "/blog/the-benefits-of-using-a-stainless-steel-grease-trap-in-your-restaurant",
  ),
  permanent(
    "/the-benefits-of-using-a-stainless-steel-grease-trap-in-your-restaurant/",
    "/blog/the-benefits-of-using-a-stainless-steel-grease-trap-in-your-restaurant",
  ),
];
