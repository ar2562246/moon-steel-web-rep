-- Catalog: categories, products, many-to-many links, storage, RLS, seed data.
-- Run in Supabase SQL editor after projects.sql (or standalone).

create table if not exists public.catalog_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  sort_order int not null default 100,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  details text not null default '',
  image_url text not null default '',
  image_urls text[] not null default '{}',
  sort_order int not null default 100,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_product_categories (
  product_id uuid not null references public.catalog_products(id) on delete cascade,
  category_id uuid not null references public.catalog_categories(id) on delete cascade,
  primary key (product_id, category_id)
);

create index if not exists catalog_categories_sort_idx on public.catalog_categories (sort_order, created_at);
create index if not exists catalog_categories_slug_idx on public.catalog_categories (slug);
create index if not exists catalog_products_sort_idx on public.catalog_products (sort_order, created_at);
create index if not exists catalog_products_slug_idx on public.catalog_products (slug);
create index if not exists catalog_product_categories_category_idx on public.catalog_product_categories (category_id);

create or replace function public.set_catalog_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists catalog_categories_updated_at on public.catalog_categories;
create trigger catalog_categories_updated_at
  before update on public.catalog_categories
  for each row execute function public.set_catalog_updated_at();

drop trigger if exists catalog_products_updated_at on public.catalog_products;
create trigger catalog_products_updated_at
  before update on public.catalog_products
  for each row execute function public.set_catalog_updated_at();

alter table public.catalog_categories enable row level security;
alter table public.catalog_products enable row level security;
alter table public.catalog_product_categories enable row level security;

drop policy if exists "Public read published catalog categories" on public.catalog_categories;
create policy "Public read published catalog categories"
  on public.catalog_categories for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Admins manage catalog categories" on public.catalog_categories;
create policy "Admins manage catalog categories"
  on public.catalog_categories for all
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

drop policy if exists "Public read published catalog products" on public.catalog_products;
create policy "Public read published catalog products"
  on public.catalog_products for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Admins manage catalog products" on public.catalog_products;
create policy "Admins manage catalog products"
  on public.catalog_products for all
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

drop policy if exists "Public read catalog product category links" on public.catalog_product_categories;
create policy "Public read catalog product category links"
  on public.catalog_product_categories for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.catalog_products p
      where p.id = product_id and p.published = true
    )
    and exists (
      select 1 from public.catalog_categories c
      where c.id = category_id and c.published = true
    )
  );

drop policy if exists "Admins manage catalog product category links" on public.catalog_product_categories;
create policy "Admins manage catalog product category links"
  on public.catalog_product_categories for all
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

insert into storage.buckets (id, name, public)
values ('catalog-product-images', 'catalog-product-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read catalog product images" on storage.objects;
create policy "Public read catalog product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'catalog-product-images');

drop policy if exists "Admins upload catalog product images" on storage.objects;
create policy "Admins upload catalog product images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'catalog-product-images'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins update catalog product images" on storage.objects;
create policy "Admins update catalog product images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'catalog-product-images'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins delete catalog product images" on storage.objects;
create policy "Admins delete catalog product images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'catalog-product-images'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Seed categories (skip if slug exists)
insert into public.catalog_categories (slug, name, description, sort_order)
select * from (values
  ('work-tables', 'Work Tables & Prep Stations', 'Heavy-duty stainless prep tables and workstations.', 10),
  ('commercial-sinks', 'Commercial Sink Units', 'Single, double, and triple compartment sink systems.', 20),
  ('exhaust-hoods', 'Exhaust Hoods & Ventilation', 'Canopy and island hoods with baffle filtration.', 30),
  ('shelving-storage', 'Shelving & Storage', 'Wall shelves, racks, and enclosed storage cabinets.', 40),
  ('grease-traps', 'Grease Traps & Interceptors', 'Watertight interceptors for commercial drainage.', 50),
  ('trolleys-dispensers', 'Trolleys & Dispensers', 'GN pan trolleys and service carts.', 60)
) as seed(slug, name, description, sort_order)
where not exists (select 1 from public.catalog_categories c where c.slug = seed.slug);

-- Seed sample products linked to categories
insert into public.catalog_products (slug, name, details, image_url, image_urls, sort_order)
select seed.slug, seed.name, seed.details, seed.image_url, array[seed.image_url], seed.sort_order
from (values
  (
    'stainless-steel-work-table',
    'Stainless Steel Work Table',
    'SS 304 work table with reinforced under-bracing, adjustable bullet feet, and optional splashbacks. Built for high-volume commercial kitchens.',
    '/images/hero-kitchen-stainless.png',
    10
  ),
  (
    'triple-bowl-commercial-sink',
    'Triple Bowl Commercial Sink',
    'Fully welded SS 304 triple compartment sink with deep-drawn bowls, radiused corners, and integrated drainboards.',
    '/images/hero-kitchen-stainless.png',
    20
  ),
  (
    'canopy-exhaust-hood',
    'Canopy Exhaust Hood',
    'SS 304/430 canopy hood with baffle filters, grease cups, and integrated lighting for restaurant cooklines.',
    '/images/hero-kitchen-stainless.png',
    30
  )
) as seed(slug, name, details, image_url, sort_order)
where not exists (select 1 from public.catalog_products p where p.slug = seed.slug);

insert into public.catalog_product_categories (product_id, category_id)
select p.id, c.id
from public.catalog_products p
join public.catalog_categories c on (
  (p.slug = 'stainless-steel-work-table' and c.slug = 'work-tables')
  or (p.slug = 'triple-bowl-commercial-sink' and c.slug = 'commercial-sinks')
  or (p.slug = 'canopy-exhaust-hood' and c.slug = 'exhaust-hoods')
)
where not exists (
  select 1 from public.catalog_product_categories link
  where link.product_id = p.id and link.category_id = c.id
);
