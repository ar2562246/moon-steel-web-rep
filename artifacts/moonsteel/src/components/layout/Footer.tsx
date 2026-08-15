import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { TrackedContactLink } from "@/components/analytics/TrackedContactLink";
import {
  EMAIL,
  GOOGLE_MAPS_HREF,
  PHONE_DISPLAY,
  PHONE_TEL,
  STREET_ADDRESS,
  WHATSAPP_DISPLAY,
  WHATSAPP_HREF,
} from "@/lib/contact/details";
const logoUrl = "/ms3-logo.svg";

export function Footer() {
  return (
    <footer className="bg-muted text-foreground pt-16 pb-8 border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img
                src={logoUrl}
                alt="Moon Steel Fabricators"
                width={40}
                height={40}
                loading="lazy"
                decoding="async"
                className="w-10 h-10 object-contain"
              />
              <div className="leading-none text-center">
                <span className="moonsteel-wordmark block font-display font-semibold text-xl tracking-tight text-foreground">
                  MOON-STEEL
                </span>
                <span className="moonsteel-subline hidden mt-1 text-[10px] font-medium text-muted-foreground">
                  FABRICATORS
                </span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              AISI 304 and AISI 316 stainless steel equipment for commercial kitchens, hospitals, and industrial facilities. Manufactured in Karachi. Built and supplied across Pakistan.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://www.facebook.com/moonsteelfab"
                target="_blank"
                rel="noreferrer"
                aria-label="Moon Steel on Facebook"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border/80 bg-layer-1 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0"
                  fill="none"
                >
                  <circle cx="12" cy="12" r="12" fill="#1877F2" />
                  <path
                    fill="#FFFFFF"
                    d="M13.66 20v-7.3h2.45l.37-2.85h-2.82V8.03c0-.83.23-1.39 1.43-1.39h1.53V4.08c-.27-.03-1.18-.08-2.23-.08-2.2 0-3.7 1.34-3.7 3.82v2.03H8.2v2.85h2.48V20h2.98z"
                  />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/moonsteelfab/"
                target="_blank"
                rel="noreferrer"
                aria-label="Moon Steel on Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border/80 bg-layer-1 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0"
                  fill="none"
                >
                  <defs>
                    <linearGradient id="instagramGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#F58529" />
                      <stop offset="40%" stopColor="#DD2A7B" />
                      <stop offset="75%" stopColor="#8134AF" />
                      <stop offset="100%" stopColor="#515BD4" />
                    </linearGradient>
                  </defs>
                  <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#instagramGradient)" />
                  <circle cx="12" cy="12" r="4.25" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="17.2" cy="6.8" r="1.25" fill="#FFFFFF" />
                </svg>
              </a>
              <a
                href={GOOGLE_MAPS_HREF}
                target="_blank"
                rel="noreferrer"
                aria-label="Moon Steel on Google"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border/80 bg-layer-1 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0">
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
              </a>
              <TrackedContactLink
                method="whatsapp"
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noreferrer"
                aria-label="Chat with Moon Steel on WhatsApp"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border/80 bg-layer-1 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0"
                  fill="none"
                >
                  <circle cx="12" cy="12" r="11" fill="#25D366" />
                  <path
                    fill="#FFFFFF"
                    d="M17.34 14.15c-.28-.14-1.63-.8-1.88-.89-.25-.09-.43-.14-.61.14-.18.28-.7.89-.86 1.08-.16.18-.31.21-.58.07-.28-.14-1.17-.43-2.23-1.36-.82-.73-1.38-1.62-1.54-1.9-.16-.28-.02-.43.12-.57.12-.12.28-.31.42-.46.14-.16.18-.28.28-.46.09-.18.05-.35-.02-.5-.07-.14-.61-1.47-.84-2.02-.22-.52-.45-.45-.61-.45h-.52c-.18 0-.46.07-.7.35-.24.28-.91.89-.91 2.16s.93 2.5 1.06 2.67c.14.18 1.81 2.75 4.38 3.85.61.26 1.09.42 1.46.54.61.19 1.17.16 1.61.1.49-.07 1.63-.67 1.86-1.32.23-.65.23-1.21.16-1.32-.07-.12-.25-.19-.52-.33Z"
                  />
                </svg>
              </TrackedContactLink>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-6 text-sm">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <a
                  href={GOOGLE_MAPS_HREF}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {STREET_ADDRESS}<br />
                  Karachi-Pakistan
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <TrackedContactLink method="phone" href={`tel:${PHONE_TEL}`} className="hover:text-primary transition-colors">{PHONE_DISPLAY}</TrackedContactLink>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0"
                  fill="none"
                >
                  <circle cx="12" cy="12" r="11" fill="#25D366" />
                  <path
                    fill="#FFFFFF"
                    d="M17.34 14.15c-.28-.14-1.63-.8-1.88-.89-.25-.09-.43-.14-.61.14-.18.28-.7.89-.86 1.08-.16.18-.31.21-.58.07-.28-.14-1.17-.43-2.23-1.36-.82-.73-1.38-1.62-1.54-1.9-.16-.28-.02-.43.12-.57.12-.12.28-.31.42-.46.14-.16.18-.28.28-.46.09-.18.05-.35-.02-.5-.07-.14-.61-1.47-.84-2.02-.22-.52-.45-.45-.61-.45h-.52c-.18 0-.46.07-.7.35-.24.28-.91.89-.91 2.16s.93 2.5 1.06 2.67c.14.18 1.81 2.75 4.38 3.85.61.26 1.09.42 1.46.54.61.19 1.17.16 1.61.1.49-.07 1.63-.67 1.86-1.32.23-.65.23-1.21.16-1.32-.07-.12-.25-.19-.52-.33Z"
                  />
                </svg>
                <TrackedContactLink
                  method="whatsapp"
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  WhatsApp {WHATSAPP_DISPLAY}
                </TrackedContactLink>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <TrackedContactLink method="email" href={`mailto:${EMAIL}`} className="hover:text-primary transition-colors">{EMAIL}</TrackedContactLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-6 text-sm">Hours</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Clock className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="text-foreground font-medium mb-1">Monday - Saturday</p>
                  <p>9:00 AM - 6:00 PM</p>
                  <p className="mt-2 text-foreground font-medium mb-1">Sunday</p>
                  <p>Closed</p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-6 text-sm">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</a></li>
              <li><a href="/grease-traps" className="text-sm text-muted-foreground hover:text-primary transition-colors">Grease Traps</a></li>
              <li><a href="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">Products & Specs</a></li>
              <li><a href="/materials" className="text-sm text-muted-foreground hover:text-primary transition-colors">Materials Guide</a></li>
              <li><a href="/clients" className="text-sm text-muted-foreground hover:text-primary transition-colors">Clients</a></li>
              <li><a href="/process" className="text-sm text-muted-foreground hover:text-primary transition-colors">Process</a></li>
              <li><a href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
              <li><a href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</a></li>
              <li><a href="/collaboration/food-fusion" className="text-sm text-muted-foreground hover:text-primary transition-colors">Food Fusion Collab</a></li>
              <li><a href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Request a Quote</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Moon Steel Fabricators. All rights reserved.</p>
        </div>
      </div>

    </footer>
  );
}