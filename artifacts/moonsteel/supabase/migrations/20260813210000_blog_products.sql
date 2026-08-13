-- Allow multiple catalog products per blog post.

create table if not exists public.blog_products (
  blog_id uuid not null references public.blogs (id) on delete cascade,
  product_id uuid not null references public.catalog_products (id) on delete cascade,
  sort_order int not null default 100,
  primary key (blog_id, product_id)
);

create index if not exists blog_products_product_id_idx on public.blog_products (product_id);
create index if not exists blog_products_blog_sort_idx on public.blog_products (blog_id, sort_order);

-- Migrate any existing single product_id links.
insert into public.blog_products (blog_id, product_id, sort_order)
select id, product_id, 100
from public.blogs
where product_id is not null
on conflict (blog_id, product_id) do nothing;

drop index if exists public.blogs_product_id_idx;

alter table public.blogs
  drop column if exists product_id;

alter table public.blog_products enable row level security;

drop policy if exists "Public read blog product links" on public.blog_products;
create policy "Public read blog product links"
  on public.blog_products for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.blogs b
      where b.id = blog_id and b.published = true
    )
  );

drop policy if exists "Admins manage blog product links" on public.blog_products;
create policy "Admins manage blog product links"
  on public.blog_products for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
