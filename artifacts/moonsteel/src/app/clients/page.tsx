import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ClientsPageView } from "@/app/clients/ClientsPageView";
import type { CustomerLogo } from "@/features/admin/types";
import { defaultClientReferences, defaultClients } from "@/features/clients/defaultClients";
import {
  listCustomerLogos,
  listPublishedClientReferences,
  listPublishedClients,
} from "@/features/clients/queries";
import { createSupabaseServerClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { absoluteUrl } from "@/lib/site";

async function resolveClientsPageData() {
  if (hasSupabaseServerEnv()) {
    try {
      const supabase = await createSupabaseServerClient();
      const [clients, references, logos] = await Promise.all([
        listPublishedClients(supabase),
        listPublishedClientReferences(supabase),
        listCustomerLogos(supabase),
      ]);
      if (clients.length > 0 || references.length > 0 || logos.length > 0) {
        return { clients, references, logos };
      }
    } catch {
      // Fall through to defaults.
    }
  }

  return {
    clients: defaultClients,
    references: defaultClientReferences,
    logos: [] as CustomerLogo[],
  };
}

export const metadata: Metadata = {
  title: "Hotels, QSRs and Hospitals We Supply",
  description:
    "Restaurants, hotels, hospitals, labs, and industrial clients served by Moon Steel Fabricators — plus client reference letters.",
  alternates: {
    canonical: "/clients",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/clients"),
    title: "Hotels, QSRs and Hospitals We Supply | Moon Steel Fabricators",
    description:
      "Trusted by Pizza Hut, Aga Khan Hospital, Serena Hotels, and dozens more across Pakistan.",
  },
};

export default async function ClientsPage() {
  const { clients, references, logos } = await resolveClientsPageData();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Clients", path: "/clients" },
        ])}
      />
      <ClientsPageView clients={clients} references={references} logos={logos} />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
