export type BuildingType =
  | "restaurant"
  | "hotel"
  | "bakery"
  | "hospital"
  | "laboratory"
  | "food-factory"
  | "outdoor"
  | "coastal";

export type WizardLocation = "indoor" | "coastal" | "chemical" | "food-factory";
export type WizardFood = "yes" | "no";
export type WizardBudget = "economy" | "standard" | "premium";
export type EquipmentType = "sink" | "table" | "shelf" | "hood" | "cabinet" | "custom";
export type CalcEnvironment = "restaurant" | "hotel" | "hospital" | "lab" | "industrial";

export const buildingOptions: Array<{ id: BuildingType; label: string }> = [
  { id: "restaurant", label: "Restaurant" },
  { id: "hotel", label: "Hotel" },
  { id: "bakery", label: "Bakery" },
  { id: "hospital", label: "Hospital" },
  { id: "laboratory", label: "Laboratory" },
  { id: "food-factory", label: "Food Factory" },
  { id: "outdoor", label: "Outdoor Kitchen" },
  { id: "coastal", label: "Coastal Restaurant" },
];

export function recommendForBuilding(type: BuildingType) {
  if (type === "coastal" || type === "outdoor") {
    return {
      grade: "AISI 316",
      reasons: [
        "Superior chloride and salt-air resistance",
        "Food safe for commercial prep",
        "Best durability in marine / outdoor conditions",
      ],
    };
  }
  if (type === "hospital" || type === "laboratory") {
    return {
      grade: "AISI 316 or 316L",
      reasons: [
        "Handles aggressive cleaning chemicals",
        "Food / sterile-process suitable",
        "Low-carbon 316L when heavy welding is required",
      ],
    };
  }
  if (type === "food-factory") {
    return {
      grade: "AISI 304 or 304L",
      reasons: [
        "Food-safe commercial standard",
        "304L for large welded assemblies",
        "Excellent value for plant equipment",
      ],
    };
  }
  return {
    grade: "AISI 304",
    reasons: [
      "Excellent corrosion resistance",
      "Food safe",
      "Best value for daily commercial kitchens",
    ],
  };
}

export function recommendFromWizard(
  location: WizardLocation,
  food: WizardFood,
  budget: WizardBudget,
) {
  if (food === "no" && budget === "economy") {
    return {
      grade: "AISI 430",
      reasons: ["Cost-effective for non-food panels", "Good heat resistance", "Decorative / structural use"],
    };
  }
  if (location === "coastal" || location === "chemical") {
    return {
      grade: budget === "premium" ? "AISI 316L" : "AISI 316",
      reasons: [
        "Superior chloride / chemical resistance",
        "Food safe when finished correctly",
        budget === "premium" ? "316L for maximum post-weld corrosion resistance" : "Premium performance for harsh sites",
      ],
    };
  }
  if (location === "food-factory" && budget !== "economy") {
    return {
      grade: "AISI 304L",
      reasons: ["Excellent for large welded assemblies", "Food safe", "Reduced weld corrosion risk"],
    };
  }
  return {
    grade: "AISI 304",
    reasons: ["Industry standard for commercial kitchens", "Food safe", "Best balance of performance and cost"],
  };
}

export function recommendFromCalculator(
  equipment: EquipmentType,
  environment: CalcEnvironment,
  nearSea: boolean,
) {
  const grade =
    nearSea || environment === "lab" || environment === "hospital"
      ? "AISI 316"
      : "AISI 304";

  const thicknessByEquipment: Record<EquipmentType, string> = {
    sink: "1.2 – 1.5 mm",
    table: "1.2 – 1.5 mm",
    shelf: "0.8 – 1.0 mm",
    hood: "1.0 – 1.2 mm",
    cabinet: "1.0 – 1.2 mm",
    custom: "1.2 – 3.0 mm",
  };

  return {
    grade,
    thickness: thicknessByEquipment[equipment],
    finish: "No.4 Satin",
  };
}

export const quickGrades = [
  {
    grade: "304",
    label: "Recommended",
    bestFor: "Restaurants",
    corrosion: 5,
    foodSafe: "Yes",
    highlight: true,
  },
  {
    grade: "316",
    label: "Premium",
    bestFor: "Coastal & Chemicals",
    corrosion: 6,
    foodSafe: "Yes",
    highlight: false,
  },
  {
    grade: "430",
    label: "Decorative",
    bestFor: "Panels & covers",
    corrosion: 3,
    foodSafe: "Limited",
    highlight: false,
  },
] as const;

export const gradeCards = [
  {
    grade: "304",
    rating: 5,
    badge: "Best Choice",
    checks: [
      "Food Safe",
      "Easy to Clean",
      "Excellent Corrosion Resistance",
      "Commercial Kitchens",
    ],
    uses: ["Sinks", "Tables", "Shelves", "Hoods"],
  },
  {
    grade: "316",
    rating: 6,
    badge: "Premium",
    checks: ["Marine", "Salt Water", "Chemicals", "Hospitals"],
    uses: ["Coastal kitchens", "Labs", "Seafood", "Pharma"],
  },
] as const;

export const comparisonMatrix = [
  {
    property: "Food Safe",
    values: { "201": "Caution", "202": "Caution", "304": "Yes", "316": "Yes", "430": "Limited" },
  },
  {
    property: "Corrosion",
    values: { "201": "★★", "202": "★★", "304": "★★★★★", "316": "★★★★★★", "430": "★★★" },
  },
  {
    property: "Weldability",
    values: { "201": "Good", "202": "Good", "304": "Excellent", "316": "Excellent", "430": "Fair" },
  },
  {
    property: "Kitchen Use",
    values: { "201": "No", "202": "No", "304": "Yes", "316": "Yes", "430": "Limited" },
  },
  {
    property: "Marine",
    values: { "201": "No", "202": "No", "304": "Good", "316": "Excellent", "430": "No" },
  },
  {
    property: "Cost",
    values: { "201": "$", "202": "$", "304": "$$", "316": "$$$", "430": "$" },
  },
] as const;

export const thicknessGuide = [
  { mm: "0.8 mm", use: "Light shelves" },
  { mm: "1.0 mm", use: "Cabinets" },
  { mm: "1.2 mm", use: "Tables" },
  { mm: "1.5 mm", use: "Heavy-duty tables" },
  { mm: "2.0 mm", use: "Industrial equipment" },
  { mm: "3.0 mm", use: "Custom fabrication" },
] as const;

export const finishes = [
  {
    name: "No.4 Satin",
    use: "Most commercial kitchens",
    visual: "brushed",
    image: "/images/finishes/hairline.jpg",
    credit: "Wikimedia Commons — Brushed aluminium",
  },
  {
    name: "Mirror",
    use: "Decorative",
    visual: "mirror",
    image: "/images/finishes/mirror.jpg",
    credit: "Flickr / mckaysavage — Chennai stainless (CC BY 2.0)",
  },
  {
    name: "Hairline",
    use: "Architectural",
    visual: "hairline",
    image: "/images/finishes/no4-satin.jpg",
    credit: "Wikimedia Commons — Brushed metal (public domain)",
  },
  {
    name: "2B",
    use: "Industrial",
    visual: "industrial",
    image: "/images/finishes/mill-2b.jpg",
    credit: "Wikimedia Commons — 316L unpolished",
  },
] as const;

export const chemistry = [
  { grade: "304", chromium: "18–20%", nickel: "8–10.5%", molybdenum: "—" },
  { grade: "316", chromium: "16–18%", nickel: "10–14%", molybdenum: "2–3%" },
  { grade: "430", chromium: "16–18%", nickel: "—", molybdenum: "—" },
] as const;

export const verifyMethods = [
  {
    title: "Mill Certificates",
    level: "Documentation",
    body: "Ask for mill test certificates (MTC) with the coil or sheet heat number. This is the first line of traceability for grade, chemistry, and thickness.",
  },
  {
    title: "Material Testing Gun (XRF / PMI)",
    level: "On-site",
    body: "A handheld XRF (X-ray fluorescence) or PMI gun reads chromium, nickel, molybdenum, and other elements on the spot — useful for confirming 304 vs 316 vs 200-series without cutting a sample.",
  },
  {
    title: "Laboratory Chemical Analysis",
    level: "Lab",
    body: "For disputed material or critical projects, send a sample to a materials lab for wet chemistry or OES analysis. Lab results are the most authoritative grade confirmation.",
  },
  {
    title: "Magnet Test (Limited)",
    level: "Quick check only",
    body: "A magnet can hint at ferritic grades like 430, but cold-worked 304 can also show slight magnetism. Never use a magnet alone to accept or reject stainless.",
  },
] as const;

export const corrosionMatrix = [
  { env: "Fresh Water", "304": "Yes", "316": "Yes" },
  { env: "Salt Water", "304": "Caution", "316": "Yes" },
  { env: "Chlorine", "304": "Caution", "316": "Yes" },
  { env: "Acidic Food", "304": "Yes", "316": "Yes" },
  { env: "Outdoor", "304": "Good", "316": "Excellent" },
] as const;

export const whyMoonSteel = [
  "Certified AISI 304",
  "TIG Welded",
  "Mill Certificates",
  "Custom Thickness",
  "Food Grade Finishes",
  "Made in Pakistan",
  "Hotel & Restaurant Specialists",
  "Custom Fabrication",
] as const;

export const faqs = [
  {
    q: "Is 304 stainless steel food grade?",
    a: "Yes. Properly finished AISI 304 is widely used for food preparation equipment, restaurant kitchens, and food processing facilities.",
  },
  {
    q: "Is 316 worth the extra cost?",
    a: "For coastal sites, seafood processing, labs, and aggressive chemical cleaning — yes. For typical indoor restaurants and hotels, AISI 304 is usually the better value.",
  },
  {
    q: "Can 430 stainless steel rust?",
    a: "It can corrode faster than 304 in wet or acidic kitchens. Use 430 for decorative panels and non-food structural parts, not primary food-contact surfaces.",
  },
  {
    q: "Which stainless steel is magnetic?",
    a: "Ferritic grades like 430 are magnetic. Austenitic 304 and 316 are typically non-magnetic when annealed, though cold working can add slight magnetism.",
  },
  {
    q: "What stainless steel do restaurants use?",
    a: "Most commercial kitchens specify AISI 304 for sinks, tables, shelves, cabinets, and hoods.",
  },
  {
    q: "Is 201 stainless steel safe for kitchens?",
    a: "201 is an economy grade with lower corrosion resistance. Moon Steel does not recommend it for commercial food preparation equipment.",
  },
  {
    q: "Which grade lasts longest?",
    a: "In harsh chloride or chemical environments, 316/316L lasts longest. In typical indoor kitchens, certified 304 delivers excellent long service life.",
  },
  {
    q: "Does thickness matter more than grade?",
    a: "Both matter. Grade drives corrosion and hygiene performance; thickness drives strength and dent resistance. Specify both on every quote.",
  },
  {
    q: "What finish is easiest to clean?",
    a: "No.4 satin is the commercial kitchen standard — easy to clean while hiding light wear better than mirror finishes.",
  },
  {
    q: "How do I verify genuine 304 stainless steel?",
    a: "Request mill certificates, confirm grade and thickness in writing, and verify chemistry with a handheld XRF/PMI material testing gun or laboratory analysis. Do not rely on a magnet test alone.",
  },
  {
    q: "What is a material testing gun for stainless steel?",
    a: "A handheld XRF or PMI analyzer measures the elemental composition of the metal on site — typically chromium, nickel, and molybdenum — so you can distinguish grades such as 304, 316, and lower-nickel 200-series alloys.",
  },
  {
    q: "Should I get a lab test for stainless steel grade?",
    a: "Yes for critical jobs, disputed material, or when certificates are missing. A materials laboratory can run chemical analysis (OES or wet chemistry) and report the actual grade with higher confidence than field checks alone.",
  },
  {
    q: "Is 304 suitable for outdoor kitchens?",
    a: "It can work inland. Near the sea or in salt spray, specify AISI 316 for better long-term performance.",
  },
  {
    q: "Can I use 316 indoors?",
    a: "Yes. 316 is excellent indoors when you need extra resistance to chlorides or harsh cleaners.",
  },
  {
    q: "What is the difference between 304 and 304L?",
    a: "304L is a low-carbon version of 304 designed for extensive welding, reducing the risk of weld corrosion in large assemblies.",
  },
  {
    q: "What is the difference between 316 and 316L?",
    a: "316L is low-carbon 316 for maximum corrosion resistance after heavy welding — common in medical, pharma, and sterile process work.",
  },
  {
    q: "What thickness should I use for commercial work tables?",
    a: "Most commercial tables use 1.2 mm tops; heavy-duty stations often move to 1.5 mm depending on span and load.",
  },
  {
    q: "Do you provide mill certificates?",
    a: "Yes. Moon Steel can provide mill certificates on request so the grade used on your project is traceable.",
  },
  {
    q: "What welding process do you use?",
    a: "We fabricate with TIG welding for clean, strong, hygienic joints suited to commercial food-service equipment.",
  },
  {
    q: "Can Moon Steel fabricate custom thicknesses?",
    a: "Yes. Typical sheet ranges from about 0.8 mm to 3.0 mm depending on the application and drawing package.",
  },
  {
    q: "Is SS 200 series the same as 304?",
    a: "No. 200-series grades replace nickel with manganese/nitrogen to cut cost and generally perform worse in wet commercial kitchens.",
  },
  {
    q: "How do I get a material recommendation for my project?",
    a: "Use the selectors on this page, or send drawings and environment notes via our quote form — we will specify grade, thickness, and finish in writing.",
  },
] as const;

export const quickSpecs: Array<[string, string]> = [
  ["Standard Material", "AISI 304 Stainless Steel"],
  ["Optional Grades", "AISI 304L, 316, 316L, 430, Others on Request"],
  ["Surface Finish", "#4 Satin (Brushed)"],
  ["Available Finishes", "No.4, BA, Mirror, Hairline, 2B"],
  ["Typical Thickness", "0.8 mm – 3.0 mm (project dependent)"],
  ["Welding", "TIG Welding"],
  ["Certification", "Mill Certificates Available"],
  ["Food Contact", "Suitable for Commercial Food Service"],
];
