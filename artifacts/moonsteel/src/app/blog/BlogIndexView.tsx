"use client";

import Link from "next/link";
import { ParentBackLink } from "@/components/layout/ParentBackLink";
import { CmsImage } from "@/components/ui/CmsImage";
import { formatBlogDate, getBlogCoverImageUrl, getBlogPath } from "@/features/blog/types";
import type { BlogPost } from "@/features/blog/types";

type BlogIndexViewProps = {
  posts: BlogPost[];
};

export function BlogIndexView({ posts }: BlogIndexViewProps) {
  return (
    <main className="layer-0 pb-20 pt-28">
      <div className="container mx-auto px-4 md:px-6">
        <ParentBackLink href="/" label="home" />
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <h1 className="apple-section-title mb-6 section-title-accent">Blog</h1>
          <p className="apple-section-copy">
            Notes on commercial stainless fabrication, material grades, and kitchen projects from
            the Moon Steel workshop in Karachi.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="layer-1 mx-auto max-w-xl rounded-2xl p-8 text-center">
            <p className="text-base text-muted-foreground">
              No posts published yet. Check back soon, or read our{" "}
              <Link href="/materials" className="text-primary hover:underline">
                materials guide
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const dateLabel = formatBlogDate(post.published_at ?? post.created_at);
              const coverSrc = getBlogCoverImageUrl(post);
              return (
                <li key={post.id}>
                  <Link
                    href={getBlogPath(post.slug)}
                    className="group layer-1 block overflow-hidden rounded-xl transition-colors hover:border-primary/40"
                  >
                    {coverSrc ? (
                      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                        <CmsImage
                          src={coverSrc}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : null}
                    <div className="space-y-3 p-6">
                      {dateLabel ? (
                        <p className="text-xs font-medium text-muted-foreground">{dateLabel}</p>
                      ) : null}
                      <h2 className="text-xl font-display font-semibold text-foreground transition-colors group-hover:text-primary">
                        {post.title}
                      </h2>
                      {post.excerpt ? (
                        <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
                      ) : null}
                      <span className="inline-flex text-sm text-primary">Read article</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
