import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

import {
  getProvinceBySlug,
  getPlaceItemBySlug,
  getPlaceItemSources,
  getPlaceItemsByProvince,
  getAllProvinces,
} from '@/lib/queries';
import PlaceDetail from '@/components/PlaceDetail';

export async function generateStaticParams() {
  const provinces = await getAllProvinces();
  const locales = ['vi', 'en'];
  const params: { locale: string; type: string; slug: string; placeSlug: string }[] = [];
  for (const province of provinces) {
    const placeItems = await getPlaceItemsByProvince(province.id);
    for (const place of placeItems) {
      for (const locale of locales) {
        params.push({
          locale,
          type: locale === 'vi' ? province.type : province.type_en,
          slug: province.slug,
          placeSlug: place.slug,
        });
      }
    }
  }
  return params;
}

type Props = {
  params: Promise<{ locale: string; type: string; slug: string; placeSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug, placeSlug } = await params;
  const place = await getPlaceItemBySlug(placeSlug);
  if (!place) return {};
  const isVi = locale === 'vi';
  const title = isVi ? place.title_vi : place.title_en;
  const description = isVi ? place.lede_vi : place.lede_en;
  const province = await getProvinceBySlug(slug);
  const provinceName = province ? (isVi ? province.name_vi : province.name_en) : '';
  return {
    title: `${title} — ${provinceName}`,
    description,
    openGraph: { title, description, locale: isVi ? 'vi_VN' : 'en_US', type: 'article' },
  };
}


export default async function PlaceItemPage({ params }: Props) {
  const { locale, slug, placeSlug } = await params;

  const [province, place] = await Promise.all([
    getProvinceBySlug(slug),
    getPlaceItemBySlug(placeSlug),
  ]);

  if (!province || !place) notFound();

  const isVi = locale === 'vi';
  const provinceName = isVi ? province.name_vi : province.name_en;
  const provinceTypeSlug = isVi ? province.type : province.type_en;

  const [sources, allPlaceItems] = await Promise.all([
    getPlaceItemSources(place.id),
    getPlaceItemsByProvince(province.id),
  ]);

  const idx = allPlaceItems.findIndex((p) => p.slug === placeSlug);
  const prevPlace = idx > 0 ? allPlaceItems[idx - 1] : null;
  const nextPlace = idx < allPlaceItems.length - 1 ? allPlaceItems[idx + 1] : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3005';
  const title = isVi ? place.title_vi : place.title_en;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isVi ? 'Trang chủ' : 'Home', item: `${siteUrl}/${locale}` },
      { '@type': 'ListItem', position: 2, name: provinceName, item: `${siteUrl}/${locale}/${provinceTypeSlug}/${slug}` },
      { '@type': 'ListItem', position: 3, name: title, item: `${siteUrl}/${locale}/${provinceTypeSlug}/${slug}/dia-diem/${placeSlug}` },
    ],
  };

  const otherLocale = locale === 'vi' ? 'en' : 'vi';
  const otherTypeSlug = locale === 'vi' ? province.type_en : province.type;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
              href={`/${otherLocale}/${otherTypeSlug}/${slug}/dia-diem/${placeSlug}`}
              className="flex-shrink-0 text-vn-stone hover:text-vn-ink transition-colors font-medium"
            >
              {locale === 'vi' ? 'English' : 'Tiếng Việt'}
            </Link>
          </div>
        </div>

        {/* Header */}
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
              href={`/${locale}/${provinceTypeSlug}/${slug}#culture`}
              className="text-sm text-vn-stone hover:text-vn-ink transition-colors flex items-center gap-1"
            >
              ← {provinceName}
            </Link>
          </div>
        </header>

        {/* Place detail content */}
        <main className="flex-1">
          <PlaceDetail
            locale={locale}
            place={place}
            sources={sources}
            prevPlace={prevPlace}
            nextPlace={nextPlace}
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
