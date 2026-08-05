"use client";

import { useState } from "react";
import Link from "next/link";
import { CmsImage } from "@/components/ui/CmsImage";
import { groupClientsByIndustry } from "@/features/clients/types";
import type { Client, ClientReference } from "@/features/clients/types";

type ClientsPageViewProps = {
  clients: Client[];
  references: ClientReference[];
};

export function ClientsPageView({ clients, references }: ClientsPageViewProps) {
  const groups = groupClientsByIndustry(clients);
  const [activeRef, setActiveRef] = useState<ClientReference | null>(null);

  return (
    <main className="layer-0 pb-16 pt-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <h1 className="apple-section-title mb-6 section-title-accent">Our Clients</h1>
          <p className="apple-section-copy">
            Moon Steel fabricates commercial kitchen and stainless steel equipment for restaurants,
            hotels, hospitals, labs, and industrial facilities across Pakistan — and for consultant
            partners who specify our work.
          </p>
        </div>

        {references.length > 0 ? (
          <section id="references" className="mb-20">
            <div className="mb-8 max-w-2xl">
              <h2 className="text-2xl font-display font-semibold text-foreground">
                Client references
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Letters of satisfaction from long-term clients. Tap a card to view the full scan.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {references.map((ref) => (
                <button
                  key={ref.id}
                  type="button"
                  onClick={() => setActiveRef(ref)}
                  className="group layer-1 overflow-hidden rounded-xl text-left transition-colors hover:border-primary/40"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <CmsImage
                      src={ref.image_url}
                      alt={`${ref.client_name} reference letter`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-2 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {ref.industry}
                      </span>
                      {ref.issued_on ? (
                        <span className="text-xs text-muted-foreground">
                          {new Date(ref.issued_on).toLocaleDateString("en-PK", {
                            year: "numeric",
                            month: "short",
                          })}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-lg font-display font-semibold text-foreground">
                      {ref.client_name}
                    </h3>
                    {ref.quote ? (
                      <p className="line-clamp-3 text-sm text-muted-foreground">{ref.quote}</p>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-12">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-display font-semibold text-foreground">Client directory</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {clients.length} organizations we have supplied. Photo case studies live on our{" "}
              <Link href="/projects" className="text-primary hover:underline">
                projects
              </Link>{" "}
              page.
            </p>
          </div>

          {groups.map((group) => (
            <div key={group.industry}>
              <h3 className="mb-4 border-b border-border pb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {group.industry}
              </h3>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.clients.map((client) => (
                  <li
                    key={client.id}
                    className="layer-1 flex items-start gap-3 rounded-xl px-4 py-3"
                  >
                    {client.logo_url ? (
                      <div className="relative mt-0.5 h-10 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-background">
                        <CmsImage
                          src={client.logo_url}
                          alt={client.name}
                          fill
                          sizes="56px"
                          className="object-contain p-1"
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{client.name}</p>
                      {client.locations ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">{client.locations}</p>
                      ) : null}
                      {client.notes ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">{client.notes}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </div>

      {activeRef ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${activeRef.client_name} reference letter`}
          onClick={() => setActiveRef(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setActiveRef(null);
          }}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-xl bg-background p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-display font-semibold text-foreground">
                  {activeRef.client_name}
                </h3>
                {activeRef.quote ? (
                  <p className="mt-1 text-sm text-muted-foreground">{activeRef.quote}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setActiveRef(null)}
                className="rounded-full border border-border px-3 py-1 text-sm text-foreground hover:border-primary/40"
              >
                Close
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeRef.image_url}
              alt={`${activeRef.client_name} reference letter`}
              className="mx-auto max-h-[75vh] w-auto max-w-full object-contain"
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
