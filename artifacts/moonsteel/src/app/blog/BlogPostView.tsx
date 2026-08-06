"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CmsImage } from "@/components/ui/CmsImage";
import { formatBlogDate } from "@/features/blog/types";
import type { BlogPost } from "@/features/blog/types";

type BlogPostViewProps = {
  post: BlogPost;
};

export function BlogPostView({ post }: BlogPostViewProps) {
  const dateLabel = formatBlogDate(post.published_at ?? post.created_at);

  return (
    <main className="layer-0 pb-20 pt-28">
      <article className="container mx-auto px-4 md:px-6">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>

        <div className="mx-auto max-w-3xl">
          {dateLabel ? (
            <p className="mb-3 text-sm font-medium text-muted-foreground">{dateLabel}</p>
          ) : null}
          <h1 className="apple-section-title mb-6 section-title-accent">{post.title}</h1>
          {post.excerpt ? (
            <p className="mb-10 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
          ) : null}

          {post.cover_image_url ? (
            <div className="relative mb-10 aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
              <CmsImage
                src={post.cover_image_url}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          ) : null}

          <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
            {post.body}
          </div>

          <div className="mt-14 border-t border-border pt-8">
            <p className="mb-4 text-sm text-muted-foreground">
              Specifying stainless for a commercial kitchen? Start with our materials guide.
            </p>
            <Link
              href="/materials"
              className="inline-flex text-sm font-medium text-primary hover:underline"
            >
              Read SS 304 material guide
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
