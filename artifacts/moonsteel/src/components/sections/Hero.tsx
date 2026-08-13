"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CmsImage } from "@/components/ui/CmsImage";
import { ArrowRight, Download, Zap } from "lucide-react";
import type { HeroImage } from "@/features/admin/types";

type HeroStripe = {
  src: string | null;
  label: string | null;
};

const arcPattern = [
  {
    size: "h-[30rem] w-[30rem] md:h-[38rem] md:w-[38rem] xl:h-[46rem] xl:w-[46rem]",
    color: "border-primary/25",
  },
  {
    size: "h-[24rem] w-[24rem] md:h-[30rem] md:w-[30rem] xl:h-[36rem] xl:w-[36rem]",
    color: "border-foreground/15",
  },
  {
    size: "h-[19rem] w-[19rem] md:h-[24rem] md:w-[24rem] xl:h-[29rem] xl:w-[29rem]",
    color: "border-primary/20",
  },
  {
    size: "h-[14rem] w-[14rem] md:h-[18rem] md:w-[18rem] xl:h-[22rem] xl:w-[22rem]",
    color: "border-foreground/12",
  },
  {
    size: "h-[10rem] w-[10rem] md:h-[13rem] md:w-[13rem] xl:h-[16rem] xl:w-[16rem]",
    color: "border-primary/18",
  },
];

type HeroProps = {
  initialHeroImages?: HeroImage[];
};

export function Hero({ initialHeroImages = [] }: HeroProps) {
  const [hoveredStripe, setHoveredStripe] = useState<number | null>(null);
  const [activeStripe, setActiveStripe] = useState(0);
  const [paused, setPaused] = useState(false);

  const heroImages = useMemo<HeroStripe[]>(() => {
    const bySlot = new Map<number, { image_url: string; label: string | null }>();
    initialHeroImages.forEach((img) =>
      bySlot.set(img.slot, { image_url: img.image_url, label: img.label }),
    );

    return Array.from({ length: 4 }, (_, index) => {
      const slot = index + 1;
      const managed = bySlot.get(slot);
      if (!managed) {
        return { src: null, label: null };
      }
      return { src: managed.image_url, label: managed.label };
    });
  }, [initialHeroImages]);

  const filledIndexes = useMemo(
    () => heroImages.map((item, index) => (item.src ? index : -1)).filter((index) => index >= 0),
    [heroImages]
  );

  useEffect(() => {
    if (paused || filledIndexes.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveStripe((current) => {
        const position = filledIndexes.indexOf(current);
        const next = filledIndexes[(position + 1) % filledIndexes.length] ?? filledIndexes[0];
        return next;
      });
    }, 4200);
    return () => window.clearInterval(timer);
  }, [filledIndexes, paused]);

  const highlighted = hoveredStripe ?? activeStripe;

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(165deg,hsl(var(--background))_0%,hsl(210_20%_96%)_48%,hsl(var(--background))_100%)] pt-20 md:pt-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 55% at 78% 42%, hsl(var(--primary) / 0.14), transparent 70%)",
        }}
      />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div
          className={
            "grid min-h-[calc(86vh-5rem)] grid-cols-1 content-start gap-y-10 gap-x-10 md:min-h-[calc(82vh-6rem)] " +
            "lg:min-h-[calc(90vh-6rem)] lg:grid-cols-2 lg:content-stretch lg:items-center lg:gap-x-12 lg:gap-y-0"
          }
        >
          <div className="relative flex w-full justify-center lg:justify-start">
            <div className="relative z-10 w-full max-w-xl">
              <div className="mb-6 flex items-center gap-4">
                <div className="h-px w-12 bg-primary" />
                <span className="apple-eyebrow text-primary">Engineering Grade Fabrication</span>
              </div>

              <h1 className="mb-6 text-5xl font-display font-semibold leading-[1.1] tracking-tight text-foreground md:text-7xl">
                Precision Stainless Steel <br className="hidden md:block" />
                For Kitchens That <span className="text-primary">Actually Last.</span>
              </h1>

              <p className="apple-section-copy mb-10 max-w-xl">
                Certified SS 304. Accurate gauges. Flawless Laser Welding. We build commercial kitchen
                equipment, hospital sterile prep stations, and industrial solutions designed to endure 15+
                years of severe use. No compromises.
              </p>

              <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-primary/25 bg-primary/10 px-3 py-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
                <span className="text-xs font-medium uppercase tracking-[0.06em] text-primary">
                  Quote Returned in 24 Hours
                </span>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="group bg-primary font-medium text-primary-foreground hover:bg-primary/90"
                  onClick={() => {
                    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Request a Quote
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="group border-foreground/20 font-medium text-foreground hover:bg-foreground/5"
                  onClick={() => {
                    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Upload Drawings
                </Button>
              </div>
            </div>
          </div>

          <div className="relative z-20 hidden min-h-0 w-full lg:flex lg:items-center lg:justify-end">
            <div
              className="flex h-[min(80vh,760px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[0_24px_60px_-28px_rgba(15,23,42,0.45)]"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => {
                setPaused(false);
                setHoveredStripe(null);
              }}
            >
              {heroImages.map((stripe, i) => {
                const active = highlighted === i;
                return (
                  <div
                    key={`hero-slot-${i + 1}`}
                    onMouseEnter={() => setHoveredStripe(i)}
                    className={`group relative overflow-hidden border-t border-white/10 first:border-t-0 transition-[flex] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      active ? "flex-[4.6]" : "flex-[0.85]"
                    }`}
                  >
                    {stripe.src ? (
                      <>
                        <CmsImage
                          src={stripe.src}
                          alt={stripe.label ?? `Hero image ${i + 1}`}
                          fill
                          sizes="(min-width: 1024px) 40vw, 1px"
                          priority={i === 0}
                          className={`object-cover object-center transition-transform duration-[1.4s] ease-out ${
                            active ? "scale-110" : "scale-100"
                          }`}
                        />
                        <div
                          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
                            active
                              ? "bg-gradient-to-t from-black/45 via-black/5 to-transparent opacity-100"
                              : "bg-gradient-to-t from-black/55 via-black/25 to-black/10 opacity-90"
                          }`}
                        />
                        {stripe.label ? (
                          <div
                            className={`absolute bottom-4 left-4 right-4 transition-all duration-500 ${
                              active
                                ? "translate-y-0 opacity-100"
                                : "translate-y-1 opacity-0"
                            }`}
                          >
                            <p className="text-sm font-medium tracking-wide text-white drop-shadow-sm">
                              {stripe.label}
                            </p>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted/40 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                        Empty hero image
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex w-full justify-center lg:hidden">
            <div className="w-full max-w-xl">
              <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 px-1 sm:mx-0 sm:px-0 md:gap-4">
                {heroImages.map((stripe, index) => (
                  <article
                    key={`hero-mobile-slot-${index + 1}`}
                    className="relative h-52 min-w-[82%] snap-start overflow-hidden rounded-xl border border-border/60 shadow-sm sm:h-56 sm:min-w-[68%] md:h-64 md:min-w-[50%]"
                  >
                    {stripe.src ? (
                      <>
                        <CmsImage
                          src={stripe.src}
                          alt={stripe.label ?? "Hero image"}
                          fill
                          sizes="(max-width: 1023px) 82vw, 1px"
                          priority={index === 0}
                          className="object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                        {stripe.label ? (
                          <div className="absolute bottom-3 left-3 right-3">
                            <p className="text-sm font-medium text-white drop-shadow-sm">{stripe.label}</p>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted/40 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                        Empty hero image
                      </div>
                    )}
                  </article>
                ))}
              </div>
              {filledIndexes.length > 1 ? (
                <div className="mt-3 flex justify-center gap-1.5">
                  {filledIndexes.map((index) => (
                    <button
                      key={`hero-dot-${index}`}
                      type="button"
                      aria-label={`Show hero image ${index + 1}`}
                      onClick={() => {
                        setActiveStripe(index);
                        setPaused(true);
                        window.setTimeout(() => setPaused(false), 6000);
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        activeStripe === index ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/35"
                      }`}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {arcPattern.map((arc, i) => (
          <div
            key={`nested-arc-${i}`}
            className={`absolute -bottom-10 -right-10 md:-bottom-12 md:-right-12 xl:-bottom-14 xl:-right-14 ${arc.size} rounded-tl-full border-l border-t ${arc.color}`}
          />
        ))}
      </div>
    </section>
  );
}
