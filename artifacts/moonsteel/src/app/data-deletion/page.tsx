import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { ParentBackLink } from "@/components/layout/ParentBackLink";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { EMAIL } from "@/lib/contact/details";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "User Data Deletion",
  description:
    "How to request deletion of personal data held by Moon Steel Fabricators, including data related to our Meta business app.",
  alternates: {
    canonical: "/data-deletion",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/data-deletion"),
    title: "User Data Deletion | Moon Steel Fabricators",
    description: "Request deletion of personal data held by Moon Steel Fabricators.",
  },
};

export default function DataDeletionPage() {
  return (
    <>
      <main className="layer-0 pb-20 pt-28">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <ParentBackLink href="/privacy" label="privacy policy" />
          <article className="layer-1 overflow-hidden rounded-2xl p-6 md:p-10">
            <p className="apple-eyebrow mb-3">Legal</p>
            <h1 className="apple-section-title mb-4 section-title-accent">User data deletion</h1>
            <p className="mb-6 text-base leading-relaxed text-muted-foreground">
              This page is the data-deletion URL for Moon Steel Fabricators’ Meta business app and for anyone who has
              sent us an enquiry.
            </p>
            <ol className="mb-6 list-decimal space-y-3 pl-5 text-base leading-relaxed text-muted-foreground">
              <li>
                Email{" "}
                <a
                  href={`mailto:${EMAIL}?subject=Data%20deletion%20request`}
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  {EMAIL}
                </a>{" "}
                with the subject “Data deletion request”.
              </li>
              <li>Include the name, email, or phone number we should look up.</li>
              <li>
                We will confirm and delete or anonymize personal data we hold within 30 days, except records we must
                keep for tax, contract, or legal reasons.
              </li>
            </ol>
            <p className="text-base leading-relaxed text-muted-foreground">
              Full details are in our{" "}
              <Link href="/privacy#data-deletion" className="text-foreground underline-offset-4 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </article>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
