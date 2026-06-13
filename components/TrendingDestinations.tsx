import Link from 'next/link';
import type { Festival } from '@/lib/queries';

type Props = {
  locale: string;
  festivals: Festival[];
};

function formatDateBlock(dateStr: string): { day: string; month: string } {
  try {
    const date = new Date(dateStr);
    return {
      day: date.getDate().toString(),
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    };
  } catch {
    return { day: '—', month: '—' };
  }
}

function formatDateRange(start: string, end: string | null, locale: string): string {
  try {
    const s = new Date(start);
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const lang = locale === 'vi' ? 'vi-VN' : 'en-US';
    if (!end || end === start) return s.toLocaleDateString(lang, opts);
    const e = new Date(end);
    return `${s.toLocaleDateString(lang, opts)} – ${e.toLocaleDateString(lang, opts)}`;
  } catch {
    return start;
  }
}

export default function TrendingDestinations({ locale, festivals }: Props) {
  const isVi = locale === 'vi';

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="text-xs font-medium text-vn-stone uppercase tracking-widest block mb-1">
            {isVi ? 'Lễ hội sắp diễn ra' : 'Upcoming festivals'}
          </span>
          <h2 className="font-heading text-3xl font-semibold text-vn-ink">
            {isVi ? 'Theo lịch âm và lịch dương — đừng bỏ lỡ.' : "By lunar and solar calendar — don't miss out."}
          </h2>
        </div>
        <a
          href="#"
          className="hidden md:inline-flex items-center text-sm font-medium border border-vn-mist rounded-full px-4 py-2 hover:bg-vn-fog transition-colors flex-shrink-0"
          style={{ color: '#1B1B1A' }}
        >
          {isVi ? 'Lịch đầy đủ →' : 'Full calendar →'}
        </a>
      </div>

      {festivals.length === 0 ? (
        <div
          className="rounded-2xl border border-vn-mist p-8 text-center text-vn-stone"
          style={{ background: '#FFFFFF' }}
        >
          {isVi ? 'Hiện tại không có lễ hội nào sắp diễn ra' : 'No upcoming festivals at the moment'}
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-4 pb-3 snap-x snap-mandatory scrollbar-thin">
          {festivals.map((f) => {
            const name = isVi ? f.name_vi : f.name_en;
            const description = isVi ? f.description_vi : f.description_en;
            const provinceName = isVi ? f.province_name_vi : f.province_name_en;
            const typeSlug = isVi ? f.province_type : f.province_type_en;
            const dateBlock = formatDateBlock(f.start_date);
            const dateRange = formatDateRange(f.start_date, f.end_date, locale);

            return (
              <Link
                key={f.id}
                href={
                  f.slug
                    ? `/${locale}/${typeSlug}/${f.province_slug}/le-hoi/${f.slug}`
                    : `/${locale}/${typeSlug}/${f.province_slug}#festivals`
                }
                className="group flex-none w-72 snap-start rounded-2xl border border-vn-mist p-5 flex gap-4 items-start transition-all hover:-translate-y-0.5 hover:border-vn-gold hover:shadow-md"
                style={{
                  background: '#FFFFFF',
                  boxShadow: '0 2px 4px rgba(27,27,26,0.05)',
                }}
              >
                {/* Date block */}
                <div
                  className="flex-shrink-0 w-14 rounded-xl flex flex-col items-center py-2.5 px-1 text-center"
                  style={{ background: '#FDF1F3', border: '1px solid #F5C0C8' }}
                >
                  <span className="font-heading text-2xl font-semibold leading-none" style={{ color: '#8E0A1F' }}>
                    {dateBlock.day}
                  </span>
                  <span className="text-[10px] uppercase font-medium mt-1" style={{ color: '#C8102E' }}>
                    {dateBlock.month}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {f.is_trending && (
                      <span
                        className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                        style={{ background: '#C8102E', color: '#FBF8F1' }}
                      >
                        {isVi ? 'Nổi bật' : 'Trending'}
                      </span>
                    )}
                    {f.is_lunar ? (
                      <span
                        className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full"
                        style={{ background: '#EEF6F0', color: '#1F5B40', border: '1px solid #A3D4B8' }}
                      >
                        {isVi ? '🌙 Âm lịch' : '🌙 Lunar'}
                      </span>
                    ) : (
                      <span
                        className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full"
                        style={{ background: '#FBF6E8', color: '#8A6C00', border: '1px solid #E8D48A' }}
                      >
                        {isVi ? '☀️ Dương lịch' : '☀️ Solar'}
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-base font-medium text-vn-ink line-clamp-2 leading-snug group-hover:text-vn-red transition-colors">
                    {name}
                  </h3>
                  <p className="text-xs text-vn-stone mt-1">{provinceName}</p>
                  {description && (
                    <p className="text-xs text-vn-stone mt-1.5 line-clamp-2 leading-relaxed">{description}</p>
                  )}
                  <p className="text-xs text-vn-stone/60 mt-2">📅 {dateRange}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
