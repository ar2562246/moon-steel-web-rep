export const PROCESS_STEPS = [
  {
    id: "consultation",
    title: "Consultation",
    summary: "We analyze your space, workflow requirements, and operational capacity.",
    body: "Work starts with how the kitchen actually operates: the floor plan, existing equipment, service volume, and who uses the space. Send drawings, photos, or a brief through the quote form. We use that to scope the equipment list, stainless grade, and whether a site visit is needed before we draw.",
    points: [
      "Review space, workflow, and operational capacity",
      "Confirm AISI 304 or 316 from the project specification",
      "Identify what to fabricate, modify, or reuse",
      "Quote from drawings, photos, or a site visit",
    ],
  },
  {
    id: "design",
    title: "Design / Drawing",
    summary: "Detailed AutoCAD/DXF layouts provided for precision alignment and approval.",
    body: "Once the scope is agreed, we produce AutoCAD and DXF layouts plus item drawings for approval. You or your consultant sign off dimensions, connections, and finishes before steel is cut. Revisions happen on the drawing, not on the shop floor.",
    points: [
      "AutoCAD / DXF kitchen and item layouts",
      "Dimensions, connections, and finishes for approval",
      "Alignment to workflow and building services",
      "Changes captured before fabrication starts",
    ],
  },
  {
    id: "fabrication",
    title: "Fabrication",
    summary: "Engineered in our Karachi facility using specified AISI 304 or 316 stainless steel.",
    body: "Equipment is fabricated at our Karachi workshop in the specified AISI 304 or AISI 316 stainless steel. Cutting, forming, welding, and finishing follow the approved drawings so the finished items match the layout you signed.",
    points: [
      "Built in Karachi to the approved drawings",
      "AISI 304 or AISI 316 as specified",
      "Custom sizes and one-off items from DXF, DWG, or PDF",
      "Food-grade finishes for kitchen and hygienic areas",
    ],
  },
  {
    id: "installation",
    title: "Delivery & Installation",
    summary: "Seamless on-site installation by our expert teams to ensure perfect fit and finish.",
    body: "We deliver to site and install with our own teams so units sit level, sealed, and ready for service. Where access or fit requires it, we complete fabrication on site rather than forcing a mismatch.",
    points: [
      "Delivery to the project site",
      "Installation and fit-out by our teams",
      "Level, sealed, and ready for service",
      "On-site fabrication where the layout requires it",
    ],
  },
] as const;

export const PROCESS_INTRO =
  "A systematic, transparent process ensuring your facility is delivered on time, to spec, without surprises.";
