import Link from "next/link";
import { ParentBackLink } from "@/components/layout/ParentBackLink";
import { EMAIL, PHONE_DISPLAY, STREET_ADDRESS } from "@/lib/contact/details";

const UPDATED = "16 August 2026";

export function TermsPageView() {
  return (
    <main className="layer-0 pb-20 pt-28">
      <div className="container mx-auto max-w-3xl px-4 md:px-6">
        <ParentBackLink href="/" label="home" />
        <article className="layer-1 overflow-hidden rounded-2xl p-6 md:p-10">
          <p className="apple-eyebrow mb-3">Legal</p>
          <h1 className="apple-section-title mb-4 section-title-accent">Terms of Use</h1>
          <p className="mb-8 text-sm text-muted-foreground">Last updated {UPDATED}</p>
          <div className="space-y-10 text-base leading-relaxed text-muted-foreground">
            <section className="space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">About this site</h2>
              <p>
                moonsteelfab.com is operated by Moon Steel Fabricators, {STREET_ADDRESS}, Karachi, Pakistan. You can
                buy listed catalog products on each product page. Custom fabrication from drawings is quoted in writing
                before we start work. Catalog prices are confirmed on the order unless a written quotation says
                otherwise.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">Quotes and custom work</h2>
              <p>
                Equipment is typically made to order from approved drawings or a written specification. A website
                enquiry is a request for quotation, not a binding order. An order exists only when both sides confirm
                scope, price, and terms in writing (quotation, purchase order, or contract).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">Returns and refunds</h2>
              <p>
                Standard catalog products may be returned within 7 days of delivery. Custom and made-to-spec equipment
                is not returnable or exchangeable once manufacture has started, except for transit damage, defects, or
                goods that do not match the approved specification. The full public policy is at{" "}
                <Link href="/returns" className="text-foreground underline-offset-4 hover:underline">
                  /returns
                </Link>
                .
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">Delivery</h2>
              <p>
                We manufacture in Karachi and supply across Pakistan. Lead time, packing, and delivery or collection
                are stated on the quotation for each job. Catalog listings on Facebook, Instagram, WhatsApp, or Google
                do not by themselves create a shipping contract.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">Catalogs on other platforms</h2>
              <p>
                Product information may appear in Meta Commerce catalogs (Facebook, Instagram, WhatsApp Business) and
                Google Merchant Center. Those listings follow this website as the source of product content. Platform
                availability, ads, and checkout features (if any) are controlled by Meta or Google and may require extra
                setup. See our{" "}
                <Link href="/privacy" className="text-foreground underline-offset-4 hover:underline">
                  Privacy Policy
                </Link>{" "}
                for how catalog data is shared.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">Website content</h2>
              <p>
                Drawings, photos, and specifications on this site are for information. Dimensions, GPM figures, and
                finishes should be confirmed before you order. You may not copy the site or our product images for
                another commercial catalog without permission.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">Contact</h2>
              <p>
                {STREET_ADDRESS}, Karachi, Pakistan · {PHONE_DISPLAY} ·{" "}
                <a href={`mailto:${EMAIL}`} className="text-foreground underline-offset-4 hover:underline">
                  {EMAIL}
                </a>
              </p>
            </section>
          </div>
        </article>
      </div>
    </main>
  );
}
