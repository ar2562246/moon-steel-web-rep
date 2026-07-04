-- CMS core tables: hero images, customer logos, product lines, site settings.
-- Requires profiles.sql. Run before or after projects.sql / catalog.sql.

create table if not exists public.hero_images (
  id uuid primary key default gen_random_uuid(),
  slot int unique not null,
  image_url text not null,
  label text,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_logos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  specs text not null default '',
  description text not null default '',
  uses text not null default '',
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

create index if not exists product_categories_sort_idx on public.product_categories (sort_order, created_at);

create or replace function public.set_product_categories_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists product_categories_updated_at on public.product_categories;
create trigger product_categories_updated_at
  before update on public.product_categories
  for each row execute function public.set_product_categories_updated_at();

alter table public.hero_images enable row level security;
alter table public.customer_logos enable row level security;
alter table public.product_categories enable row level security;
alter table public.site_settings enable row level security;

-- Public read (marketing site)
drop policy if exists "Public read hero images" on public.hero_images;
create policy "Public read hero images"
  on public.hero_images for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read customer logos" on public.customer_logos;
create policy "Public read customer logos"
  on public.customer_logos for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read product categories" on public.product_categories;
create policy "Public read product categories"
  on public.product_categories for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read site settings" on public.site_settings;
create policy "Public read site settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

-- Admin manage
drop policy if exists "Admins manage hero images" on public.hero_images;
create policy "Admins manage hero images"
  on public.hero_images for all
  to authenticated
  using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

drop policy if exists "Admins manage customer logos" on public.customer_logos;
create policy "Admins manage customer logos"
  on public.customer_logos for all
  to authenticated
  using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

drop policy if exists "Admins manage product categories" on public.product_categories;
create policy "Admins manage product categories"
  on public.product_categories for all
  to authenticated
  using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

drop policy if exists "Admins manage site settings" on public.site_settings;
create policy "Admins manage site settings"
  on public.site_settings for all
  to authenticated
  using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

-- Storage buckets
insert into storage.buckets (id, name, public)
values ('hero-images', 'hero-images', true)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('customer-logos', 'customer-logos', true)
on conflict (id) do update set public = excluded.public;

-- hero-images storage policies
drop policy if exists "Public read hero-images bucket" on storage.objects;
create policy "Public read hero-images bucket"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'hero-images');

drop policy if exists "Admins upload hero-images" on storage.objects;
create policy "Admins upload hero-images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'hero-images'
    and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

drop policy if exists "Admins update hero-images" on storage.objects;
create policy "Admins update hero-images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'hero-images'
    and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

drop policy if exists "Admins delete hero-images" on storage.objects;
create policy "Admins delete hero-images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'hero-images'
    and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

-- customer-logos storage policies
drop policy if exists "Public read customer-logos bucket" on storage.objects;
create policy "Public read customer-logos bucket"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'customer-logos');

drop policy if exists "Admins upload customer-logos" on storage.objects;
create policy "Admins upload customer-logos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'customer-logos'
    and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

drop policy if exists "Admins update customer-logos" on storage.objects;
create policy "Admins update customer-logos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'customer-logos'
    and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

drop policy if exists "Admins delete customer-logos" on storage.objects;
create policy "Admins delete customer-logos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'customer-logos'
    and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

insert into public.site_settings (key, value)
values ('logo_slider_speed', '52')
on conflict (key) do nothing;
