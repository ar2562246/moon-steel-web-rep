import type { SupabaseClient } from "@supabase/supabase-js";
import type { CustomerLogo, HeroImage, ProductCategory } from "@/features/admin/types";
import { defaultProductLines } from "@/features/home/defaultProductLines";
import { defaultProjects } from "@/features/projects/defaultProjects";
import { listPublishedProjects } from "@/features/projects/queries";
import { defaultTestimonials } from "@/features/testimonials/defaultTestimonials";
import { listPublishedTestimonials } from "@/features/testimonials/queries";
import type { Testimonial } from "@/features/testimonials/types";
import type { Project } from "@/features/projects/types";
import { createSupabaseServerClient, hasSupabaseServerEnv } from "@/lib/supabase/server";

const DEFAULT_LOGO_SLIDER_SPEED = 52;

export type HomePageData = {
  heroImages: HeroImage[];
  customerLogos: CustomerLogo[];
  logoSliderSpeed: number;
  productCategories: ProductCategory[];
  projects: Project[];
  testimonials: Testimonial[];
};

async function fetchHeroImages(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("hero_images")
    .select("id,slot,image_url,label,created_at")
    .order("slot", { ascending: true });

  if (error) throw error;
  return (data ?? []) as HeroImage[];
}

async function fetchCustomerLogos(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("customer_logos")
    .select("id,image_url,created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CustomerLogo[];
}

async function fetchLogoSliderSpeed(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "logo_slider_speed")
    .maybeSingle();

  if (error) throw error;

  const parsed = Number(data?.value);
  if (Number.isFinite(parsed) && parsed >= 12 && parsed <= 120) {
    return parsed;
  }

  return DEFAULT_LOGO_SLIDER_SPEED;
}

async function fetchProductCategories(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("product_categories")
    .select("id,title,specs,description,uses,sort_order,created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ProductCategory[];
}

export async function resolveHomePageData(): Promise<HomePageData> {
  if (hasSupabaseServerEnv()) {
    try {
      const supabase = await createSupabaseServerClient();
      const [heroImages, customerLogos, logoSliderSpeed, productCategories, projects, testimonials] =
        await Promise.all([
          fetchHeroImages(supabase),
          fetchCustomerLogos(supabase),
          fetchLogoSliderSpeed(supabase),
          fetchProductCategories(supabase),
          listPublishedProjects(supabase),
          listPublishedTestimonials(supabase),
        ]);

      return {
        heroImages,
        customerLogos,
        logoSliderSpeed,
        productCategories: productCategories.length > 0 ? productCategories : defaultProductLines,
        projects: projects.length > 0 ? projects : defaultProjects,
        testimonials: testimonials.length > 0 ? testimonials : defaultTestimonials,
      };
    } catch {
      // Fall through to static defaults when Supabase is unavailable.
    }
  }

  return {
    heroImages: [],
    customerLogos: [],
    logoSliderSpeed: DEFAULT_LOGO_SLIDER_SPEED,
    productCategories: defaultProductLines,
    projects: defaultProjects,
    testimonials: defaultTestimonials,
  };
}
