# Workspace

## Overview

pnpm workspace monorepo for the Moon Steel marketing site and admin CMS.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: Next.js 16 + Supabase (auth, CMS, storage)
- **Hosting**: Vercel

## Key Commands

- `pnpm run typecheck` — typecheck all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/moonsteel run dev` — run the site locally
- `pnpm --filter @workspace/moonsteel run test:e2e` — Playwright smoke tests (requires build first)
