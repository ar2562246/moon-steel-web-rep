"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CmsImage } from "@/components/ui/CmsImage";
import { formatBlogDate, getBlogCoverImageUrl } from "@/features/blog/types";
import type { BlogPost } from "@/features/blog/types";
import { getCatalogProductCover, getCatalogProductPath } from "@/features/catalog/paths";
import type { CatalogProduct } from "@/features/catalog/types";

type BlogPostViewProps = {
  post: BlogPost;
  linkedProducts?: CatalogProduct[];
};

export function BlogPostView({ post, linkedProducts = [] }: BlogPostViewProps) {
  const dateLabel = formatBlogDate(post.published_at ?? post.created_at);
  const hasProducts = linkedProducts.length > 0;
  const coverSrc = getBlogCoverImageUrl(post, linkedProducts);

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

          {coverSrc ? (
            <div className="relative mb-10 aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
              <CmsImage
                src={coverSrc}
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

          {hasProducts ? (
            <div className="mt-14 border-t border-border pt-8">
              <p className="mb-4 text-sm font-medium text-muted-foreground">
                {linkedProducts.length === 1 ? "Related product" : "Related products"}
              </p>
              <div className="grid gap-3">
                {linkedProducts.map((product) => {
                  const productCover = getCatalogProductCover(product);
                  return (
                    <Link
                      key={product.id}
                      href={getCatalogProductPath(product.slug)}
                      className="group flex gap-4 overflow-hidden rounded-2xl border border-border bg-muted/30 transition-colors hover:border-primary/40 hover:bg-muted/50"
                    >
                      {productCover ? (
                        <div className="relative aspect-square w-28 shrink-0 bg-muted sm:w-36">
                          <CmsImage
                            src={productCover}
                            alt=""
                            fill
                            sizes="144px"
                            className="object-cover"
                          />
                        </div>
                      ) : null}
                      <div className="flex min-w-0 flex-1 flex-col justify-center py-4 pr-4">
                        <p className="truncate text-base font-medium text-foreground group-hover:text-primary">
                          {product.name}
                        </p>
                        {product.details ? (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {product.details}
                          </p>
                        ) : null}
                        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                          View product
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className={`${hasProducts ? "mt-10" : "mt-14"} border-t border-border pt-8`}>
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
