import type { Client, ClientReference } from "@/features/clients/types";

/** Static fallback when Supabase is unavailable. */
export const defaultClients: Client[] = [
  {
    id: "default-pizza-hut",
    slug: "pizza-hut",
    name: "Pizza Hut",
    industry: "Restaurants",
    locations: "Branches across Pakistan",
    logo_url: null,
    notes: null,
    sort_order: 10,
    published: true,
    created_at: "",
  },
  {
    id: "default-aga-khan",
    slug: "aga-khan-hospital",
    name: "Aga Khan Hospital",
    industry: "Hospitals",
    locations: null,
    logo_url: null,
    notes: null,
    sort_order: 20,
    published: true,
    created_at: "",
  },
  {
    id: "default-serena",
    slug: "serena-hotel-and-lodges",
    name: "Serena Hotel and Lodges",
    industry: "Hotels",
    locations: "Islamabad, Faisalabad, Quetta, Swat, Hunza",
    logo_url: null,
    notes: null,
    sort_order: 20,
    published: true,
    created_at: "",
  },
];

export const defaultClientReferences: ClientReference[] = [];
