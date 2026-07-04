# Marketing images

The site references PNG/JPG assets under `/images/` for Open Graph previews, hero fallbacks, and default catalog/project thumbnails.

**Currently in repo:** only SVG logos in `public/` (`ms3-logo.svg`, `favicon.svg`).

## Required assets (add before full production launch)

| Path | Used by |
|------|---------|
| `/images/hero-kitchen-stainless.png` | Root layout OG/Twitter (1200×630 recommended) |
| `/images/projects/*.png` | Default project cards in `defaultProjects.ts` |
| `/images/catalog/*.png` | Default catalog products in `defaultCatalog.ts` |

## Options

1. **Commit files here** — add PNG/WebP under `public/images/` and redeploy.
2. **Supabase Storage** — upload via admin CMS; ensure public URLs are used in content.
3. **Interim** — layout metadata uses `/ms3-logo.svg` until hero PNG is available (Phase 1).

After adding files, update `layout.tsx` OG image back to `/images/hero-kitchen-stainless.png` if desired.
