import Link from "next/link";
import { ParentBackLink } from "@/components/layout/ParentBackLink";
import { EMAIL, PHONE_DISPLAY, STREET_ADDRESS } from "@/lib/contact/details";

export const RETURNS_UPDATED = "16 August 2026";

const toc = [
  { id: "summary", label: "Summary" },
  { id: "standard", label: "Standard catalog products" },
  { id: "custom", label: "Custom and made-to-spec" },
  { id: "defects", label: "Damage, defects, and wrong goods" },
  { id: "how-to", label: "How to request a return" },
  { id: "refunds", label: "Refunds" },
  { id: "shipping", label: "Return shipping" },
  { id: "contact", label: "Contact" },
] as const;

export function ReturnsPageView() {
  return (
    <main className="layer-0 pb-20 pt-28">
      <div className="container mx-auto max-w-3xl px-4 md:px-6">
        <ParentBackLink href="/" label="home" />
        <article className="layer-1 overflow-hidden rounded-2xl p-6 md:p-10">
          <p className="apple-eyebrow mb-3">Legal</p>
          <h1 className="apple-section-title mb-4 section-title-accent">Return and refund policy</h1>
          <p className="mb-8 text-sm text-muted-foreground">Last updated {RETURNS_UPDATED}</p>
          <p className="mb-8 text-base leading-relaxed text-muted-foreground">
            This is the public return and refund policy for Moon Steel Fabricators, {STREET_ADDRESS}, Karachi,
            Pakistan. It applies to products sold from{" "}
            <a href="https://moonsteelfab.com" className="text-foreground underline-offset-4 hover:underline">
              moonsteelfab.com
            </a>{" "}
            and to the same products listed in Google, Facebook, Instagram, and WhatsApp catalogs. You do not need to
            log in, create an account, or give personal information to read this page.
          </p>

          <nav aria-label="Return policy sections" className="mb-10 rounded-xl border border-border bg-background/60 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contents</p>
            <ul className="grid gap-1 sm:grid-cols-2">
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="text-sm text-foreground hover:text-primary">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-10 text-base leading-relaxed text-muted-foreground">
            <section id="summary" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">Summary</h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <span className="text-foreground">Standard catalog products</span> (stock sizes and listed models
                  sold as shown, without customer drawings) may be returned within 7 days of delivery.
                </li>
                <li>
                  <span className="text-foreground">Custom and made-to-spec items</span> are not returnable or
                  exchangeable once manufacture has started from an approved drawing, specification, or written order.
                </li>
                <li>
                  Goods that arrive damaged, that we made incorrectly, or that do not match the approved specification
                  are handled under{" "}
                  <a href="#defects" className="text-foreground underline-offset-4 hover:underline">
                    damage, defects, and wrong goods
                  </a>
                  , including custom work.
                </li>
              </ul>
            </section>

            <section id="standard" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">Standard catalog products</h2>
              <p>
                A standard product is a listed catalog model supplied to the published size, grade, and specification,
                without changes from a customer drawing or a custom design.
              </p>
              <p>You may return a standard product if all of the following are true:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>You tell us within 7 calendar days of delivery.</li>
                <li>The item is unused, uninstalled, and in the same condition as delivered.</li>
                <li>You include the original packing where practical, and the invoice or order reference.</li>
              </ul>
              <p>
                After we inspect the return at our Karachi factory, we refund the product price by the same method you
                paid (or by bank transfer if that is not possible). Delivery charges already paid are refunded only if
                we sent the wrong standard item.
              </p>
            </section>

            <section id="custom" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">Custom and made-to-spec work</h2>
              <p>
                Most Moon Steel equipment is fabricated to a customer or consultant drawing, an approved sketch, or a
                written specification (size, fittings, grade, layout, or finish that is not the listed catalog model).
                Those goods are made for one order. We do not accept returns or exchanges on custom or made-to-spec
                items because they cannot be resold as standard stock.
              </p>
              <p>
                This includes, for example, sinks, tables, hoods, grease traps, and other equipment built from your
                drawing or a size we do not list as a standard catalog model.
              </p>
              <p>
                If you cancel a custom order before we start cutting or fabricating, we refund any deposit minus
                documented drawing or material costs already incurred. After fabrication has started, the order is not
                cancellable or returnable except under{" "}
                <a href="#defects" className="text-foreground underline-offset-4 hover:underline">
                  damage, defects, and wrong goods
                </a>
                .
              </p>
            </section>

            <section id="defects" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">Damage, defects, and wrong goods</h2>
              <p>Tell us as soon as you can, and within 7 calendar days of delivery, if:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>the goods arrived damaged in transit</li>
                <li>we supplied the wrong standard catalog item</li>
                <li>the goods do not match the approved drawing or written specification we both confirmed</li>
                <li>there is a manufacturing defect in workmanship or material</li>
              </ul>
              <p>
                Please keep photos of the packing and the goods. We will inspect and then repair, replace, or refund as
                appropriate for that order. This applies to both standard and custom products.
              </p>
            </section>

            <section id="how-to" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">How to request a return or refund</h2>
              <p>No account is required. Email or call us with:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>your name, company, phone, and order or invoice reference</li>
                <li>the product name and whether it was a standard catalog model or custom work</li>
                <li>the reason, and photos if the goods are damaged or incorrect</li>
              </ul>
              <p>
                Email{" "}
                <a href={`mailto:${EMAIL}`} className="text-foreground underline-offset-4 hover:underline">
                  {EMAIL}
                </a>{" "}
                or call {PHONE_DISPLAY}. We confirm next steps in writing, usually within 2 business days.
              </p>
              <p>
                Returns of approved standard products must be sent to {STREET_ADDRESS}, Karachi, Pakistan, unless we
                arrange collection.
              </p>
            </section>

            <section id="refunds" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">Refunds</h2>
              <p>
                Approved refunds are paid within 14 days after we receive and inspect the goods (or after we agree a
                refund without a physical return). We refund to the original payment method where we can, otherwise by
                bank transfer in Pakistan. We do not charge a restocking fee on standard catalog returns that meet this
                policy.
              </p>
            </section>

            <section id="shipping" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">Return shipping</h2>
              <p>
                For a standard catalog return that is not our error, you pay return freight to Karachi. If we sent the
                wrong item, or the goods were defective or damaged in transit under our responsibility, we pay return
                or replacement freight in Pakistan.
              </p>
              <p>
                Outbound delivery across Pakistan and factory collection from Karachi are quoted on each order. Catalog
                listings do not by themselves create a shipping contract.
              </p>
            </section>

            <section id="contact" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">Contact</h2>
              <p>
                Moon Steel Fabricators
                <br />
                {STREET_ADDRESS}, Karachi, Pakistan
                <br />
                {PHONE_DISPLAY}
                <br />
                <a href={`mailto:${EMAIL}`} className="text-foreground underline-offset-4 hover:underline">
                  {EMAIL}
                </a>
              </p>
              <p>
                Related pages:{" "}
                <Link href="/terms" className="text-foreground underline-offset-4 hover:underline">
                  Terms of Use
                </Link>
                ,{" "}
                <Link href="/privacy" className="text-foreground underline-offset-4 hover:underline">
                  Privacy Policy
                </Link>
                , and{" "}
                <Link href="/contact" className="text-foreground underline-offset-4 hover:underline">
                  Contact / order
                </Link>
                .
              </p>
            </section>
          </div>
        </article>
      </div>
    </main>
  );
}
