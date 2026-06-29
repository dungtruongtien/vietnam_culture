import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

import {
  getProvinceBySlug,
  getFestivalBySlug,
  getFestivalItemBySlug,
  getFestivalItemSources,
  getFestivalItemsByProvince,
  getAllFestivals,
} from '@/lib/queries';
import FestivalDetail from '@/components/FestivalDetail';

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

type Props = {
  params: Promise<{ locale: string; type: string; slug: string; festivalSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug, festivalSlug } = await params;
  const festivalItem = await getFestivalItemBySlug(festivalSlug);
  const festival = await getFestivalBySlug(slug, festivalSlug);
  if (!festival) return {};
  const isVi = locale === 'vi';
  const title = festivalItem ? (isVi ? festivalItem.title_vi : festivalItem.title_en)
    : (isVi ? festival.name_vi : festival.name_en);
  const description = festivalItem
    ? (isVi ? festivalItem.lede_vi : festivalItem.lede_en)
    : (isVi ? festival.description_vi : festival.description_en);
  const imageUrl = festivalItem?.image_url;
  return {
    title,
    description: description ?? undefined,
    openGraph: {
      title, description: description ?? undefined,
      locale: isVi ? 'vi_VN' : 'en_US', type: 'article',
      ...(imageUrl ? { images: [{ url: imageUrl }] } : {}),
    },
  };
}

export default async function FestivalDetailPage({ params }: Props) {
  const { locale, slug, festivalSlug } = await params;
  const isVi = locale === 'vi';

  const [province, festival, festivalItem] = await Promise.all([
    getProvinceBySlug(slug),
    getFestivalBySlug(slug, festivalSlug),
    getFestivalItemBySlug(festivalSlug),
  ]);

  if (!province || !festival) notFound();

  const provinceTypeSlug = isVi ? province.type : province.type_en;
  const provinceName = isVi ? province.name_vi : province.name_en;
  const otherLocale = isVi ? 'en' : 'vi';
  const otherTypeSlug = isVi ? province.type_en : province.type;

  // If we have a rich festival-item, render the full detail page
  if (festivalItem) {
    const [sources, allFestivalItems] = await Promise.all([
      getFestivalItemSources(festivalItem.id),
      getFestivalItemsByProvince(province.id),
    ]);

    const idx = allFestivalItems.findIndex((fi) => fi.slug === festivalSlug);
    const prevFestival = idx > 0 ? allFestivalItems[idx - 1] : null;
    const nextFestival = idx < allFestivalItems.length - 1 ? allFestivalItems[idx + 1] : null;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3005';
    const title = isVi ? festivalItem.title_vi : festivalItem.title_en;
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: isVi ? 'Trang chủ' : 'Home', item: `${siteUrl}/${locale}` },
        { '@type': 'ListItem', position: 2, name: provinceName, item: `${siteUrl}/${locale}/${provinceTypeSlug}/${slug}` },
        { '@type': 'ListItem', position: 3, name: title, item: `${siteUrl}/${locale}/${provinceTypeSlug}/${slug}/le-hoi/${festivalSlug}` },
      ],
    };

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="min-h-screen flex flex-col" style={{ background: '#FBF8F1' }}>

          {/* Topbar */}
          <div style={{ background: '#3D1A1F' }} className="text-xs">
            <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0" style={{ color: 'rgba(255,255,255,0.55)' }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#C9A24C' }} />
                <span className="truncate">
                  {isVi
                    ? 'Thông tin tổng hợp từ nhiều nguồn — vui lòng kiểm tra từ nguồn chính thống'
                    : 'Information aggregated from multiple sources — please verify from official sources'}
                </span>
              </div>
              <Link
                href={`/${otherLocale}/${otherTypeSlug}/${slug}/le-hoi/${festivalSlug}`}
                className="flex-shrink-0 font-medium transition-colors"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                {locale === 'vi' ? 'English' : 'Tiếng Việt'}
              </Link>
            </div>
          </div>

          {/* Header */}
          <header
            className="sticky top-0 z-40"
            style={{
              background: 'rgba(251,248,241,0.95)',
              backdropFilter: 'saturate(150%) blur(14px)',
              WebkitBackdropFilter: 'saturate(150%) blur(14px)',
              borderBottom: '1px solid #E9E6DE',
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
                href={`/${locale}/${provinceTypeSlug}/${slug}#festivals`}
                className="text-sm text-vn-stone hover:text-vn-ink transition-colors flex items-center gap-1"
              >
                ← {provinceName}
              </Link>
            </div>
          </header>

          {/* Festival detail content */}
          <main className="flex-1">
            <FestivalDetail
              locale={locale}
              festivalItem={festivalItem}
              festival={festival}
              sources={sources}
              prevFestival={prevFestival}
              nextFestival={nextFestival}
              provinceName={provinceName}
              provinceSlug={slug}
              provinceTypeSlug={provinceTypeSlug}
            />
          </main>

          {/* Footer */}
          <footer style={{ background: '#3D1A1F' }} className="text-white/60 mt-8">
            <div className="max-w-7xl mx-auto px-4 pt-10 pb-6">
              <div className="border-t border-white/10 pt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-white/30">
                <span>© {new Date().getFullYear()} {isVi ? 'Khám Phá Việt Nam' : 'Explore Vietnam'}</span>
                <span>{isVi ? 'Không phải nguồn học thuật chính thức' : 'Not an official academic source'}</span>
              </div>
            </div>
          </footer>

        </div>
      </>
    );
  }

  // Fallback: festival exists but no festival-item yet — render old simple layout
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
      <div style={{ background: '#F4EFE6', borderBottom: '1px solid #D9D3C5' }} className="text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0 text-vn-stone">
            <span className="w-1.5 h-1.5 rounded-full bg-vn-gold flex-shrink-0" />
            <span className="truncate">
              {isVi ? 'Thông tin tổng hợp từ nhiều nguồn' : 'Information aggregated from multiple sources'}
            </span>
          </div>
          <Link href={`/${otherLocale}/${otherTypeSlug}/${slug}/le-hoi/${festivalSlug}`} className="flex-shrink-0 text-vn-stone hover:text-vn-ink font-medium">
            {locale === 'vi' ? 'EN' : 'VI'}
          </Link>
        </div>
      </div>
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold uppercase px-3 py-1 rounded-full" style={{ background: '#C8102E', color: '#FBF8F1' }}>
            {isVi ? 'Lễ hội' : 'Festival'}
          </span>
          <span className="text-sm text-vn-stone">{dateDisplay}</span>
        </div>
        <h1 className="font-heading font-semibold text-4xl text-vn-ink mb-8">{name}</h1>
        <div className="space-y-5">
          {paragraphs.map((para, i) => (
            <p key={i} className="text-base leading-relaxed text-vn-stone">{para}</p>
          ))}
        </div>
        <div className="mt-8">
          <Link href={`/${locale}/${provinceTypeSlug}/${slug}#festivals`} className="text-sm text-vn-red hover:underline">
            ← {isVi ? 'Quay lại lễ hội' : 'Back to festivals'}
          </Link>
        </div>
      </main>
    </div>
  );
}
