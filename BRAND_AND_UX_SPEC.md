# ExportPilot AI - Brand and UX Specification

Single-source identity and interface architecture for the sovereign trade platform.
This document is the contract every UI file must honor.

## Niche Analysis

- Vertical: cross-border export trade intelligence for Bangladesh (RMG, diversified jute, leather, ceramics, agro-processing).
- Value proposition: factories bypass predatory middlemen, price against modelled FOB Chattogram cost stacks, quantify EU CBAM carbon exposure, and negotiate directly with verified EU/UK/US/Japan buyers under bank-grade payment discipline.
- Primary users: factory owners on phones and 13 to 16 inch Windows laptops in Bangla; verified international buyers on desktops in English; compliance auditors and administrators on desktops.
- Emotional target: institutional authority. The interface must read like a Bloomberg terminal crossed with a customs ledger: dense, calm, exact. It must never read like a consumer app or a startup landing template.

## Brand Name and Tagline

| Language | Brand Name | Tagline |
|---|---|---|
| English | ExportPilot AI | Direct export intelligence for Bangladesh |
| Bengali | এক্সপোর্টপাইলট এআই | কারখানা থেকে সরাসরি বিশ্ববাজারে |

## Geometric Symbol Concept (Master Mark)

One flat 2D mark, no gradients, no glow, no 3D:

- A solid rounded square tile reads as a cargo container face.
- Inside, negative space forms a bold upward arrow above three horizontal ribs (container corrugation).
- Meaning: cargo moving up and out. Direct export uplift. One silhouette works as a 16 px favicon and as a 512 px architectural tile.
- Color logic: the standalone SVG file is fixed (emerald 700 tile, white cuts) so favicons never break. The in-app `<BrandLogo />` inlines the same path data and swaps fills by theme: day uses emerald 700 on white cuts, night uses emerald 500 on deep navy cuts. One geometry, two tunings.

## Day / Night Color Tokens

| Token | Day | Night | Use |
|---|---|---|---|
| --background | #F6F7F9 alabaster | #070B14 carbon | Page canvas |
| --surface-1 | #FFFFFF | #0D1420 | Primary card |
| --surface-2 | #F1F5F9 | #111B2B | Nested card, table head |
| --border-subtle | #E2E8F0 1px | #1C2940 1px | Structural borders |
| --ink | #0F172A | #E7EDF6 | Primary text |
| --ink-muted | #475569 | #94A3B8 | Secondary text |
| --accent | #047857 | #10B981 | Actions, active states |
| --accent-ink | #FFFFFF | #04211A | Text on accent |
| Top-edge highlight | none | inset 1px rgba(148,163,184,0.10) top | Night card depth |

Contrast floor: AA (4.5:1) everywhere, AAA (7:1) for body text on both canvases. Verified ratios from the previous audit cycle are preserved.

## Typography Pairing

| Role | Family | Notes |
|---|---|---|
| English display and UI | Plus Jakarta Sans | Geometric grotesque, headings, buttons, badges |
| Data, codes, numerals | JetBrains Mono | HS codes, FOB figures, telemetry |
| Bengali headings and UI | Hind Siliguri | Navbar, buttons, badges, card titles |
| Bengali long-form | Noto Sans Bengali | Paragraphs, guidance copy |

- Self-hosted via fontsource woff2 files copied to /fonts by the brand asset script. No third-party font CDN at runtime.
- Bengali faces register with `unicode-range: U+0980-09FF, U+200C-200D, U+25CC` and `size-adjust: 106%` so Bengali caps match adjacent Latin optical height.
- Line heights: 1.6 body, 1.25 headings, so kar and fala marks never clip in buttons, badges, or inputs.

## Page-by-Page Layout Plan (4-tier device matrix)

Breakpoints: mobile 0-767, tablet 768-1024, laptop 1025-1600, desktop 1601+.

- Global shell: centered `max-w-[1920px]`, structural border rails appear at desktop tier.
- Landing: single column hero on mobile, two columns from tablet, hero canvas and calculator card side by side on laptop, max prose measure on desktop.
- Navbar: hamburger below tablet, inline links from laptop, palette button plus shield badge from tablet up. Mobile tier gains a sticky bottom tab bar for authenticated workspaces.
- Deal Room (`/dealroom`): stacked negotiation and co-pilot on mobile and tablet, split `1fr / 360px` from laptop, plus wider gutters and a persistent context rail feel on desktop.
- Buyer Catalog: stacked cards on mobile, horizontal scroll table on tablet, bounded sticky-header table on laptop and desktop.
- Audit, Security, Admin: single column on mobile, two columns from laptop, filter chips wrap at every tier.
- Modals: bottom-sheet drawers on mobile, centered dialogs from tablet up (`ui/dialog.tsx` primitive).
- Command palette: full-screen sheet on mobile, floating panel on larger tiers.

## Asset Pipeline Contract

`scripts/generate_brand_assets.mjs` (local-only, like all scripts/) reads `public/brand/master-mark.svg` and emits every production asset: multi-size ICO (hand-packed PNG entries), PNG icons, apple touch icon, android chrome icons, `site.webmanifest`, and two OG images (1200x630 and 1200x1200) whose content is confined to the central 600x600 safe box (x 300-900, y 15-615) so WhatsApp square crops never cut the mark or a letter. Outer bands carry only ambient grid geometry. Fonts for OG text render from system faces (Segoe UI) because resvg cannot consume woff2; the in-app logo always renders the true brand faces from code.
