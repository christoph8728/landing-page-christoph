# Personal Site

Minimal personal landing page and blog. No CMS. No database. No admin panel.

## Stack

- **Framework:** Next.js (App Router)
- **Content:** Markdown files with YAML frontmatter
- **Config:** Single `site.config.yaml` controls everything
- **Hosting:** Vercel (free tier)
- **Analytics:** Plausible (configured in config)

## Content workflow

**Blog posts:** Write Markdown → save to `content/blog/` → git push → live.

**Speaking entries:** iOS Shortcut → POST to `/api/content` → auto-committed → live.

**Editing from phone/iPad:** Obsidian + Working Copy, or the API route.

## Config

All site settings, feature flags, section visibility, rendering mode, design tokens,
and analytics configuration live in `site.config.yaml`. Edit that file, not code.

## Key config options

| Setting | Values | Effect |
|---|---|---|
| `rendering.blog_mode` | `dynamic` / `static` / `isr` | How blog pages are rendered |
| `features.scheduled_posts` | `true` / `false` | Hide future-dated posts until their date |
| `features.drafts` | `true` / `false` | Hide posts with `draft: true` |
| `sections.engagements` | `true` / `false` | Auto-hides when no entries exist regardless |
| `analytics.provider` | `plausible` / `umami` / `null` | Which analytics to load |

## Content structure

```
content/
├── blog/           ← Markdown posts (frontmatter: title, date, tags, draft)
├── speaking/       ← Speaking entries (frontmatter: title, date, event, location, type)
└── publications/   ← Academic publications (frontmatter: title, authors, year, venue, type, doi, highlight)
```

## Development

```bash
npm install
npm run dev        # http://localhost:3000
```

## Deploy

Push to GitHub. Connect repo to Vercel. Add environment variables. Done.

## Dependencies

Total: 3 runtime dependencies beyond Next.js/React.

- `gray-matter` — YAML frontmatter parsing
- `remark` + `remark-html` — Markdown → HTML rendering
- `js-yaml` — Config file parsing
