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

-- Seed: legacy WordPress post
-- https://moonsteelfab.com/the-benefits-of-using-a-stainless-steel-grease-trap-in-your-restaurant/
insert into public.blogs (
  slug,
  title,
  excerpt,
  body,
  cover_image_url,
  published,
  published_at,
  sort_order
)
select
  'the-benefits-of-using-a-stainless-steel-grease-trap-in-your-restaurant',
  'The Benefits of Using a Stainless Steel Grease Trap in Your Restaurant',
  'Why stainless steel grease traps are the durable, hygienic, and cost-effective choice for commercial restaurant kitchens.',
  $body$Introduction:

A grease trap is an essential component of any restaurant's plumbing system. It captures grease and other fats from wastewater, preventing them from clogging up the pipes and causing costly plumbing problems. In this blog post, we will explore the benefits of using a stainless steel grease trap in your restaurant.

Durability

Stainless steel grease traps are extremely durable and can withstand the heavy use and harsh cleaning chemicals that are common in commercial kitchens. They are resistant to corrosion, rust, and staining, ensuring that they will last for many years.

Hygiene

Stainless steel is a non-porous material that is easy to clean and sanitize, making it ideal for use in food service environments. Stainless steel grease traps can be easily cleaned and disinfected, reducing the risk of contamination and ensuring a safe and sanitary kitchen.

Cost-effective

While stainless steel grease traps may have a higher upfront cost than some other materials, they are a cost-effective choice in the long run. Their durability means that they require less frequent replacement than other materials, reducing maintenance and replacement costs over time.

Customization

Stainless steel grease traps can be custom-fabricated to fit the specific needs and dimensions of your restaurant's plumbing system. This ensures that the grease trap is the right size and shape to effectively capture grease and other contaminants, reducing the risk of clogs and plumbing problems.

Sustainability

Stainless steel is a 100% recyclable material, making it an environmentally friendly choice for your restaurant. When it's time to replace your grease trap, it can be recycled instead of ending up in a landfill.

Conclusion:

A stainless steel grease trap is an essential component of any restaurant's plumbing system. Its durability, hygiene, cost-effectiveness, customization, and sustainability make it a smart choice for any restaurant owner. At Moon Steel Fabricators, we specialize in stainless steel grease traps and can help you choose and install the right grease trap for your restaurant's needs. Contact us today to learn more.$body$,
  '',
  true,
  '2023-03-26T00:00:00Z'::timestamptz,
  10
where not exists (
  select 1
  from public.blogs
  where slug = 'the-benefits-of-using-a-stainless-steel-grease-trap-in-your-restaurant'
);
