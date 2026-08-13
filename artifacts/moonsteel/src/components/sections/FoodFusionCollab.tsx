import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { CmsImage } from "@/components/ui/CmsImage";

const madeItems = ["Trivets", "BBQ grills", "Skewers", "Spatulas", "Kulfi stands"];

export function FoodFusionCollab() {
  return (
    <section id="food-fusion" className="layer-0 py-24">
      <div className="container mx-auto px-4 md:px-6">
        <SectionReveal className="layer-1 mx-auto max-w-5xl overflow-hidden rounded-2xl">
          <div className="grid md:grid-cols-2">
            <div className="order-2 p-8 md:order-1 md:p-12">
              <p className="apple-eyebrow mb-6">Collaboration</p>

              <div className="mb-7 flex items-center gap-4">
                <img
                  src="/ms3-logo.svg"
                  alt="Moon Steel Fabricators"
                  width={48}
                  height={48}
                  loading="lazy"
                  decoding="async"
                  className="h-12 w-12 object-contain"
                />
                <span className="text-2xl font-light text-muted-foreground" aria-hidden>
                  &times;
                </span>
                {/* Served unresampled — the source mark is only 126px, so an
                    optimizer downscale pass would cost visible sharpness. */}
                <img
                  src="/images/partners/food-fusion-logo.png"
                  alt="Food Fusion"
                  width={126}
                  height={126}
                  loading="lazy"
                  decoding="async"
                  className="h-12 w-12 object-contain"
                />
              </div>

              <h2 className="mb-4 text-3xl font-display font-semibold tracking-tight text-foreground md:text-4xl">
                Built for Food Fusion.
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                Food Fusion designs it. We fabricate it in Karachi — laser-cut stainless steel
                kitchen tools for Pakistan&rsquo;s largest food brand, on the same machines that run
                our commercial work.
              </p>

              <ul className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border pt-6 text-sm text-muted-foreground">
                {madeItems.map((item, index) => (
                  <li key={item} className="flex items-center gap-2">
                    {index > 0 ? <span aria-hidden>&middot;</span> : null}
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/collaboration/food-fusion"
                className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Explore the collaboration
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            <div className="relative order-1 aspect-[4/3] bg-muted md:order-2 md:aspect-auto md:min-h-[420px]">
              <CmsImage
                src="/images/partners/food-fusion/connect-loop-trivet.jpg"
                alt="Connect Loop Trivet, laser-cut by Moon Steel for Food Fusion"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
