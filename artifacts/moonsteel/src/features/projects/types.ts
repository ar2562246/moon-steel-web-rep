export type Project = {
  id: string;
  slug: string;
  title: string;
  scope: string;
  image_url: string;
  image_urls?: string[];
  industry: string;
  location: string | null;
  materials: string | null;
  description: string | null;
  specs: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at?: string;
};

export const PROJECT_SELECT =
  "id,slug,title,scope,image_url,image_urls,industry,location,materials,description,specs,sort_order,published,created_at,updated_at";
