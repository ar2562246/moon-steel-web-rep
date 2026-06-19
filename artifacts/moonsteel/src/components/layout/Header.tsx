"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const logoUrl = "/ms3-logo.svg";

const navLinks = [
  { name: "Products", href: "/products", sectionId: "products" },
  { name: "Comparison", href: "#comparison", sectionId: "comparison" },
  { name: "Process", href: "#process", sectionId: "process" },
  { name: "Projects", href: "#projects", sectionId: "projects" },
] as const;

const homeSectionIds = ["comparison", "process", "projects"] as const;

function isNavLinkActive(sectionId: string, pathname: string, activeSection: string | null) {
  if (sectionId === "products") return pathname.startsWith("/products");
  if (sectionId === "projects") {
    return pathname.startsWith("/projects") || (pathname === "/" && activeSection === "projects");
  }
  if (pathname === "/") return activeSection === sectionId;
  return false;
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection(null);
      return;
    }

    const hash = window.location.hash.replace("#", "");
    if (hash && homeSectionIds.includes(hash as (typeof homeSectionIds)[number])) {
      setActiveSection(hash);
    }

    const elements = homeSectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0, 0.2, 0.45] }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);

  const scrollTo = useCallback((href: string) => {
    const el = document.querySelector(href);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  const navigate = useCallback(
    (href: string, sectionId: string) => {
      setMobileMenuOpen(false);

      if (href.startsWith("/")) {
        router.push(href);
        return;
      }

      if (pathname !== "/") {
        router.push(`/${href}`);
        return;
      }

      setActiveSection(sectionId);
      scrollTo(href);
    },
    [pathname, router, scrollTo]
  );

  useEffect(() => {
    if (pathname !== "/" || !window.location.hash) return;
    const id = window.location.hash.replace("#", "");
    if (!homeSectionIds.includes(id as (typeof homeSectionIds)[number])) return;

    setActiveSection(id);
    const timer = window.setTimeout(() => scrollTo(`#${id}`), 120);
    return () => window.clearTimeout(timer);
  }, [pathname, scrollTo]);

  const navLinkClass = (sectionId: string, mobile = false) =>
    cn(
      mobile
        ? "text-left text-lg font-medium py-2 border-b border-border/50 transition-colors"
        : "text-sm font-medium transition-colors",
      isNavLinkActive(sectionId, pathname, activeSection)
        ? "text-primary"
        : mobile
          ? "text-foreground hover:text-primary"
          : "text-muted-foreground hover:text-foreground"
    );

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b transition-[background-color,border-color,box-shadow,padding] duration-300",
        scrolled
          ? "border-border bg-background/80 py-3 shadow-sm backdrop-blur-xl"
          : "border-border/60 bg-background/65 py-5 backdrop-blur-xl"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
            <img src={logoUrl} alt="Moon Steel Fabricators" className="h-9 w-9 object-contain" />
            <div className="leading-none text-center">
              <span className="moonsteel-wordmark block font-display text-xl font-semibold tracking-tight text-foreground">
                MOON-STEEL
              </span>
              <span className="moonsteel-subline mt-1 hidden text-[10px] font-medium text-muted-foreground">
                FABRICATORS
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <button
                key={link.name}
                type="button"
                onClick={() => navigate(link.href, link.sectionId)}
                className={navLinkClass(link.sectionId)}
                aria-current={isNavLinkActive(link.sectionId, pathname, activeSection) ? "page" : undefined}
              >
                {link.name}
              </button>
            ))}
            <Button
              onClick={() => navigate("#contact", "contact")}
              className="bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Request Quote
            </Button>
          </nav>

          <button
            type="button"
            className="p-2 text-foreground md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="absolute left-0 right-0 top-full flex flex-col gap-4 border-b border-border bg-background px-4 py-4 shadow-sm md:hidden">
          {navLinks.map((link) => (
            <button
              key={link.name}
              type="button"
              onClick={() => navigate(link.href, link.sectionId)}
              className={navLinkClass(link.sectionId, true)}
              aria-current={isNavLinkActive(link.sectionId, pathname, activeSection) ? "page" : undefined}
            >
              {link.name}
            </button>
          ))}
          <Button
            onClick={() => navigate("#contact", "contact")}
            className="mt-2 w-full bg-primary font-medium text-primary-foreground"
          >
            Request Quote
          </Button>
        </div>
      ) : null}
    </header>
  );
}
