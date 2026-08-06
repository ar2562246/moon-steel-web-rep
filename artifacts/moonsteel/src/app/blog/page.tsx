import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { BlogIndexView } from "@/app/blog/BlogIndexView";
import { listPublishedBlogs } from "@/features/blog/queries";
import type { BlogPost } from "@/features/blog/types";
import { createSupabaseServerClient, hasSupabaseServerEnv } from "@/lib/supabase/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://moonsteelfab.com";

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
  title: "Blog",
  description:
    "Articles on commercial stainless steel fabrication, material grades, and kitchen projects from Moon Steel Fabricators.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/blog`,
    title: "Blog | Moon Steel",
    description:
      "Notes on stainless fabrication, SS 304, and commercial kitchen projects from Karachi.",
  },
};

export default async function BlogPage() {
  const posts = await resolveBlogPosts();

  return (
    <>
      <BlogIndexView posts={posts} />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
