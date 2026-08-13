import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { BlogPostView } from "@/app/blog/BlogPostView";
import { getPublishedBlogBySlug, listPublishedBlogSlugs } from "@/features/blog/queries";
import { getBlogCoverImageUrl } from "@/features/blog/types";
import { getPublishedCatalogProductsByIds } from "@/features/catalog/queries";
import { createSupabaseServerClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { breadcrumbJsonLd, ORGANIZATION_ID, toAbsoluteMediaUrl } from "@/lib/json-ld";
import { absoluteUrl, getSiteUrl } from "@/lib/site";

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
        title: post.title,
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

  const coverSrc = getBlogCoverImageUrl(post);
  const coverUrl = coverSrc ? toAbsoluteMediaUrl(coverSrc) : "";
  const postUrl = absoluteUrl(`/blog/${post.slug}`);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt || post.body.slice(0, 160),
          datePublished: post.published_at || post.created_at,
          dateModified: post.updated_at || post.published_at || post.created_at,
          ...(coverUrl ? { image: coverUrl } : {}),
          mainEntityOfPage: postUrl,
          author: {
            "@type": "Organization",
            "@id": ORGANIZATION_ID,
            name: "Moon Steel Fabricators",
          },
          publisher: {
            "@type": "Organization",
            "@id": ORGANIZATION_ID,
            name: "Moon Steel Fabricators",
          },
        }}
      />
      <BlogPostView post={post} linkedProducts={linkedProducts} />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
