# Supabase SQL migrations

Run these scripts in order in the **Supabase SQL Editor** (Dashboard → SQL → New query).

| Order | File | Purpose |
|-------|------|---------|
| 1 | `profiles.sql` | User profiles + roles + signup trigger |
| 2 | `cms_core.sql` | Hero images, logos, product lines, site settings |
| 3 | `projects.sql` | Portfolio projects + storage |
| 4 | `catalog.sql` | Product catalog + storage |
| 5 | `contact_inquiries.sql` | Quote form lead storage |

After running `profiles.sql`, promote your admin user:

```sql
update public.profiles
set role = 'admin'
where email = 'your-admin@example.com';
```

## Contact form (Phase 2)

The `/api/contact` route stores leads in `contact_inquiries` using `SUPABASE_SERVICE_ROLE_KEY` (server-only).

Optional email notifications via [Resend](https://resend.com):

- `RESEND_API_KEY`
- `CONTACT_NOTIFICATION_EMAIL`
- `RESEND_FROM_EMAIL`
