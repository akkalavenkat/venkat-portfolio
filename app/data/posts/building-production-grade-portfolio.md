---
title: "Building a production-grade developer portfolio in 2026"
date: "2026-04-01"
excerpt: "How I built a Next.js portfolio with Lighthouse 100/100/100/100, full CI/CD pipeline, E2E tests, SonarCloud analysis, and SEO — and made it available as an open source template."
tags: "nextjs,typescript,cicd,portfolio,sonarcloud"
source: "original"
---

Most developer portfolios are built quickly — pick a template, swap in your name and projects, deploy. Mine started that way too. But somewhere along the way it became something more: a production-grade web application with a CI/CD pipeline, automated quality gates, E2E tests, SonarCloud analysis, and Lighthouse scores of 100 across all four categories.

This post documents the decisions, the stack, and the lessons. The full codebase is open source and available as a template at your GitHub repository.

## The Stack

The foundation is straightforward:

- **Next.js 16** with App Router and TypeScript
- **Tailwind CSS v4** for styling
- **Vercel** for deployment
- **Hostinger SMTP** for the contact form

Nothing exotic. The interesting part is everything built around it.

## Single-File Configuration

The first architectural decision was to make the portfolio reusable. All personal data lives in a single `site.config.ts` file:

```ts
export const siteConfig = {
  person: {
    name: "Your Name",
    title: "Your Title",
  },
  social: [
    { label: "GitHub", href: "https://github.com/yourusername", icon: "Github" },
    { label: "LinkedIn", href: "https://linkedin.com/in/yourprofile", icon: "Linkedin" },
  ],
  hero: {
    tagline: "Your Professional Tagline",
    headline: "Your headline copy here",
    // ...
  },
  seo: {
    url: "https://www.yourdomain.com",
    description: "...",
  },
};
```

Anyone forking the repo fills in this file and the entire site updates — name, social links, hero copy, SEO metadata, contact details. Content data files (projects, certifications, journey timeline, blog posts) are separate typed arrays and markdown files.

## CI/CD Pipeline

Every push to main runs through this pipeline in order:

```text
commit-message    → commitlint validates Conventional Commits format
quality           → ESLint + TypeScript + build + Jest tests + SonarCloud
lighthouse        → Lighthouse CI with minimum score thresholds
e2e               → Playwright end-to-end tests on production build
deploy-health     → Email delivery health check after Vercel deploy
```

The quality gate is the most important step. It runs:

- `npm run lint` — ESLint with Next.js rules + Prettier integration
- `npm run typecheck` — TypeScript strict mode, no emit
- `npm run build` — full production build must succeed
- `npm run test:coverage` — Jest with 85%+ coverage, report sent to SonarCloud

If any step fails, deployment does not happen.

## Testing

The project has two test layers.

**Unit tests with Jest** cover the business logic — API routes, email sending, blog post parsing, data validation. 219 tests, 85% coverage across `app/lib/` and `app/api/`.

```text
Test Suites: 7 passed
Tests:       219 passed
Coverage:    91.3% statements, 85.25% branches
```

**End-to-end tests with Playwright** cover user-facing flows — navigation, page loads, contact form, theme toggle, 404 handling. 20 tests running against a production build on every CI run.

Both test suites run headless in GitHub Actions on Ubuntu. Playwright uploads an HTML report as an artifact on failure so you can see screenshots of exactly what broke.

## Code Quality with SonarCloud

SonarCloud runs on every push and pull request. The quality gate checks:

- Zero new bugs
- Zero new vulnerabilities
- Code duplication under 3%
- Coverage on new code above threshold

The duplication was the trickiest to get right — it started at 13% and required extracting shared patterns from project pages and data files to get it down to 3%.

## Lighthouse CI

Lighthouse runs automatically on every push to main against a local production build:

```json
{
  "assertions": {
    "categories:performance": ["error", { "minScore": 0.95 }],
    "categories:accessibility": ["error", { "minScore": 0.95 }],
    "categories:best-practices": ["error", { "minScore": 0.95 }],
    "categories:seo": ["error", { "minScore": 0.95 }]
  }
}
```

The live site scores 100/100/100/100 on desktop. The CI threshold is 95 to account for environment differences between local builds and Vercel's CDN.

## SEO

SEO setup covers all the bases:

- **Sitemap** — auto-generated from filesystem, submitted to Google Search Console
- **Open Graph** — title, description, image, URL on every page
- **Twitter cards** — summary_large_image on all pages
- **JSON-LD structured data** — Person schema on homepage, Article schema on blog posts, BreadcrumbList on listing pages
- **Canonical URLs** — www version set as canonical everywhere
- **robots.txt** — properly configured

The sitemap is dynamic — add a blog post markdown file and it appears in the sitemap on next build automatically.

## Contact Form

The contact form has multiple layers of protection:

- **Honeypot field** — hidden field that bots fill in, humans don't
- **Rate limiting** — prevents spam bursts
- **Cloudflare Turnstile** — optional CAPTCHA replacement, configurable via env vars
- **Dual email provider** — SMTP primary, Resend as fallback

The form posts to `/api/contact`. If `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` are all set, SMTP is used. Otherwise it falls back to Resend. Turnstile is disabled if both Turnstile keys are absent — useful for local development.

A deployment health check endpoint at `/api/ops/deploy-health` sends a test email after every successful production deploy, verifying the email pipeline is working end to end.

## Pre-commit Hooks

Husky runs before every commit:

- **lint-staged** — ESLint autofix on staged JS/TS files, Prettier on JSON/MD/CSS/YAML
- **commitlint** — enforces Conventional Commits format

This means lint errors and formatting issues never reach CI. They're caught locally before the commit is even created.

## DNS and Infrastructure

The domain is registered at GoDaddy but nameservers point to Vercel, making Vercel the single control point for DNS. Hostinger handles email delivery — MX records are configured in Vercel DNS pointing to Hostinger's mail servers.

The 308 redirect from non-www to www is configured in Vercel, not in code. Google Search Console is verified on the www property only.

## What It Scores

- **Performance: 100** — FCP 0.4s, LCP 0.5s, TBT 0ms, CLS 0
- **Accessibility: 96** — one contrast ratio issue on a CTA button being addressed
- **Best Practices: 100**
- **SEO: 100**

## Use It as a Template

The repository is marked as a GitHub template. Click "Use this template" on your repository, fill in `site.config.ts`, replace the content data files, add your blog posts, and deploy to Vercel.

The entire CI/CD pipeline, testing setup, SonarCloud integration, Lighthouse CI, SEO configuration, and contact form come pre-configured. Most developers building a portfolio from scratch would spend weeks on this infrastructure. The template gives you a running start.
