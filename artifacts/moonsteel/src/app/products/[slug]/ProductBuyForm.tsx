"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trackGenerateLead } from "@/lib/analytics/gtag";
import type { CatalogProduct } from "@/features/catalog/types";

function formatPkr(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProductBuyForm({ product }: { product: CatalogProduct }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const listedPrice = typeof product.price === "number" && product.price > 0 ? product.price : null;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (String(data.get("website") ?? "")) return;

    const fullName = String(data.get("fullName") ?? "").trim();
    const company = String(data.get("company") ?? "").trim() || "Individual";
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const quantity = String(data.get("quantity") ?? "1").trim() || "1";
    const city = String(data.get("city") ?? "").trim();
    const notes = String(data.get("notes") ?? "").trim();

    const message = [
      `Buy order for ${product.name}.`,
      `Product URL: https://moonsteelfab.com${product.path}`,
      `SKU/slug: ${product.sku || product.slug}`,
      `Quantity: ${quantity}`,
      listedPrice ? `Listed price: ${formatPkr(listedPrice)}` : "Listed price: confirm on order.",
      city ? `Delivery city: ${city}` : null,
      notes ? `Notes: ${notes}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    setBusy(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          company,
          phone,
          email,
          projectType: "catalog-order",
          message,
          website: "",
        }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.error || "Could not place this order. Call or WhatsApp us to complete it.");
      }
      trackGenerateLead({ method: "product_buy", project_type: "catalog-order" });
      setDone(true);
      form.reset();
      toast({
        title: "Order received",
        description: "We will confirm price, lead time, and payment within 24 hours.",
      });
    } catch (error) {
      toast({
        title: "Could not complete order",
        description: error instanceof Error ? error.message : "Try again, or use WhatsApp / phone.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div id="buy" className="scroll-mt-28 space-y-4">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground">Buy this product</h2>
        {listedPrice ? (
          <p className="text-2xl font-display font-semibold text-foreground">{formatPkr(listedPrice)}</p>
        ) : (
          <p className="text-lg font-display font-semibold text-foreground">Price confirmed on order</p>
        )}
        <p className="text-xs text-muted-foreground">
          {product.availability === "out_of_stock"
            ? "Currently unavailable. Submit the form and we will confirm the next making slot."
            : "In Pakistan. Factory collection in Karachi or delivery quoted on the order."}
        </p>
      </div>

      {done ? (
        <p className="rounded-lg border border-border bg-background/70 px-3 py-3 text-sm text-muted-foreground">
          Order received for {product.name}. We will contact you to confirm payment and delivery.
        </p>
      ) : (
        <form className="space-y-3" onSubmit={onSubmit}>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`buy-name-${product.slug}`}>Name</Label>
              <Input id={`buy-name-${product.slug}`} name="fullName" required minLength={2} autoComplete="name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`buy-phone-${product.slug}`}>Phone</Label>
              <Input id={`buy-phone-${product.slug}`} name="phone" required minLength={10} autoComplete="tel" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`buy-email-${product.slug}`}>Email</Label>
              <Input id={`buy-email-${product.slug}`} name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`buy-company-${product.slug}`}>Company</Label>
              <Input id={`buy-company-${product.slug}`} name="company" autoComplete="organization" placeholder="Optional" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`buy-qty-${product.slug}`}>Quantity</Label>
              <Input id={`buy-qty-${product.slug}`} name="quantity" type="number" min={1} defaultValue={1} required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`buy-city-${product.slug}`}>City / delivery</Label>
              <Input id={`buy-city-${product.slug}`} name="city" placeholder="Karachi factory collection or your city" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`buy-notes-${product.slug}`}>Order notes</Label>
              <Textarea
                id={`buy-notes-${product.slug}`}
                name="notes"
                rows={3}
                placeholder="Standard catalog model as listed, or describe a custom size / drawing."
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Placing order…" : "Buy"}
          </Button>
        </form>
      )}

      <p className="text-xs text-muted-foreground">
        Standard catalog models can be returned within 7 days. Custom and made-to-spec equipment is not returnable.{" "}
        <Link href="/returns" className="text-foreground underline-offset-4 hover:underline">
          Return and refund policy
        </Link>
        .
      </p>
    </div>
  );
}
