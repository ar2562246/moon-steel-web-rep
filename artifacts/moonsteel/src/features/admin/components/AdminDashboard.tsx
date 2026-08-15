"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminTabKey } from "@/features/admin/types";
import { AdminToolbar } from "@/features/admin/components/AdminToolbar";
import { CustomerLogosTab } from "@/features/admin/components/CustomerLogosTab";
import { HeroImagesTab } from "@/features/admin/components/HeroImagesTab";
import { ProductCategoriesTab } from "@/features/admin/components/ProductCategoriesTab";
import { CatalogCategoriesTab } from "@/features/admin/components/CatalogCategoriesTab";
import { CatalogProductsTab } from "@/features/admin/components/CatalogProductsTab";
import { ProjectsTab } from "@/features/admin/components/ProjectsTab";
import { TestimonialsTab } from "@/features/admin/components/TestimonialsTab";
import { BlogsTab } from "@/features/admin/components/BlogsTab";
import { InquiriesTab } from "@/features/admin/components/InquiriesTab";

type TabConfig = {
  key: AdminTabKey;
  label: string;
  shortLabel: string;
  placeholder?: boolean;
};

const tabConfig: TabConfig[] = [
  { key: "inquiries", label: "Inquiries", shortLabel: "Leads" },
  { key: "customer-logos", label: "Customer Logos", shortLabel: "Logos" },
  { key: "hero-images", label: "Hero Images", shortLabel: "Hero" },
  { key: "products", label: "Product Lines", shortLabel: "Lines" },
  { key: "categories", label: "Categories", shortLabel: "Categories" },
  { key: "catalog-products", label: "Catalog Products", shortLabel: "Products" },
  { key: "projects", label: "Projects", shortLabel: "Projects" },
  { key: "testimonials", label: "Testimonials", shortLabel: "Quotes" },
  { key: "blogs", label: "Blog", shortLabel: "Blog" },
];
const defaultTab: AdminTabKey = "customer-logos";
const tabKeys = new Set<AdminTabKey>(tabConfig.map((t) => t.key));

function PlaceholderTab({ title }: { title: string }) {
  return (
    <Card className="layer-1">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">This module is ready for future implementation.</p>
      </CardContent>
    </Card>
  );
}

function AdminTabBody({ tab }: { tab: AdminTabKey }) {
  if (tab === "inquiries") return <InquiriesTab />;
  if (tab === "customer-logos") return <CustomerLogosTab />;
  if (tab === "hero-images") return <HeroImagesTab />;
  if (tab === "products") return <ProductCategoriesTab />;
  if (tab === "categories") return <CatalogCategoriesTab />;
  if (tab === "catalog-products") return <CatalogProductsTab />;
  if (tab === "projects") return <ProjectsTab />;
  if (tab === "testimonials") return <TestimonialsTab />;
  if (tab === "blogs") return <BlogsTab />;
  const fallback = tabConfig.find((item) => item.key === tab);
  return <PlaceholderTab title={fallback?.label ?? "Admin"} />;
}

export function AdminDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = useMemo<AdminTabKey>(() => {
    const requested = searchParams.get("tab");
    if (!requested) return defaultTab;
    return tabKeys.has(requested as AdminTabKey) ? (requested as AdminTabKey) : defaultTab;
  }, [searchParams]);

  const onTabChange = (nextTab: string) => {
    if (!tabKeys.has(nextTab as AdminTabKey)) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", nextTab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const active = document.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
    const list = active?.closest('[role="tablist"]');
    if (!active || !list) return;
    const left = active.offsetLeft - list.clientWidth / 2 + active.offsetWidth / 2;
    list.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [activeTab]);

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="flex h-full min-h-0 flex-col overflow-hidden">
      <AdminToolbar
        nav={
          <TabsList className="flex h-9 min-w-0 flex-1 justify-start gap-1 overflow-x-auto overscroll-x-contain rounded-lg p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {tabConfig.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="min-h-7 shrink-0 px-2.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none sm:px-3 sm:text-sm"
              >
                <span className="lg:hidden">{tab.shortLabel}</span>
                <span className="hidden lg:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        }
      />

      <div className="min-h-0 flex-1 overflow-hidden [&_input]:text-base [&_textarea]:text-base md:[&_input]:text-sm md:[&_textarea]:text-sm">
        <TabsContent value={activeTab} className="mt-0 h-full min-h-0 overflow-hidden [&>*]:h-full [&>*]:min-h-0">
          <AdminTabBody tab={activeTab} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
