-- Blog posts CMS for /blog and /blog/[slug].
-- Requires profiles.sql for admin RLS policies.

create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  cover_image_url text not null default '',
  published boolean not null default false,
  published_at timestamptz,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_products (
  blog_id uuid not null references public.blogs (id) on delete cascade,
  product_id uuid not null references public.catalog_products (id) on delete cascade,
  sort_order int not null default 100,
  primary key (blog_id, product_id)
);

create index if not exists blog_products_product_id_idx on public.blog_products (product_id);
create index if not exists blog_products_blog_sort_idx on public.blog_products (blog_id, sort_order);

create index if not exists blogs_published_idx
  on public.blogs (published, published_at desc nulls last, sort_order, created_at desc);

create index if not exists blogs_slug_idx on public.blogs (slug);

create or replace function public.set_blogs_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blogs_updated_at on public.blogs;
create trigger blogs_updated_at
  before update on public.blogs
  for each row execute function public.set_blogs_updated_at();

alter table public.blogs enable row level security;

drop policy if exists "Public read published blogs" on public.blogs;
create policy "Public read published blogs"
  on public.blogs for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Admins read all blogs" on public.blogs;
create policy "Admins read all blogs"
  on public.blogs for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins insert blogs" on public.blogs;
create policy "Admins insert blogs"
  on public.blogs for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins update blogs" on public.blogs;
create policy "Admins update blogs"
  on public.blogs for update
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

drop policy if exists "Admins delete blogs" on public.blogs;
create policy "Admins delete blogs"
  on public.blogs for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

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

-- Storage bucket for blog cover images (public read).
insert into storage.buckets (id, name, public)
values ('blog-covers', 'blog-covers', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read blog covers" on storage.objects;
create policy "Public read blog covers"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'blog-covers');

drop policy if exists "Admins upload blog covers" on storage.objects;
create policy "Admins upload blog covers"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'blog-covers'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins update blog covers" on storage.objects;
create policy "Admins update blog covers"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'blog-covers'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins delete blog covers" on storage.objects;
create policy "Admins delete blog covers"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'blog-covers'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
