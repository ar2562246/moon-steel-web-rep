-- Run in Supabase SQL editor. Creates projects table, RLS, storage bucket, and optional seed data.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  scope text not null,
  image_url text not null,
  image_urls text[] not null default '{}',
  industry text not null default '',
  location text,
  materials text,
  description text,
  specs text,
  sort_order int not null default 100,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_sort_order_idx on public.projects (sort_order, created_at);
create index if not exists projects_slug_idx on public.projects (slug);

create or replace function public.set_projects_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_projects_updated_at();

alter table public.projects enable row level security;

drop policy if exists "Public read published projects" on public.projects;
create policy "Public read published projects"
  on public.projects for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Admins manage projects" on public.projects;
create policy "Admins manage projects"
  on public.projects for all
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

-- Storage bucket (public read). Create bucket in Dashboard if insert fails.
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read project images" on storage.objects;
create policy "Public read project images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'project-images');

drop policy if exists "Admins upload project images" on storage.objects;
create policy "Admins upload project images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'project-images'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins update project images" on storage.objects;
create policy "Admins update project images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'project-images'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins delete project images" on storage.objects;
create policy "Admins delete project images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'project-images'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Optional seed (uses existing static images). Safe to re-run: skips if slug exists.
insert into public.projects (slug, title, scope, image_url, industry, location, materials, description, specs, sort_order)
select * from (values
  (
    'hotel-kitchen-prep-area',
    'Hotel Kitchen Prep Area',
    'Prep Tables, Sinks, Wall Shelving',
    '/images/projects/hotel-kitchen.png',
    'Hospitality',
    'Karachi, Pakistan',
    'SS 304, #4 satin finish',
    'Full prep zone fabrication for a high-volume hotel kitchen including welded prep tables, compartment sinks, and wall shelving.',
    'SS 304 | 1.2mm tops | Seamless welds | Adjustable bullet feet',
    10
  ),
  (
    'hospital-sterile-prep-station',
    'Hospital Sterile Prep Station',
    'Custom Fabrication, Seamless Welds',
    '/images/projects/hospital-prep.png',
    'Healthcare',
    'Karachi, Pakistan',
    'SS 304, hygienic radiused corners',
    'Sterile prep workstations built for hospital infection-control requirements with seamless welds and easy-clean surfaces.',
    'SS 304 | Radiused corners | Fully welded bowls',
    20
  ),
  (
    'restaurant-cooking-line',
    'Restaurant Cooking Line',
    'Exhaust Hood, Equipment Stands',
    '/images/projects/restaurant-line.png',
    'Food Service',
    'Lahore, Pakistan',
    'SS 304 / SS 430 hood sections',
    'Cookline exhaust hood and equipment stands for a busy restaurant kitchen.',
    'Canopy hood | Baffle filters | Equipment stands',
    30
  ),
  (
    'pharma-cleanroom-workbench',
    'Pharma Cleanroom Workbench',
    'Hygienic Workstations, Drawers',
    '/images/projects/pharma-cleanroom.png',
    'Pharmaceutical',
    'Karachi, Pakistan',
    'SS 304, electropolished-ready finish',
    'Cleanroom-grade workbenches with integrated drawer storage for pharmaceutical production.',
    'SS 304 | Drawer units | Hygienic design',
    40
  ),
  (
    'qsr-back-of-house',
    'QSR Back-of-House',
    'Prep Counters, Assembly Tables',
    '/images/projects/qsr-kitchen.png',
    'QSR',
    'Islamabad, Pakistan',
    'SS 304 prep surfaces',
    'Fast-casual back-of-house prep counters and assembly tables for high-throughput service.',
    'Prep counters | Assembly tables | SS 304',
    50
  ),
  (
    'industrial-cafeteria-serving-line',
    'Industrial Cafeteria Serving Line',
    'Hot/Cold Displays, Tray Slides',
    '/images/projects/industrial-cafeteria.png',
    'Industrial',
    'Karachi, Pakistan',
    'SS 304 serving line components',
    'Serving line with hot/cold display sections and tray slides for an industrial cafeteria.',
    'Hot/cold displays | Tray slides | Custom lengths',
    60
  ),
  (
    'cold-storage-shelving',
    'Cold Storage Shelving',
    'Heavy-Duty Racking, Slotted Shelves',
    '/images/projects/custom-shelving.png',
    'Cold Chain',
    'Karachi, Pakistan',
    'SS 304 slotted shelving',
    'Heavy-duty cold room shelving designed for wash-down and corrosion resistance.',
    'Slotted shelves | Heavy-duty brackets | SS 304',
    70
  ),
  (
    'commercial-grease-interceptor',
    'Commercial Grease Interceptor',
    'Custom Sized Grease Trap, Plumbing',
    '/images/projects/grease-trap.png',
    'Food Service',
    'Karachi, Pakistan',
    'SS 304, 2.0mm gauge',
    'Custom-sized grease interceptor with watertight welded construction for commercial kitchen drainage.',
    'SS 304 | 2.0mm | Watertight welds',
    80
  )
) as seed(slug, title, scope, image_url, industry, location, materials, description, specs, sort_order)
where not exists (select 1 from public.projects p where p.slug = seed.slug);

-- Migration: add gallery column to existing installs
alter table public.projects add column if not exists image_urls text[] not null default '{}';

update public.projects
set image_urls = array[image_url]
where image_url is not null
  and (image_urls is null or cardinality(image_urls) = 0);

