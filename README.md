# Personal Portfolio

A production-grade developer portfolio built with Next.js, TypeScript, Tailwind CSS v4, and Vercel.

## Features

- **Single-file configuration** — all personal data lives in `app/site.config.ts`
- **Dark / light theme** — system-aware with manual toggle via `next-themes`
- **Blog system** — Markdown files with YAML frontmatter, tag support, syntax highlighting
- **Project showcase** — typed data file with individual project detail pages
- **Career journey timeline** — animated scroll-driven timeline from a typed data file
- **Certifications page** — filterable grid driven by a data file
- **Contact form** — rate-limited, honeypot-protected, Cloudflare Turnstile support, dual email provider (SMTP + Resend fallback)
- **Visitor counter** — privacy-friendly, Redis-based, deduplicates per IP per day
- **CI/CD pipeline** — GitHub Actions: commitlint → ESLint → TypeScript → build → Playwright E2E → Lighthouse CI
- **SEO optimized** — sitemap, robots.txt, Open Graph, Twitter cards, JSON-LD schema

---

## Getting Started

### Prerequisites

- Node.js 22+ and npm

### Installation

```bash
# Clone the repository
git clone YOUR_REPOSITORY_URL
cd your-portfolio

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration (see Configuration section below)

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view your portfolio.

---

## Configuration

Everything you need to personalize is in **`app/site.config.ts`**. Edit this file once and the entire site updates.

### `person` — your identity

```ts
person: {
  name: "Your Name",
  title: "Your Job Title",
  location: "Your City, Country",
  currentEmployer: "Your Company",
  profilePhoto: "/profile.jpg",       // place your photo in /public
  knowsAbout: ["Skill1", "Skill2"],   // skills for JSON-LD schema
}
```

### `social` — all social profiles

```ts
social: [
  { label: "GitHub", href: "https://github.com/you", icon: "Github", navbarVisible: true },
  { label: "LinkedIn", href: "https://linkedin.com/in/you", icon: "Linkedin", navbarVisible: true },
  { label: "Stack Overflow", href: "...", icon: "Code2", navbarVisible: false },
];
```

`navbarVisible: true` — shown in the navbar and contact section buttons.
`navbarVisible: false` — shown in the footer only.

### `navbar` — navigation links and CTA

```ts
navbar: {
  cta: { label: "Let's talk", href: "#contact" },
  navItems: [
    { label: "Home",        href: "#hero" },
    { label: "Projects",    href: "#projects" },
    { label: "Tech Stack",  href: "#tech" },
    { label: "Blog",        href: "#blog" },
    { label: "Contact",     href: "#contact" },
  ],
}
```

### `hero` — landing section

Controls the tagline, headline, bio, credentials, CTA buttons, service cards, and stat grid.

### `seo` — metadata and Open Graph

```ts
seo: {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://yourdomain.com",
  siteName: "Your Name Portfolio",
  description: "Your professional description",
  ogDescription: "Your OG description",
  ogImage: "/profile.jpg",
  keywords: ["Your Name", "Your Skills", ...],
  googleVerification: "YOUR_GOOGLE_VERIFICATION_TOKEN",
}
```

### `resume` — resume download

```ts
resume: {
  path: "/your-resume.pdf",  // place the file in /public
}
```

---

## Content

Four data files hold all section content:

### Projects — `app/data/projects.ts`

A typed array of `Project` objects. Each generates a card and detail page at `/projects/[slug]`.

### Certifications — `app/data/certifications.ts`

A typed array shown on the `/certifications` page.

### Career Journey — `app/data/journey.ts`

Timeline entries for the `/journey` page.

### Blog Posts — `app/data/posts/`

Markdown/MDX files with YAML frontmatter:

```yaml
---
title: "Your Post Title"
date: "2024-06-01"
excerpt: "Summary shown in blog listing."
tags: "tag1,tag2"
source: "original"
---
Your post content in Markdown...
```

---

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
# Email Configuration
CONTACT_TO_EMAIL=your-email@example.com

# SMTP (primary email provider)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-app-password
CONTACT_FROM_EMAIL=Portfolio <noreply@yourdomain.com>

# Resend (fallback email provider)
RESEND_API_KEY=your_resend_key

# Cloudflare Turnstile (optional spam protection)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key
TURNSTILE_SECRET_KEY=your_secret_key

# Deployment health check (optional)
DEPLOY_HEALTH_TOKEN=generate_a_random_secure_token
```

SMTP is used when `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` are all set. Otherwise Resend is used.

---

## Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # ESLint checks
npm run lint:fix     # Auto-fix ESLint issues
npm run typecheck    # TypeScript type checking
npm run format       # Format code with Prettier
npm run format:check # Check formatting
npm test             # Run unit tests
npm run e2e          # Run E2E tests
npm run lighthouse   # Run Lighthouse audits
```

---

## Development

### Pre-commit Checks

This repository uses Husky + lint-staged:

- Staged files are linted with autofix
- Commit messages validated with commitlint (Conventional Commits)

### Commit Convention

Use Conventional Commits:

```text
feat(feature): short description
fix(bug): short description
docs(readme): short description
chore(deps): short description
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import repository at [vercel.com](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy

### Custom Domain

1. Register domain (GoDaddy, Namecheap, etc.)
2. Add domain to Vercel project
3. Point nameservers to Vercel
4. Update `siteConfig.seo.url` to your domain

### Google Search Console

1. Update Google verification token in `site.config.ts`
2. Verify domain at [search.google.com/search-console](https://search.google.com/search-console)
3. Monitor search performance

---

## Project Structure

```
app/
├── site.config.ts          # Main configuration
├── data/
│   ├── projects.ts         # Project data
│   ├── certifications.ts   # Certifications data
│   ├── journey.ts          # Career timeline
│   └── posts/              # Blog posts
├── api/                    # API routes
├── components/             # React components
├── lib/                    # Utilities
└── (routes)/               # App Router pages
```

---

## Customization

### Styling

- Global styles: `app/globals.css`
- Tailwind CSS v4 with utility-first approach
- Theme colors in dark/light modes

### Components

Edit components in `app/components/`:
- Hero section
- Projects showcase
- Blog preview
- Contact form
- Theme switcher
- Footer

### Fonts

- Default: Geist Sans
- Code: Geist Mono
- Alternative: Newsreader (editorial)
- Alternative: Archivo Black (brutalist)

---

## Themes

Four design themes available via UI switcher:

1. **Bento** (default) — Modern, modular
2. **Editorial** — Magazine-style
3. **Brutalist** — Minimal, text-focused
4. **Terminal** — Developer-focused

---

## Performance & SEO

- Static generation and ISR
- Image optimization
- CSS/JS minimization
- Code splitting
- Auto font optimization
- Vercel Edge CDN
- Sitemap generation
- robots.txt
- Open Graph + Twitter cards
- JSON-LD structured data
- Canonical URLs

---

## Testing

- **Unit Tests:** Jest
- **E2E Tests:** Playwright
- **Type Safety:** Full TypeScript coverage
- **Linting:** ESLint
- **Formatting:** Prettier

---

## Support

For issues or questions:

1. Review configuration in `app/site.config.ts`
2. Check `.env.example` for required environment variables
3. Review technology documentation:
   - [Next.js](https://nextjs.org/docs)
   - [Tailwind CSS](https://tailwindcss.com/docs)
   - [Vercel](https://vercel.com/docs)

---

## License

This project is open source and available for personal use.
