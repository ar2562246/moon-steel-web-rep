export type GreaseTrapClass = "small" | "medium" | "large";

export type GreaseTrapProduct = {
  id: GreaseTrapClass;
  code: string;
  name: string;
  slug: string;
  size: string;
  gpm: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  grossGal: number;
  grossLitres: number;
  material: string;
  inlet: string;
  outlet: string;
  inletIn: number;
  outletIn: number;
  internals?: string;
  greaseHolding?: string;
  application: string;
  positioning: string;
  uses: string[];
};

export const greaseTrapProducts: GreaseTrapProduct[] = [
  {
    id: "small",
    code: "GT-17",
    name: "Grease Trap Small 17 GPM",
    slug: "grease-trap-grease-interceptor",
    size: "22″ × 15″ × 12″",
    gpm: 17,
    lengthIn: 22,
    widthIn: 15,
    heightIn: 12,
    grossGal: 17.1,
    grossLitres: 65,
    material: "1.50mm AISI 304",
    inlet: "1″",
    outlet: "2″",
    inletIn: 1,
    outletIn: 2,
    internals: "1× bucket, 1× baffle",
    greaseHolding: "9.5 kg",
    application: "Cafés and light-duty sinks",
    positioning: "Compact",
    uses: ["Café", "Small restaurant", "Light food preparation", "Limited sink discharge"],
  },
  {
    id: "medium",
    code: "GT-34",
    name: "Grease Trap Medium 34 GPM",
    slug: "stainless-steel-grease-trap-33-gpm",
    size: "24″ × 18″ × 18″",
    gpm: 34,
    lengthIn: 24,
    widthIn: 18,
    heightIn: 18,
    grossGal: 33.7,
    grossLitres: 128,
    material: "1.50mm AISI 304",
    inlet: "3″",
    outlet: "3″",
    inletIn: 3,
    outletIn: 3,
    internals: "Removable baffles",
    application: "Restaurants and moderate commercial kitchens",
    positioning: "Commercial",
    uses: ["Restaurant", "Bakery", "Commercial kitchen", "Moderate food preparation"],
  },
  {
    id: "large",
    code: "GI-120",
    name: "Grease Trap Large 120 GPM",
    slug: "grease-trap-large",
    size: "48″ × 24″ × 24″",
    gpm: 120,
    lengthIn: 48,
    widthIn: 24,
    heightIn: 24,
    grossGal: 119.7,
    grossLitres: 453,
    material: "1.50mm AISI 304",
    inlet: "4″",
    outlet: "4″",
    inletIn: 4,
    outletIn: 4,
    application: "Hotels, catering, and high-volume kitchens",
    positioning: "Large commercial",
    uses: ["Hotel", "Large restaurant", "Catering kitchen", "Institutional kitchen", "Central kitchen"],
  },
];

export type GreaseTrapCatalogImage = {
  name: string;
  image_url: string;
  image_urls?: string[];
};

export function pickGreaseTrapCatalogImages(
  products: Array<{ slug: string; name: string; image_url: string; image_urls?: string[] }>,
): Record<string, GreaseTrapCatalogImage> {
  const slugs = new Set(greaseTrapProducts.map((item) => item.slug));
  return Object.fromEntries(
    products
      .filter((product) => slugs.has(product.slug))
      .map((product) => [
        product.slug,
        {
          name: product.name,
          image_url: product.image_url,
          image_urls: product.image_urls,
        },
      ]),
  );
}

export const howItWorks = [
  {
    step: "01",
    title: "Wastewater enters",
    body: "Kitchen wastewater enters through the inlet, carrying fats, oils, grease, and food solids.",
  },
  {
    step: "02",
    title: "Flow is slowed",
    body: "The inlet and baffle arrangement reduces a straight path across the tank so the flow can settle.",
  },
  {
    step: "03",
    title: "Separation occurs",
    body: "Fats, oils, and grease rise. Heavier solids settle. Relatively clearer water moves toward the outlet.",
  },
  {
    step: "04",
    title: "Water exits",
    body: "The outlet arrangement helps retain the floating grease layer and settled solids inside the unit.",
  },
] as const;

export const features = [
  {
    title: "AISI 304 stainless steel",
    body: "1.50 mm nominal body thickness for corrosion resistance in commercial kitchen drainage.",
  },
  {
    title: "TIG welded construction",
    body: "Fully welded, leak-resistant tanks with smooth internal surfaces for easier cleaning.",
  },
  {
    title: "Inlet and outlet baffles",
    body: "Internal baffling slows flow so grease can rise and solids can settle before water exits.",
  },
  {
    title: "Removable cover",
    body: "Access for removing floating grease, settled solids, and internal components.",
  },
  {
    title: "Defined connections",
    body: "Small 1″ / 2″, Medium 3″ / 3″, Large 4″ / 4″ inlet and outlet. Custom sizes on request.",
  },
  {
    title: "Easy-clean internals",
    body: "Serviceable baffles and a clear grease/solids layout rather than sealed compartments.",
  },
  {
    title: "Three standard sizes",
    body: "17 GPM, 34 GPM, and 120 GPM, plus custom fabrication for other flows and layouts.",
  },
  {
    title: "Made in Karachi",
    body: "Fabricated by Moon Steel for restaurants, hotels, and institutional kitchens in Pakistan.",
  },
] as const;

export const constructionLabels = [
  { n: "1", title: "Inlet", body: "Incoming wastewater from connected kitchen fixtures." },
  { n: "2", title: "Inlet baffle", body: "Reduces direct flow and turbulence at the surface." },
  { n: "3", title: "Grease separation zone", body: "Quieter volume where FOG can rise." },
  { n: "4", title: "Solids collection zone", body: "Heavier material settles toward the bottom." },
  { n: "5", title: "Outlet baffle", body: "Helps keep floating grease from leaving with the effluent." },
  { n: "6", title: "Outlet", body: "Discharges separated wastewater downstream." },
] as const;

export const specRows: Array<[string, string]> = [
  ["Material", "AISI 304 stainless steel"],
  ["Body thickness", "1.50 mm nominal"],
  ["Internal baffles", "AISI 304"],
  ["Welding", "TIG welded, leak-resistant"],
  ["Cover", "Removable"],
  ["Nominal flow", "Small 17 GPM · Medium 34 GPM · Large 120 GPM"],
  ["Inlet / outlet", "Small 1″ / 2″ · Medium 3″ / 3″ · Large 4″ / 4″"],
  ["Fabrication", "Custom sizes available"],
];

export const installPoints = [
  "Install below the relevant fixture drainage elevation where gravity flow is required.",
  "Keep covers clear so the unit can be opened for cleaning.",
  "Provide access for removing floating grease and settled solids.",
  "Arrange inlet and outlet to suit the kitchen drainage design.",
  "Venting and connection details vary by project and local plumbing authority — do not treat one layout as code-compliant everywhere.",
  "Do not connect incompatible waste streams without checking the applicable requirements.",
] as const;

export const cleaningSteps = [
  "Open the access cover.",
  "Remove accumulated grease from the top.",
  "Remove settled solids from the bottom.",
  "Clean internal surfaces.",
  "Inspect baffles and replace if they are damaged or missing.",
  "Refit the cover securely.",
] as const;

export const faqs = [
  {
    q: "What is a grease trap?",
    a: "A grease trap is a tank that slows kitchen wastewater so fats, oils, and grease (FOG) can float and heavier solids can settle before the water continues into the drain.",
  },
  {
    q: "What is the difference between a grease trap and a grease interceptor?",
    a: "The terms overlap in everyday use. Smaller under-sink units are often called traps; larger-retention units for high-volume kitchens are often called interceptors. Moon Steel fabricates both as stainless steel tanks in Small, Medium, and Large sizes.",
  },
  {
    q: "What size grease trap do I need?",
    a: "Size from the fixtures connected to the unit — sink volume, how full they typically are, and how fast they drain — then confirm with your local plumbing authority. Use the calculator on this page for an estimate, then request engineering confirmation.",
  },
  {
    q: "What does GPM mean?",
    a: "GPM is gallons per minute. Moon Steel lists Small at 17 GPM, Medium at 34 GPM, and Large at 120 GPM.",
  },
  {
    q: "Does a larger tank always mean a better grease trap?",
    a: "A larger tank gives more volume, but performance also depends on inlet and outlet arrangement, baffles, access for cleaning, and how the unit is used. Oversizing can also make maintenance harder. Internal design matters as much as box size.",
  },
  {
    q: "Where should a grease trap be installed?",
    a: "Typically on the grease-laden waste line, with gravity flow and enough clearance to open the cover. Exact location, invert, and venting follow the project drainage design and local requirements.",
  },
  {
    q: "How often should a grease trap be cleaned?",
    a: "Clean before grease and solids take up enough of the tank that the remaining working volume is reduced. Some jurisdictions publish accumulation thresholds; those rules are local, not a universal Moon Steel standard.",
  },
  {
    q: "Can a dishwasher discharge into a grease trap?",
    a: "It depends on the local plumbing authority and the project specification. Enter the dishwasher as a fixture in the calculator only if it will actually connect to the trap, then confirm with your designer or inspector.",
  },
  {
    q: "Can you manufacture a custom grease trap?",
    a: "Yes. Moon Steel fabricates custom stainless steel grease traps to kitchen layout, inlet and outlet size, and project drawings.",
  },
  {
    q: "What stainless steel grade do you use?",
    a: "Standard fabrication is AISI 304 at 1.50 mm nominal body thickness. Other grades and thicknesses can be quoted for the project.",
  },
  {
    q: "What is the difference between gross volume and working volume?",
    a: "Gross volume is the geometric tank size (length × width × depth). Working volume is the liquid that actually participates in separation after air space, baffles, and accumulated grease/solids are accounted for. The figures on this page are approximate gross tank volumes.",
  },
  {
    q: "What inlet and outlet size should I use?",
    a: "Small uses a 1″ inlet and 2″ outlet, Medium uses 3″ inlet and outlet, and Large uses 4″ inlet and outlet. Confirm the connection against the kitchen drainage design.",
  },
] as const;

export const gpmOptions = [10, 17, 20, 34, 50, 75, 100, 120, 150, 200, 300, 500] as const;

export type SizeUnit = "in" | "mm";

const MM_PER_INCH = 25.4;

export type InchRange = { min: number; max: number };

export type TypicalDimensionBand = {
  minGpm: number;
  maxGpm: number;
  length: InchRange;
  width: InchRange;
  height: InchRange;
  inlet: InchRange;
  outlet: InchRange;
  category: "under-sink" | "floor-mounted" | "in-ground";
};

export const typicalDimensionBands: TypicalDimensionBand[] = [
  {
    minGpm: 4,
    maxGpm: 12,
    length: { min: 16, max: 24 },
    width: { min: 10, max: 15 },
    height: { min: 10, max: 13 },
    inlet: { min: 2, max: 2 },
    outlet: { min: 2, max: 2 },
    category: "under-sink",
  },
  {
    minGpm: 13,
    maxGpm: 20,
    length: { min: 24, max: 30 },
    width: { min: 16, max: 18 },
    height: { min: 12, max: 16 },
    inlet: { min: 2, max: 3 },
    outlet: { min: 2, max: 3 },
    category: "under-sink",
  },
  {
    minGpm: 21,
    maxGpm: 35,
    length: { min: 28, max: 36 },
    width: { min: 18, max: 20 },
    height: { min: 16, max: 20 },
    inlet: { min: 3, max: 3 },
    outlet: { min: 3, max: 3 },
    category: "under-sink",
  },
  {
    minGpm: 36,
    maxGpm: 55,
    length: { min: 36, max: 42 },
    width: { min: 18, max: 24 },
    height: { min: 18, max: 24 },
    inlet: { min: 3, max: 3 },
    outlet: { min: 3, max: 3 },
    category: "under-sink",
  },
  {
    minGpm: 56,
    maxGpm: 85,
    length: { min: 40, max: 40 },
    width: { min: 31, max: 31 },
    height: { min: 23, max: 23 },
    inlet: { min: 4, max: 4 },
    outlet: { min: 4, max: 4 },
    category: "floor-mounted",
  },
  {
    minGpm: 86,
    maxGpm: 125,
    length: { min: 40, max: 48 },
    width: { min: 24, max: 31 },
    height: { min: 24, max: 33 },
    inlet: { min: 4, max: 4 },
    outlet: { min: 4, max: 4 },
    category: "floor-mounted",
  },
  {
    minGpm: 126,
    maxGpm: 175,
    length: { min: 40, max: 72 },
    width: { min: 30, max: 31 },
    height: { min: 43, max: 72 },
    inlet: { min: 4, max: 6 },
    outlet: { min: 4, max: 6 },
    category: "floor-mounted",
  },
  {
    minGpm: 176,
    maxGpm: 250,
    length: { min: 52, max: 108 },
    width: { min: 30, max: 34 },
    height: { min: 43, max: 72 },
    inlet: { min: 4, max: 6 },
    outlet: { min: 4, max: 6 },
    category: "floor-mounted",
  },
  {
    minGpm: 251,
    maxGpm: 350,
    length: { min: 76, max: 120 },
    width: { min: 30, max: 48 },
    height: { min: 48, max: 72 },
    inlet: { min: 6, max: 6 },
    outlet: { min: 6, max: 6 },
    category: "in-ground",
  },
  {
    minGpm: 351,
    maxGpm: 800,
    length: { min: 83, max: 216 },
    width: { min: 30, max: 60 },
    height: { min: 52, max: 74 },
    inlet: { min: 6, max: 8 },
    outlet: { min: 6, max: 8 },
    category: "in-ground",
  },
];

export function typicalDimensionsForGpm(gpm: number) {
  return (
    typicalDimensionBands.find((band) => gpm >= band.minGpm && gpm <= band.maxGpm) ??
    typicalDimensionBands[typicalDimensionBands.length - 1]
  );
}

export function formatInchesValue(inches: number, unit: SizeUnit) {
  if (unit === "mm") return `${Math.round(inches * MM_PER_INCH)} mm`;
  const rounded = Number.isInteger(inches) ? String(inches) : inches.toFixed(1);
  return `${rounded}″`;
}

export function formatInchRange(range: InchRange, unit: SizeUnit) {
  if (range.min === range.max) return formatInchesValue(range.min, unit);
  return `${formatInchesValue(range.min, unit)}–${formatInchesValue(range.max, unit)}`;
}

export function formatProductSize(product: GreaseTrapProduct, unit: SizeUnit) {
  return `${formatInchesValue(product.lengthIn, unit)} × ${formatInchesValue(product.widthIn, unit)} × ${formatInchesValue(product.heightIn, unit)}`;
}

export function formatProductPipe(inches: number, unit: SizeUnit) {
  return formatInchesValue(inches, unit);
}

export function matchGreaseTrap(gpm: number): {
  product: GreaseTrapProduct;
  fitsStandard: boolean;
} {
  const ranked = [...greaseTrapProducts].sort((a, b) => a.gpm - b.gpm);
  const largest = ranked[ranked.length - 1] ?? greaseTrapProducts[0];
  const product = ranked.find((item) => item.gpm >= gpm) ?? largest;
  return {
    product,
    fitsStandard: product.gpm >= gpm,
  };
}
