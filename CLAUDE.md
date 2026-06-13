# Khám Phá Việt Nam — CLAUDE.md

Project reference for AI-assisted development. Covers business context, architecture, DB schema, conventions, and active work areas.

---

## Business Context

**Khám Phá Việt Nam** is a bilingual (Vietnamese / English) tourism and cultural-heritage website for exploring Vietnam's 63 provinces and cities. The MVP focuses on 2 provinces (Hồ Chí Minh, Hà Nội).

**Core value proposition:**
- Every historical event is cited from ≥ 2 independent sources
- Cultural content (cuisine, landmarks, customs, festivals) is editor-curated
- Not an official academic source — positioned as an engaging travel companion

**Monetisation:** Google AdSense (slots already in code, hidden in dev)

**Target audience:** Domestic Vietnamese travellers + international tourists

---

## Technical Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 App Router (React 19 Server Components) |
| Language | TypeScript 5 |
| Database | SQLite via `@libsql/client` (local file `database.db`) |
| Styling | Tailwind CSS 3 + inline styles for design-system tokens |
| i18n | `next-intl` 3 — locales: `vi` (default), `en` |
| Fonts | Cormorant Garamond (headings), Be Vietnam Pro (body) — Google Fonts |
| Map | D3-geo + custom SVG — `public/viet-nam-geo.json` |
| Search | SQLite LIKE query (FTS5 virtual table also exists but not wired) |

**Dev commands:**
```bash
npm run dev            # start Next.js dev server
npx tsx scripts/seed.ts  # seed / re-seed the database
```

**DB file:** `./database.db` — created automatically by `lib/db.ts` on first run.

---

## URL Structure

```
/:locale                              → home
/:locale/:type/:slug                  → province detail
  e.g. /vi/thanh-pho/ho-chi-minh
       /en/city/ho-chi-minh
/:locale/:type/:slug/am-thuc/:foodSlug  → food detail page (planned)
```

`type` is locale-aware: `thanh-pho` (vi) / `city` (en), `tinh` (vi) / `province` (en).
Slugs are always English-friendly ASCII kebab-case.

---

## Database Schema

```sql
-- 5 core tables

provinces          id, name_vi, name_en, slug, type, type_en, svg_path_id,
                   status, meta_description_vi, meta_description_en,
                   population, area_km2, region_vi, region_en

events             id, province_id→provinces, title_vi, title_en,
                   content_vi, content_en, event_date (YYYY-MM-DD),
                   event_date_display, image_url, status, content_hash

cultural_posts     id, province_id→provinces, title_vi, title_en,
                   content_vi, content_en,
                   type ('am-thuc'|'dia-diem'|'phong-tuc'|'le-hoi'),
                   status, content_hash
                   -- content_vi / content_en stored as JSON array:
                   -- [{ "item": "Name", "description": "Text..." }, ...]

sources            id, entity_type ('event'|'cultural_post'|'festival'),
                   entity_id, url, title, publisher, accessed_date

festivals          id, province_id→provinces, name_vi, name_en,
                   description_vi, description_en,
                   start_date, end_date, is_lunar, is_trending, status
```

**Planned new table (food detail pages):**
```sql
food_items         id, cultural_post_id→cultural_posts, slug,
                   title_vi, title_en, lede_vi, lede_en,
                   story_vi, story_en,
                   ingredients_json,   -- JSON array of {name_vi,name_en,role_vi,role_en,svgVariant}
                   how_to_eat_vi, how_to_eat_en,
                   eateries_json,      -- JSON array of {name,address,tags,price_vnd}
                   info_origin_vi, info_origin_en,
                   info_best_time_vi, info_best_time_en,
                   info_price_range,
                   info_vegetarian_vi, info_vegetarian_en,
                   status, content_hash
```

**Migrations:** `/migrations/001_init.sql` — applied automatically by `lib/db.ts` on startup.
New migrations go in `/migrations/002_*.sql` etc. — run automatically on next `npm run dev` / seed.

---

## Key Files

| File | Role |
|------|------|
| `lib/db.ts` | LibSQL client singleton + migration runner |
| `lib/queries.ts` | All typed DB query functions (Province, Event, CulturalPost, Source, Festival types) |
| `app/[locale]/[type]/[slug]/page.tsx` | Province detail page — main content page |
| `components/Timeline.tsx` | Historical era timeline with filter chips |
| `components/CulturalPostList.tsx` | 2-col ranked grid for culture sections |
| `components/TrendingDestinations.tsx` | Festival carousel |
| `scripts/seed.ts` | Full DB seed — uses `INSERT OR IGNORE` via content_hash |
| `migrations/001_init.sql` | Base schema |
| `mock-design/city.html` | Design reference for province page |
| `mock-design/food-hu-tieu-nam-vang.html` | Design reference for food detail page |

---

## Design System

**Colour palette (Tailwind aliases):**
```
vn-red       #C8102E   primary brand / CTAs
vn-red-dark  #8E0A1F   hover, headings
vn-gold      #C9A24C   accent, stars, highlights
vn-gold-lt   #DEC07F   softer gold, secondary CTAs
vn-jade      #2E7D5A   Đổi Mới era, nature
vn-jade-dk   #1F5B40   dark jade
vn-ivory     #FBF8F1   main background
vn-sand      #EDE3CC   section backgrounds
vn-mist      #D9D3C5   borders
vn-fog       #E9E6DE   hover states
vn-stone     #6E6A60   secondary text
vn-charcoal  #3A3833   dark text
vn-ink       #1B1B1A   near-black text (use sparingly, NOT as backgrounds)
```

**Rule: Never use `#1B1B1A` or pure `#000000` as background colours** — not suitable for a warm tourism brand. Use `#3D1A1F` (deep wine) for dark sections like footer.

**Typography:**
- `font-heading` = Cormorant Garamond (serif, editorial feel)
- `font-body` / `font-sans` = Be Vietnam Pro

---

## i18n Conventions

- `locale === 'vi'` → show Vietnamese content
- `isVi ? field_vi : field_en` pattern used throughout
- URL type segments: `thanh-pho`/`tinh` in `vi`, `city`/`province` in `en`
- Page content is rendered server-side in the correct language (no client hydration for text)

---

## Content Patterns

### Cultural posts (`cultural_posts` table)
Content is stored as JSON:
```json
[
  { "item": "Display name", "description": "Paragraph about this item" },
  ...
]
```
Parsed in `CulturalPostList.tsx` — `listItems[0].item` = meta text, `listItems[0].description` = excerpt.

### Mock data fallback
Province detail page has inline mock data for HCM (`isHCM` flag) as fallback when DB is empty:
```tsx
const displayEvents = events.length > 0 ? events : mockEvents;
const displayCulturalPosts = culturalPosts.length > 0 ? culturalPosts : mockCulturalPosts;
```

---

## Active / Planned Features

### Done ✓
- Province detail page: scrolling single page with Timeline + CulturalPostList
- Timeline: era filter chips, vertical line, event cards with sources
- CulturalPostList: 2-col grid, SVG thumbnails, rank badges (top-3 red, rest gold)
- DB seed: 6 am-thuc + 6 dia-diem individual records for HCM
- No black backgrounds — warm wine/red dark theme

### In progress / Next
- **Food detail pages** — `/vi/thanh-pho/ho-chi-minh/am-thuc/hu-tieu-nam-vang`
  - New DB table: `food_items` (see schema above)
  - New route: `app/[locale]/[type]/[slug]/am-thuc/[foodSlug]/page.tsx`
  - Sections: hero, info bar, story, ingredients grid, how to eat, eatery list, sources, prev/next nav
  - Mock design: `mock-design/food-hu-tieu-nam-vang.html`

### Future
- Hà Nội full content
- More provinces
- Admin CMS panel (`admin-tool/server.ts` skeleton exists)
- Replace mock fallback data with real DB data
- FTS5 search wired into SearchBar
