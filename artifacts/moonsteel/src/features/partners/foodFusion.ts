/**
 * Moon Steel × Food Fusion collaboration content.
 *
 * Product images live in `public/images/partners/food-fusion/` and all buy links
 * point at Fusion Home — Moon Steel fabricates these items but does not retail them.
 */

export type CollabProduct = {
  slug: string;
  name: string;
  blurb: string;
  image: string;
  url: string;
  /** True where Fusion Home's own product copy names Moon Steel. */
  creditsMoonSteel: boolean;
};

export const FOOD_FUSION_STORE_URL = "https://www.fusionhomepk.com";
export const FOOD_FUSION_BRAND_URL = "https://foodfusion.com";

export const foodFusionProducts: CollabProduct[] = [
  {
    slug: "connect-loop-trivet",
    name: "Connect Loop Trivet",
    blurb:
      "Laser-cut from a single piece of 2mm stainless steel, with an interconnected loop pattern that spreads heat away from the table.",
    image: "/images/partners/food-fusion/connect-loop-trivet.jpg",
    url: "https://www.fusionhomepk.com/products/connect-loop-trivets-for-hot-dishes-food-fusion",
    creditsMoonSteel: true,
  },
  {
    slug: "portable-bbq-grill",
    name: "Portable BBQ Grill",
    blurb:
      "3mm stainless steel body with a skewer-locking design that holds twelve skewers at any angle, then folds flat using two nuts.",
    image: "/images/partners/food-fusion/portable-bbq-grill.jpg",
    url: "https://www.fusionhomepk.com/products/portable-food-fusion-bbq-grill",
    creditsMoonSteel: true,
  },
  {
    slug: "kulfi-molds",
    name: "Kulfi Mould Stand",
    blurb:
      "The freezer stand that holds the moulds steady — laser-cut and bent to millimetric tolerances at our manufacturing facility.",
    image: "/images/partners/food-fusion/kulfi-molds.jpg",
    url: "https://www.fusionhomepk.com/products/kulfi-molds-6-pcs-with-lids-and-stainless-steel-stand",
    creditsMoonSteel: true,
  },
  {
    slug: "bbq-skewers-kit",
    name: "BBQ Skewer Kit",
    blurb:
      "Hand-finished flat and square skewers in high-grade stainless steel, with brass rivets and hardwood handles.",
    image: "/images/partners/food-fusion/bbq-skewers-kit.jpg",
    url: "https://www.fusionhomepk.com/products/stainless-steel-bbq-skewers-with-stylish-wooden-handel-food-fusion-branded",
    creditsMoonSteel: false,
  },
  {
    slug: "fish-spatula",
    name: "Fish Spatula",
    blurb:
      "Laser-cut stainless blade angled to slide under fish and eggs without tearing, riveted to a shaped wooden handle.",
    image: "/images/partners/food-fusion/fish-spatula.jpg",
    url: "https://www.fusionhomepk.com/products/fish-spatula-multi-purpose-spatula-stainless-steel-with-wooden-handle",
    creditsMoonSteel: false,
  },
  {
    slug: "potato-masher",
    name: "Potato Masher",
    blurb:
      "A Reuleaux-triangle head in 304 stainless steel, shaped to reach the corners of both round and square pots.",
    image: "/images/partners/food-fusion/potato-masher.jpg",
    url: "https://www.fusionhomepk.com/products/potato-masher",
    creditsMoonSteel: false,
  },
];

export const foodFusionContributions = [
  {
    title: "Laser cutting",
    body: "Flat patterns cut to the design team's drawings, clean enough that the cut edge is part of the finished look.",
  },
  {
    title: "Precision bending",
    body: "Millimetric bends and forming so parts land square and stack repeatably across a production run.",
  },
  {
    title: "Material selection",
    body: "Food-safe stainless grades matched to the job — 304 for utensils, heavier 430 where high-heat strength matters.",
  },
  {
    title: "Production fabrication",
    body: "Welding, finishing, and assembly at volume in our Korangi manufacturing facility, to the same tolerances as our commercial work.",
  },
];
