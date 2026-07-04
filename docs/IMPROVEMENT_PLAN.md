# Moon Steel Website — Improvement Plan

**Repository:** [ar2562246/moon-steel-web-rep](https://github.com/ar2562246/moon-steel-web-rep)  
**Last updated:** 2026-07-05  
**Production readiness score (baseline):** 55/100

This document tracks the remediation plan from the comprehensive website audit. Work is organized in phases that can ship incrementally without downtime.

---

## Current Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| CMS / Auth | Supabase (PostgreSQL, Auth, Storage) |
| Hosting | Vercel (account: ar2562246@gmail.com) |
| Monorepo | pnpm workspaces |

---

## Phase 1 — Quick wins (zero downtime)

**Goal:** Fix deploy config, UX bugs, SEO duplicates, and baseline security.  
**Status:** Code complete — manual Vercel dashboard steps remain (1.1, 1.2)

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 1.1 | Set Vercel **Root Directory** to `artifacts/moonsteel` | DevOps | **Manual** | See [Vercel setup](#vercel-setup-ar2562246) |
| 1.2 | Set production env vars in Vercel | DevOps | **Manual** | Copy from `.env.example` |
| 1.3 | Mount `<Toaster />` in root layout | Code | **Done** | + `"use client"` on `toaster.tsx` |
| 1.4 | Add security headers in `next.config.ts` | Code | **Done** | HSTS, X-Frame-Options, etc. |
| 1.5 | Remove `/tesla`, `/apple-design` from sitemap | Code | **Done** | Duplicate content fix |
| 1.6 | Redirect `/tesla`, `/apple-design` → `/` | Code | **Done** | 308 permanent; pages removed |
| 1.7 | Use fallback OG image (`ms3-logo.svg`) until PNG ready | Code | **Done** | Replace when hero PNG added |
| 1.8 | Improve `/unauthorized` page navigation | Code | **Done** | Home + login links |
| 1.9 | Document missing `/images/*` assets | Code | **Done** | `public/images/README.md` |
| 1.10 | Consolidate `artifacts/moonsteel/vercel.json` | Code | **Done** | Use when Root Directory = moonsteel |

### Vercel setup (ar2562246)

In [Vercel Dashboard](https://vercel.com/dashboard) → **moon-steel-web-rep** → **Settings → Build and Deployment**:

| Setting | Value |
|---------|--------|
| Root Directory | `artifacts/moonsteel` |
| Framework Preset | **Next.js** |
| Include files outside root | **Enabled** |
| Install Command | `cd ../.. && corepack pnpm install --frozen-lockfile --config.strict-dep-builds=false` |
| Build Command | `cd ../.. && corepack pnpm --filter @workspace/moonsteel run build` |
| Node.js Version | 24.x |

**Environment variables (Production):**

```
NEXT_PUBLIC_SITE_URL=https://your-production-domain.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://nliwlwmanqbfutmxxjhp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase Dashboard → API>
```

**Supabase → Authentication → URL configuration:**

- Site URL: your production domain
- Redirect URLs: `https://your-domain/auth/callback`

---

## Phase 2 — Business & security (Week 2)

**Goal:** Capture leads safely; complete Supabase security.

| # | Task | Priority | Effort |
|---|------|----------|--------|
| 2.1 | Wire contact form to API route + email (Resend/SMTP) | P0 | 4–8h |
| 2.2 | Add Supabase SQL migrations for all CMS tables + RLS | P0 | 4–8h |
| 2.3 | Add `middleware.ts` for Supabase session refresh | P1 | 2–4h |
| 2.4 | Add GitHub Actions CI (typecheck + build) | P1 | 2–4h |
| 2.5 | Add `error.tsx`, `not-found.tsx`, `loading.tsx` | P2 | 2–4h |

---

## Phase 3 — Performance & CMS (Week 3–4)

| # | Task | Priority | Effort |
|---|------|----------|--------|
| 3.1 | SSR homepage hero + key sections | P2 | 8–16h |
| 3.2 | Adopt `next/image` + Supabase remote patterns | P2 | 4–8h |
| 3.3 | Implement testimonials CMS tab | P2 | 8–16h |
| 3.4 | Add `/projects` index page | P3 | 4h |
| 3.5 | Consolidate product lines vs catalog (long-term) | P3 | 16h+ |

---

## Phase 4 — Optional / future

- Customer portal / quotation system
- Multi-language (hreflang)
- E-commerce integration
- Remove unused `api-server` + Drizzle scaffold
- Playwright E2E smoke tests
- Vercel Analytics / Sentry

---

## Score targets

| Area | Baseline | After Phase 1 | Target (Phase 3) |
|------|----------|---------------|------------------|
| Production Readiness | 55 | 65 | 80 |
| Security | 58 | 68 | 85 |
| SEO | 74 | 80 | 88 |
| Performance | 62 | 63 | 78 |

---

## Issue tracker (summary)

See audit for full table. **Open P0 items:**

1. Contact form not wired (Phase 2.1)
2. Missing PNG/JPG marketing images in repo (Phase 1.9 — documented)
3. Supabase RLS migrations incomplete in repo (Phase 2.2)
4. Vercel root directory still on `artifacts/api-server` until manually changed (Phase 1.1)

---

## Changelog

| Date | Phase | Changes |
|------|-------|---------|
| 2026-07-05 | 1 | Initial plan; Toaster, headers, redirects, sitemap, OG fallback, unauthorized UX, image asset README |
| 2026-07-05 | 1 | Removed duplicate `/tesla` and `/apple-design` pages; build verified |
