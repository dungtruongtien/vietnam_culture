'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Event, Source } from '@/lib/queries';

type EventWithSources = Event & { sources: Source[] };

type Props = {
  locale: string;
  events: EventWithSources[];
  provinceSlug: string;
  provinceTypeSlug: string;
};

type Era = { labelVi: string; labelEn: string; sublabelVi: string; sublabelEn: string; yearStart: number; yearEnd: number };

const ERAS: Era[] = [
  { labelVi: 'Tiền thuộc địa · 1698 — 1858', labelEn: 'Pre-colonial · 1698 — 1858', sublabelVi: 'Phủ Gia Định', sublabelEn: 'Gia Dinh Prefecture', yearStart: 0, yearEnd: 1858 },
  { labelVi: 'Pháp thuộc · 1859 — 1954', labelEn: 'French colonial · 1859 — 1954', sublabelVi: 'Sài Gòn thuộc địa', sublabelEn: 'Colonial Saigon', yearStart: 1859, yearEnd: 1954 },
  { labelVi: 'Hiện đại · 1955 — 1986', labelEn: 'Modern · 1955 — 1986', sublabelVi: 'Thống nhất & đổi tên', sublabelEn: 'Reunification & renaming', yearStart: 1955, yearEnd: 1986 },
  { labelVi: 'Đổi mới · 1986 — nay', labelEn: 'Doi Moi · 1986 — present', sublabelVi: 'Thành phố toàn cầu', sublabelEn: 'Global city', yearStart: 1987, yearEnd: 9999 },
];

const ERA_CHIPS_VI = ['Tất cả', 'Tiền thuộc địa', 'Pháp thuộc', 'Hiện đại', 'Đổi mới'];
const ERA_CHIPS_EN = ['All', 'Pre-colonial', 'French colonial', 'Modern', 'Doi Moi'];

export default function Timeline({ locale, events, provinceSlug, provinceTypeSlug }: Props) {
  const [activeEra, setActiveEra] = useState(0);
  const isVi = locale === 'vi';

  if (events.length === 0) {
    return (
      <div className="text-center text-vn-stone py-12">
        {isVi ? 'Chưa có sự kiện lịch sử nào' : 'No historical events yet'}
      </div>
    );
  }

  // Group events into eras, keeping only non-empty ones
  const grouped = ERAS.map((era) => ({
    ...era,
    events: events.filter((e) => {
      const yr = parseInt(e.event_date.split('-')[0], 10);
      return yr >= era.yearStart && yr <= era.yearEnd;
    }),
  })).filter((g) => g.events.length > 0);

  // activeEra 0 = all; 1..n = the n-th populated era
  const visibleGroups = activeEra === 0 ? grouped : grouped.slice(activeEra - 1, activeEra);

  const chips = isVi ? ERA_CHIPS_VI : ERA_CHIPS_EN;

  return (
    <div>
      {/* Era filter chips */}
      <div className="flex flex-wrap gap-2 mb-10">
        {chips.map((chip, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveEra(i)}
            className="px-3.5 py-2 rounded-full border text-sm font-medium transition-all"
            style={
              activeEra === i
                ? { background: '#8E0A1F', color: '#FBF8F1', borderColor: '#8E0A1F' }
                : { background: '#FFFFFF', color: '#6E6A60', borderColor: '#D9D3C5' }
            }
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative" style={{ paddingLeft: 36 }}>
        {/* Vertical line */}
        <div
          className="absolute top-3 bottom-3"
          style={{
            left: 14,
            width: 2,
            background: 'linear-gradient(to bottom, transparent, #E8D48A 8%, #D9D3C5 92%, transparent)',
          }}
        />

        {visibleGroups.map((group, gi) => (
          <div key={gi}>
            {/* Era header */}
            <div
              className="flex items-center gap-3 relative"
              style={{ marginTop: gi === 0 ? 0 : 48, marginBottom: 24 }}
            >
              {/* Circle dot on the line */}
              <div
                className="absolute rounded-full flex items-center justify-center"
                style={{
                  left: -36,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 30,
                  height: 30,
                  background: '#8E0A1F',
                }}
              />
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-vn-stone">
                  {isVi ? group.labelVi : group.labelEn}
                </div>
                <div className="font-heading text-xl italic font-medium text-vn-ink mt-0.5">
                  {isVi ? group.sublabelVi : group.sublabelEn}
                </div>
              </div>
            </div>

            {/* Events in this era */}
            {group.events.map((event) => {
              const title = isVi ? event.title_vi : event.title_en;
              const content = isVi ? event.content_vi : event.content_en;
              const paragraphs = content.split('\n\n').filter(Boolean);

              // Parse display: "17/02/1859 · Đêm tấn công" → date part + subtitle
              const displayParts = event.event_date_display?.split('·').map((s) => s.trim()) ?? [];
              const datePart = displayParts[0] || event.event_date.split('-')[0];
              const subPart = displayParts[1] || '';

              const isFeatured = event.event_date.startsWith('1975');

              return (
                <article
                  key={event.id}
                  className="relative rounded-2xl border mb-6 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-vn-gold"
                  style={{
                    background: '#FFFFFF',
                    borderColor: '#D9D3C5',
                    padding: '24px 24px 20px',
                    boxShadow: '0 2px 4px rgba(27,27,26,0.04)',
                  }}
                >
                  {/* Red dot on the line */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      left: -28,
                      top: 28,
                      width: 14,
                      height: 14,
                      background: isFeatured ? '#C8102E' : '#FBF8F1',
                      border: `2.5px solid ${isFeatured ? '#C9A24C' : '#C8102E'}`,
                      boxShadow: isFeatured
                        ? '0 0 0 5px rgba(201,162,76,0.18)'
                        : '0 0 0 4px rgba(200,16,46,0.10)',
                    }}
                  />

                  {/* Event header: date + tag */}
                  <div className="flex flex-wrap items-baseline gap-3 mb-3">
                    <div>
                      <span className="font-heading text-2xl font-semibold leading-none" style={{ color: '#8E0A1F' }}>
                        {datePart}
                      </span>
                      {subPart && (
                        <small className="block text-[10px] font-medium uppercase tracking-widest text-vn-stone mt-1">
                          {subPart}
                        </small>
                      )}
                    </div>
                    {isFeatured && (
                      <span
                        className="text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full"
                        style={{ background: '#FCE7EE', color: '#8E0A1F' }}
                      >
                        {isVi ? 'Quốc lễ' : 'National holiday'}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  {event.slug ? (
                    <Link
                      href={`/${locale}/${provinceTypeSlug}/${provinceSlug}/su-kien/${event.slug}`}
                      className="block hover:text-vn-red transition-colors"
                    >
                      <h3 className="font-heading text-xl font-medium text-vn-ink leading-snug mb-3 hover:text-vn-red">{title}</h3>
                    </Link>
                  ) : (
                    <h3 className="font-heading text-xl font-medium text-vn-ink leading-snug mb-3">{title}</h3>
                  )}

                  {/* Body */}
                  {paragraphs.map((para, i) => (
                    <p key={i} className="text-sm text-vn-stone leading-relaxed max-w-[68ch]">{para}</p>
                  ))}

                  {/* Sources */}
                  {event.sources.length > 0 && (
                    <div className="mt-5 pt-4" style={{ borderTop: '1px dashed #D9D3C5' }}>
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-vn-stone mb-3">
                        {isVi
                          ? `Nguồn tham khảo · ${event.sources.length} độc lập`
                          : `References · ${event.sources.length} independent`}
                      </div>
                      <ul className="flex flex-wrap gap-2">
                        {event.sources.map((source) => (
                          <li key={source.id}>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:border-vn-red hover:bg-red-50 hover:text-vn-red"
                              style={{ borderColor: '#D9D3C5', color: '#1B1B1A', background: '#FBF8F1' }}
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#8A8580' }}>
                                <path d="M7 17 17 7M7 7h10v10" />
                              </svg>
                              {source.publisher || source.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Detail link */}
                  {event.slug && (
                    <div className="mt-4">
                      <Link
                        href={`/${locale}/${provinceTypeSlug}/${provinceSlug}/su-kien/${event.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-4 py-1.5 transition-colors"
                        style={{ background: '#C8102E', color: '#FBF8F1' }}
                      >
                        {isVi ? 'Xem chi tiết →' : 'Read more →'}
                      </Link>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
