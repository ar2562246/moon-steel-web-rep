import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { BlogPostView } from "@/app/blog/BlogPostView";
import { getPublishedBlogBySlug, listPublishedBlogSlugs } from "@/features/blog/queries";
import { getBlogCoverImageUrl } from "@/features/blog/types";
import { getPublishedCatalogProductsByIds } from "@/features/catalog/queries";
import { createSupabaseServerClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  if (!hasSupabaseServerEnv()) return [];
  try {
    const supabase = await createSupabaseServerClient();
    const rows = await listPublishedBlogSlugs(supabase);
    return rows.map((row) => ({ slug: row.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!hasSupabaseServerEnv()) {
    return { title: "Article" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const post = await getPublishedBlogBySlug(supabase, slug);
    if (!post) return { title: "Article not found" };

    const description = post.excerpt || post.body.slice(0, 160);
    const coverSrc = getBlogCoverImageUrl(post);
    return {
      title: post.title,
      description,
      alternates: {
        canonical: `/blog/${post.slug}`,
      },
      openGraph: {
        type: "article",
        url: `${siteUrl}/blog/${post.slug}`,
        title: `${post.title} | Moon Steel`,
        description,
        ...(coverSrc ? { images: [{ url: coverSrc, alt: post.title }] } : {}),
      },
    };
  } catch {
    return { title: "Article" };
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  if (!hasSupabaseServerEnv()) notFound();

  let post = null;
  let linkedProducts: Awaited<ReturnType<typeof getPublishedCatalogProductsByIds>> = [];
  try {
    const supabase = await createSupabaseServerClient();
    post = await getPublishedBlogBySlug(supabase, slug);
    if (post?.product_ids.length) {
      linkedProducts = await getPublishedCatalogProductsByIds(supabase, post.product_ids);
    }
  } catch {
    notFound();
  }

  if (!post) notFound();

  return (
    <>
      <BlogPostView post={post} linkedProducts={linkedProducts} />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
