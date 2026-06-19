"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { fetchProductCategories } from "@/features/admin/services/productCategories";
import type { ProductCategory } from "@/features/admin/types";

const defaultProducts = [
  {
    name: "Work Tables & Prep Stations",
    specs: "SS 304 | 1.2mm/1.5mm Top | #4 Satin",
    desc: "Heavy-duty tables with reinforced under-bracing, adjustable bullet feet, and optional splashbacks.",
    uses: "Commercial Kitchens, Bakeries, Labs"
  },
  {
    name: "Commercial Sink Units",
    specs: "SS 304 | 1.5mm Bowl | Fully Welded",
    desc: "Single, double, or triple compartment sinks. Deep-drawn or fully laser welded bowls with radiused corners.",
    uses: "Dishwashing Areas, Janitorial, Medical"
  },
  {
    name: "Exhaust Hoods & Ventilation",
    specs: "SS 304/430 | 1.0mm/1.2mm | Baffle Filters",
    desc: "Canopy and island hoods designed for maximum extraction efficiency, featuring grease cups and lighting.",
    uses: "Restaurant Cooklines, Industrial Kitchens"
  },
  {
    name: "Shelving & Storage Cabinets",
    specs: "SS 304 | 1.2mm Shelves | Adjustable",
    desc: "Wall-mounted shelves, multi-tier racks, and enclosed storage cabinets with sliding or hinged doors.",
    uses: "Dry Storage, Cold Rooms, Pharma"
  },
  {
    name: "Grease Traps & Interceptors",
    specs: "SS 304 | 2.0mm Heavy Gauge | Watertight",
    desc: "Under-sink or floor-mounted interceptors to prevent fat, oil, and grease from entering drainage systems.",
    uses: "Restaurants, Cafeterias, Food Processing"
  },
  {
    name: "Trolleys & Service Dispensers",
    specs: "SS 304 | 1.2mm Tubing | Heavy Duty Castors",
    desc: "Gastronorm pan trolleys, service carts, and heated/ambient dispensers built for rigorous transport.",
    uses: "Hotels, Hospitals, Banquet Halls"
  }
];

export function Products() {
  const [products, setProducts] = useState(defaultProducts);

  useEffect(() => {
    let isMounted = true;
    fetchProductCategories()
      .then((rows) => {
        if (!isMounted || rows.length === 0) return;
        const mapped = rows.map((row: ProductCategory) => ({
          name: row.title,
          specs: row.specs,
          desc: row.description,
          uses: row.uses,
        }));
        setProducts(mapped);
      })
      .catch(() => {
        // Keep default products when DB is not ready.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="products" className="layer-0 py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-16">
          <h2 className="apple-section-title mb-6 section-title-accent">
            Engineered Products.
          </h2>
          <p className="apple-section-copy max-w-2xl">
            We don't build generic equipment. Every item is fabricated to exact specifications, ensuring hygiene, durability, and operational flow.
          </p>
        </div>

        <SectionReveal className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, i) => (
            <div
              key={i}
              className="group layer-1 p-6 rounded-xl hover:border-primary/40 transition-colors"
            >
              <div className="mb-6 pb-6 border-b border-border">
                <h3 className="text-xl font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <div className="inline-block rounded-md border border-primary/25 bg-primary/10 px-2 py-1 text-xs font-mono text-primary">
                  {product.specs}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
                {product.desc}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-medium text-foreground">
                  {product.uses}
                </span>
                <ChevronRight className="w-5 h-5 text-primary opacity-0 md:group-hover:opacity-100 md:group-hover:translate-x-0 -translate-x-2 transition-[opacity,transform] duration-300" />
              </div>
            </div>
          ))}
        </SectionReveal>
      </div>
    </section>
  );
}
