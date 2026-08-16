# How to sync products (admin)

The website catalog is the source of truth. Facebook, Instagram, WhatsApp, and Google only change when you click Sync.

## Connect a platform

1. Open **Admin → Social Channels**.
2. **Meta:** Connect, then choose the Facebook Page and product catalog. Instagram Shopping uses that same catalog once the Instagram account is eligible in Meta Business Suite.
3. **WhatsApp Business:** After Meta is connected, enter the WhatsApp Business Account ID and link the catalog. A normal WhatsApp phone number cannot be managed here.
4. **Google:** Connect Google, then save the Merchant Center ID and API data source ID.
5. Use **Test connection** after connecting.
6. On a development site you can connect the **mock catalog** instead of live platforms.

## Sync one product

1. Open **Catalog Products** and select a product.
2. Save any website edits first. That does **not** publish externally.
3. Scroll to **Platform distribution**.
4. Optionally click **Check before sync**.
5. Select platforms and click **Sync selected**, or **Sync** on one row.

## Bulk sync

1. Tick products in the left list, or click **Select all**.
2. Tick the platforms in the bar under the list.
3. Click **Sync selected products**.
4. **Sync all products** asks for confirmation first because it can create hundreds of catalog updates.

Watch the progress dialog. Failures are listed per product; the rest of the batch continues.

## Failed syncs

- Read the red error on the product’s platform row. It is written for admins, not raw API codes.
- Typical fixes: reconnect an expired account, add a catalog price, or use a public HTTPS image.
- Open **Social Channels → Sync history** for who synced what, and when.

## Unpublish vs delete

- **Delete** on the product form removes it from the Moon Steel website only.
- **Unpublish** on a platform row removes or marks it unavailable on that platform.
- Website edits never auto-delete Facebook, Instagram, WhatsApp, or Google listings.
