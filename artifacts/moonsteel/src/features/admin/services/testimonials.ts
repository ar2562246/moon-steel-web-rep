import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { TESTIMONIAL_SELECT, type Testimonial } from "@/features/testimonials/types";

export async function fetchTestimonials() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select(TESTIMONIAL_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Testimonial[];
}

type CreatePayload = {
  quote: string;
  author_name: string;
  author_role: string;
  company?: string | null;
  sort_order: number;
  published: boolean;
};

export async function createTestimonial(payload: CreatePayload) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("testimonials")
    .insert({
      quote: payload.quote,
      author_name: payload.author_name,
      author_role: payload.author_role,
      company: payload.company ?? null,
      sort_order: payload.sort_order,
      published: payload.published,
    })
    .select(TESTIMONIAL_SELECT)
    .single();

  if (error) throw error;
  return data as Testimonial;
}

type UpdatePayload = CreatePayload & {
  id: string;
};

export async function updateTestimonial(payload: UpdatePayload) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("testimonials")
    .update({
      quote: payload.quote,
      author_name: payload.author_name,
      author_role: payload.author_role,
      company: payload.company ?? null,
      sort_order: payload.sort_order,
      published: payload.published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.id)
    .select(TESTIMONIAL_SELECT)
    .single();

  if (error) throw error;
  return data as Testimonial;
}

export async function deleteTestimonial(id: string) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) throw error;
}
