import { PRODUCTION_SITE_URL } from "@/lib/site";

export const COMPANY_NAME = "Moon Steel Fabricators";
export const EMAIL = "info@moonsteelfab.com";
export const PHONE_DISPLAY = "+92-21-35121145-46";
export const PHONE_TEL = "+922135121145";
export const WHATSAPP_E164 = "923312562246";
export const WHATSAPP_DISPLAY = "+92 331 2562246";
export const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_E164}`;
export const STREET_ADDRESS = "Plot 142, Sector 24, Korangi Industrial Area";
export const ADDRESS_LOCALITY = "Karachi";
export const ADDRESS_COUNTRY = "Pakistan";

export const CONTACT_DRAWING_ACCEPT = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".dxf",
  ".dwg",
  ".step",
  ".stp",
  ".iges",
  ".igs",
  ".stl",
  ".sat",
  ".x_t",
  ".x_b",
  ".ipt",
  ".iam",
  ".sldprt",
  ".sldasm",
  ".3dm",
  ".catpart",
  ".catproduct",
  ".prt",
  ".zip",
].join(",");

export const CONTACT_DRAWING_HINT =
  "PDF, CAD (DWG, DXF, STEP, IGES, STL, SolidWorks, Inventor), images, or ZIP — up to 10 files, 25 MB each";

export function contactVCard() {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${COMPANY_NAME}`,
    `ORG:${COMPANY_NAME}`,
    `TEL;TYPE=WORK,VOICE:${PHONE_TEL}`,
    `TEL;TYPE=CELL,VOICE:+${WHATSAPP_E164}`,
    `EMAIL;TYPE=WORK:${EMAIL}`,
    `ADR;TYPE=WORK:;;Plot 142\\, Sector 24\\, Korangi Industrial Area;${ADDRESS_LOCALITY};;${ADDRESS_COUNTRY}`,
    `URL:${PRODUCTION_SITE_URL}`,
    "END:VCARD",
  ];
  return lines.join("\r\n");
}

export function contactVCardHref() {
  return `data:text/vcard;charset=utf-8,${encodeURIComponent(contactVCard())}`;
}
