import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import {
  getProvinceBySlug,
  getEventBySlug,
  getSourcesForEntity,
  getEventsByProvince,
} from '@/lib/queries';

type Props = {
  params: Promise<{ locale: string; type: string; slug: string; eventSlug: string }>;
};


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug, eventSlug } = await params;
  const event = await getEventBySlug(slug, eventSlug);
  if (!event) return {};
  const isVi = locale === 'vi';
  return {
    title: isVi ? event.title_vi : event.title_en,
    description: (isVi ? event.content_vi : event.content_en).split('\n')[0].slice(0, 160),
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { locale, slug, eventSlug } = await params;
  const isVi = locale === 'vi';

  const [province, event] = await Promise.all([
    getProvinceBySlug(slug),
    getEventBySlug(slug, eventSlug),
  ]);

  if (!province || !event) notFound();

  const [sources, allProvinceEvents] = await Promise.all([
    getSourcesForEntity('event', event.id),
    getEventsByProvince(province.id),
  ]);

  const relatedEvents = allProvinceEvents
    .filter((e) => e.slug && e.slug !== eventSlug)
    .slice(0, 3);

  const provinceTypeSlug = isVi ? province.type : province.type_en;
  const provinceName = isVi ? province.name_vi : province.name_en;
  const otherLocale = isVi ? 'en' : 'vi';
  const otherLang = isVi ? 'EN' : 'VI';
  const otherTypeSlug = isVi ? province.type_en : province.type;
  const title = isVi ? event.title_vi : event.title_en;
  const paragraphs = (isVi ? event.content_vi : event.content_en).split('\n').filter(Boolean);
  const eventYear = parseInt(event.event_date.split('-')[0], 10);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FBF8F1' }}>

      {/* Topbar */}
      <div style={{ background: '#F4EFE6', borderBottom: '1px solid #D9D3C5' }} className="text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0 text-vn-stone">
            <span className="w-1.5 h-1.5 rounded-full bg-vn-gold flex-shrink-0" />
            <span className="truncate">
              {isVi
                ? 'Thông tin tổng hợp từ nhiều nguồn — vui lòng kiểm tra từ nguồn chính thống'
                : 'Information aggregated from multiple sources — please verify from official sources'}
            </span>
          </div>
          <Link
            href={`/${otherLocale}/${otherTypeSlug}/${slug}/su-kien/${eventSlug}`}
            className="flex-shrink-0 text-vn-stone hover:text-vn-ink transition-colors font-medium"
          >
            {otherLang}
          </Link>
        </div>
      </div>

      {/* Header — frosted glass */}
      <header
        className="sticky top-0 z-40 border-b border-vn-mist"
        style={{
          background: 'rgba(251,248,241,0.88)',
          backdropFilter: 'saturate(150%) blur(14px)',
          WebkitBackdropFilter: 'saturate(150%) blur(14px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-[64px] flex items-center justify-between gap-4">
          <Link href={`/${locale}`} className="flex items-center gap-3 flex-shrink-0">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: '#C8102E', boxShadow: '0 2px 4px rgba(27,27,26,0.15)' }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 16 C10 16 4 11 4 7 C4 4.8 6 3 8 4 C8.8 4.4 9.4 5 10 6 C10.6 5 11.2 4.4 12 4 C14 3 16 4.8 16 7 C16 11 10 16 10 16Z" stroke="#DEC07F" strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
                <path d="M10 16 L10 9" stroke="#DEC07F" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-heading text-xl font-semibold text-vn-ink leading-none">
              {isVi ? 'Khám Phá Việt Nam' : 'Explore Vietnam'}
            </span>
          </Link>
          <Link
            href={`/${locale}/${provinceTypeSlug}/${slug}`}
            className="text-sm text-vn-stone hover:text-vn-ink transition-colors flex items-center gap-1"
          >
            ← {provinceName}
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-vn-stone mb-8 flex-wrap">
          <Link href={`/${locale}`} className="hover:text-vn-ink transition-colors">
            {isVi ? 'Trang chủ' : 'Home'}
          </Link>
          <span>/</span>
          <Link href={`/${locale}/${provinceTypeSlug}/${slug}`} className="hover:text-vn-ink transition-colors">
            {provinceName}
          </Link>
          <span>/</span>
          <Link href={`/${locale}/${provinceTypeSlug}/${slug}#history`} className="hover:text-vn-ink transition-colors">
            {isVi ? 'Lịch sử' : 'History'}
          </Link>
          <span>/</span>
          <span className="text-vn-ink line-clamp-1">{title}</span>
        </nav>

        {/* Era badge + date */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-xs font-semibold uppercase px-3 py-1 rounded-full"
            style={{ background: '#C8102E', color: '#FBF8F1' }}
          >
            {isVi ? 'Sự kiện lịch sử' : 'Historical Event'}
          </span>
          <span className="text-sm text-vn-stone">{event.event_date_display}</span>
        </div>

        {/* Title */}
        <h1
          className="font-heading font-semibold leading-tight mb-6"
          style={{ fontSize: 'clamp(26px, 3vw + 1rem, 40px)', color: '#1B1B1A' }}
        >
          {title}
        </h1>

        {/* Province tag */}
        <div className="flex items-center gap-2 mb-8 pb-8 border-b border-vn-mist">
          <span className="text-xs text-vn-stone">
            {isVi ? 'Địa điểm:' : 'Location:'}
          </span>
          <Link
            href={`/${locale}/${provinceTypeSlug}/${slug}`}
            className="text-xs font-medium text-vn-red hover:text-vn-red-dark transition-colors"
          >
            {provinceName}
          </Link>
          <span className="text-vn-mist">·</span>
          <span className="text-xs text-vn-stone">{eventYear}</span>
        </div>

        {/* Content */}
        <article className="prose-custom space-y-5 mb-10">
          {paragraphs.map((para, i) => (
            <p key={i} className="text-base leading-relaxed" style={{ color: '#3A3833' }}>
              {para}
            </p>
          ))}
        </article>

        {/* Sources */}
        {sources.length > 0 && (
          <section className="mt-10 pt-8 border-t border-vn-mist">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-vn-stone mb-4">
              {isVi ? 'Nguồn tham khảo' : 'Sources'}
            </h2>
            <ol className="space-y-3">
              {sources.map((s, i) => (
                <li key={s.id} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 font-medium text-vn-stone">{i + 1}.</span>
                  <div>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:underline"
                      style={{ color: '#C8102E' }}
                    >
                      {s.title}
                    </a>
                    <p className="text-xs text-vn-stone mt-0.5">
                      {s.publisher} · {s.accessed_date}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Related events */}
        {relatedEvents.length > 0 && (
          <section className="mt-10 pt-8 border-t border-vn-mist">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-vn-stone mb-5">
              {isVi ? `Cùng chủ đề · ${provinceName}` : `More from ${provinceName}`}
            </h2>
            <div className="grid gap-3">
              {relatedEvents.map((e) => {
                const eTitle = isVi ? e.title_vi : e.title_en;
                const eYear = e.event_date.split('-')[0];
                return (
                  <Link
                    key={e.id}
                    href={`/${locale}/${provinceTypeSlug}/${slug}/su-kien/${e.slug}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-vn-mist hover:border-vn-gold hover:-translate-y-0.5 hover:shadow-sm transition-all"
                    style={{ background: '#FFFFFF' }}
                  >
                    <span
                      className="flex-shrink-0 font-heading text-lg font-semibold w-14 text-center"
                      style={{ color: '#8E0A1F' }}
                    >
                      {eYear}
                    </span>
                    <span className="text-sm font-medium text-vn-ink leading-snug">{eTitle}</span>
                    <span className="ml-auto text-vn-stone text-xs flex-shrink-0">→</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Back link */}
        <div className="mt-10 pt-6 border-t border-vn-mist">
          <Link
            href={`/${locale}/${provinceTypeSlug}/${slug}#history`}
            className="inline-flex items-center gap-2 text-sm font-medium rounded-full px-5 py-2.5 border border-vn-mist hover:border-vn-red hover:text-vn-red transition-colors"
            style={{ color: '#3A3833' }}
          >
            ← {isVi ? `Lịch sử ${provinceName}` : `${provinceName} History`}
          </Link>
        </div>

      </main>

      {/* Footer */}
      <footer style={{ background: '#3D1A1F' }} className="text-white/60 mt-8">
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-6">
          <div className="border-t border-white/10 pt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-white/30">
            <span>© {new Date().getFullYear()} {isVi ? 'Khám Phá Việt Nam' : 'Explore Vietnam'}</span>
            <span>{isVi ? 'Không phải nguồn học thuật chính thức' : 'Not an official academic source'}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
