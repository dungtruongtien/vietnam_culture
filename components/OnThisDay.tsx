import Link from 'next/link';

type EventRow = {
  id: number;
  title_vi: string;
  title_en: string;
  content_vi: string;
  content_en: string;
  event_date: string;
  event_date_display: string;
  province_name_vi: string;
  province_name_en: string;
  province_slug: string;
  province_type: string;
  province_type_en: string;
  slug?: string | null;
};

type Props = {
  locale: string;
  todayEvents: EventRow[];
  monthEvents: EventRow[];
  today: { month: number; day: number; year: number };
};

function getEventYear(eventDate: string): number {
  return parseInt(eventDate.split('-')[0], 10);
}

function calcYearsAgo(eventYear: number, currentYear: number): number {
  return currentYear - eventYear;
}

function isRoundAnniversary(years: number): boolean {
  return years % 50 === 0;
}

export default function OnThisDay({ locale, todayEvents, monthEvents, today }: Props) {
  const isVi = locale === 'vi';

  const sortedEvents = [...todayEvents].sort((a, b) => {
    const yearsA = calcYearsAgo(getEventYear(a.event_date), today.year);
    const yearsB = calcYearsAgo(getEventYear(b.event_date), today.year);
    const roundA = isRoundAnniversary(yearsA) ? 1 : 0;
    const roundB = isRoundAnniversary(yearsB) ? 1 : 0;
    if (roundA !== roundB) return roundB - roundA;
    return Math.abs(yearsA - 50) - Math.abs(yearsB - 50);
  });

  const displayEvents = sortedEvents.length > 0 ? sortedEvents.slice(0, 1) : monthEvents.slice(0, 1);
  const isFallback = sortedEvents.length === 0;
  const event = displayEvents[0];

  if (!event) return null;

  const eventYear = getEventYear(event.event_date);
  const yearsAgo = calcYearsAgo(eventYear, today.year);
  const isRound = isRoundAnniversary(yearsAgo);
  const typeSlug = isVi ? event.province_type : event.province_type_en;
  const title = isVi ? event.title_vi : event.title_en;
  const content = isVi ? event.content_vi : event.content_en;
  const provinceName = isVi ? event.province_name_vi : event.province_name_en;
  const preview = content.split('\n')[0];

  const todayFormatted = isVi
    ? `Ngày ${today.day} tháng ${today.month}`
    : new Date(today.year, today.month - 1, today.day).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <section
      className="rounded-3xl overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1B1B1A 0%, #3A0A12 60%, #1B0A0A 100%)' }}
    >
      <div className="px-6 py-8 md:px-10 md:py-10">
        {/* Eyebrow */}
        <p className="text-xs font-medium uppercase tracking-widest mb-6" style={{ color: '#DEC07F' }}>
          {isFallback
            ? isVi ? `Tháng ${today.month}` : `Month ${today.month}`
            : todayFormatted}
          {isRound && (
            <span className="ml-3 text-white/50 normal-case tracking-normal">
              · {isVi ? `Tròn ${yearsAgo} năm` : `${yearsAgo}-year anniversary`}
            </span>
          )}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-12">
          {/* Day block */}
          <div className="flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-0 md:border-r md:border-white/10 md:pr-8">
            <div
              className="font-heading font-semibold leading-none"
              style={{ fontSize: 'clamp(48px, 6vw, 72px)', color: '#C9A24C' }}
            >
              {today.day}
            </div>
            <div>
              <div
                className="font-heading leading-snug"
                style={{ fontSize: '20px', color: '#FBF8F1' }}
              >
                {isVi
                  ? `Tháng ${today.month}, ${today.year}`
                  : new Date(today.year, today.month - 1, today.day).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <div className="text-xs mt-1" style={{ color: 'rgba(251,248,241,0.45)' }}>
                {isVi ? `${yearsAgo} năm trước` : `${yearsAgo} years ago`}
              </div>
            </div>
          </div>

          {/* Event block */}
          <div>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#DEC07F' }}>
              {provinceName}
            </p>
            <Link
              href={
                event.slug
                  ? `/${locale}/${typeSlug}/${event.province_slug}/su-kien/${event.slug}`
                  : `/${locale}/${typeSlug}/${event.province_slug}#history`
              }
              className="block hover:opacity-80 transition-opacity"
            >
              <h2
                className="font-heading font-medium leading-snug mb-4"
                style={{ fontSize: 'clamp(22px, 2vw + 1rem, 34px)', color: '#FBF8F1' }}
              >
                {title}
              </h2>
            </Link>
            <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'rgba(251,248,241,0.72)' }}>
              {preview}
            </p>

            <div className="mt-6 flex items-center gap-3 flex-wrap">
              <Link
                href={
                  event.slug
                    ? `/${locale}/${typeSlug}/${event.province_slug}/su-kien/${event.slug}`
                    : `/${locale}/${typeSlug}/${event.province_slug}#history`
                }
                className="inline-flex items-center gap-1.5 text-sm font-medium rounded-full px-4 py-2 transition-colors"
                style={{ background: '#C8102E', color: '#FBF8F1' }}
              >
                {isVi ? 'Đọc thêm →' : 'Read more →'}
              </Link>
              <Link
                href={`/${locale}/${typeSlug}/${event.province_slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium rounded-full px-4 py-2 transition-colors border"
                style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(251,248,241,0.7)' }}
              >
                {isVi ? `Khám phá ${event.province_name_vi} →` : `Explore ${event.province_name_en} →`}
              </Link>
              <span
                className="text-xs px-3 py-1.5 rounded-full border"
                style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(251,248,241,0.5)' }}
              >
                {event.event_date_display}
              </span>
            </div>
          </div>
        </div>

        {/* More events this period */}
        {sortedEvents.length > 1 && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'rgba(251,248,241,0.4)' }}>
              {isVi ? 'Cũng trong ngày này' : 'Also on this day'}
            </p>
            <div className="flex flex-col gap-2">
              {sortedEvents.slice(1, 3).map((e) => {
                const yr = getEventYear(e.event_date);
                const eTypeSlug = isVi ? e.province_type : e.province_type_en;
                const href = e.slug
                  ? `/${locale}/${eTypeSlug}/${e.province_slug}/su-kien/${e.slug}`
                  : `/${locale}/${eTypeSlug}/${e.province_slug}#history`;
                return (
                  <Link
                    key={e.id}
                    href={href}
                    className="flex items-center gap-3 text-sm hover:opacity-80 transition-opacity"
                    style={{ color: 'rgba(251,248,241,0.6)' }}
                  >
                    <span
                      className="flex-shrink-0 font-heading text-sm font-medium"
                      style={{ color: '#C9A24C', minWidth: '40px' }}
                    >
                      {yr}
                    </span>
                    <span className="line-clamp-1">{isVi ? e.title_vi : e.title_en}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
