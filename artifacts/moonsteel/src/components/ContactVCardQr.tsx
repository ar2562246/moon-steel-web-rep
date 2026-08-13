"use client";

import { QRCodeSVG } from "qrcode.react";
import { contactVCard, contactVCardHref } from "@/lib/contact/details";

export function ContactVCardQr() {
  const vcard = contactVCard();

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/80 bg-background/60 p-4">
      <div className="shrink-0 rounded-md bg-white p-2">
        <QRCodeSVG
          value={vcard}
          size={112}
          level="M"
          bgColor="#ffffff"
          fgColor="#0f1419"
          title="Scan to save Moon Steel Fabricators as a phone contact"
        />
      </div>
      <div className="min-w-0">
        <h4 className="font-medium text-foreground">Save to phone</h4>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Scan the QR code to add Moon Steel Fabricators to your contacts.
        </p>
        <a
          href={contactVCardHref()}
          download="moon-steel-fabricators.vcf"
          className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
        >
          Download contact card
        </a>
      </div>
    </div>
  );
}
