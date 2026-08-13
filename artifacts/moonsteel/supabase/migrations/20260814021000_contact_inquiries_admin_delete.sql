drop policy if exists "Admins delete contact inquiries" on public.contact_inquiries;
create policy "Admins delete contact inquiries"
  on public.contact_inquiries for delete
  to authenticated
  using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );
