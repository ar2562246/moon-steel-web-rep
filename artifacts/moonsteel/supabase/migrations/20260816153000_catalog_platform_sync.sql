-- Manual product catalog sync / publishing.
-- Additive: does not replace catalog_products. External IDs live in product_platform_sync.
-- Run in Supabase SQL editor after catalog.sql.

-- Optional commerce fields used by external catalogs. Website display does not require them.
alter table public.catalog_products
  add column if not exists sku text,
  add column if not exists price numeric(12, 2),
  add column if not exists currency text not null default 'PKR',
  add column if not exists availability text not null default 'in_stock';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'catalog_products_availability_check'
  ) then
    alter table public.catalog_products
      add constraint catalog_products_availability_check
      check (availability in ('in_stock', 'out_of_stock', 'preorder', 'available_for_order'));
  end if;
end $$;

create unique index if not exists catalog_products_sku_unique
  on public.catalog_products (sku)
  where sku is not null and length(trim(sku)) > 0;

-- Connections (non-secret config only). Tokens live in platform_connection_secrets.
create table if not exists public.platform_connections (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  account_key text not null default 'default',
  display_name text not null default '',
  status text not null default 'disconnected'
    check (status in ('connected', 'disconnected', 'expired', 'error')),
  config jsonb not null default '{}'::jsonb,
  last_validated_at timestamptz,
  last_error text,
  connected_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, account_key)
);

create table if not exists public.platform_connection_secrets (
  connection_id uuid primary key references public.platform_connections(id) on delete cascade,
  credentials_encrypted text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.product_platform_sync (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.catalog_products(id) on delete set null,
  connection_id uuid references public.platform_connections(id) on delete set null,
  provider text not null,
  platform text not null,
  account_key text not null default 'default',
  external_product_id text,
  external_url text,
  status text not null default 'NOT_SYNCED'
    check (status in (
      'NOT_SYNCED',
      'SYNCING',
      'SYNCED',
      'UPDATE_REQUIRED',
      'FAILED',
      'UNPUBLISHED',
      'DISCONNECTED'
    )),
  content_hash text,
  last_synced_at timestamptz,
  last_attempted_at timestamptz,
  last_error text,
  last_error_code text,
  last_error_detail text,
  product_name text,
  product_slug text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists product_platform_sync_unique
  on public.product_platform_sync (product_id, platform, connection_id)
  where product_id is not null and connection_id is not null;

create unique index if not exists product_platform_sync_external_unique
  on public.product_platform_sync (connection_id, platform, external_product_id)
  where connection_id is not null and external_product_id is not null;

create index if not exists product_platform_sync_product_idx
  on public.product_platform_sync (product_id);

create index if not exists product_platform_sync_platform_idx
  on public.product_platform_sync (platform, status);

create table if not exists public.sync_jobs (
  id uuid primary key default gen_random_uuid(),
  action text not null
    check (action in ('SYNC', 'UNPUBLISH', 'DELETE', 'VALIDATE')),
  status text not null default 'QUEUED'
    check (status in ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')),
  product_scope text not null default 'selected'
    check (product_scope in ('selected', 'all')),
  platform_ids text[] not null default '{}',
  requested_by uuid references public.profiles(id) on delete set null,
  process_token text not null,
  total_items int not null default 0,
  processed_items int not null default 0,
  success_count int not null default 0,
  failed_count int not null default 0,
  skipped_count int not null default 0,
  started_at timestamptz,
  finished_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sync_jobs_status_idx on public.sync_jobs (status, created_at desc);

create table if not exists public.sync_job_items (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.sync_jobs(id) on delete cascade,
  product_id uuid references public.catalog_products(id) on delete set null,
  product_name text,
  product_slug text,
  provider text not null,
  platform text not null,
  connection_id uuid references public.platform_connections(id) on delete set null,
  action text not null
    check (action in ('CREATE', 'UPDATE', 'DELETE', 'UNPUBLISH', 'VALIDATE', 'SKIP')),
  status text not null default 'QUEUED'
    check (status in ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'SKIPPED')),
  attempt_count int not null default 0,
  external_product_id text,
  error text,
  error_code text,
  error_detail text,
  started_at timestamptz,
  finished_at timestamptz,
  duration_ms int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sync_job_items_job_status_idx
  on public.sync_job_items (job_id, status);

create table if not exists public.sync_logs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.sync_jobs(id) on delete set null,
  job_item_id uuid references public.sync_job_items(id) on delete set null,
  product_id uuid references public.catalog_products(id) on delete set null,
  product_name text,
  provider text not null,
  platform text not null,
  action text not null,
  status text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  external_product_id text,
  error text,
  error_code text,
  error_detail text,
  duration_ms int,
  created_at timestamptz not null default now()
);

create index if not exists sync_logs_created_idx on public.sync_logs (created_at desc);
create index if not exists sync_logs_product_idx on public.sync_logs (product_id, created_at desc);
create index if not exists sync_logs_platform_idx on public.sync_logs (platform, created_at desc);

create or replace function public.set_platform_sync_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists platform_connections_updated_at on public.platform_connections;
create trigger platform_connections_updated_at
  before update on public.platform_connections
  for each row execute function public.set_platform_sync_updated_at();

drop trigger if exists product_platform_sync_updated_at on public.product_platform_sync;
create trigger product_platform_sync_updated_at
  before update on public.product_platform_sync
  for each row execute function public.set_platform_sync_updated_at();

drop trigger if exists sync_jobs_updated_at on public.sync_jobs;
create trigger sync_jobs_updated_at
  before update on public.sync_jobs
  for each row execute function public.set_platform_sync_updated_at();

drop trigger if exists sync_job_items_updated_at on public.sync_job_items;
create trigger sync_job_items_updated_at
  before update on public.sync_job_items
  for each row execute function public.set_platform_sync_updated_at();

-- Mark existing SYNCED rows as UPDATE_REQUIRED when master catalog content changes.
-- Never publishes automatically.
create or replace function public.mark_catalog_sync_update_required()
returns trigger
language plpgsql
as $$
begin
  if (
    new.name is distinct from old.name
    or new.details is distinct from old.details
    or new.slug is distinct from old.slug
    or new.image_url is distinct from old.image_url
    or new.image_urls is distinct from old.image_urls
    or new.published is distinct from old.published
    or new.sku is distinct from old.sku
    or new.price is distinct from old.price
    or new.currency is distinct from old.currency
    or new.availability is distinct from old.availability
  ) then
    update public.product_platform_sync
    set
      status = 'UPDATE_REQUIRED',
      product_name = new.name,
      product_slug = new.slug,
      updated_at = now()
    where product_id = new.id
      and status in ('SYNCED');
  end if;
  return new;
end;
$$;

drop trigger if exists catalog_products_mark_sync_stale on public.catalog_products;
create trigger catalog_products_mark_sync_stale
  after update on public.catalog_products
  for each row execute function public.mark_catalog_sync_update_required();

create or replace function public.mark_catalog_sync_update_required_from_categories()
returns trigger
language plpgsql
as $$
declare
  target_product uuid;
begin
  target_product := coalesce(new.product_id, old.product_id);
  update public.product_platform_sync
  set status = 'UPDATE_REQUIRED', updated_at = now()
  where product_id = target_product
    and status in ('SYNCED');
  return coalesce(new, old);
end;
$$;

drop trigger if exists catalog_product_categories_mark_sync_stale on public.catalog_product_categories;
create trigger catalog_product_categories_mark_sync_stale
  after insert or delete on public.catalog_product_categories
  for each row execute function public.mark_catalog_sync_update_required_from_categories();

-- Snapshot name/slug before hard-delete so orphaned external listings remain manageable.
create or replace function public.snapshot_catalog_product_before_delete()
returns trigger
language plpgsql
as $$
begin
  update public.product_platform_sync
  set
    product_name = old.name,
    product_slug = old.slug,
    updated_at = now()
  where product_id = old.id;
  return old;
end;
$$;

drop trigger if exists catalog_products_snapshot_before_delete on public.catalog_products;
create trigger catalog_products_snapshot_before_delete
  before delete on public.catalog_products
  for each row execute function public.snapshot_catalog_product_before_delete();

alter table public.platform_connections enable row level security;
alter table public.platform_connection_secrets enable row level security;
alter table public.product_platform_sync enable row level security;
alter table public.sync_jobs enable row level security;
alter table public.sync_job_items enable row level security;
alter table public.sync_logs enable row level security;

-- Secrets: no policies. Only the service role (API routes) can read tokens.
drop policy if exists "Admins manage platform connections" on public.platform_connections;
create policy "Admins manage platform connections"
  on public.platform_connections for all
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

drop policy if exists "Admins manage product platform sync" on public.product_platform_sync;
create policy "Admins manage product platform sync"
  on public.product_platform_sync for all
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

drop policy if exists "Admins read sync jobs" on public.sync_jobs;
create policy "Admins read sync jobs"
  on public.sync_jobs for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins read sync job items" on public.sync_job_items;
create policy "Admins read sync job items"
  on public.sync_job_items for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins read sync logs" on public.sync_logs;
create policy "Admins read sync logs"
  on public.sync_logs for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
