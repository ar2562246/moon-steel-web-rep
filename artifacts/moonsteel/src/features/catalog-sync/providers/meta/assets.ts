import { metaGraphRequest } from "./graph";

export type MetaNamedAsset = { id: string; name?: string };

type CatalogEdge = { data?: MetaNamedAsset[] };

type MetaBusiness = {
  id: string;
  name?: string;
  owned_product_catalogs?: CatalogEdge;
  client_product_catalogs?: CatalogEdge;
};

export function uniqueNamedAssets(items: MetaNamedAsset[]): MetaNamedAsset[] {
  const seen = new Set<string>();
  const out: MetaNamedAsset[] = [];
  for (const item of items) {
    if (!item?.id || seen.has(item.id)) continue;
    seen.add(item.id);
    out.push({ id: item.id, name: item.name });
  }
  return out;
}

export function flattenBusinessCatalogs(businesses: MetaBusiness[]): MetaNamedAsset[] {
  const catalogs: MetaNamedAsset[] = [];
  for (const business of businesses) {
    catalogs.push(...(business.owned_product_catalogs?.data ?? []));
    catalogs.push(...(business.client_product_catalogs?.data ?? []));
  }
  return uniqueNamedAssets(catalogs);
}

export async function listMetaBusinessAssets(accessToken: string, pages: MetaNamedAsset[] = []) {
  const businessesResponse = await metaGraphRequest<{ data?: MetaBusiness[] }>("me/businesses", {
    accessToken,
    search: {
      fields: "id,name,owned_product_catalogs{id,name},client_product_catalogs{id,name}",
    },
  }).catch(() => ({ data: [] as MetaBusiness[] }));

  const businesses = businessesResponse.data ?? [];
  let catalogs = flattenBusinessCatalogs(businesses);

  if (catalogs.length === 0) {
    const fromEdges = await Promise.all(
      businesses.map((business) =>
        metaGraphRequest<{ data?: MetaNamedAsset[] }>(`${business.id}/owned_product_catalogs`, {
          accessToken,
          search: { fields: "id,name" },
        }).catch(() => ({ data: [] as MetaNamedAsset[] }))
      )
    );
    catalogs = uniqueNamedAssets(fromEdges.flatMap((edge) => edge.data ?? []));
  }

  if (catalogs.length === 0 && pages.length > 0) {
    const fromPages = await Promise.all(
      pages.map((page) =>
        metaGraphRequest<{ data?: MetaNamedAsset[] }>(`${page.id}/product_catalogs`, {
          accessToken,
          search: { fields: "id,name" },
        }).catch(() => ({ data: [] as MetaNamedAsset[] }))
      )
    );
    catalogs = uniqueNamedAssets(fromPages.flatMap((edge) => edge.data ?? []));
  }

  return { businesses, catalogs };
}
