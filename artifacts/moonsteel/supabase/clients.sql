-- Clients directory + client reference letters.
-- Requires profiles.sql for admin RLS policies.

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  industry text not null default 'Others',
  locations text,
  logo_url text,
  notes text,
  sort_order int not null default 100,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_industry_sort_idx
  on public.clients (industry, sort_order, name);

create index if not exists clients_published_idx
  on public.clients (published, industry);

create table if not exists public.client_references (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  client_name text not null,
  industry text not null default 'Others',
  issued_on date,
  quote text not null default '',
  image_url text not null,
  client_id uuid references public.clients (id) on delete set null,
  sort_order int not null default 100,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_references_sort_idx
  on public.client_references (sort_order, created_at);

create or replace function public.set_clients_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_client_references_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clients_updated_at on public.clients;
create trigger clients_updated_at
  before update on public.clients
  for each row execute function public.set_clients_updated_at();

drop trigger if exists client_references_updated_at on public.client_references;
create trigger client_references_updated_at
  before update on public.client_references
  for each row execute function public.set_client_references_updated_at();

alter table public.clients enable row level security;
alter table public.client_references enable row level security;

drop policy if exists "Public read published clients" on public.clients;
create policy "Public read published clients"
  on public.clients for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Admins manage clients" on public.clients;
create policy "Admins manage clients"
  on public.clients for all
  to authenticated
  using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

drop policy if exists "Public read published client references" on public.client_references;
create policy "Public read published client references"
  on public.client_references for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Admins manage client references" on public.client_references;
create policy "Admins manage client references"
  on public.client_references for all
  to authenticated
  using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

-- Storage for scanned reference letters
insert into storage.buckets (id, name, public)
values ('client-references', 'client-references', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read client references" on storage.objects;
create policy "Public read client references"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'client-references');

drop policy if exists "Admins upload client references" on storage.objects;
create policy "Admins upload client references"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'client-references'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins update client references" on storage.objects;
create policy "Admins update client references"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'client-references'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins delete client references" on storage.objects;
create policy "Admins delete client references"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'client-references'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
