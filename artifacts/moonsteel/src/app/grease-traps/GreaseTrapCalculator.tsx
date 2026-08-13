"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { getCatalogProductPath } from "@/features/catalog/paths";
import { cn } from "@/lib/utils";
import {
  formatInchRange,
  formatProductPipe,
  formatProductSize,
  gpmOptions,
  matchGreaseTrap,
  typicalDimensionsForGpm,
  type SizeUnit,
} from "@/app/grease-traps/grease-traps-data";

export function GreaseTrapCalculator() {
  const [gpm, setGpm] = useState<(typeof gpmOptions)[number]>(17);
  const [unit, setUnit] = useState<SizeUnit>("in");
  const { product, fitsStandard } = useMemo(() => matchGreaseTrap(gpm), [gpm]);
  const typical = useMemo(() => typicalDimensionsForGpm(gpm), [gpm]);

  return (
    <section id="calculator" className="mb-16 scroll-mt-28">
      <div className="mb-6 max-w-2xl">
        <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
          What Size Grease Trap Do I Need?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Select the required flow in GPM. Typical dimensions are planning ranges. Exact size
          depends on brand and model — always confirm against the manufacturer datasheet.
        </p>
      </div>

      <div className="layer-1 space-y-6 rounded-2xl p-5 md:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Required flow (GPM)</p>
            <div className="flex flex-wrap gap-2">
              {gpmOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setGpm(option)}
                  className={cn(
                    "min-h-10 rounded-full border px-3.5 text-sm transition-colors",
                    gpm === option
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option} GPM
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Units</p>
            <div className="flex gap-2">
              {(
                [
                  ["in", "Inches"],
                  ["mm", "mm"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setUnit(id)}
                  className={cn(
                    "min-h-10 rounded-full border px-3.5 text-sm transition-colors",
                    unit === id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="layer-2 rounded-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Typical dimensions for a {gpm} GPM trap
          </p>
          <dl className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg bg-muted/40 px-3 py-2">
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Length</dt>
              <dd className="text-sm font-medium text-foreground">
                ≈ {formatInchRange(typical.length, unit)}
              </dd>
            </div>
            <div className="rounded-lg bg-muted/40 px-3 py-2">
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Width</dt>
              <dd className="text-sm font-medium text-foreground">
                ≈ {formatInchRange(typical.width, unit)}
              </dd>
            </div>
            <div className="rounded-lg bg-muted/40 px-3 py-2">
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Height</dt>
              <dd className="text-sm font-medium text-foreground">
                ≈ {formatInchRange(typical.height, unit)}
              </dd>
            </div>
            <div className="rounded-lg bg-muted/40 px-3 py-2">
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Typical inlet
              </dt>
              <dd className="text-sm font-medium text-foreground">
                {formatInchRange(typical.inlet, unit)}
              </dd>
            </div>
            <div className="rounded-lg bg-muted/40 px-3 py-2">
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Typical outlet
              </dt>
              <dd className="text-sm font-medium text-foreground">
                {formatInchRange(typical.outlet, unit)}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            These are typical ranges for planning space. Actual dimensions vary by manufacturer.
            Always check the datasheet for the model you specify.
          </p>
        </div>

        <div className="layer-2 rounded-xl p-5">
          {fitsStandard ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recommended Moon Steel model
              </p>
              <p className="mt-1 text-2xl font-display font-semibold text-primary">{product.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {product.gpm} GPM · {formatProductSize(product, unit)} · ~{product.grossGal} gal
                gross volume
              </p>
              <dl className="mt-4 grid gap-2 sm:grid-cols-3">
                <div className="rounded-lg bg-muted/40 px-3 py-2">
                  <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Moon Steel size
                  </dt>
                  <dd className="text-sm font-medium text-foreground">
                    {formatProductSize(product, unit)}
                  </dd>
                </div>
                <div className="rounded-lg bg-muted/40 px-3 py-2">
                  <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Inlet</dt>
                  <dd className="text-sm font-medium text-foreground">
                    {formatProductPipe(product.inletIn, unit)}
                  </dd>
                </div>
                <div className="rounded-lg bg-muted/40 px-3 py-2">
                  <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Outlet</dt>
                  <dd className="text-sm font-medium text-foreground">
                    {formatProductPipe(product.outletIn, unit)}
                  </dd>
                </div>
              </dl>
              <ul className="mt-4 space-y-1.5">
                <li className="flex gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Recommended for {product.application.toLowerCase()}.
                </li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Request a quote
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={getCatalogProductPath(product.slug)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
                >
                  View {product.name}
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Moon Steel recommendation
              </p>
              <p className="mt-1 text-2xl font-display font-semibold text-primary">Custom size</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {gpm} GPM is above the standard Large unit (120 GPM). We can fabricate a custom
                stainless steel interceptor to the required flow, inlet, and outlet.
              </p>
              <div className="mt-5">
                <Link
                  href="/contact"
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Request a custom size
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Sizing guidance only. Final grease trap selection should comply with the applicable
          plumbing authority, project specifications, and local requirements.
        </p>
      </div>
    </section>
  );
}
