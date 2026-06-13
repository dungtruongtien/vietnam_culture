import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import {
  getProvinceBySlug,
  getProvinces,
  getEventsByProvince,
  getSourcesForEntity,
  getCulturalPosts,
  getFoodItemsByProvince,
  getPlaceItemsByProvince,
  getAllProvinces,
} from '@/lib/queries';
import Timeline from '@/components/Timeline';
import CulturalPostList from '@/components/CulturalPostList';
import AdSlot from '@/components/AdSlot';

type Props = {
  params: Promise<{ locale: string; type: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const province = await getProvinceBySlug(slug);
  if (!province) return {};

  const isVi = locale === 'vi';
  const name = isVi ? province.name_vi : province.name_en;
  const description = isVi ? province.meta_description_vi : province.meta_description_en;

  return {
    title: name,
    description: description || undefined,
    openGraph: {
      title: name,
      description: description || undefined,
      locale: isVi ? 'vi_VN' : 'en_US',
      type: 'website',
    },
  };
}

export async function generateStaticParams() {
  const provinces = await getAllProvinces();
  const locales = ['vi', 'en'];
  return locales.flatMap((locale) =>
    provinces.map((p) => ({
      locale,
      type: locale === 'vi' ? p.type : p.type_en,
      slug: p.slug,
    }))
  );
}

export default async function ProvincePage({ params }: Props) {
  const { locale, slug } = await params;

  const province = await getProvinceBySlug(slug);
  if (!province) notFound();

  const isVi = locale === 'vi';
  const name = isVi ? province.name_vi : province.name_en;
  const siteHome = isVi ? 'Trang chủ' : 'Home';

  const rawEvents = await getEventsByProvince(province.id);
  const events = await Promise.all(rawEvents.map(async (event) => ({
    ...event,
    sources: await getSourcesForEntity('event', event.id),
  })));

  const rawPosts = await getCulturalPosts(province.id);
  const culturalPosts = await Promise.all(rawPosts.map(async (post) => ({
    ...post,
    sources: await getSourcesForEntity('cultural_post', post.id),
  })));

  const [foodItems, placeItems, allProvinces] = await Promise.all([
    getFoodItemsByProvince(province.id),
    getPlaceItemsByProvince(province.id),
    getProvinces(),
  ]);
  const foodSlugs: Record<number, string> = Object.fromEntries(
    foodItems.map((f) => [f.cultural_post_id, f.slug])
  );
  const placeSlugs: Record<number, string> = Object.fromEntries(
    placeItems.map((p) => [p.cultural_post_id, p.slug])
  );
  const foodImageUrls: Record<number, string> = Object.fromEntries(
    foodItems.filter((f) => f.image_url).map((f) => [f.cultural_post_id, f.image_url!])
  );
  const placeImageUrls: Record<number, string> = Object.fromEntries(
    placeItems.filter((p) => p.image_url).map((p) => [p.cultural_post_id, p.image_url!])
  );
  const relatedProvinces = allProvinces.filter((p) => p.slug !== slug);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const typeSlug = isVi ? province.type : province.type_en;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: siteHome, item: `${siteUrl}/${locale}` },
      { '@type': 'ListItem', position: 2, name, item: `${siteUrl}/${locale}/${typeSlug}/${slug}` },
    ],
  };

  const otherLocale = locale === 'vi' ? 'en' : 'vi';
  const otherLang = locale === 'vi' ? 'English' : 'Tiếng Việt';
  const otherTypeSlug = locale === 'vi' ? province.type_en : province.type;

  const typeLabelVi = province.type === 'thanh-pho' ? 'Thành phố trực thuộc Trung ương' : 'Tỉnh';
  const typeLabelEn = province.type_en === 'city' ? 'Municipality' : 'Province';
  const typeLabel = isVi ? typeLabelVi : typeLabelEn;


  const displayEvents = events;
  const displayCulturalPosts = culturalPosts;
  const displayFeaturedEvent = displayEvents[displayEvents.length - 1] ?? null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
              href={`/${otherLocale}/${otherTypeSlug}/${slug}`}
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
              href={`/${locale}`}
              className="text-sm text-vn-stone hover:text-vn-ink transition-colors flex items-center gap-1"
            >
              ← {siteHome}
            </Link>
          </div>
        </header>

        {/* Ad — top */}
        <div className="max-w-7xl mx-auto w-full px-4 mt-3">
          <AdSlot id={`${slug}-banner-top`} size="leaderboard" />
        </div>

        {/* Cover hero */}
        <section className="relative overflow-hidden" style={{ minHeight: '420px' }} aria-labelledby="city-title">
          {/* Illustrated skyline background */}
          <div className="absolute inset-0" aria-hidden="true">
            {slug === 'ho-chi-minh' ? (
              <svg viewBox="0 0 1440 420" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <linearGradient id="skyGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#7A2A2A"/>
                    <stop offset="45%" stopColor="#B5460E"/>
                    <stop offset="75%" stopColor="#D4A24C"/>
                    <stop offset="100%" stopColor="#EDE3CC"/>
                  </linearGradient>
                </defs>
                <rect width="1440" height="420" fill="url(#skyGrad)"/>
                <circle cx="1080" cy="290" r="70" fill="#F4D8B5" opacity="0.85"/>
                <circle cx="1080" cy="290" r="110" fill="#F4D8B5" opacity="0.15"/>
                <path d="M0 300 L180 275 L360 285 L540 265 L720 280 L900 270 L1080 280 L1260 272 L1440 285 L1440 420 L0 420 Z" fill="#3D1A1F" opacity="0.65"/>
                <g fill="#3D1A1F">
                  <rect x="80" y="250" width="55" height="170"/>
                  <rect x="150" y="215" width="38" height="205"/>
                  <rect x="200" y="265" width="45" height="155"/>
                  <rect x="260" y="195" width="28" height="225"/>
                  <rect x="300" y="240" width="50" height="180"/>
                  <rect x="375" y="125" width="25" height="295"/>
                  <ellipse cx="387" cy="125" rx="38" ry="12" fill="#3D1A1F"/>
                  <rect x="420" y="225" width="42" height="195"/>
                  <rect x="475" y="210" width="50" height="210"/>
                  <rect x="540" y="250" width="55" height="170"/>
                  <rect x="610" y="225" width="32" height="195"/>
                  <rect x="655" y="200" width="45" height="220"/>
                  <rect x="715" y="240" width="38" height="180"/>
                  <rect x="765" y="215" width="48" height="205"/>
                  <path d="M840 420 L840 105 L850 88 L870 88 L880 105 L880 420 Z"/>
                  <rect x="895" y="225" width="44" height="195"/>
                  <rect x="950" y="250" width="36" height="170"/>
                  <rect x="995" y="215" width="50" height="205"/>
                  <rect x="1055" y="240" width="38" height="180"/>
                  <rect x="1100" y="200" width="46" height="220"/>
                  <rect x="1155" y="250" width="40" height="170"/>
                  <rect x="1200" y="225" width="36" height="195"/>
                  <rect x="1245" y="250" width="55" height="170"/>
                </g>
                <g fill="#FBF6E8" opacity="0.5">
                  <rect x="88" y="268" width="3" height="5"/><rect x="97" y="268" width="3" height="5"/>
                  <rect x="157" y="232" width="3" height="5"/><rect x="166" y="232" width="3" height="5"/>
                  <rect x="380" y="155" width="3" height="5"/><rect x="389" y="155" width="3" height="5"/>
                  <rect x="380" y="185" width="3" height="5"/><rect x="389" y="185" width="3" height="5"/>
                  <rect x="845" y="128" width="3" height="5"/><rect x="854" y="128" width="3" height="5"/>
                  <rect x="845" y="158" width="3" height="5"/><rect x="854" y="158" width="3" height="5"/>
                </g>
                <rect x="0" y="400" width="1440" height="20" fill="#3D1A1F" opacity="0.5"/>
              </svg>
            ) : (
              <svg viewBox="0 0 1440 420" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <linearGradient id="skyNorth" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2A4A5A"/>
                    <stop offset="50%" stopColor="#4A7A6A"/>
                    <stop offset="100%" stopColor="#D4C9A8"/>
                  </linearGradient>
                </defs>
                <rect width="1440" height="420" fill="url(#skyNorth)"/>
                <circle cx="320" cy="120" r="55" fill="#F4E8C2" opacity="0.7"/>
                <path d="M0 300 Q360 260 720 280 Q1080 300 1440 270 L1440 420 L0 420 Z" fill="#1A2A3D" opacity="0.6"/>
                <g fill="#3D1A1F">
                  <rect x="100" y="240" width="50" height="180"/>
                  <rect x="165" y="200" width="35" height="220"/>
                  <rect x="215" y="255" width="45" height="165"/>
                  <rect x="275" y="185" width="28" height="235"/>
                  <rect x="320" y="235" width="52" height="185"/>
                  <rect x="390" y="210" width="40" height="210"/>
                  <rect x="445" y="225" width="48" height="195"/>
                  <rect x="510" y="245" width="55" height="175"/>
                  <rect x="580" y="215" width="38" height="205"/>
                  <rect x="635" y="195" width="46" height="225"/>
                  <rect x="700" y="238" width="40" height="182"/>
                  <rect x="760" y="210" width="50" height="210"/>
                </g>
                <g fill="#FBF6E8" opacity="0.45">
                  <rect x="108" y="258" width="3" height="5"/><rect x="116" y="258" width="3" height="5"/>
                  <rect x="173" y="218" width="3" height="5"/><rect x="181" y="218" width="3" height="5"/>
                  <rect x="283" y="202" width="3" height="5"/><rect x="291" y="202" width="3" height="5"/>
                </g>
              </svg>
            )}
          </div>
          {/* Gradient overlay for text legibility */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(61,26,31,0.80) 0%, rgba(61,26,31,0.25) 60%, transparent 100%)' }} />

          {/* Hero content */}
          <div className="relative max-w-7xl mx-auto px-4 flex flex-col justify-end h-full" style={{ minHeight: '420px', paddingBottom: '40px' }}>
            <span className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: '#DEC07F' }}>
              {typeLabel} · {name}
            </span>
            <h1 id="city-title" className="font-heading font-semibold leading-tight text-white" style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>
              {isVi ? <>{name} — <em style={{ fontStyle: 'italic' }}>{province.region_vi || typeLabel}</em>.</> : <>{name} — <em style={{ fontStyle: 'italic' }}>{province.region_en || typeLabel}</em>.</>}
            </h1>
            <p className="mt-3 text-base leading-relaxed max-w-2xl" style={{ color: 'rgba(251,248,241,0.78)' }}>
              {isVi
                ? (province.meta_description_vi || '')
                : (province.meta_description_en || '')}
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-8 mt-6">
              {province.population && (
                <div>
                  <div className="font-heading text-2xl font-semibold text-white">{province.population}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(251,248,241,0.55)' }}>{isVi ? 'Dân số' : 'Population'}</div>
                </div>
              )}
              {province.area_km2 && (
                <div>
                  <div className="font-heading text-2xl font-semibold text-white">{province.area_km2.toLocaleString()} km²</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(251,248,241,0.55)' }}>{isVi ? 'Diện tích' : 'Area'}</div>
                </div>
              )}
              <div>
                <div className="font-heading text-2xl font-semibold text-white">{events.length}</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(251,248,241,0.55)' }}>{isVi ? 'Sự kiện đã trích nguồn' : 'Sourced events'}</div>
              </div>
              <div>
                <div className="font-heading text-2xl font-semibold text-white">{culturalPosts.length}</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(251,248,241,0.55)' }}>{isVi ? 'Bài văn hóa' : 'Cultural posts'}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <nav className="max-w-7xl mx-auto w-full px-4 py-3" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-vn-stone">
            <li><Link href={`/${locale}`} className="hover:text-vn-ink transition-colors">{siteHome}</Link></li>
            <li aria-hidden="true" className="font-heading italic text-vn-mist">›</li>
            <li><Link href={`/${locale}`} className="hover:text-vn-ink transition-colors">{isVi ? 'Khám phá' : 'Explore'}</Link></li>
            <li aria-hidden="true" className="font-heading italic text-vn-mist">›</li>
            <li className="text-vn-stone">{typeLabel}</li>
            <li aria-hidden="true" className="font-heading italic text-vn-mist">›</li>
            <li aria-current="page" className="text-vn-ink font-medium">{name}</li>
          </ol>
        </nav>

        {/* Sticky tab bar */}
        <div
          className="sticky z-30 border-b border-vn-mist"
          style={{
            top: '64px',
            background: 'rgba(251,248,241,0.95)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <ul className="flex gap-0 text-sm font-medium">
                {[
                  { href: '#culture', label: isVi ? 'Văn hóa' : 'Culture', count: displayCulturalPosts.length },
                  { href: '#sources', label: isVi ? 'Nguồn' : 'Sources', count: null },
                ].map((tab) => (
                  <li key={tab.href}>
                    <a
                      href={tab.href}
                      className="flex items-center gap-1.5 px-4 py-3.5 border-b-2 border-transparent hover:border-vn-red hover:text-vn-ink transition-colors text-vn-stone"
                    >
                      {tab.label}
                      {tab.count !== null && tab.count > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: '#E9E6DE', color: '#6E6A60' }}>
                          {tab.count}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-vn-fog transition-colors text-vn-stone" aria-label={isVi ? 'Chia sẻ' : 'Share'}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* Main content — detail grid */}
        <main className="flex-1 w-full">
          <div style={{ background: '#FFFFFF', borderTop: '1px solid #E9E6DE' }}>
            <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── Main article ── */}
            <article className="flex-1 min-w-0 space-y-16">
              {/* ===== Văn hóa section ===== */}
              <section id="culture">
                <CulturalPostList
                  locale={locale}
                  posts={displayCulturalPosts}
                  provinceSlug={slug}
                  provinceTypeSlug={typeSlug}
                  foodSlugs={foodSlugs}
                  placeSlugs={placeSlugs}
                  foodImageUrls={foodImageUrls}
                  placeImageUrls={placeImageUrls}
                />
              </section>

              {/* Contribute CTA */}
              <section
                className="rounded-3xl overflow-hidden p-8 md:p-10 text-center"
                style={{ background: 'linear-gradient(135deg, #1F5B40 0%, #2E7D5A 100%)' }}
              >
                <span className="text-xs font-medium uppercase tracking-widest block mb-3" style={{ color: '#DEC07F' }}>
                  {isVi ? 'Đóng góp' : 'Contribute'}
                </span>
                <h3 className="font-heading text-2xl font-semibold text-white mb-3">
                  {isVi ? 'Bạn biết một sự kiện chúng tôi chưa có?' : "Know an event we're missing?"}
                </h3>
                <p className="text-sm leading-relaxed max-w-lg mx-auto mb-6" style={{ color: 'rgba(251,248,241,0.78)' }}>
                  {isVi
                    ? 'Mỗi đóng góp đều được biên tập viên đối chiếu với ít nhất 2 nguồn độc lập trước khi đăng.'
                    : 'Every contribution is cross-checked by our editors against at least 2 independent sources before publishing.'}
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ background: '#DEC07F', color: '#1B1B1A' }}
                >
                  {isVi ? 'Gửi đề xuất sự kiện →' : 'Submit an event →'}
                </a>
              </section>
            </article>

            {/* ── Sidebar ── */}
            <aside className="lg:w-[300px] flex-shrink-0 space-y-5 lg:sticky lg:top-[calc(64px+48px+36px)]">

              {/* Quick facts */}
              <div
                className="rounded-2xl border border-vn-mist p-5"
                style={{ background: '#FFFFFF', boxShadow: '0 2px 8px rgba(27,27,26,0.05)' }}
              >
                <h4 className="font-heading text-base font-semibold text-vn-ink mb-4">
                  {isVi ? 'Thông tin nhanh' : 'Quick facts'}
                </h4>
                <dl className="space-y-3 text-sm">
                  {province.population && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-vn-stone">{isVi ? 'Dân số' : 'Population'}</dt>
                      <dd className="font-medium text-vn-ink text-right">{province.population}</dd>
                    </div>
                  )}
                  {province.area_km2 && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-vn-stone">{isVi ? 'Diện tích' : 'Area'}</dt>
                      <dd className="font-medium text-vn-ink text-right">{province.area_km2.toLocaleString()} km²</dd>
                    </div>
                  )}
                  {province.region_vi && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-vn-stone">{isVi ? 'Vùng' : 'Region'}</dt>
                      <dd className="font-medium text-vn-ink text-right">{isVi ? province.region_vi : province.region_en}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-3">
                    <dt className="text-vn-stone">{isVi ? 'Loại' : 'Type'}</dt>
                    <dd className="font-medium text-vn-ink text-right">{typeLabel}</dd>
                  </div>
                </dl>
              </div>

              {/* Featured event card */}
              {displayFeaturedEvent && (
                <div
                  className="rounded-2xl p-5 border border-vn-mist"
                  style={{ background: '#FDF1F3', boxShadow: '0 2px 8px rgba(27,27,26,0.06)' }}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest block mb-2" style={{ color: '#8E0A1F' }}>
                    {isVi ? 'Sự kiện nổi bật' : 'Featured event'}
                  </span>
                  <h4 className="font-heading text-base font-semibold mt-1 text-vn-ink">
                    {displayFeaturedEvent.event_date_display}
                  </h4>
                  <p className="text-xs leading-relaxed mt-2 text-vn-stone">
                    {(isVi ? displayFeaturedEvent.title_vi : displayFeaturedEvent.title_en).slice(0, 80)}
                    {(isVi ? displayFeaturedEvent.title_vi : displayFeaturedEvent.title_en).length > 80 ? '…' : ''}
                  </p>
                  <Link
                    href={displayFeaturedEvent.slug
                      ? `/${locale}/${typeSlug}/${slug}/su-kien/${displayFeaturedEvent.slug}`
                      : `#history`}
                    className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-opacity hover:opacity-90 border border-vn-mist"
                    style={{ background: '#FFFFFF', color: '#8E0A1F' }}
                  >
                    {isVi ? 'Đọc chi tiết →' : 'Read details →'}
                  </Link>
                </div>
              )}

              {/* Ad slot */}
              <AdSlot id={`sidebar-${slug}`} size="rectangle" />

              {/* Related provinces from DB */}
              {relatedProvinces.length > 0 && (
                <div
                  className="rounded-2xl border border-vn-mist p-5"
                  style={{ background: '#FFFFFF', boxShadow: '0 2px 8px rgba(27,27,26,0.05)' }}
                >
                  <h4 className="font-heading text-base font-semibold text-vn-ink mb-4">
                    {isVi ? 'Khám phá thêm' : 'Explore more'}
                  </h4>
                  <div className="space-y-3">
                    {relatedProvinces.map((p) => {
                      const pTypeSlug = isVi ? p.type : p.type_en;
                      const pName = isVi ? p.name_vi : p.name_en;
                      const pRegion = isVi ? p.region_vi : p.region_en;
                      const bg = p.slug === 'ho-chi-minh'
                        ? 'linear-gradient(135deg, #8E0A1F, #C8102E)'
                        : p.slug === 'ha-noi'
                        ? 'linear-gradient(135deg, #2A4A5A, #4A7A9A)'
                        : 'linear-gradient(135deg, #2E7D5A, #5AAA88)';
                      return (
                        <Link
                          key={p.slug}
                          href={`/${locale}/${pTypeSlug}/${p.slug}`}
                          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                          <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ background: bg }} />
                          <div>
                            {pRegion && <div className="text-xs text-vn-stone">{pRegion}</div>}
                            <div className="text-sm font-medium text-vn-ink">{pName}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

            </aside>
          </div>
            </div>
          </div>
        </main>

        {/* Ad — bottom */}
        <div className="max-w-7xl mx-auto w-full px-4 mb-3">
          <AdSlot id={`${slug}-banner-bottom`} size="leaderboard" />
        </div>

        {/* Footer */}
        <footer style={{ background: '#3D1A1F' }} className="text-white/60 mt-8">
          <div className="max-w-7xl mx-auto px-4 pt-12 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 mb-10">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#C8102E' }}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                      <path d="M10 16 C10 16 4 11 4 7 C4 4.8 6 3 8 4 C8.8 4.4 9.4 5 10 6 C10.6 5 11.2 4.4 12 4 C14 3 16 4.8 16 7 C16 11 10 16 10 16Z" stroke="#DEC07F" strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
                      <path d="M10 16 L10 9" stroke="#DEC07F" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span className="font-heading text-white text-lg font-medium">
                    {isVi ? 'Khám Phá Việt Nam' : 'Explore Vietnam'}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-white/40 max-w-xs">
                  {isVi
                    ? 'Thông tin lịch sử, văn hóa và du lịch các tỉnh thành Việt Nam.'
                    : 'History, culture, and tourism information for Vietnamese provinces.'}
                </p>
              </div>
              <div>
                <h4 className="font-heading text-white text-sm font-medium mb-4">{isVi ? 'Khám phá' : 'Explore'}</h4>
                <ul className="flex flex-col gap-2 text-sm">
                  <li><Link href={`/${locale}/thanh-pho/ha-noi`} className="hover:text-vn-gold transition-colors">{isVi ? 'Hà Nội' : 'Hanoi'}</Link></li>
                  <li><Link href={`/${locale}/thanh-pho/ho-chi-minh`} className="hover:text-vn-gold transition-colors">{isVi ? 'Hồ Chí Minh' : 'Ho Chi Minh City'}</Link></li>
                  <li><Link href={`/${locale}#today`} className="hover:text-vn-gold transition-colors">{isVi ? 'Sự kiện hôm nay' : "Today's events"}</Link></li>
                  <li><Link href={`/${locale}#festivals`} className="hover:text-vn-gold transition-colors">{isVi ? 'Lễ hội' : 'Festivals'}</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-heading text-white text-sm font-medium mb-4">{isVi ? 'Nguồn ưu tiên' : 'Priority sources'}</h4>
                <ul className="flex flex-col gap-2 text-sm">
                  <li><a href="https://nhandan.vn" className="hover:text-vn-gold transition-colors" target="_blank" rel="noopener">nhandan.vn</a></li>
                  <li><a href="https://baotanglichsu.vn" className="hover:text-vn-gold transition-colors" target="_blank" rel="noopener">baotanglichsu.vn</a></li>
                  <li><a href="https://vietnamtourism.gov.vn" className="hover:text-vn-gold transition-colors" target="_blank" rel="noopener">vietnamtourism.gov.vn</a></li>
                  <li><a href="https://bvhttdl.gov.vn" className="hover:text-vn-gold transition-colors" target="_blank" rel="noopener">bvhttdl.gov.vn</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-heading text-white text-sm font-medium mb-4">{isVi ? 'Dành cho admin' : 'Admin'}</h4>
                <ul className="flex flex-col gap-2 text-sm">
                  <li><a href="#" className="hover:text-vn-gold transition-colors">{isVi ? 'Quy tắc nội dung' : 'Content rules'}</a></li>
                  <li><a href="#" className="hover:text-vn-gold transition-colors">{isVi ? 'Báo cáo lỗi nguồn' : 'Report source error'}</a></li>
                  <li><a href="#" className="hover:text-vn-gold transition-colors">{isVi ? 'Đề xuất sự kiện' : 'Suggest event'}</a></li>
                </ul>
              </div>
            </div>
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
