import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { BlogIndexView } from "@/app/blog/BlogIndexView";
import { listPublishedBlogs } from "@/features/blog/queries";
import type { BlogPost } from "@/features/blog/types";
import { createSupabaseServerClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { absoluteUrl } from "@/lib/site";

async function resolveBlogPosts(): Promise<BlogPost[]> {
  if (!hasSupabaseServerEnv()) return [];
  try {
    const supabase = await createSupabaseServerClient();
    return await listPublishedBlogs(supabase);
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: "Commercial Kitchen Fabrication Notes",
  description:
    "Articles on commercial stainless steel fabrication, material grades, and kitchen projects from Moon Steel Fabricators.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/blog"),
    title: "Commercial Kitchen Fabrication Notes | Moon Steel Fabricators",
    description:
      "Notes on stainless fabrication, AISI 304 and 316, and commercial kitchen projects from Karachi.",
  },
};

export default async function BlogPage() {
  const posts = await resolveBlogPosts();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ])}
      />
      <BlogIndexView posts={posts} />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
