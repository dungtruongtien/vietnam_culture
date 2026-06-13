# Vietnam Map — Implementation Context

> Keep this file updated whenever the map changes. It is the single source of truth for future development.

---

## Architecture Overview

The map is a client-side React component (`components/VietnamMap.tsx`) that:
1. Fetches GeoJSON on mount from `/viet-nam-geo.json` (served from `public/`)
2. Projects it to SVG paths using `d3-geo` (Mercator projection)
3. Renders the SVG inside a CSS perspective container for a 3D tilt effect
4. Shows only selected "revealed" provinces as interactive — all others are muted/non-interactive

---

## Data Sources

| File | Location | Description |
|------|----------|-------------|
| GeoJSON | `public/viet-nam-geo.json` | 63-province FeatureCollection, sourced from GADM. Original: `map-sample/viet-nam-svg.json` |
| Original sample | `map-sample/index.html` | Reference D3 implementation with full 63-province UI (dark theme, panel, region filter) |

### GeoJSON Structure

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "NAME_1": "HàNội",       // No spaces — used as lookup key
        "GID_1": "VNM.x_1",
        "HASC_1": "VN.HI",
        "ISO_1": "NA",
        "TYPE_1": "Thành phố trực thuộc trung ương",
        "ENGTYPE_1": "Municipality"
      },
      "geometry": { "type": "MultiPolygon", "coordinates": [...] }
    }
  ]
}
```

**Critical:** `NAME_1` values have **no spaces** between words (e.g. `"HàNội"` not `"Hà Nội"`, `"HồChíMinh"` not `"Hồ Chí Minh"`). This is the GADM convention. All lookups in `NAME_TO_SLUG` must use the no-space form.

---

## Projection Setup

```ts
import { geoMercator, geoPath } from 'd3-geo';

const W = 360;  // SVG canvas width
const H = 780;  // SVG canvas height

const projection = geoMercator()
  .center([106, 16])   // Longitude 106°E, Latitude 16°N — center of Vietnam
  .scale(1700)          // Zoom level — increase to zoom in, decrease to zoom out
  .translate([W / 2, H / 2]);

const pathGen = geoPath(projection);
const d = pathGen(feature);  // returns SVG path string
```

These values match the `map-sample/index.html` reference implementation.

---

## Province Reveal System

### How it works

There are two layers:

| Layer | Visual | Interaction | Tooltip |
|-------|--------|-------------|---------|
| **Hidden** (not in `NAME_TO_SLUG`) | Dark blue muted (`#1a3a5c`, 55% opacity) | None | None |
| **Revealed** (in `NAME_TO_SLUG`) | Green gradient + 3D shadow | Hover + click | Yes |

### Currently revealed provinces (2 of 63)

| `NAME_TO_SLUG` key | DB slug | Status |
|---|---|---|
| `HàNội` | `ha-noi` | Active in DB ✓ |
| `HồChíMinh` | `ho-chi-minh` | Active in DB ✓ |

### To reveal more provinces

**Step 1:** Uncomment the province in `NAME_TO_SLUG` in `components/VietnamMap.tsx`:
```ts
const NAME_TO_SLUG: Record<string, string> = {
  'HàNội':     'ha-noi',
  'HồChíMinh': 'ho-chi-minh',
  'ĐàNẵng':    'da-nang',   // ← uncomment this
};
```

**Step 2:** Add a display name entry in `DISPLAY_NAMES`:
```ts
const DISPLAY_NAMES: Record<string, { vi: string; en: string }> = {
  'HàNội':     { vi: 'Hà Nội',           en: 'Hanoi' },
  'HồChíMinh': { vi: 'TP. Hồ Chí Minh', en: 'Ho Chi Minh City' },
  'ĐàNẵng':    { vi: 'Đà Nẵng',          en: 'Da Nang' },  // ← add this
};
```

**Step 3:** Ensure the province exists in the database and has `status = 'active'`. The `activeProvinces` prop is passed from `app/[locale]/page.tsx` and contains all active DB provinces. A revealed province only becomes clickable if its slug appears in `activeProvinces`.

### Full pre-mapped province list (all 18 previously in map)

These are ready to uncomment — `NAME_TO_SLUG` keys were verified against the GeoJSON:

```ts
// 'ĐàNẵng':          'da-nang',
// 'HảiPhòng':        'hai-phong',
// 'CầnThơ':          'can-tho',
// 'QuảngNinh':       'quang-ninh',
// 'LàoCai':          'lao-cai',
// 'ThừaThiênHuế':    'thua-thien-hue',
// 'QuảngNam':        'quang-nam',
// 'KhánhHòa':        'khanh-hoa',
// 'LâmĐồng':         'lam-dong',
// 'AnGiang':         'an-giang',
// 'KiênGiang':       'kien-giang',
// 'ĐiệnBiên':        'dien-bien',
// 'HàGiang':         'ha-giang',
// 'NghệAn':          'nghe-an',
// 'BàRịa-VũngTàu':   'ba-ria-vung-tau',
// 'NinhBình':        'ninh-binh',
```

---

## Visual Design

### 3D Effect Technique

The 3D illusion uses **pure CSS perspective** — no WebGL, no external 3D library.

```
┌─────────────────────────────────────────┐
│  div (perspective: 900px)               │
│    div (rotateX(22deg) rotateZ(-2deg))  │  ← CSS 3D transform
│      svg                                │
│        <defs> gradients + filters       │
│        <rect> ocean background          │
│        <path> muted provinces           │
│        <g> revealed provinces           │
│          <path> extrusion shadow offset │ ← translate(2, 4)
│          <path> main path + gradient    │ ← lifted -2px on hover
└─────────────────────────────────────────┘
```

**CSS transforms applied:**
- Container: `perspective: 900px; perspective-origin: 50% 30%`
- Tilt wrapper: `rotateX(22deg) rotateZ(-2deg)` (3D mode) / `none` (2D mode)
- Tilt transition: `0.6s cubic-bezier(0.23, 1, 0.32, 1)`

**Per-province 3D depth (revealed provinces only):**
- Shadow extrusion: a second `<path>` with `fill="url(#prov-extrude)"` offset by `translate(2, 4)` — creates the raised-from-surface illusion
- SVG `<filter id="shadow-normal">` using `feDropShadow` for soft ambient shadow
- Hover: deeper filter (`shadow-hover`) + CSS `translateY(-2px)` for the "lift" effect
- Gradient fill: linear gradient from `#3d9b72` (top-left) to `#1e5c38` (bottom-right) simulates a light source from top-left

### Color Values

| Token | Hex | Usage |
|-------|-----|-------|
| `prov-active` gradient start | `#3d9b72` | Revealed province top |
| `prov-active` gradient end | `#1e5c38` | Revealed province bottom |
| `prov-hover` gradient start | `#52cc8a` | Hovered province top |
| `prov-hover` gradient end | `#2d7a4e` | Hovered province bottom |
| `prov-extrude` | `#071a0e` | Shadow extrusion layer |
| Hidden province fill | `#1a3a5c` | Muted dark blue |
| Hidden province stroke | `#2a5f8a` | Muted border |
| Ocean gradient start | `#c8dff0` | North (lighter) |
| Ocean gradient end | `#6da8cc` | South (deeper) |

### SVG Defs Reference

```xml
<defs>
  <radialGradient id="ocean-bg" cx="55%" cy="25%" r="75%">
    <!-- lighter top-right → deeper bottom-left -->
  </radialGradient>

  <linearGradient id="prov-active" x1="0%" y1="0%" x2="45%" y2="100%">
    <!-- top-left light source simulation -->
  </linearGradient>

  <linearGradient id="prov-hover" ...> <!-- brighter version of active --> </linearGradient>
  <linearGradient id="prov-extrude" ...> <!-- dark shadow for extrusion layer --> </linearGradient>

  <filter id="shadow-normal">
    <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#071a0e" floodOpacity="0.45" />
  </filter>
  <filter id="shadow-hover">
    <feDropShadow dx="3" dy="7" stdDeviation="5" floodColor="#071a0e" floodOpacity="0.6" />
  </filter>
</defs>
```

---

## Component Props

```ts
type Props = {
  locale: string;               // 'vi' | 'en'
  activeProvinces: {
    slug: string;               // e.g. 'ha-noi'
    type: string;               // Vietnamese type slug, e.g. 'thanh-pho'
    type_en: string;            // English type slug, e.g. 'city'
  }[];
};
```

`activeProvinces` comes from the DB query in `app/[locale]/page.tsx`:
```ts
const activeProvinces = provinces.map((p) => ({
  slug: p.slug,
  type: p.type,
  type_en: p.type_en,
}));
```

A province path is **clickable** only when its slug appears in both `NAME_TO_SLUG` AND `activeProvinces`.

---

## Dependencies

| Package | Version | Why |
|---------|---------|-----|
| `d3-geo` | `^3.1.1` | GeoJSON → SVG path conversion (Mercator projection) |
| `@types/d3-geo` | dev | TypeScript types for d3-geo |

Install: `npm install d3-geo && npm install --save-dev @types/d3-geo`

---

## Map Container (in `app/[locale]/page.tsx`)

The map is wrapped with an ocean-feel gradient background:
```tsx
<div
  className="rounded-2xl shadow-lg border border-heritage-border p-4 mx-auto max-w-2xl overflow-hidden"
  style={{ background: 'radial-gradient(ellipse at 60% 30%, #e3f0ff 0%, #c8e0f8 60%, #a9cce8 100%)' }}
>
  <VietnamMap locale={locale} activeProvinces={activeProvinces} />
</div>
```

---

## Reference: `map-sample/index.html`

The sample file is a standalone HTML implementation using D3 v7 (CDN) that demonstrates:
- Full 63-province rendering with region color coding
- 3D/2D toggle via CSS perspective
- Side panel with province info (pop, area, highlights)
- Region filter pills
- Compass rose SVG overlay
- Province metadata for all 63 provinces (region, population, area, highlights)

The `PROVINCE_DATA` object in `map-sample/index.html` contains rich metadata for all 63 provinces that can be used when expanding the map. The `normalizeName()` function there maps GADM English names to Vietnamese display names.

**Key difference from our implementation:** The sample uses D3's full data-join pattern (`svg.selectAll().data().join()`); our implementation uses React state + `.map()` which integrates better with Next.js.

---

## Known Issues / Future Work

- **Tooltip positioning with 3D tilt:** The tooltip uses `clientX/Y` minus the SVG bounding rect. When the map is tilted, the apparent position of provinces is shifted visually by the CSS perspective. For most cases this is acceptable, but the tooltip may appear slightly offset from the exact hovered province in 3D mode. Switching to 2D mode gives pixel-perfect tooltip placement.

- **Province label overlays:** The sample shows short province names at centroid positions. Not yet implemented in our version. To add: use `geoPath.centroid(feature)` to get `[x, y]` then render `<text>` elements.

- **Mobile / touch:** The 3D tilt can be disorienting on mobile. Consider auto-switching to 2D on small screens: `useEffect(() => { if (window.innerWidth < 640) setIs3D(false); }, [])`.

- **Panning / zoom:** Not implemented. The sample is also static (no zoom). Could add with `d3-zoom` if needed.
