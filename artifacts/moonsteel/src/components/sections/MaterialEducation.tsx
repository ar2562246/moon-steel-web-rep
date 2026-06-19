"use client";

import { SectionReveal } from "@/components/motion/SectionReveal";

export function MaterialEducation() {
  return (
    <section className="layer-1 py-20 border-y border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-display font-semibold text-foreground mb-4">
              Material Specification: SS 304 vs SS 200
            </h2>
            <p className="text-muted-foreground">
              Understanding why true commercial environments demand 300-series stainless steel.
            </p>
          </div>

          <SectionReveal className="grid md:grid-cols-2 gap-8">
            <div className="layer-2 p-6 rounded-xl shadow-sm">
              <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-primary rounded-full"></span>
                SS 304 (Moon Steel Standard)
              </h3>
              <ul className="space-y-4 text-sm">
                <li className="flex flex-col gap-1">
                  <span className="font-semibold text-foreground">Composition: 18/8</span>
                  <span className="text-muted-foreground">18% Chromium, 8% Nickel. High nickel content prevents rust.</span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="font-semibold text-foreground">Magnetism: Non-Magnetic</span>
                  <span className="text-muted-foreground">Austenitic crystalline structure. Will not hold a magnet.</span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="font-semibold text-foreground">Corrosion Resistance: Superior</span>
                  <span className="text-muted-foreground">Impervious to food acids, cleaning chemicals, and high humidity.</span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="font-semibold text-foreground">Hygiene: Food Safe</span>
                  <span className="text-muted-foreground">Non-porous surface. Approved for direct food contact and sterile medical use.</span>
                </li>
              </ul>
            </div>

            <div className="layer-2 p-6 rounded-xl shadow-sm">
              <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-destructive rounded-full"></span>
                SS 200 Series (Common Alternative)
              </h3>
              <ul className="space-y-4 text-sm">
                <li className="flex flex-col gap-1">
                  <span className="font-semibold text-foreground">Composition: Negligible Nickel</span>
                  <span className="text-muted-foreground">Nickel is replaced by manganese/nitrogen to cut costs.</span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="font-semibold text-foreground">Magnetism: Magnetic</span>
                  <span className="text-muted-foreground">Often holds a magnet due to different internal structure.</span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="font-semibold text-foreground">Corrosion Resistance: Poor</span>
                  <span className="text-muted-foreground">Prone to pitting, rust, and discoloration in wet or acidic environments.</span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="font-semibold text-foreground">Hygiene: High Risk</span>
                  <span className="text-muted-foreground">Rust harbors bacteria. Will fail strict international health audits.</span>
                </li>
              </ul>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
