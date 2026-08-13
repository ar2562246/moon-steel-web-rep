-- Link optional catalog product to a blog post for related-product CTA on /blog/[slug].

alter table public.blogs
  add column if not exists product_id uuid references public.catalog_products (id) on delete set null;

create index if not exists blogs_product_id_idx on public.blogs (product_id);
