"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { CmsImage } from "@/components/ui/CmsImage";
import type { CustomerLogo } from "@/features/admin/types";
import { logoAltFromUrl } from "@/lib/logo-alt";

const stats = [
  { value: "50+", label: "Years fabricating steel" },
  { value: "850+", label: "Projects Delivered" },
  { value: "304 / 316", label: "Guaranteed" },
  { value: "Karachi", label: "Korangi Industrial Area" },
] as const;

type TrustBandProps = {
  initialLogos?: CustomerLogo[];
  initialSliderSpeed?: number;
};

export function TrustBand({ initialLogos = [], initialSliderSpeed = 52 }: TrustBandProps) {
  const [logos] = useState<CustomerLogo[]>(initialLogos);
  const [sliderSpeed] = useState(initialSliderSpeed);

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
        <div className="mb-16 grid grid-cols-2 gap-x-4 gap-y-10 border-b border-border/50 pb-16 md:grid-cols-4 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.value} className="flex flex-col items-center text-center">
              <p className="whitespace-nowrap font-display text-[clamp(1.85rem,5vw,3.75rem)] font-semibold leading-none tracking-tight text-foreground">
                {stat.value}
              </p>
              <p className="mt-3 max-w-[11rem] text-sm font-medium leading-snug text-muted-foreground md:max-w-none">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mb-10">
          <p className="apple-eyebrow">Trusted by Industry Leaders</p>
        </div>

        {hasLogos ? (
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
                <div key={loopKey} className="clients-carousel-item">
                  <CmsImage
                    src={logo.image_url}
                    alt={logoAltFromUrl(logo.image_url)}
                    width={176}
                    height={52}
                    sizes="176px"
                    loading="lazy"
                    className="max-h-12 w-auto max-w-full object-contain sm:max-h-[52px]"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
