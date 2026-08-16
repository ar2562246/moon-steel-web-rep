"use client";

import { useEffect, useId, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { PRODUCTION_SITE_URL } from "@/lib/site";
import { trackShare } from "@/lib/analytics/gtag";

type ShareProduct = {
  slug: string;
  name: string;
  path: string;
};

const buttonClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/80 bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary";

export function productSharePayload(product: ShareProduct) {
  const url = `${PRODUCTION_SITE_URL}${product.path.startsWith("/") ? product.path : `/${product.path}`}`;
  const text = `${product.name} — Moon Steel Fabricators`;
  return {
    url,
    text,
    message: `${text}\n${url}`,
  };
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.left = "-9999px";
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(field);
    return ok;
  }
}

function openWindow(href: string) {
  window.open(href, "_blank", "noopener,noreferrer");
}

export function ProductShareBar({ product, className }: { product: ShareProduct; className?: string }) {
  const { toast } = useToast();
  const gradientId = useId().replace(/:/g, "");
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const share = productSharePayload(product);

  useEffect(() => {
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  function recorded(method: string) {
    trackShare({ method, item_id: product.slug, item_name: product.name });
  }

  async function copyThenOpen(method: "instagram" | "google", href: string, description: string) {
    const ok = await copyText(share.message);
    recorded(method);
    toast({
      title: ok ? "Product link copied" : "Copy the product link",
      description,
    });
    openWindow(href);
  }

  async function onFacebook() {
    recorded("facebook");
    openWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(share.url)}`);
  }

  async function onWhatsApp() {
    recorded("whatsapp");
    openWindow(`https://wa.me/?text=${encodeURIComponent(share.message)}`);
  }

  async function onCopy() {
    const ok = await copyText(share.url);
    recorded("copy");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
    toast({
      title: ok ? "Link copied" : "Could not copy",
      description: share.url,
    });
  }

  async function onNativeShare() {
    if (!navigator.share) return;
    recorded("native");
    try {
      await navigator.share({ title: share.text, text: share.text, url: share.url });
    } catch {
      // User cancelled the sheet.
    }
  }

  return (
    <div className={className}>
      <p className="sr-only">Share this product</p>
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        {canNativeShare ? (
          <button type="button" className={buttonClass} onClick={() => void onNativeShare()} aria-label="Share with device apps">
            <ShareGlyph />
          </button>
        ) : null}
        <button type="button" className={buttonClass} onClick={() => void onFacebook()} aria-label="Share on Facebook">
          <FacebookGlyph />
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() =>
            void copyThenOpen(
              "instagram",
              "https://www.instagram.com/",
              "Paste it into an Instagram post, story, or reel. Instagram does not allow websites to publish for you.",
            )
          }
          aria-label="Share on Instagram"
        >
          <InstagramGlyph gradientId={gradientId} />
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() =>
            void copyThenOpen(
              "google",
              "https://business.google.com/posts",
              "Paste the product into a Google Business Profile post. Google does not allow websites to publish that post for you.",
            )
          }
          aria-label="Share to a Google Business Profile post"
        >
          <GoogleGlyph />
        </button>
        <button type="button" className={buttonClass} onClick={() => void onWhatsApp()} aria-label="Share on WhatsApp">
          <WhatsAppGlyph />
        </button>
        <button type="button" className={buttonClass} onClick={() => void onCopy()} aria-label="Copy product link">
          {copied ? <CheckGlyph /> : <CopyGlyph />}
        </button>
      </div>
    </div>
  );
}

function ShareGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M18 8a3 3 0 1 0-2.83-4H15a3 3 0 0 0 .17 1H8.83A3.001 3.001 0 1 0 6 9c.46 0 .89-.1 1.28-.29l6.1 3.56A3 3 0 0 0 13 14a3 3 0 0 0 .17 1l-6.1 3.56A3 3 0 1 0 9 21c0-.35-.06-.68-.17-1h6.34c.11.32.17.65.17 1a3 3 0 1 0 2.83-4 3 3 0 0 0-1.28.29l-6.1-3.56c.08-.23.13-.48.13-.73s-.05-.5-.13-.73l6.1-3.56A3 3 0 0 0 18 8Z"
      />
    </svg>
  );
}

function FacebookGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        fill="#FFFFFF"
        d="M13.66 20v-7.3h2.45l.37-2.85h-2.82V8.03c0-.83.23-1.39 1.43-1.39h1.53V4.08c-.27-.03-1.18-.08-2.23-.08-2.2 0-3.7 1.34-3.7 3.82v2.03H8.2v2.85h2.48V20h2.98z"
      />
    </svg>
  );
}

function InstagramGlyph({ gradientId }: { gradientId: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F58529" />
          <stop offset="40%" stopColor="#DD2A7B" />
          <stop offset="75%" stopColor="#8134AF" />
          <stop offset="100%" stopColor="#515BD4" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill={`url(#${gradientId})`} />
      <circle cx="12" cy="12" r="4.25" stroke="#FFFFFF" strokeWidth="2" fill="none" />
      <circle cx="17.2" cy="6.8" r="1.25" fill="#FFFFFF" />
    </svg>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.74-.07-1.45-.19-2.13H12v4.03h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.99-4.31 2.99-7.42Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.62-2.35l-3.23-2.5c-.9.6-2.04.96-3.39.96-2.6 0-4.81-1.76-5.6-4.12H3.07v2.58A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.99A6.01 6.01 0 0 1 6.08 12c0-.69.12-1.36.32-1.99V7.43H3.07A10 10 0 0 0 2 12c0 1.61.39 3.14 1.07 4.57l3.33-2.58Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.96c1.47 0 2.78.5 3.82 1.5l2.86-2.86C16.95 2.97 14.7 2 12 2A10 10 0 0 0 3.07 7.43l3.33 2.58C7.19 7.72 9.4 5.96 12 5.96Z"
      />
    </svg>
  );
}

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <circle cx="12" cy="12" r="11" fill="#25D366" />
      <path
        fill="#FFFFFF"
        d="M17.34 14.15c-.28-.14-1.63-.8-1.88-.89-.25-.09-.43-.14-.61.14-.18.28-.7.89-.86 1.08-.16.18-.31.21-.58.07-.28-.14-1.17-.43-2.23-1.36-.82-.73-1.38-1.62-1.54-1.9-.16-.28-.02-.43.12-.57.12-.12.28-.31.42-.46.14-.16.18-.28.28-.46.09-.18.05-.35-.02-.5-.07-.14-.61-1.47-.84-2.02-.22-.52-.45-.45-.61-.45h-.52c-.18 0-.46.07-.7.35-.24.28-.91.89-.91 2.16s.93 2.5 1.06 2.67c.14.18 1.81 2.75 4.38 3.85.61.26 1.09.42 1.46.54.61.19 1.17.16 1.61.1.49-.07 1.63-.67 1.86-1.32.23-.65.23-1.21.16-1.32-.07-.12-.25-.19-.52-.33Z"
      />
    </svg>
  );
}

function CopyGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}
