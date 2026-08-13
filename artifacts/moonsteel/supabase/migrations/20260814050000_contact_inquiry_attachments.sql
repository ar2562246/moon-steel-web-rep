-- Store quote-form drawings in a private bucket and keep metadata on the inquiry.

alter table public.contact_inquiries
  add column if not exists file_urls jsonb not null default '[]'::jsonb;

insert into storage.buckets (id, name, public, file_size_limit)
values ('contact-attachments', 'contact-attachments', false, 26214400)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

drop policy if exists "Admins read contact-attachments" on storage.objects;
create policy "Admins read contact-attachments"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'contact-attachments'
    and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

drop policy if exists "Admins delete contact-attachments" on storage.objects;
create policy "Admins delete contact-attachments"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'contact-attachments'
    and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );
