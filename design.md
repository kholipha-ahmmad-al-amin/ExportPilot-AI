# Design — ExportPilot AI

A locked design system for this app. Every page redesign reads this file before
emitting code. `BRAND_AND_UX_SPEC.md` remains the authoritative brand contract;
this file is the Hallmark-facing summary of the same system.

## Genre
editorial — institutional, ledger-like, bilingual-first. Calm, dense, honest.

## Macrostructure family
- Marketing pages: asymmetric split hero + specimen product preview +
  hairline-section rhythm (Landing.tsx pattern). Programmatic pages reuse the
  same container/rhythm at smaller scope.
- App pages: utilitarian workbench — sidebar + content, tables over cards,
  skeleton loaders, no enrichment.
- Content pages (/docs, guides): long-document reading rhythm, sticky section nav.

## Theme
Source of truth: `frontend/src/tokens.css` (`:root` light, `.dark` night).
- Paper: cool slate-alabaster `#F8FAFC` / night `#070B14`
- Ink: slate-900 `#0F172A` / night `#E7EDF6`
- Accent: verified emerald `#047857` light / `#10B981` dark — single anchor,
  <= 5% per viewport
- Semantic: amber / rose / sky tokens for alerts only

## Typography
- Display + body (Latin): Plus Jakarta Sans -> Inter fallback
- Bengali: Hind Siliguri -> Noto Sans Bengali (unicode-range registered,
  size-adjust 106%)
- Mono: JetBrains Mono (tabular figures for trade numbers)
- Headings roman only — no italic headers. Bengali headings line-height 1.45.

## Spacing
4-point named scale in tokens.css (`--space-3xs`..`--space-4xl`).
Reference tokens by name; never inline raw spacing where a token exists.

## Motion
- Easings: `--ease-out` cubic-bezier(0.16,1,0.3,1), `--ease-in-out`
- Spatial motion on transform/opacity only; `prefers-reduced-motion` collapses
  to opacity crossfade (handled globally by MotionConfig)
- Scroll reveals: one orchestrated entrance per section, staggered <= 100ms
- No bounce/elastic easings

## Microinteractions stance
- Silent success over celebratory toasts; dedicated success UI where flows
  already have it (RFQ created screen, inline save banners)
- 44px minimum tap targets enforced globally (`--tap-min`)
- Focus-visible ring instant, never animated
- Clickable text never wraps (`white-space: nowrap` on buttons/links)

## CTA voice
- Primary: emerald fill, 10px radius, semibold, icon-right
- Secondary: accent text link with ArrowUpRight
- Honest labels only — "illustrative", "sample", "draft" where data is
  demonstration-grade

## Per-page allowances
- Marketing pages: real photography (generated sector/port/office assets,
  WebP) + typographic heroes. No fake chrome, no stock people.
- App pages: no enrichment — function carries the page.
- Content pages: typography only.

## What pages MUST share
- Wordmark, emerald accent placement, PJS/Hind Siliguri type pairing,
- CTA voice, honest-data labeling convention.

## What pages MAY differ on
- Section order within family, hero composition knobs, enrichment tier
  (Tier A/B only, marketing pages).
