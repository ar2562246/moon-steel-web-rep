export const TESTIMONIAL_SELECT =
  "id,quote,author_name,author_role,company,sort_order,published,created_at";

export type Testimonial = {
  id: string;
  quote: string;
  author_name: string;
  author_role: string;
  company: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};
