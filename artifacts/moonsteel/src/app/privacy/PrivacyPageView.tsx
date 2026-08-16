import Link from "next/link";
import { ParentBackLink } from "@/components/layout/ParentBackLink";
import { EMAIL, PHONE_DISPLAY, STREET_ADDRESS } from "@/lib/contact/details";

const UPDATED = "16 August 2026";

const toc = [
  { id: "who-we-are", label: "Who we are" },
  { id: "what-we-collect", label: "Information we collect" },
  { id: "how-we-use", label: "How we use information" },
  { id: "platforms", label: "Facebook, Instagram, WhatsApp, and Google" },
  { id: "cookies", label: "Cookies and analytics" },
  { id: "sharing", label: "Who we share with" },
  { id: "retention", label: "How long we keep data" },
  { id: "data-deletion", label: "Access, correction, and deletion" },
  { id: "security", label: "Security" },
  { id: "children", label: "Children" },
  { id: "changes", label: "Changes" },
  { id: "contact", label: "Contact" },
] as const;

export function PrivacyPageView() {
  return (
    <main className="layer-0 pb-20 pt-28">
      <div className="container mx-auto max-w-3xl px-4 md:px-6">
        <ParentBackLink href="/" label="home" />
        <article className="layer-1 overflow-hidden rounded-2xl p-6 md:p-10">
          <p className="apple-eyebrow mb-3">Legal</p>
          <h1 className="apple-section-title mb-4 section-title-accent">Privacy Policy</h1>
          <p className="mb-8 text-sm text-muted-foreground">Last updated {UPDATED}</p>
          <p className="mb-8 text-base leading-relaxed text-muted-foreground">
            This policy explains how Moon Steel Fabricators collects, uses, and shares information when you visit{" "}
            <a href="https://moonsteelfab.com" className="text-foreground underline-offset-4 hover:underline">
              moonsteelfab.com
            </a>
            , request a quote, or see our products on Facebook, Instagram, WhatsApp Business, or Google. It is written
            to meet Meta, WhatsApp, Instagram, and Google Merchant Center requirements for a public privacy policy.
          </p>

          <nav aria-label="Privacy policy sections" className="mb-10 rounded-xl border border-border bg-background/60 p-4">
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
            <section id="who-we-are" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">Who we are</h2>
              <p>
                Moon Steel Fabricators manufactures stainless steel commercial kitchen and industrial equipment in
                Karachi, Pakistan, and supplies customers across Pakistan.
              </p>
              <p>
                {STREET_ADDRESS}, Karachi, Pakistan
                <br />
                Email:{" "}
                <a href={`mailto:${EMAIL}`} className="text-foreground underline-offset-4 hover:underline">
                  {EMAIL}
                </a>
                <br />
                Phone: {PHONE_DISPLAY}
              </p>
            </section>

            <section id="what-we-collect" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">Information we collect</h2>
              <p>We collect information you give us and information created when you use the site:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <span className="text-foreground">Quote and contact details:</span> name, company, email, phone
                  number, project type, message, and any drawings or files you upload.
                </li>
                <li>
                  <span className="text-foreground">Business communications:</span> emails, phone calls, and WhatsApp
                  messages you send us.
                </li>
                <li>
                  <span className="text-foreground">Admin accounts:</span> login details for Moon Steel staff who manage
                  the website and catalog.
                </li>
                <li>
                  <span className="text-foreground">Usage data:</span> pages viewed, approximate location derived from
                  IP address, device and browser type, and referral source, through Google Analytics 4 and Vercel
                  performance tools on the live site.
                </li>
              </ul>
              <p>We do not require Facebook or Google login to browse the website or request a quote.</p>
            </section>

            <section id="how-we-use" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">How we use information</h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>Prepare quotations, drawings, and fabrication orders.</li>
                <li>Reply to enquiries by phone, email, or WhatsApp.</li>
                <li>Operate, secure, and improve the website.</li>
                <li>Measure which pages and products are useful (analytics).</li>
                <li>Publish selected product listings to social and shopping catalogs, as described below.</li>
                <li>Meet accounting, tax, and legal obligations.</li>
              </ul>
            </section>

            <section id="platforms" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">
                Facebook, Instagram, WhatsApp, and Google
              </h2>
              <p>
                When we choose to publish a product, we send catalog data from this website to Meta (for Facebook,
                Instagram, and WhatsApp Business catalogs) and to Google Merchant Center. That data can include product
                name, description, images, public product URL, price, currency, availability, SKU, and brand. We do this
                so customers can see Moon Steel products in those catalogs and ads. Listings are not created
                automatically when a product is saved on the website.
              </p>
              <p>
                Meta and Google process that catalog data under their own terms and privacy policies. If you interact
                with our Facebook Page, Instagram account, WhatsApp Business account, or Google listing, those platforms
                also collect information according to their policies.
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <a
                    href="https://www.facebook.com/privacy/policy/"
                    className="text-foreground underline-offset-4 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Meta Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.whatsapp.com/legal/privacy-policy"
                    className="text-foreground underline-offset-4 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="https://policies.google.com/privacy"
                    className="text-foreground underline-offset-4 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Google Privacy Policy
                  </a>
                </li>
              </ul>
              <p>
                Staff may connect a Meta or Google business account in our admin tools so we can manage those catalogs.
                Tokens for that connection are stored only for catalog management. We do not use Facebook Login for
                website visitors.
              </p>
            </section>

            <section id="cookies" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">Cookies and analytics</h2>
              <p>
                The public site uses a small number of cookies and similar technologies. Essential cookies keep an
                admin session signed in. On the live website we load Google Analytics 4 (measurement ID G-LQ83V349QZ)
                and Vercel speed/analytics scripts to understand traffic and page performance. These tools may set
                cookies or use similar identifiers. You can block analytics cookies in your browser; the site will still
                work.
              </p>
            </section>

            <section id="sharing" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">Who we share with</h2>
              <p>We share information only as needed to run the business:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Hosting and infrastructure providers that run this website and email.</li>
                <li>Meta and Google, for product catalogs and (if you use them) Page, Instagram, WhatsApp, or ads.</li>
                <li>Professional advisers, banks, or authorities where the law requires it.</li>
              </ul>
              <p>We do not sell personal information.</p>
            </section>

            <section id="retention" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">How long we keep data</h2>
              <p>
                Quote requests, drawings, and correspondence are kept as long as needed to fulfil an enquiry or order,
                and afterwards for a reasonable period for quality, warranty, and legal records. Analytics data is kept
                according to the settings of those tools. Catalog listings remain on a platform until we unpublish them
                or disconnect that catalog.
              </p>
            </section>

            <section id="data-deletion" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">Access, correction, and deletion</h2>
              <p>
                You may ask us to access, correct, or delete personal information we hold about you. This is also the
                user data deletion process required by Meta for our business app.
              </p>
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  Email{" "}
                  <a href={`mailto:${EMAIL}?subject=Data%20deletion%20request`} className="text-foreground underline-offset-4 hover:underline">
                    {EMAIL}
                  </a>{" "}
                  with the subject “Data deletion request”.
                </li>
                <li>Tell us the email, phone number, or name used in your enquiry, and what you want deleted.</li>
                <li>
                  We will confirm and delete or anonymize that personal data within 30 days, unless we must keep a
                  record for tax, contract, or legal reasons.
                </li>
              </ol>
              <p>
                Deleting your personal data does not automatically remove a product from Facebook, Instagram, WhatsApp,
                or Google catalogs. Those listings are company product data, not a customer profile. To stop WhatsApp
                messages from us, reply STOP or tell us in the same email.
              </p>
              <p>
                The same instructions are published at{" "}
                <Link href="/data-deletion" className="text-foreground underline-offset-4 hover:underline">
                  /data-deletion
                </Link>
                .
              </p>
            </section>

            <section id="security" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">Security</h2>
              <p>
                We use HTTPS, access controls on admin tools, and encrypted storage for platform connection secrets. No
                method of transmission or storage is completely secure. Please do not send payment card numbers through
                the quote form.
              </p>
            </section>

            <section id="children" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">Children</h2>
              <p>
                This website is for commercial and industrial customers. It is not directed at children under 13, and we
                do not knowingly collect personal information from children.
              </p>
            </section>

            <section id="changes" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">Changes</h2>
              <p>
                We may update this policy when our site or platform integrations change. The “Last updated” date at the
                top will change. Continued use of the site after an update means you accept the revised policy.
              </p>
            </section>

            <section id="contact" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">Contact</h2>
              <p>
                Privacy questions:{" "}
                <a href={`mailto:${EMAIL}`} className="text-foreground underline-offset-4 hover:underline">
                  {EMAIL}
                </a>
                . See also our{" "}
                <Link href="/terms" className="text-foreground underline-offset-4 hover:underline">
                  Terms of Use
                </Link>
                ,{" "}
                <Link href="/returns" className="text-foreground underline-offset-4 hover:underline">
                  Return and refund policy
                </Link>
                , and{" "}
                <Link href="/contact" className="text-foreground underline-offset-4 hover:underline">
                  contact page
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
