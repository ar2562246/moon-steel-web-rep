-- Contact form lead storage. Inserts are performed server-side via service role (API route).
-- Run after profiles.sql.

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  company text not null,
  phone text not null,
  email text not null,
  project_type text not null,
  message text not null,
  file_name text,
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now()
);

create index if not exists contact_inquiries_created_at_idx on public.contact_inquiries (created_at desc);
create index if not exists contact_inquiries_status_idx on public.contact_inquiries (status);

alter table public.contact_inquiries enable row level security;

-- Admins can read and update inquiry status in Supabase dashboard or future admin UI.
drop policy if exists "Admins read contact inquiries" on public.contact_inquiries;
create policy "Admins read contact inquiries"
  on public.contact_inquiries for select
  to authenticated
  using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

drop policy if exists "Admins update contact inquiries" on public.contact_inquiries;
create policy "Admins update contact inquiries"
  on public.contact_inquiries for update
  to authenticated
  using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

-- No insert policy for anon/authenticated: API uses SUPABASE_SERVICE_ROLE_KEY.
