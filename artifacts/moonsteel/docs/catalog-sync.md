# Catalog platform sync

Moon Steel `catalog_products` is the master catalog. External platforms receive copies only when an admin clicks Sync.

## Architecture

```
Moon Steel product
  → NormalizedProduct
  → Sync engine
  → Provider adapter (Meta / WhatsApp / Google / Mock)
  → Official catalog API
  → product_platform_sync + sync_logs
```

Adding a provider does **not** change product CRUD.

1. Implement `SocialProvider` in `src/features/catalog-sync/providers/<name>/`.
2. Register it in `src/features/catalog-sync/core/register.ts`.
3. Add OAuth/app credentials to env.
4. The Social Channels tab lists platforms from the registry.

Do not add `facebook_synced` columns to `catalog_products`.

## Database

Applied via `supabase/migrations/20260816153000_catalog_platform_sync.sql`.

| Table | Purpose |
| --- | --- |
| `platform_connections` | Non-secret connection config |
| `platform_connection_secrets` | Encrypted tokens (service role only) |
| `product_platform_sync` | Per product × platform status and external IDs |
| `sync_jobs` / `sync_job_items` | Queued bulk work |
| `sync_logs` | Audit trail |

Product edits never call provider APIs. A trigger sets `UPDATE_REQUIRED` on existing `SYNCED` rows.

Deleting a website product does **not** delete the external catalog item.

## Sync lifecycle

1. Admin saves the Moon Steel product.
2. Status stays Not synced, or becomes Update required if it was previously synced.
3. Admin selects platforms and clicks Sync.
4. API creates a `sync_jobs` row and processes items in the background (`after()` + continuation).
5. Each product/platform is independent. One failure does not stop the batch.

## Authentication

- All sync APIs use `requireAdminApi()` (`profiles.role = 'admin'`).
- OAuth callbacks verify a signed state cookie.
- Tokens never ship to the browser.
- Encrypt secrets with `SYNC_CREDENTIALS_ENCRYPTION_KEY`.

## Official APIs used

- **Meta / Facebook / Instagram:** Marketing Catalog `/{catalog_id}/items_batch` (Graph API v22). Instagram Shopping visibility still requires an eligible IG account linked in Business Suite. This module does **not** publish Instagram/Facebook posts.
- **WhatsApp Business:** Same Meta catalog, linked to a WABA via `/{waba-id}/product_catalogs`. Consumer WhatsApp is not supported. Catalog *messages* are out of scope.
- **Google:** Merchant API `accounts.productInputs` (replaces Content API for Shopping, shutdown 18 Aug 2026). Google Business Profile local posts are **not** implemented.
- **Mock:** In-memory catalog for local testing. Enabled outside production unless `CATALOG_SYNC_ENABLE_MOCK=true`.

## Capabilities that are not faked

- Social post publishing / scheduling
- Google Business Profile product posts
- Unofficial scraping or browser automation
- Auto-sync on create/edit/image/price/category change

## Testing

```bash
corepack pnpm --filter @workspace/moonsteel test
```

Unit tests mock providers. They do not call live Meta/Google APIs.

## Admin workflow

See [catalog-sync-admin.md](./catalog-sync-admin.md).
