"use client";

import { Quote } from "lucide-react";
import { SectionReveal } from "@/components/motion/SectionReveal";
import type { Testimonial } from "@/features/testimonials/types";

type TestimonialsProps = {
  initialTestimonials: Testimonial[];
};

export function Testimonials({ initialTestimonials }: TestimonialsProps) {
  if (initialTestimonials.length === 0) return null;

  return (
    <section id="testimonials" className="layer-0 py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="apple-section-title mb-6 section-title-accent">What Clients Say.</h2>
          <p className="apple-section-copy">
            Fabrication quality and reliability matter when equipment runs under daily pressure.
          </p>
        </div>

        <SectionReveal className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {initialTestimonials.map((item) => (
            <figure key={item.id} className="layer-1 flex h-full flex-col rounded-xl p-6">
              <Quote className="mb-4 h-5 w-5 text-primary" aria-hidden />
              <blockquote className="flex-1 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-4">
                <p className="text-sm font-semibold text-foreground">{item.author_name}</p>
                <p className="text-xs text-muted-foreground">
                  {[item.author_role, item.company].filter(Boolean).join(" · ")}
                </p>
              </figcaption>
            </figure>
          ))}
        </SectionReveal>
      </div>
    </section>
  );
}
