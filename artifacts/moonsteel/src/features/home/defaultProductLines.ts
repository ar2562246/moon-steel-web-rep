import type { ProductCategory } from "@/features/admin/types";

export const defaultProductLines: ProductCategory[] = [
  {
    id: "default-work-tables",
    title: "Work Tables & Prep Stations",
    specs: "SS 304 | 1.2mm/1.5mm Top | #4 Satin",
    description:
      "Heavy-duty tables with reinforced under-bracing, adjustable bullet feet, and optional splashbacks.",
    uses: "Commercial Kitchens, Bakeries, Labs",
    sort_order: 10,
    created_at: "",
  },
  {
    id: "default-sinks",
    title: "Commercial Sink Units",
    specs: "SS 304 | 1.5mm Bowl | Fully Welded",
    description:
      "Single, double, or triple compartment sinks. Deep-drawn or fully laser welded bowls with radiused corners.",
    uses: "Dishwashing Areas, Janitorial, Medical",
    sort_order: 20,
    created_at: "",
  },
  {
    id: "default-hoods",
    title: "Exhaust Hoods & Ventilation",
    specs: "SS 304/430 | 1.0mm/1.2mm | Baffle Filters",
    description:
      "Canopy and island hoods designed for maximum extraction efficiency, featuring grease cups and lighting.",
    uses: "Restaurant Cooklines, Industrial Kitchens",
    sort_order: 30,
    created_at: "",
  },
  {
    id: "default-shelving",
    title: "Shelving & Storage Cabinets",
    specs: "SS 304 | 1.2mm Shelves | Adjustable",
    description:
      "Wall-mounted shelves, multi-tier racks, and enclosed storage cabinets with sliding or hinged doors.",
    uses: "Dry Storage, Cold Rooms, Pharma",
    sort_order: 40,
    created_at: "",
  },
  {
    id: "default-grease-traps",
    title: "Grease Traps & Interceptors",
    specs: "SS 304 | 2.0mm Heavy Gauge | Watertight",
    description:
      "Under-sink or floor-mounted interceptors to prevent fat, oil, and grease from entering drainage systems.",
    uses: "Restaurants, Cafeterias, Food Processing",
    sort_order: 50,
    created_at: "",
  },
  {
    id: "default-trolleys",
    title: "Trolleys & Service Dispensers",
    specs: "SS 304 | 1.2mm Tubing | Heavy Duty Castors",
    description:
      "Gastronorm pan trolleys, service carts, and heated/ambient dispensers built for rigorous transport.",
    uses: "Hotels, Hospitals, Banquet Halls",
    sort_order: 60,
    created_at: "",
  },
];
