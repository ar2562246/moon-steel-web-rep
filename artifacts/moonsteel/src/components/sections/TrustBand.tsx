"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { CmsImage } from "@/components/ui/CmsImage";
import type { CustomerLogo } from "@/features/admin/types";

type TrustBandProps = {
  initialLogos?: CustomerLogo[];
  initialSliderSpeed?: number;
};

export function TrustBand({ initialLogos = [], initialSliderSpeed = 52 }: TrustBandProps) {
  const [logos] = useState<CustomerLogo[]>(initialLogos);
  const [sliderSpeed] = useState(initialSliderSpeed);
  const [imagesLoaded, setImagesLoaded] = useState(initialLogos.length === 0);

  useEffect(() => {
    if (logos.length === 0) {
      setImagesLoaded(false);
      return;
    }

    let cancelled = false;
    const urls = [...new Set(logos.map((l) => l.image_url).filter(Boolean))];

    Promise.all(
      urls.map(
        (url) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = url;
          }),
      ),
    ).then(() => {
      if (!cancelled) setImagesLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [logos]);

  const hasLogos = logos.length > 0;
  const marqueeLogos = useMemo(() => {
    if (logos.length === 0) return [];

    const minItemsPerSet = 6;
    const repeatCount = Math.max(2, Math.ceil(minItemsPerSet / logos.length));
    const baseSet = Array.from({ length: repeatCount }).flatMap((_, repeatIdx) =>
      logos.map((logo) => ({
        logo,
        key: `${logo.id}-set-${repeatIdx}`,
      })),
    );

    return [...baseSet, ...baseSet].map((item, idx) => ({
      ...item,
      loopKey: `${item.key}-loop-${idx}`,
    }));
  }, [logos]);

  return (
    <section className="py-16 bg-background border-b border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 border-b border-border/50 pb-16">
          <div className="flex flex-col items-center justify-start min-h-[88px] text-center">
            <p className="text-5xl md:text-6xl font-display font-semibold text-foreground leading-none">50+</p>
            <p className="text-sm font-medium text-muted-foreground mt-3">Years Experience</p>
          </div>
          <div className="flex flex-col items-center justify-start min-h-[88px] text-center">
            <p className="text-5xl md:text-6xl font-display font-semibold text-foreground leading-none">850+</p>
            <p className="text-sm font-medium text-muted-foreground mt-3">Projects Delivered</p>
          </div>
          <div className="flex flex-col items-center justify-start min-h-[88px] text-center">
            <p className="text-5xl md:text-6xl font-display font-semibold text-foreground leading-none">100%</p>
            <p className="text-sm font-medium text-muted-foreground mt-3">Certified SS 304</p>
          </div>
          <div className="flex flex-col items-center justify-start min-h-[88px] text-center">
            <p className="text-5xl md:text-6xl font-display font-semibold text-primary leading-none">0</p>
            <p className="text-sm font-medium text-muted-foreground mt-3">Compromises</p>
          </div>
        </div>

        <div className="text-center mb-10">
          <p className="apple-eyebrow">Trusted by Industry Leaders</p>
        </div>

        {hasLogos && imagesLoaded ? (
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div
              className="clients-carousel-track"
              style={
                {
                  "--clients-marquee-duration": `${sliderSpeed}s`,
                } as CSSProperties
              }
            >
              {marqueeLogos.map(({ logo, loopKey }) => (
                <a
                  key={loopKey}
                  href={logo.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="clients-carousel-item flex items-center justify-center"
                  aria-label="View customer logo"
                >
                  <CmsImage
                    src={logo.image_url}
                    alt="Customer logo"
                    width={160}
                    height={44}
                    sizes="160px"
                    loading="eager"
                    className="max-h-10 w-auto max-w-full object-contain sm:max-h-[44px]"
                  />
                </a>
              ))}
            </div>
          </div>
        ) : hasLogos ? (
          <div
            className="h-[60px] sm:h-20 w-full rounded-xl border border-border/50 bg-muted/30"
            aria-hidden
          />
        ) : null}
      </div>
    </section>
  );
}
