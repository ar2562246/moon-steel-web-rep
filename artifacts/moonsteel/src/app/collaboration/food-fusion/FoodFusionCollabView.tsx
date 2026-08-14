import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { ParentBackLink } from "@/components/layout/ParentBackLink";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { CmsImage } from "@/components/ui/CmsImage";
import {
  FOOD_FUSION_BRAND_URL,
  FOOD_FUSION_STORE_URL,
  foodFusionContributions,
  foodFusionProducts,
} from "@/features/partners/foodFusion";

export function FoodFusionCollabView() {
  return (
    <main className="layer-0 pb-16 pt-28">
      <div className="container mx-auto px-4 md:px-6">
        <ParentBackLink href="/" label="home" />
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-8 flex items-center justify-center gap-5 md:gap-7">
            <img
              src="/ms3-logo.svg"
              alt="Moon Steel Fabricators"
              className="h-16 w-16 object-contain"
            />
            <span className="text-3xl font-light text-muted-foreground" aria-hidden>
              &times;
            </span>
            {/* Capped at 64px and served unresampled — the source badge is only
                150px, so a larger box would render visibly soft. */}
            <img
              src="/images/partners/food-fusion-logo.png"
              alt="Food Fusion"
              width={150}
              height={150}
              className="h-16 w-16 object-contain"
            />
          </div>

          <h1 className="apple-section-title mb-6">
            Moon Steel <span className="text-muted-foreground">&times;</span> Food Fusion
          </h1>
          <p className="apple-section-copy">
            Food Fusion is Pakistan&rsquo;s largest digital food brand. When they moved from recipes
            into physical kitchen tools, they needed a fabricator who could hold a tolerance at
            production volume — and hand-finish the result. That work happens at our Karachi
            manufacturing facility.
          </p>
        </div>

        <section className="mb-20">
          <div className="layer-1 mx-auto max-w-4xl space-y-4 rounded-2xl p-8 md:p-10">
            <h2 className="text-2xl font-display font-semibold text-foreground">
              A design partnership, not a supply order.
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              The Food Fusion design team brings the concept and the cooking insight — how a spatula
              should flex, why a trivet needs to breathe, where a skewer rolls when the weight is
              uneven. We bring the steel: material selection, laser cutting, forming, welding, and
              finishing.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Several rounds of prototyping usually sit between the two. The pieces that reach the
              shelf are the ones that survived that back-and-forth, and they carry the same
              standards as the commercial kitchen equipment we have built since 1974.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Moon Steel Fabricators is a member of Fusion Crafts, Food Fusion&rsquo;s network of
              collaborative Pakistani manufacturers.
            </p>
          </div>
        </section>

        <section className="mb-20">
          <div className="mb-10 max-w-2xl">
            <h2 className="apple-section-title mb-4 text-3xl">What we bring to the bench.</h2>
          </div>
          <SectionReveal className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {foodFusionContributions.map((item) => (
              <div key={item.title} className="layer-1 rounded-xl p-6">
                <h3 className="mb-2 text-lg font-display font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </SectionReveal>
        </section>

        <section className="mb-20">
          <div className="mb-10 max-w-2xl">
            <h2 className="apple-section-title mb-4 text-3xl">Products we fabricate.</h2>
            <p className="apple-section-copy">
              All of these are sold by Food Fusion through Fusion Home — the links go straight to
              their store.
            </p>
          </div>

          <SectionReveal className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {foodFusionProducts.map((product) => (
              <a
                key={product.slug}
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group layer-1 flex flex-col overflow-hidden rounded-xl transition-colors hover:border-primary/40"
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <CmsImage
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover md:transition-transform md:duration-700 md:group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="text-lg font-display font-semibold text-foreground group-hover:text-primary">
                      {product.name}
                    </h3>
                    <ArrowUpRight
                      className="mt-1 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary"
                      aria-hidden
                    />
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                    {product.blurb}
                  </p>
                  {product.creditsMoonSteel ? (
                    <p className="mt-4 border-t border-border pt-3 text-xs font-medium text-primary">
                      Moon Steel credited on the product page
                    </p>
                  ) : null}
                </div>
              </a>
            ))}
          </SectionReveal>

          <p className="mt-8 text-xs text-muted-foreground">
            Product names, photography, and designs belong to Food Fusion / Fusion Home and are shown
            here to document our fabrication work.
          </p>
        </section>

        <section className="layer-1 rounded-2xl p-8 text-center md:p-12">
          <h2 className="mb-4 text-2xl font-display font-semibold text-foreground md:text-3xl">
            Want something built to your drawing?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground">
            We take on product fabrication for brands as well as commercial kitchen projects. Send us
            a drawing or a concept and we will tell you how it should be made.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Talk to us about a build
            </Link>
            <a
              href={FOOD_FUSION_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-6 text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary"
            >
              Shop on Fusion Home
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
            <a
              href={FOOD_FUSION_BRAND_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              foodfusion.com
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
