# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run typecheck    # TypeScript check (no emit)
npm run format       # Prettier format all files
npm run format:check # Prettier check (no write)
```

Pre-commit hooks (Husky + lint-staged) automatically run lint and format on staged files.

## Commit Convention

Conventional Commits are enforced via commitlint:
`feat`, `fix`, `docs`, `refactor`, `test`, `chore`

## Architecture

This is a **Next.js 16 App Router** portfolio site deployed on Vercel, using static generation for all content pages and server-side API routes for dynamic functionality.

### Routing & Pages

All routes live under `app/`. Static pages generate params at build time via `generateStaticParams()`:

- `/` — Home, composes all section components from `app/components/`
- `/blog/[slug]` — Dynamic blog posts rendered from Markdown files in `app/data/posts/`
- `/projects/[slug]` — Dynamic project detail pages driven by `app/data/projects.ts`
- `/certifications`, `/journey` — Static content pages
- `POST /api/contact` — Contact form: rate limiting (5 req/10 min per IP), optional Cloudflare Turnstile, honeypot, then delegates to `app/lib/email.ts`
- `POST /api/ops/deploy-health` — Authenticated health check (requires `x-deploy-health-token` header)

### Content System

**Blog posts** are `.md`/`.mdx` files in `app/data/posts/` with YAML frontmatter (`title`, `date`, `excerpt`, `tags`, `source`). Utilities in `app/lib/getPosts.ts` parse these at build time using `gray-matter`.

**Projects** are defined as a typed array in `app/data/projects.ts` with a `getProjectBySlug()` utility. Each project can have its own detail page under `app/projects/[slug]/page.tsx`.

**Certifications** are typed data in `app/data/certifications.ts`.

### Email Delivery

`app/lib/email.ts` exports `sendPortfolioEmail()` with a dual-provider fallback:

1. SMTP (Hostinger) — used if `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` are set
2. Resend — fallback

### Theme

Dark/light theming via `next-themes`. `ThemeProvider` wraps the app in the root layout; `ThemeToggle` switches themes. Use `dark:` Tailwind classes for theme-aware styles.

### Key Config

- **Security headers** (CSP, HSTS, X-Frame-Options, etc.) are configured in `next.config.ts`
- **Path alias**: `@/*` maps to the repo root (e.g., `@/app/lib/email`)
- **Tailwind CSS 4** — no separate config file; uses `@tailwindcss/postcss`
- **Prettier**: double quotes, semicolons, trailing commas, 100-char print width

### Environment Variables

| Variable                                           | Purpose                                       |
| -------------------------------------------------- | --------------------------------------------- |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_PORT` | Primary email via Hostinger SMTP              |
| `RESEND_API_KEY`                                   | Fallback email provider                       |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`                   | Cloudflare Turnstile (contact form, optional) |
| `TURNSTILE_SECRET_KEY`                             | Server-side Turnstile verification            |
| `DEPLOY_HEALTH_TOKEN`                              | Auth token for `/api/ops/deploy-health`       |
| `CONTACT_EMAIL`                                    | Recipient address for contact form emails     |

### CI/CD

GitHub Actions runs on push/PR: commitlint → ESLint → TypeScript → Next.js build. SonarCloud is integrated for static analysis (`sonar-project.properties`).
