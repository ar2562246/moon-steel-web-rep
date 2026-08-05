export type Client = {
  id: string;
  slug: string;
  name: string;
  industry: string;
  locations: string | null;
  logo_url: string | null;
  notes: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type ClientReference = {
  id: string;
  slug: string;
  client_name: string;
  industry: string;
  issued_on: string | null;
  quote: string;
  image_url: string;
  client_id: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export const CLIENT_SELECT =
  "id,slug,name,industry,locations,logo_url,notes,sort_order,published,created_at" as const;

export const CLIENT_REFERENCE_SELECT =
  "id,slug,client_name,industry,issued_on,quote,image_url,client_id,sort_order,published,created_at" as const;

export const CLIENT_INDUSTRY_ORDER = [
  "Restaurants",
  "Hotels",
  "Hospitals",
  "Pharmaceuticals",
  "Petroleum",
  "Clubs",
  "Others",
  "Partners",
] as const;

export function groupClientsByIndustry(clients: Client[]) {
  const groups = new Map<string, Client[]>();
  for (const industry of CLIENT_INDUSTRY_ORDER) {
    groups.set(industry, []);
  }
  for (const client of clients) {
    const key = groups.has(client.industry) ? client.industry : "Others";
    groups.get(key)!.push(client);
  }
  return CLIENT_INDUSTRY_ORDER.map((industry) => ({
    industry,
    clients: groups.get(industry) ?? [],
  })).filter((group) => group.clients.length > 0);
}
