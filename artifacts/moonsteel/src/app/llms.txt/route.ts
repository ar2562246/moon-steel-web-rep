import { NextResponse } from "next/server";
import { PRODUCTION_SITE_URL } from "@/lib/site";

const body = `# Moon Steel Fabricators

> Moon Steel Fabricators is a stainless steel fabrication company based in Karachi, Pakistan. Commercial kitchens are the strongest vertical. Custom fabrication is the core capability.

- Legal name: Moon Steel Fabricators
- Location: Plot 142, Sector 24, Korangi Industrial Area, Karachi, Pakistan
- Phone: +92-21-35121145
- Email: info@moonsteelfab.com
- Hours: Monday–Saturday 09:00–18:00

## What we fabricate

- Commercial kitchen equipment
- Custom stainless steel fabrication from drawings (DXF, DWG, PDF)
- AISI 304 and AISI 316 stainless steel equipment
- Sinks, work tables, counters, cabinets, trolleys, serving lines
- Exhaust hoods, grease traps, racks, drains, cooking equipment

## Key pages

- [Home](${PRODUCTION_SITE_URL}/): Engineering-grade stainless steel fabrication for commercial kitchens
- [Products](${PRODUCTION_SITE_URL}/products): Commercial stainless steel kitchen equipment catalog
- [Grease traps](${PRODUCTION_SITE_URL}/grease-traps): AISI 304 grease traps and sizing calculator
- [Materials](${PRODUCTION_SITE_URL}/materials): AISI 304 vs 316 grade, thickness, and finish guide
- [Process](${PRODUCTION_SITE_URL}/process): Consultation, AutoCAD drawings, Karachi fabrication, and on-site installation
- [Projects](${PRODUCTION_SITE_URL}/projects): Fabrication installations across Pakistan
- [Clients](${PRODUCTION_SITE_URL}/clients): Hotels, QSRs, hospitals, and industrial clients
- [About](${PRODUCTION_SITE_URL}/about): Family fabrication business in Karachi since 1947
- [Contact](${PRODUCTION_SITE_URL}/contact): Request a fabrication quote
- [Food Fusion collaboration](${PRODUCTION_SITE_URL}/collaboration/food-fusion): Concept-to-product stainless fabrication

## Facts

- Workshop and fabrication in Karachi, Pakistan
- Serves hotels, restaurants, QSRs, healthcare, pharmaceutical, industrial cafeterias, and cold storage
- Standard commercial equipment is fabricated in AISI 304; AISI 316 is available where the specification requires it
- Grease trap GPM figures on the website are product classes and engineering estimates, not a plumbing-code certification
`;

export function GET() {
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
