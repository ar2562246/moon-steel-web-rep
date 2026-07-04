"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminTabKey } from "@/features/admin/types";
import { CustomerLogosTab } from "@/features/admin/components/CustomerLogosTab";
import { HeroImagesTab } from "@/features/admin/components/HeroImagesTab";
import { ProductCategoriesTab } from "@/features/admin/components/ProductCategoriesTab";
import { CatalogCategoriesTab } from "@/features/admin/components/CatalogCategoriesTab";
import { CatalogProductsTab } from "@/features/admin/components/CatalogProductsTab";
import { ProjectsTab } from "@/features/admin/components/ProjectsTab";
import { TestimonialsTab } from "@/features/admin/components/TestimonialsTab";

type TabConfig = {
  key: AdminTabKey;
  label: string;
  placeholder?: boolean;
};

const tabConfig: TabConfig[] = [
  { key: "customer-logos", label: "Customer Logos" },
  { key: "hero-images", label: "Hero Images" },
  { key: "products", label: "Product Lines" },
  { key: "categories", label: "Categories" },
  { key: "catalog-products", label: "Catalog Products" },
  { key: "projects", label: "Projects" },
  { key: "testimonials", label: "Testimonials" },
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

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="mb-4 h-auto w-full justify-start gap-2 overflow-x-auto rounded-lg p-1">
        {tabConfig.map((tab) => (
          <TabsTrigger key={tab.key} value={tab.key} className="shrink-0">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabConfig.map((tab) => (
        <TabsContent key={tab.key} value={tab.key}>
          {tab.key === "customer-logos" ? (
            <CustomerLogosTab />
          ) : tab.key === "hero-images" ? (
            <HeroImagesTab />
          ) : tab.key === "products" ? (
            <ProductCategoriesTab />
          ) : tab.key === "categories" ? (
            <CatalogCategoriesTab />
          ) : tab.key === "catalog-products" ? (
            <CatalogProductsTab />
          ) : tab.key === "projects" ? (
            <ProjectsTab />
          ) : tab.key === "testimonials" ? (
            <TestimonialsTab />
          ) : (
            <PlaceholderTab title={tab.label} />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
