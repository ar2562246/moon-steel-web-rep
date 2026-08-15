"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCatalogProductPath } from "@/features/catalog/paths";
import { rememberProductBackLink } from "@/features/catalog/product-back";
import { cn } from "@/lib/utils";
import {
  formatInchesValue,
  formatProductPipe,
  gpmOptions,
  greaseTrapQuoteHref,
  recommendGreaseTrapSize,
  sizeUnits,
  standardGreaseTrapGpms,
  type SizeUnit,
} from "@/app/grease-traps/grease-traps-data";

const WHEEL_ITEM = 52;
const WHEEL_VISIBLE = 5;
const WHEEL_PAD = ((WHEEL_VISIBLE - 1) / 2) * WHEEL_ITEM;

type GpmOption = (typeof gpmOptions)[number];

function WheelPicker<T extends number>({
  options,
  value,
  onChange,
  format,
  ariaLabel,
  idPrefix,
  isStandard,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  format: (value: T) => string;
  ariaLabel: string;
  idPrefix: string;
  isStandard?: (value: T) => boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const ignoreScroll = useRef(false);
  const commitTimer = useRef<number>(0);
  const [scrollTop, setScrollTop] = useState(0);

  const indexOf = (item: T) => Math.max(0, options.indexOf(item));

  const indexFromScroll = (top: number) =>
    Math.min(options.length - 1, Math.max(0, Math.round(top / WHEEL_ITEM)));

  const scrollToIndex = (index: number, behavior: ScrollBehavior) => {
    const el = scrollerRef.current;
    if (!el) return;
    ignoreScroll.current = true;
    el.scrollTo({ top: index * WHEEL_ITEM, behavior });
    window.setTimeout(() => {
      ignoreScroll.current = false;
    }, behavior === "smooth" ? 320 : 0);
  };

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = indexOf(value) * WHEEL_ITEM;
    setScrollTop(el.scrollTop);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const top = indexOf(value) * WHEEL_ITEM;
    if (Math.abs(el.scrollTop - top) > 2) scrollToIndex(indexOf(value), "smooth");
  }, [value, options]);

  function commit(top: number) {
    const next = options[indexFromScroll(top)];
    if (next !== undefined && next !== value) onChange(next);
  }

  return (
    <div className="relative w-full" style={{ height: WHEEL_VISIBLE * WHEEL_ITEM }}>
      <div
        ref={scrollerRef}
        role="listbox"
        aria-label={ariaLabel}
        aria-activedescendant={`${idPrefix}-${value}`}
        tabIndex={0}
        onKeyDown={(event) => {
          const current = indexOf(value);
          if (event.key === "ArrowDown" || event.key === "ArrowRight") {
            event.preventDefault();
            const next = options[Math.min(options.length - 1, current + 1)];
            if (next !== undefined) onChange(next);
          }
          if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
            event.preventDefault();
            const next = options[Math.max(0, current - 1)];
            if (next !== undefined) onChange(next);
          }
        }}
        onScroll={(event) => {
          const top = event.currentTarget.scrollTop;
          setScrollTop(top);
          if (ignoreScroll.current) return;
          window.clearTimeout(commitTimer.current);
          commitTimer.current = window.setTimeout(() => commit(top), 80);
        }}
        className="h-full overflow-y-auto overscroll-contain outline-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
          perspective: "900px",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
        }}
      >
        <div style={{ height: WHEEL_PAD }} aria-hidden />
        {options.map((option, itemIndex) => {
          const offset = itemIndex - scrollTop / WHEEL_ITEM;
          const abs = Math.abs(offset);
          const selected = Math.round(scrollTop / WHEEL_ITEM) === itemIndex;
          const standard = isStandard?.(option) ?? false;
          return (
            <button
              key={option}
              id={`${idPrefix}-${option}`}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => {
                onChange(option);
                scrollToIndex(itemIndex, "smooth");
              }}
              className="flex w-full shrink-0 items-center justify-center"
              style={{
                height: WHEEL_ITEM,
                scrollSnapAlign: "center",
                opacity: Math.max(0.16, 1 - abs * 0.4),
                transform: `rotateX(${Math.max(-52, Math.min(52, offset * 16))}deg)`,
              }}
            >
              <span
                className={cn(
                  "font-display text-xl font-bold tabular-nums tracking-tight",
                  standard
                    ? selected
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-emerald-600/55 dark:text-emerald-400/55"
                    : selected
                      ? "text-primary"
                      : "text-muted-foreground",
                )}
              >
                {format(option)}
              </span>
            </button>
          );
        })}
        <div style={{ height: WHEEL_PAD }} aria-hidden />
      </div>
    </div>
  );
}

export function GreaseTrapCalculator() {
  const [gpm, setGpm] = useState<GpmOption>(17);
  const [unit, setUnit] = useState<SizeUnit>("in");
  const size = useMemo(() => recommendGreaseTrapSize(gpm), [gpm]);
  const catalog = size.catalogProduct;
  const quoteHref = greaseTrapQuoteHref(gpm, size.heightIn, size.sizeLabel.replace(/ × /g, "x"));

  return (
    <section id="calculator" className="mb-16 scroll-mt-28">
      <div className="mb-6 max-w-2xl">
        <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
          What Size Grease Trap Do I Need?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Spin the flow wheel. 17, 34, and 120 GPM are the three sizes we usually make — those land
          on the catalog tank. Other flows stay rectangular in the same length-to-width ratios
          (22″ × 15″, 24″ × 18″, or 48″ × 24″), with a recommended height. If you already have a
          drawing, upload it with the quote.
        </p>
      </div>

      <div className="layer-1 space-y-5 rounded-2xl p-5 md:p-7">
        <div className="grid gap-4 md:grid-cols-[minmax(13rem,16rem)_minmax(0,1fr)] md:items-stretch">
          <div className="flex flex-col">
            <p className="mb-2 flex h-9 items-center text-sm font-medium text-foreground">Flow</p>
            <div className="layer-2 relative flex min-h-[260px] flex-1 items-center overflow-hidden rounded-xl">
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-x-3 top-1/2 z-10 h-[52px] -translate-y-1/2 rounded-lg border",
                  catalog
                    ? "border-emerald-600/40 bg-emerald-600/10 dark:border-emerald-400/40 dark:bg-emerald-400/10"
                    : "border-primary/40 bg-primary/10",
                )}
              />
              <WheelPicker<GpmOption>
                idPrefix="gpm"
                ariaLabel="Required flow in GPM"
                options={gpmOptions}
                value={gpm}
                onChange={setGpm}
                format={(option) => `${option} GPM`}
                isStandard={(option) => standardGreaseTrapGpms.has(option)}
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="mb-2 flex h-9 items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">Recommended size</p>
              <div className="flex flex-wrap justify-end gap-1.5" role="group" aria-label="Dimension units">
                {sizeUnits.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setUnit(item.id)}
                    className={cn(
                      "min-h-8 rounded-full border px-3 text-xs font-medium uppercase tracking-wide transition-colors",
                      unit === item.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="layer-2 flex min-h-[260px] flex-1 flex-col rounded-xl p-5">
              <p className="h-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {catalog ? "Standard Moon Steel model" : "Recommended custom size"}
              </p>
              <p
                className={cn(
                  "mt-1 h-8 truncate font-display text-2xl font-bold leading-8",
                  catalog ? "text-emerald-600 dark:text-emerald-400" : "text-primary",
                )}
              >
                {catalog ? catalog.name : `${gpm} GPM custom`}
              </p>
              <p className="mt-1 h-5 truncate text-sm tabular-nums text-muted-foreground">
                {formatInchesValue(size.lengthIn, unit)} × {formatInchesValue(size.widthIn, unit)} ×{" "}
                {formatInchesValue(size.heightIn, unit)} · ~{size.grossGal} gal
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {(
                  [
                    ["Length", formatInchesValue(size.lengthIn, unit)],
                    ["Width", formatInchesValue(size.widthIn, unit)],
                    ["Height", formatInchesValue(size.heightIn, unit)],
                    ["Inlet", formatProductPipe(size.inletIn, unit)],
                    ["Outlet", formatProductPipe(size.outletIn, unit)],
                    ["Flow", `${gpm} GPM`],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-muted/40 px-3 py-2">
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
                    <dd className="h-5 truncate text-sm font-bold tabular-nums text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-xs leading-5 text-muted-foreground">
                {catalog
                  ? `One of the three sizes we usually make. ${catalog.application}.`
                  : "Custom rectangular size for this flow, using the same length-to-width ratio as our usual tanks."}
              </p>
              <div className="mt-auto flex flex-wrap gap-3 pt-5">
                <Link
                  href={quoteHref}
                  className="inline-flex h-10 min-w-[9.5rem] items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Get quote
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {catalog ? (
                  <Link
                    href={getCatalogProductPath(catalog.slug)}
                    onClick={() =>
                      rememberProductBackLink({ href: "/grease-traps", label: "grease traps" })
                    }
                    className="inline-flex h-10 min-w-[9.5rem] items-center justify-center rounded-full border border-border px-5 text-sm font-bold text-foreground transition-colors hover:border-primary/40"
                  >
                    View product
                  </Link>
                ) : (
                  <Link
                    href={quoteHref}
                    className="inline-flex h-10 min-w-[9.5rem] items-center justify-center rounded-full border border-border px-5 text-sm font-bold text-foreground transition-colors hover:border-primary/40"
                  >
                    Upload drawings
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Sizing guidance only. Final grease trap selection should comply with the applicable
          plumbing authority, project specifications, and local requirements.
        </p>
      </div>
    </section>
  );
}
