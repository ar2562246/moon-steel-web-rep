import type { SupabaseClient } from "@supabase/supabase-js";
import type { CustomerLogo, HeroImage } from "@/features/admin/types";
import {
  defaultCatalogCategories,
  defaultCatalogProducts,
} from "@/features/catalog/defaultCatalog";
import {
  buildCatalogCategoryCards,
  listPublishedCatalogCategories,
  listPublishedCatalogProducts,
} from "@/features/catalog/queries";
import type { CatalogCategory, CatalogCategoryCard, CatalogProduct } from "@/features/catalog/types";
import { sortGreaseTrapsSmallToLarge } from "@/app/grease-traps/grease-traps-data";
import { defaultProjects } from "@/features/projects/defaultProjects";
import { listPublishedProjects } from "@/features/projects/queries";
import { defaultTestimonials } from "@/features/testimonials/defaultTestimonials";
import { listPublishedTestimonials } from "@/features/testimonials/queries";
import type { Testimonial } from "@/features/testimonials/types";
import type { Project } from "@/features/projects/types";
import { createSupabasePublicClient, hasSupabaseServerEnv } from "@/lib/supabase/server";

const DEFAULT_LOGO_SLIDER_SPEED = 52;
const GREASE_TRAP_CATEGORY_SLUG = "grease-traps";

export type HomeGreaseTrapSection = {
  title: string;
  description: string;
  products: CatalogProduct[];
};

export type HomePageData = {
  heroImages: HeroImage[];
  customerLogos: CustomerLogo[];
  logoSliderSpeed: number;
  catalogCategories: CatalogCategoryCard[];
  greaseTraps: HomeGreaseTrapSection;
  projects: Project[];
  testimonials: Testimonial[];
};

function defaultCategoryCards() {
  return buildCatalogCategoryCards(defaultCatalogCategories, defaultCatalogProducts);
}

function firstDetailsParagraph(details: string) {
  return (
    details
      .split(/\n+/)
      .map((line) => line.trim())
      .find(Boolean) ?? ""
  );
}

export function buildGreaseTrapSection(
  categories: Array<Pick<CatalogCategory, "slug" | "name" | "description">>,
  products: CatalogProduct[],
): HomeGreaseTrapSection {
  const category = categories.find((item) => item.slug === GREASE_TRAP_CATEGORY_SLUG);
  const greaseTrapProducts = sortGreaseTrapsSmallToLarge(
    products.filter((product) => product.categories.some((item) => item.slug === GREASE_TRAP_CATEGORY_SLUG)),
  );
  const fromCategory = category?.description?.trim() ?? "";
  const fromProducts = firstDetailsParagraph(greaseTrapProducts[0]?.details ?? "");

  return {
    title: category?.name ?? "Grease Traps",
    description:
      fromCategory ||
      fromProducts ||
      "Stainless steel grease traps and interceptors for commercial kitchen drainage.",
    products: greaseTrapProducts,
  };
}

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

export async function resolveHomePageData(): Promise<HomePageData> {
  if (hasSupabaseServerEnv()) {
    try {
      const supabase = createSupabasePublicClient();
      const [
        heroImages,
        customerLogos,
        logoSliderSpeed,
        categories,
        products,
        projects,
        testimonials,
      ] = await Promise.all([
        fetchHeroImages(supabase),
        fetchCustomerLogos(supabase),
        fetchLogoSliderSpeed(supabase),
        listPublishedCatalogCategories(supabase),
        listPublishedCatalogProducts(supabase),
        listPublishedProjects(supabase),
        listPublishedTestimonials(supabase),
      ]);

      const catalogCategories =
        categories.length > 0
          ? buildCatalogCategoryCards(categories, products)
          : defaultCategoryCards();

      return {
        heroImages,
        customerLogos,
        logoSliderSpeed,
        catalogCategories,
        greaseTraps: buildGreaseTrapSection(categories, products),
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
    catalogCategories: defaultCategoryCards(),
    greaseTraps: buildGreaseTrapSection(
      defaultCatalogCategories.map((category) => ({
        ...category,
        description: null,
      })),
      defaultCatalogProducts,
    ),
    projects: defaultProjects,
    testimonials: defaultTestimonials,
  };
}
