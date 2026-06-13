import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import {
  getProvinceBySlug,
  getFestivalBySlug,
  getFestivalsByProvince,
  getSourcesForEntity,
  getAllFestivals,
} from '@/lib/queries';

type Props = {
  params: Promise<{ locale: string; type: string; slug: string; festivalSlug: string }>;
};

export async function generateStaticParams() {
  const festivals = await getAllFestivals();
  const locales = ['vi', 'en'];
  const params: { locale: string; type: string; slug: string; festivalSlug: string }[] = [];
  for (const f of festivals) {
    if (!f.slug) continue;
    for (const locale of locales) {
      params.push({
        locale,
        type: locale === 'vi' ? f.province_type : f.province_type_en,
        slug: f.province_slug,
        festivalSlug: f.slug,
      });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug, festivalSlug } = await params;
  const festival = await getFestivalBySlug(slug, festivalSlug);
  if (!festival) return {};
  const isVi = locale === 'vi';
  const title = isVi ? festival.name_vi : festival.name_en;
  const description = isVi ? festival.description_vi : festival.description_en;
  return {
    title,
    description: description ?? undefined,
    openGraph: { title, description: description ?? undefined, locale: isVi ? 'vi_VN' : 'en_US', type: 'article' },
  };
}

export default async function FestivalDetailPage({ params }: Props) {
  const { locale, slug, festivalSlug } = await params;
  const isVi = locale === 'vi';

  const [province, festival] = await Promise.all([
    getProvinceBySlug(slug),
    getFestivalBySlug(slug, festivalSlug),
  ]);

  if (!province || !festival) notFound();

  const [sources, allFestivals] = await Promise.all([
    getSourcesForEntity('festival', festival.id),
    getFestivalsByProvince(province.id),
  ]);

  const relatedFestivals = allFestivals
    .filter((f) => f.slug && f.slug !== festivalSlug)
    .slice(0, 3);

  const provinceTypeSlug = isVi ? province.type : province.type_en;
  const provinceName = isVi ? province.name_vi : province.name_en;
  const otherLocale = isVi ? 'en' : 'vi';
  const otherLang = isVi ? 'EN' : 'VI';
  const otherTypeSlug = isVi ? province.type_en : province.type;

  const name = isVi ? festival.name_vi : festival.name_en;
  const content = isVi ? festival.content_vi : festival.content_en;
  const paragraphs = content ? content.split('\n\n').filter(Boolean) : [];

  const startDate = new Date(festival.start_date);
  const endDate = festival.end_date ? new Date(festival.end_date) : null;
  const lang = isVi ? 'vi-VN' : 'en-US';
  const dateOpts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  const dateDisplay = endDate && festival.end_date !== festival.start_date
    ? `${startDate.toLocaleDateString(lang, dateOpts)} – ${endDate.toLocaleDateString(lang, dateOpts)}`
    : startDate.toLocaleDateString(lang, dateOpts);

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
            href={`/${otherLocale}/${otherTypeSlug}/${slug}/le-hoi/${festivalSlug}`}
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

      <main className="flex-1" style={{ background: '#FFFFFF' }}>

        {/* Breadcrumb */}
        <nav className="max-w-7xl mx-auto w-full px-4 py-3" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-vn-stone flex-wrap">
            <li><Link href={`/${locale}`} className="hover:text-vn-ink transition-colors">{isVi ? 'Trang chủ' : 'Home'}</Link></li>
            <li aria-hidden="true" className="font-heading italic text-vn-mist">›</li>
            <li><Link href={`/${locale}/${provinceTypeSlug}/${slug}`} className="hover:text-vn-ink transition-colors">{provinceName}</Link></li>
            <li aria-hidden="true" className="font-heading italic text-vn-mist">›</li>
            <li><Link href={`/${locale}/${provinceTypeSlug}/${slug}#festivals`} className="hover:text-vn-ink transition-colors">{isVi ? 'Lễ hội' : 'Festivals'}</Link></li>
            <li aria-hidden="true" className="font-heading italic text-vn-mist">›</li>
            <li aria-current="page" className="text-vn-ink font-medium">{name}</li>
          </ol>
        </nav>

        {/* 3-col layout: ad | content | ad */}
        <div className="max-w-[1500px] mx-auto px-4 py-8 flex gap-6 items-start">

          {/* Left ad */}
          <aside className="hidden xl:flex flex-col gap-4 flex-shrink-0 w-[160px] sticky top-[80px]">
            <div className="w-[160px] h-[600px] rounded-xl flex items-center justify-center text-[10px] text-vn-mist" style={{ background: '#F0EDE7', border: '1px dashed #D9D3C5' }}>Ad</div>
          </aside>

          {/* Content card */}
          <div className="flex-1 min-w-0 rounded-2xl px-8 py-8" style={{ background: '#FFFFFF', border: '1px solid #EDE3CC' }}>

        {/* Badge + date */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span
            className="text-xs font-semibold uppercase px-3 py-1 rounded-full"
            style={{ background: '#C8102E', color: '#FBF8F1' }}
          >
            {isVi ? 'Lễ hội' : 'Festival'}
          </span>
          {festival.is_lunar ? (
            <span
              className="text-xs font-medium uppercase px-3 py-1 rounded-full"
              style={{ background: '#EEF6F0', color: '#1F5B40', border: '1px solid #A3D4B8' }}
            >
              {isVi ? '🌙 Âm lịch' : '🌙 Lunar calendar'}
            </span>
          ) : (
            <span
              className="text-xs font-medium uppercase px-3 py-1 rounded-full"
              style={{ background: '#FBF6E8', color: '#8A6C00', border: '1px solid #E8D48A' }}
            >
              {isVi ? '☀️ Dương lịch' : '☀️ Solar calendar'}
            </span>
          )}
          <span className="text-sm text-vn-stone">{dateDisplay}</span>
        </div>

        {/* Title */}
        <h1
          className="font-heading font-semibold leading-tight mb-6"
          style={{ fontSize: 'clamp(26px, 3vw + 1rem, 40px)', color: '#1B1B1A' }}
        >
          {name}
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
        </div>

        {/* Content */}
        {paragraphs.length > 0 ? (
          <article className="prose-custom space-y-5 mb-10">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-base leading-relaxed" style={{ color: '#3A3833' }}>
                {para}
              </p>
            ))}
          </article>
        ) : (
          <p className="text-base leading-relaxed mb-10" style={{ color: '#3A3833' }}>
            {isVi ? festival.description_vi : festival.description_en}
          </p>
        )}

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

        {/* Related festivals */}
        {relatedFestivals.length > 0 && (
          <section className="mt-10 pt-8 border-t border-vn-mist">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-vn-stone mb-5">
              {isVi ? `Lễ hội khác · ${provinceName}` : `More festivals · ${provinceName}`}
            </h2>
            <div className="grid gap-3">
              {relatedFestivals.map((f) => {
                const fName = isVi ? f.name_vi : f.name_en;
                const fDate = new Date(f.start_date).toLocaleDateString(lang, { month: 'short', day: 'numeric' });
                return (
                  <Link
                    key={f.id}
                    href={`/${locale}/${provinceTypeSlug}/${slug}/le-hoi/${f.slug}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-vn-mist hover:border-vn-gold hover:-translate-y-0.5 hover:shadow-sm transition-all"
                    style={{ background: '#FFFFFF' }}
                  >
                    <span
                      className="flex-shrink-0 font-heading text-base font-semibold w-14 text-center"
                      style={{ color: '#8E0A1F' }}
                    >
                      {fDate}
                    </span>
                    <span className="text-sm font-medium text-vn-ink leading-snug">{fName}</span>
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
            href={`/${locale}/${provinceTypeSlug}/${slug}#festivals`}
            className="inline-flex items-center gap-2 text-sm font-medium rounded-full px-5 py-2.5 border border-vn-mist hover:border-vn-red hover:text-vn-red transition-colors"
            style={{ color: '#3A3833' }}
          >
            ← {isVi ? `Lễ hội ${provinceName}` : `${provinceName} Festivals`}
          </Link>
        </div>

          </div>{/* end content card */}

          {/* Right ad */}
          <aside className="hidden xl:flex flex-col gap-4 flex-shrink-0 w-[160px] sticky top-[80px]">
            <div className="w-[160px] h-[600px] rounded-xl flex items-center justify-center text-[10px] text-vn-mist" style={{ background: '#F0EDE7', border: '1px dashed #D9D3C5' }}>Ad</div>
          </aside>

        </div>{/* end 3-col */}

      </main>

      {/* Footer */}
      <footer style={{ background: '#3D1A1F' }} className="text-white/60 mt-8">
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-6">
          <div className="border-t border-white/10 pt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-white/30">
            <span>© {new Date().getFullYear()} {isVi ? 'Khám Phá Việt Nam' : 'Explore Vietnam'}</span>
            <span>{isVi ? 'Không phải nguồn học thuật chính thống' : 'Not an official academic source'}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
