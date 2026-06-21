'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { geoMercator, geoPath } from 'd3-geo';

// ── Types ──────────────────────────────────────────────────────────────────────

type GeoFeature = {
  type: 'Feature';
  properties: { NAME_1: string; [key: string]: string };
  geometry: { type: string; coordinates: unknown[] };
};

type GeoJSON = {
  type: 'FeatureCollection';
  features: GeoFeature[];
};

type Tooltip = {
  x: number;
  y: number;
  name: string;
  isActive: boolean;
};

type Props = {
  locale: string;
  activeProvinces: { slug: string; type: string; type_en: string }[];
};

// ── Province name → slug mapping ───────────────────────────────────────────────
// Only revealed provinces show full styling, tooltips, and hover effects.

const NAME_TO_SLUG: Record<string, string> = {
  'HàNội':     'ha-noi',
  'HồChíMinh': 'ho-chi-minh',
  'ĐàNẵng':          'da-nang',
  // 'HảiPhòng':        'hai-phong',
  // 'CầnThơ':          'can-tho',
  // 'QuảngNinh':       'quang-ninh',
  // 'LàoCai':          'lao-cai',
  'ThừaThiênHuế':    'thua-thien-hue',
  // 'QuảngNam':        'quang-nam',
  // 'KhánhHòa':        'khanh-hoa',
  // 'LâmĐồng':         'lam-dong',
  // 'AnGiang':         'an-giang',
  // 'KiênGiang':       'kien-giang',
  // 'ĐiệnBiên':        'dien-bien',
  'HàGiang':         'ha-giang',
  // 'NghệAn':          'nghe-an',
  // 'BàRịa-VũngTàu':   'ba-ria-vung-tau',
  // 'NinhBình':        'ninh-binh',
};

const DISPLAY_NAMES: Record<string, { vi: string; en: string }> = {
  'HàNội':     { vi: 'Hà Nội',           en: 'Hanoi' },
  'HồChíMinh': { vi: 'TP. Hồ Chí Minh', en: 'Ho Chi Minh City' },
  'ĐàNẵng': { vi: 'Đà Nẵng', en: 'Da Nang' },
  'ThừaThiênHuế': { vi: 'Huế', en: 'Hue' },
  'HàGiang':      { vi: 'Hà Giang', en: 'Ha Giang' },
};

// SVG canvas dimensions (full projection space)
const W = 360;
const H = 780;

// Tight viewBox: province bounds (57,148)–(291,622) + padding, extended south for Trường Sa
const VB_X = 57;
const VB_Y = 148;
const VB_W = 265;  // extended right to show islands at ~x=295
const VB_H = 350;

// Centroids computed from D3 projection (geoMercator center=[106,16] scale=1700 translate=[180,390])
const PIN_HANOI    = { x: 171, y: 234 };
const PIN_HCM      = { x: 201, y: 551 };

export default function VietnamMap({ locale, activeProvinces }: Props) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const [paths, setPaths] = useState<{ name: string; d: string }[]>([]);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  const activeMap = new Map(activeProvinces.map((p) => [p.slug, p]));

  useEffect(() => {
    fetch('/viet-nam-geo.json')
      .then((r) => r.json())
      .then((data: GeoJSON) => {
        const projection = geoMercator()
          .center([106, 16])
          .scale(1700)
          .translate([W / 2, H / 2]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pathGen = geoPath(projection as any);

        const computed = data.features.map((feature) => ({
          name: feature.properties.NAME_1,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          d: pathGen(feature as any) || '',
        }));

        setPaths(computed);
      })
      .catch(console.error);
  }, []);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<SVGPathElement>, name: string) => {
      const slug = NAME_TO_SLUG[name];
      const isActive = !!slug && activeMap.has(slug);
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;
      setHoveredName(name);
      setTooltip({
        x: e.clientX - svgRect.left,
        y: e.clientY - svgRect.top - 12,
        name,
        isActive,
      });
    },
    [activeMap]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGPathElement>) => {
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;
    setTooltip((prev) =>
      prev
        ? { ...prev, x: e.clientX - svgRect.left, y: e.clientY - svgRect.top - 12 }
        : null
    );
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredName(null);
    setTooltip(null);
  }, []);

  const handleClick = useCallback(
    (name: string) => {
      const slug = NAME_TO_SLUG[name];
      if (!slug) return;
      const province = activeMap.get(slug);
      if (!province) return;
      const typeSlug = locale === 'vi' ? province.type : province.type_en;
      router.push(`/${locale}/${typeSlug}/${slug}`);
    },
    [activeMap, locale, router]
  );

  const tooltipLabel = tooltip
    ? (DISPLAY_NAMES[tooltip.name]?.[locale === 'vi' ? 'vi' : 'en'] ?? tooltip.name)
    : '';

  return (
    <div className="relative w-full select-none">
      <svg
        ref={svgRef}
        viewBox={`${VB_X} ${VB_Y} ${VB_W} ${VB_H}`}
        className="w-full h-auto block"
        role="img"
        aria-label={locale === 'vi' ? 'Bản đồ Việt Nam tương tác' : 'Interactive map of Vietnam'}
        onMouseLeave={handleMouseLeave}
      >
        <title>{locale === 'vi' ? 'Bản đồ Việt Nam' : 'Map of Vietnam'}</title>

        <defs>
          {/* Warm sea background gradient */}
          <linearGradient id="seaGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor="#F4F1E8" />
            <stop offset="100%" stopColor="#EDE3CC" />
          </linearGradient>

          {/* Dot pattern overlay */}
          <pattern id="dotPat" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.7" fill="#C9C5BD" opacity="0.5" />
          </pattern>

          {/* Soft shadow for mainland */}
          <filter id="landShadow" x="-5%" y="-5%" width="115%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#1B1B1A" floodOpacity="0.10" />
          </filter>

          {/* Red glow for active provinces */}
          <filter id="redGlow" x="-8%" y="-8%" width="125%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#C8102E" floodOpacity="0.25" />
          </filter>
          <filter id="redGlowHover" x="-10%" y="-10%" width="130%" height="138%">
            <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#C8102E" floodOpacity="0.40" />
          </filter>
        </defs>

        {/* Ocean background */}
        <rect x={VB_X} y={VB_Y} width={VB_W} height={VB_H} fill="url(#seaGrad)" />
        <rect x={VB_X} y={VB_Y} width={VB_W} height={VB_H} fill="url(#dotPat)" opacity="0.6" />

        {paths.length === 0 && (
          <text
            x={VB_X + VB_W / 2}
            y={VB_Y + VB_H / 2}
            textAnchor="middle"
            fill="#6E6A60"
            fontSize="10"
          >
            {locale === 'vi' ? 'Đang tải…' : 'Loading…'}
          </text>
        )}

        {/* Scale map content to fit VB_H=400 — full extent is ~480px tall (y=148→628) */}
        <g transform={`translate(${VB_X},${VB_Y}) scale(${350/480}) translate(${-VB_X},${-VB_Y})`}>

        {/* Province paths */}
        {paths.map(({ name, d }) => {
          const revealed = name in NAME_TO_SLUG;
          const slug = NAME_TO_SLUG[name];
          const active = !!slug && activeMap.has(slug);
          const hovered = hoveredName === name;

          if (!revealed) {
            return (
              <path
                key={name}
                d={d}
                fill="#D9D3C5"
                stroke="#C9C5BD"
                strokeWidth="0.5"
                opacity="0.55"
              />
            );
          }

          return (
            <path
              key={name}
              d={d}
              fill={hovered ? '#A60D26' : '#C8102E'}
              stroke="#8E0A1F"
              strokeWidth={hovered ? '1.5' : '0.8'}
              filter={hovered ? 'url(#redGlowHover)' : 'url(#redGlow)'}
              cursor={active ? 'pointer' : 'default'}
              style={{
                transition: 'fill 0.15s ease, transform 0.15s ease',
                transform: hovered ? 'translate(0, -1px)' : 'none',
                transformBox: 'fill-box',
                transformOrigin: 'center',
              }}
              onMouseEnter={(e) => handleMouseEnter(e, name)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => active && handleClick(name)}
            />
          );
        })}

        {/* ── Hà Nội pin ── */}
        <g className="map-pin" aria-label="Hà Nội">
          <line
            x1={PIN_HANOI.x} y1={PIN_HANOI.y}
            x2={PIN_HANOI.x} y2={PIN_HANOI.y - 28}
            stroke="#8E0A1F" strokeWidth="1.2" strokeDasharray="2 2"
          />
          <circle cx={PIN_HANOI.x} cy={PIN_HANOI.y - 34} r="6" fill="#C8102E" stroke="white" strokeWidth="2" />
          <circle cx={PIN_HANOI.x} cy={PIN_HANOI.y - 34} r="2.5" fill="#DEC07F" />
          <text
            x={PIN_HANOI.x + 10} y={PIN_HANOI.y - 38}
            fontFamily="var(--font-heading), Georgia, serif"
            fontSize="11" fontWeight="600"
            fill="#1B1B1A"
          >
            {locale === 'vi' ? 'Hà Nội' : 'Hanoi'}
          </text>
          <text
            x={PIN_HANOI.x + 10} y={PIN_HANOI.y - 28}
            fontFamily="var(--font-body), system-ui, sans-serif"
            fontSize="6.5"
            fill="#6E6A60"
            letterSpacing="0.08em"
          >
            {locale === 'vi' ? 'THỦ ĐÔ' : 'CAPITAL'}
          </text>
        </g>

        {/* ── Hồ Chí Minh pin ── */}
        <g className="map-pin-delayed" aria-label="Hồ Chí Minh">
          <line
            x1={PIN_HCM.x} y1={PIN_HCM.y}
            x2={PIN_HCM.x} y2={PIN_HCM.y + 26}
            stroke="#8E0A1F" strokeWidth="1.2" strokeDasharray="2 2"
          />
          <circle cx={PIN_HCM.x} cy={PIN_HCM.y + 32} r="6" fill="#C8102E" stroke="white" strokeWidth="2" />
          <circle cx={PIN_HCM.x} cy={PIN_HCM.y + 32} r="2.5" fill="#DEC07F" />
          <text
            x={PIN_HCM.x + 10} y={PIN_HCM.y + 29}
            fontFamily="var(--font-heading), Georgia, serif"
            fontSize="11" fontWeight="600"
            fill="#1B1B1A"
          >
            {locale === 'vi' ? 'Hồ Chí Minh' : 'Ho Chi Minh'}
          </text>
          <text
            x={PIN_HCM.x + 10} y={PIN_HCM.y + 39}
            fontFamily="var(--font-body), system-ui, sans-serif"
            fontSize="6.5"
            fill="#6E6A60"
            letterSpacing="0.08em"
          >
            SOUTH
          </text>
        </g>

        {/* ── Quần đảo Hoàng Sa ── (Paracel Islands — east of central Vietnam) */}
        <g aria-label="Quần đảo Hoàng Sa">
          <circle cx={295} cy={313} r="2.5" fill="#6E6A60" opacity="0.7" />
          <circle cx={303} cy={308} r="2"   fill="#6E6A60" opacity="0.7" />
          <circle cx={310} cy={318} r="2.2" fill="#6E6A60" opacity="0.7" />
          <circle cx={299} cy={323} r="1.8" fill="#6E6A60" opacity="0.7" />
          <circle cx={314} cy={327} r="1.5" fill="#6E6A60" opacity="0.7" />
          <text
            x={282} y={302}
            fontFamily="var(--font-body), system-ui, sans-serif"
            fontSize="5.5"
            fill="#6E6A60"
            letterSpacing="0.06em"
            textAnchor="start"
          >
            {locale === 'vi' ? 'Q.Đ. HOÀNG SA' : 'PARACEL IS.'}
          </text>
        </g>

        {/* ── Quần đảo Trường Sa ── (Spratly Islands — south-east, below mainland) */}
        <g aria-label="Quần đảo Trường Sa">
          <circle cx={283} cy={518} r="2"   fill="#6E6A60" opacity="0.7" />
          <circle cx={295} cy={530} r="2.5" fill="#6E6A60" opacity="0.7" />
          <circle cx={306} cy={545} r="1.8" fill="#6E6A60" opacity="0.7" />
          <circle cx={316} cy={558} r="2.2" fill="#6E6A60" opacity="0.7" />
          <circle cx={290} cy={555} r="1.5" fill="#6E6A60" opacity="0.7" />
          <circle cx={323} cy={570} r="2"   fill="#6E6A60" opacity="0.7" />
          <circle cx={302} cy={572} r="1.8" fill="#6E6A60" opacity="0.7" />
          <circle cx={330} cy={555} r="1.5" fill="#6E6A60" opacity="0.7" />
          <text
            x={273} y={507}
            fontFamily="var(--font-body), system-ui, sans-serif"
            fontSize="5.5"
            fill="#6E6A60"
            letterSpacing="0.06em"
            textAnchor="start"
          >
            {locale === 'vi' ? 'Q.Đ. TRƯỜNG SA' : 'SPRATLY IS.'}
          </text>
        </g>

        {/* ── Biển Đông label ── */}
        <text
          x={267} y={420}
          textAnchor="middle"
          fontFamily="var(--font-heading), Georgia, serif"
          fontSize="9"
          fontStyle="italic"
          fill="#8A8580"
        >
          Biển Đông
        </text>
        <text
          x={267} y={431}
          textAnchor="middle"
          fontFamily="var(--font-body), system-ui, sans-serif"
          fontSize="6.5"
          fill="#8A8580"
        >
          East Sea
        </text>


        </g>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-50 whitespace-nowrap rounded-xl px-3.5 py-2.5 shadow-lg"
          style={{
            background: '#1B1B1A',
            color: '#FBF8F1',
            left: tooltip.x,
            top: Math.max(0, tooltip.y),
            transform: 'translate(-50%, -100%)',
          }}
        >
          <strong
            className="block text-base"
            style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
          >
            {tooltipLabel}
          </strong>
          {tooltip.isActive ? (
            <span className="block text-xs mt-0.5" style={{ color: '#DEC07F' }}>
              {locale === 'vi' ? 'Nhấn để khám phá ↗' : 'Click to explore ↗'}
            </span>
          ) : (
            <span className="block text-xs mt-0.5 text-white/50">
              {locale === 'vi' ? 'Sắp ra mắt' : 'Coming soon'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
