import type { SupabaseClient } from "@supabase/supabase-js";
import { TESTIMONIAL_SELECT, type Testimonial } from "@/features/testimonials/types";

export async function listPublishedTestimonials(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("testimonials")
    .select(TESTIMONIAL_SELECT)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Testimonial[];
}

export async function listAllTestimonials(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("testimonials")
    .select(TESTIMONIAL_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Testimonial[];
}
