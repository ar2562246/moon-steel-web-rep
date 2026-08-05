import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ClientsPageView } from "@/app/clients/ClientsPageView";
import { defaultClientReferences, defaultClients } from "@/features/clients/defaultClients";
import {
  listPublishedClientReferences,
  listPublishedClients,
} from "@/features/clients/queries";
import { createSupabaseServerClient, hasSupabaseServerEnv } from "@/lib/supabase/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://moonsteelfab.com";

async function resolveClientsPageData() {
  if (hasSupabaseServerEnv()) {
    try {
      const supabase = await createSupabaseServerClient();
      const [clients, references] = await Promise.all([
        listPublishedClients(supabase),
        listPublishedClientReferences(supabase),
      ]);
      if (clients.length > 0 || references.length > 0) {
        return { clients, references };
      }
    } catch {
      // Fall through to defaults.
    }
  }

  return { clients: defaultClients, references: defaultClientReferences };
}

export const metadata: Metadata = {
  title: "Clients",
  description:
    "Restaurants, hotels, hospitals, labs, and industrial clients served by Moon Steel Fabricators — plus client reference letters.",
  alternates: {
    canonical: "/clients",
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/clients`,
    title: "Clients | Moon Steel",
    description:
      "Trusted by Pizza Hut, Aga Khan Hospital, Serena Hotels, and dozens more across Pakistan.",
  },
};

export default async function ClientsPage() {
  const { clients, references } = await resolveClientsPageData();

  return (
    <>
      <ClientsPageView clients={clients} references={references} />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
