import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

import {
  getProvinceBySlug,
  getProvinces,
  getSourcesForEntity,
  getCulturalPosts,
  getFoodItemsByProvince,
  getPlaceItemsByProvince,
  getAllProvinces,
  getFestivalsByProvince,
  getFestivalItemsByProvince,
} from '@/lib/queries';

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

const PROVINCE_HERO: Record<string, string> = {
  'ho-chi-minh':    '/places/dinh-doc-lap/hero.jpg',
  'ha-noi':         '/places/hoang-thanh-thang-long/hero.jpg',
  'ha-giang':       '/places/deo-ma-pi-leng/hero.jpg',
  'dak-lak':        '/places/ho-lak/hero.jpg',
  'da-nang':        '/places/bai-bien-my-khe/hero.jpg',
  'thua-thien-hue': '/places/dai-noi-hue/hero.jpg',
  'binh-dinh':      '/places/thap-doi/hero.jpg',
  'quang-ngai':     '/places/ly-son/hero.jpg',
};

const PROVINCE_BG: Record<string, string> = {
  'ho-chi-minh':    'linear-gradient(160deg,#7A2A2A,#3D1A1F)',
  'ha-noi':         'linear-gradient(160deg,#2A4A5A,#1A2A3D)',
  'ha-giang':       'linear-gradient(160deg,#1F5B40,#0F2A1E)',
  'dak-lak':        'linear-gradient(160deg,#5C3D1E,#3D1A1F)',
  'da-nang':        'linear-gradient(160deg,#1A5276,#0D2B3E)',
  'thua-thien-hue': 'linear-gradient(160deg,#6B3A8E,#3A1A5C)',
  'binh-dinh':      'linear-gradient(160deg,#1E5F3A,#0F2A1E)',
  'quang-ngai':     'linear-gradient(160deg,#2C5F6E,#1A3A45)',
};

export default async function ProvincePage({ params }: Props) {
  const { locale, slug } = await params;

  const province = await getProvinceBySlug(slug);
  if (!province) notFound();

  const isVi = locale === 'vi';
  const name = isVi ? province.name_vi : province.name_en;
  const siteHome = isVi ? 'Trang chủ' : 'Home';

  const rawPosts = await getCulturalPosts(province.id);
  const culturalPosts = await Promise.all(rawPosts.map(async (post) => ({
    ...post,
    sources: await getSourcesForEntity('cultural_post', post.id),
  })));

  const [foodItems, placeItems, allProvinces, festivals, festivalItems] = await Promise.all([
    getFoodItemsByProvince(province.id),
    getPlaceItemsByProvince(province.id),
    getProvinces(),
    getFestivalsByProvince(province.id),
    getFestivalItemsByProvince(province.id),
  ]);

  const festivalItemByFestivalId: Record<number, typeof festivalItems[number]> = Object.fromEntries(
    festivalItems.map((fi) => [fi.festival_id, fi])
  );
  const relatedProvinces = allProvinces.filter((p) => p.slug !== slug).slice(0, 4);

  const foodPosts = culturalPosts.filter((p) => p.type === 'am-thuc');
  const placePosts = culturalPosts.filter((p) => p.type === 'dia-diem');

  const foodSlugMap: Record<number, string> = Object.fromEntries(
    foodItems.map((f) => [f.cultural_post_id, f.slug])
  );
  const placeSlugMap: Record<number, string> = Object.fromEntries(
    placeItems.map((p) => [p.cultural_post_id, p.slug])
  );
  const foodImageMap: Record<number, string> = Object.fromEntries(
    foodItems.filter((f) => f.image_url).map((f) => [f.cultural_post_id, f.image_url!])
  );
  const placeImageMap: Record<number, string> = Object.fromEntries(
    placeItems.filter((p) => p.image_url).map((p) => [p.cultural_post_id, p.image_url!])
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3005';
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
  const typeLabelShort = isVi
    ? (province.type === 'thanh-pho' ? 'Thành phố' : 'Tỉnh')
    : (province.type_en === 'city' ? 'City' : 'Province');

  const heroImg = PROVINCE_HERO[slug];
  const heroBg = PROVINCE_BG[slug] ?? 'linear-gradient(160deg,#3D1A1F,#1A2A3D)';

  const trendingFestival = festivals.find((f) => f.is_trending === 1) ?? festivals[0] ?? null;
  const trendingFestivalItem = trendingFestival ? festivalItemByFestivalId[trendingFestival.id] : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen flex flex-col" style={{ background: '#FBF8F1' }}>

        {/* ── Topbar ── */}
        <div style={{ background: '#3D1A1F' }} className="text-xs text-white/60">
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-vn-gold flex-shrink-0" />
              <span className="truncate">
                {isVi
                  ? 'Nội dung có trích dẫn nguồn — không phải tài liệu học thuật chính thức.'
                  : 'Content is cited from sources — not an official academic document.'}
              </span>
            </div>
            <Link
              href={`/${otherLocale}/${otherTypeSlug}/${slug}`}
              className="flex-shrink-0 text-white/60 hover:text-white transition-colors font-semibold"
            >
              {otherLang}
            </Link>
          </div>
        </div>

        {/* ── Header ── */}
        <header
          className="sticky top-0 z-40 border-b border-vn-mist"
          style={{
            background: 'rgba(251,248,241,0.95)',
            backdropFilter: 'saturate(150%) blur(14px)',
            WebkitBackdropFilter: 'saturate(150%) blur(14px)',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 h-[64px] flex items-center gap-6">
            <Link href={`/${locale}`} className="flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#C8102E' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 16 C10 16 4 11 4 7 C4 4.8 6 3 8 4 C8.8 4.4 9.4 5 10 6 C10.6 5 11.2 4.4 12 4 C14 3 16 4.8 16 7 C16 11 10 16 10 16Z" stroke="#DEC07F" strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
                  <path d="M10 16 L10 9" stroke="#DEC07F" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="font-heading text-lg font-semibold leading-tight" style={{ color: '#8E0A1F' }}>
                  {isVi ? 'Khám Phá Việt Nam' : 'Explore Vietnam'}
                </div>
                <div className="text-[10px] leading-none" style={{ color: '#6E6A60' }}>
                  {isVi ? 'Hành trình di sản' : 'Heritage journey'}
                </div>
              </div>
            </Link>
            <Link
              href={`/${locale}`}
              className="ml-auto text-sm transition-colors flex items-center gap-1"
              style={{ color: '#6E6A60' }}
            >
              ← {siteHome}
            </Link>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="relative overflow-hidden" style={{ minHeight: 460 }} aria-labelledby="province-title">
          <div className="absolute inset-0" style={{ background: heroBg }} />
          {heroImg && (
            <img
              src={heroImg}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.55 }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top,rgba(20,6,8,0.92) 0%,rgba(20,6,8,0.38) 55%,rgba(20,6,8,0.08) 100%)' }}
          />
          <div
            className="relative max-w-7xl mx-auto px-6 flex flex-col justify-end"
            style={{ minHeight: 460, paddingBottom: 48 }}
          >
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#DEC07F' }}>
              {typeLabelShort} · {isVi ? (province.region_vi || '') : (province.region_en || '')}
            </div>
            <h1
              id="province-title"
              className="font-heading font-semibold text-white leading-tight"
              style={{ fontSize: 'clamp(32px,4.5vw,60px)', letterSpacing: '-0.01em' }}
            >
              {name}
              {(province.region_vi || province.region_en) && (
                <> — <em style={{ fontStyle: 'italic', color: '#DEC07F' }}>
                  {isVi ? province.region_vi : province.region_en}
                </em></>
              )}
            </h1>
            <p className="mt-3 text-base leading-relaxed max-w-2xl" style={{ color: 'rgba(255,255,255,0.72)' }}>
              {isVi ? (province.meta_description_vi || '') : (province.meta_description_en || '')}
            </p>
            <div
              className="flex flex-wrap gap-8 mt-6 pt-6"
              style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}
            >
              {province.population && (
                <div>
                  <div className="font-heading text-2xl font-semibold text-white">{province.population}</div>
                  <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{isVi ? 'Dân số' : 'Population'}</div>
                </div>
              )}
              {province.area_km2 && (
                <div>
                  <div className="font-heading text-2xl font-semibold text-white">{province.area_km2.toLocaleString()} km²</div>
                  <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{isVi ? 'Diện tích' : 'Area'}</div>
                </div>
              )}
              {foodPosts.length > 0 && (
                <div>
                  <div className="font-heading text-2xl font-semibold text-white">{foodPosts.length}</div>
                  <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{isVi ? 'Đặc sản' : 'Specialties'}</div>
                </div>
              )}
              {placePosts.length > 0 && (
                <div>
                  <div className="font-heading text-2xl font-semibold text-white">{placePosts.length}</div>
                  <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{isVi ? 'Địa điểm' : 'Places'}</div>
                </div>
              )}
              {festivals.length > 0 && (
                <div>
                  <div className="font-heading text-2xl font-semibold text-white">{festivals.length}</div>
                  <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{isVi ? 'Lễ hội' : 'Festivals'}</div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Breadcrumb ── */}
        <nav style={{ background: '#fff', borderBottom: '1px solid #E9E6DE' }}>
          <div className="max-w-7xl mx-auto px-6 py-3">
            <ol className="flex items-center gap-1.5 text-xs" style={{ color: '#6E6A60' }}>
              <li><Link href={`/${locale}`} className="hover:text-vn-ink transition-colors">{siteHome}</Link></li>
              <li aria-hidden="true" className="font-heading italic" style={{ color: '#D9D3C5' }}>›</li>
              <li><Link href={`/${locale}`} className="hover:text-vn-ink transition-colors">{isVi ? 'Khám phá' : 'Explore'}</Link></li>
              <li aria-hidden="true" className="font-heading italic" style={{ color: '#D9D3C5' }}>›</li>
              <li>{typeLabelShort}</li>
              <li aria-hidden="true" className="font-heading italic" style={{ color: '#D9D3C5' }}>›</li>
              <li aria-current="page" className="font-semibold" style={{ color: '#3A3833' }}>{name}</li>
            </ol>
          </div>
        </nav>

        {/* ── Sticky tab bar ── */}
        <div
          className="sticky z-30 border-b border-vn-mist"
          style={{
            top: '64px',
            background: 'rgba(251,248,241,0.96)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <ul className="flex text-sm font-medium">
              {[
                { href: '#food',      emoji: '🍜', label: isVi ? 'Ẩm thực'  : 'Cuisine',   count: foodPosts.length },
                { href: '#places',    emoji: '📍', label: isVi ? 'Địa điểm' : 'Places',    count: placePosts.length },
                ...(festivals.length > 0 ? [{ href: '#festivals', emoji: '🎉', label: isVi ? 'Lễ hội' : 'Festivals', count: festivals.length }] : []),
              ].map((tab) => (
                <li key={tab.href}>
                  <a
                    href={tab.href}
                    className="flex items-center gap-1.5 px-4 py-3.5 border-b-2 border-transparent hover:border-vn-red hover:text-vn-ink transition-colors"
                    style={{ color: '#6E6A60' }}
                  >
                    {tab.emoji} {tab.label}
                    {tab.count > 0 && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: '#E9E6DE', color: '#6E6A60' }}
                      >
                        {tab.count}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors border border-vn-mist"
              style={{ background: '#fff', color: '#6E6A60' }}
              aria-label={isVi ? 'Chia sẻ' : 'Share'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Page body ── */}
        <main className="flex-1 w-full" style={{ background: '#fff', borderTop: '1px solid #E9E6DE' }}>
          <div className="max-w-7xl mx-auto px-6" style={{ paddingTop: 48, paddingBottom: 72 }}>
            <div className="flex flex-col lg:flex-row gap-12 items-start">

              {/* ══ Article ══ */}
              <article className="flex-1 min-w-0">

                {/* ── Food section ── */}
                {foodPosts.length > 0 && (
                  <section id="food" style={{ scrollMarginTop: 130 }}>
                    {/* Section header */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 28 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8E5A1F', marginBottom: 6 }}>
                          <span style={{ width: 24, height: 2, background: 'currentColor', display: 'inline-block', flexShrink: 0, borderRadius: 2 }} />
                          01 · {isVi ? 'Ẩm thực đặc sản' : 'Local cuisine'}
                        </div>
                        <h2 className="font-heading" style={{ fontSize: 'clamp(22px,2.5vw,30px)', fontWeight: 600, color: '#8E0A1F', lineHeight: 1.15 }}>
                          {isVi ? 'Hương vị của vùng đất' : 'Flavours of the land'}
                        </h2>
                      </div>
                      <span style={{ fontSize: 12, color: '#6E6A60', flexShrink: 0 }}>
                        {foodPosts.length} {isVi ? 'đặc sản' : 'specialties'}
                      </span>
                    </div>

                    {/* 3-col card grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                      {foodPosts.map((post, idx) => {
                        const title = isVi ? post.title_vi : post.title_en;
                        let lede = '';
                        try {
                          const items = JSON.parse(isVi ? post.content_vi : post.content_en) as Array<{ item: string; description: string }>;
                          lede = items[0]?.description ?? '';
                        } catch { lede = (isVi ? post.content_vi : post.content_en).slice(0, 120); }

                        const foodSlug = foodSlugMap[post.id];
                        const thumbUrl = post.image_url ?? foodImageMap[post.id];
                        const href = foodSlug ? `/${locale}/${typeSlug}/${slug}/am-thuc/${foodSlug}` : undefined;
                        const cardStyle: React.CSSProperties = {
                          background: '#FBF8F1', border: '1px solid #E9E6DE', borderRadius: 12,
                          overflow: 'hidden', textDecoration: 'none', color: 'inherit',
                          display: 'block', transition: 'all 220ms ease',
                        };

                        const cardInner = (
                          <>
                            <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', background: '#EDE3CC' }}>
                              {thumbUrl ? (
                                <img src={thumbUrl} alt={post.title_vi} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                              ) : (
                                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#F4D8B5,#EDE3CC)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <svg viewBox="0 0 48 48" width="40" height="40" fill="none" opacity="0.35">
                                    <circle cx="24" cy="24" r="18" stroke="#8E5A1F" strokeWidth="1.5"/>
                                    <path d="M16 28 Q24 18 32 28" stroke="#8E5A1F" strokeWidth="1.5" fill="none"/>
                                  </svg>
                                </div>
                              )}
                              <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(200,16,46,0.85)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 100 }}>
                                {isVi ? 'Ẩm thực' : 'Cuisine'}
                              </div>
                              <div style={{ position: 'absolute', top: 10, right: 10, width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: idx < 3 ? '#8E0A1F' : '#8A6C00' }}>
                                {idx + 1}
                              </div>
                            </div>
                            <div style={{ padding: '14px 16px 16px' }}>
                              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#C9A24C', marginBottom: 5 }}>{name}</div>
                              <div className="font-heading" style={{ fontSize: 18, fontWeight: 600, color: '#3A3833', lineHeight: 1.25, marginBottom: 6 }}>{title}</div>
                              {lede && <div style={{ fontSize: 12.5, color: '#6E6A60', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{lede}</div>}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid #E9E6DE' }}>
                                <span style={{ fontSize: 10, color: '#6E6A60', background: '#E9E6DE', padding: '2px 7px', borderRadius: 100 }}>{isVi ? 'Ẩm thực' : 'Cuisine'}</span>
                                {href && <span style={{ color: '#C8102E', fontSize: 14 }}>→</span>}
                              </div>
                            </div>
                          </>
                        );
                        return href ? (
                          <Link key={post.id} href={href} style={cardStyle} className="content-card">{cardInner}</Link>
                        ) : (
                          <div key={post.id} style={cardStyle}>{cardInner}</div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* ── Divider ── */}
                {foodPosts.length > 0 && placePosts.length > 0 && (
                  <div style={{ height: 1, background: '#E9E6DE', margin: '56px 0' }} />
                )}

                {/* ── Places section ── */}
                {placePosts.length > 0 && (
                  <section id="places" style={{ scrollMarginTop: 130 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 28 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8E0A1F', marginBottom: 6 }}>
                          <span style={{ width: 24, height: 2, background: 'currentColor', display: 'inline-block', flexShrink: 0, borderRadius: 2 }} />
                          02 · {isVi ? 'Địa điểm nổi bật' : 'Top places'}
                        </div>
                        <h2 className="font-heading" style={{ fontSize: 'clamp(22px,2.5vw,30px)', fontWeight: 600, color: '#8E0A1F', lineHeight: 1.15 }}>
                          {isVi ? 'Những nơi phải ghé' : 'Places to visit'}
                        </h2>
                      </div>
                      <span style={{ fontSize: 12, color: '#6E6A60', flexShrink: 0 }}>
                        {placePosts.length} {isVi ? 'địa điểm' : 'places'}
                      </span>
                    </div>

                    {/* Top 2 as hero strip */}
                    {placePosts.length >= 2 && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        {placePosts.slice(0, 2).map((post, idx) => {
                          const title = isVi ? post.title_vi : post.title_en;
                          let kicker = '';
                          try {
                            const items = JSON.parse(isVi ? post.content_vi : post.content_en) as Array<{ item: string; description: string }>;
                            kicker = items[0]?.item ?? '';
                          } catch { /* */ }

                          const placeSlug = placeSlugMap[post.id];
                          const thumbUrl = post.image_url ?? placeImageMap[post.id];
                          const href = placeSlug ? `/${locale}/${typeSlug}/${slug}/dia-diem/${placeSlug}` : undefined;
                          const heroCardStyle: React.CSSProperties = { position: 'relative', borderRadius: idx === 0 ? 20 : 12, overflow: 'hidden', minHeight: 220, display: 'block', textDecoration: 'none', background: '#3D1A1F' };
                          const heroCardInner = (
                            <>
                              {thumbUrl ? <img src={thumbUrl} alt={post.title_vi} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} /> : <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#2E7D5A,#1F5B40)' }} />}
                              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(20,6,8,0.85) 0%,transparent 60%)' }} />
                              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 }}>
                                {kicker && <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#DEC07F', marginBottom: 5 }}>{kicker}</div>}
                                <div className="font-heading" style={{ fontSize: idx === 0 ? 22 : 18, fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>{title}</div>
                              </div>
                            </>
                          );
                          return href ? (
                            <Link key={post.id} href={href} style={heroCardStyle}>{heroCardInner}</Link>
                          ) : (
                            <div key={post.id} style={heroCardStyle}>{heroCardInner}</div>
                          );
                        })}
                      </div>
                    )}

                    {/* Remaining as 3-col grid */}
                    {placePosts.length > 2 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                        {placePosts.slice(2).map((post) => {
                          const title = isVi ? post.title_vi : post.title_en;
                          let lede = '';
                          try {
                            const items = JSON.parse(isVi ? post.content_vi : post.content_en) as Array<{ item: string; description: string }>;
                            lede = items[0]?.description ?? '';
                          } catch { lede = (isVi ? post.content_vi : post.content_en).slice(0, 120); }

                          const placeSlug = placeSlugMap[post.id];
                          const thumbUrl = post.image_url ?? placeImageMap[post.id];
                          const href = placeSlug ? `/${locale}/${typeSlug}/${slug}/dia-diem/${placeSlug}` : undefined;
                          const placeCardStyle: React.CSSProperties = { background: '#FBF8F1', border: '1px solid #E9E6DE', borderRadius: 12, overflow: 'hidden', textDecoration: 'none', color: 'inherit', display: 'block', transition: 'all 220ms ease' };
                          const placeCardInner = (
                            <>
                              <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', background: '#EDE3CC' }}>
                                {thumbUrl ? <img src={thumbUrl} alt={post.title_vi} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#EEF6F0,#D4EDDE)' }} />}
                                <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(46,125,90,0.85)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 100 }}>
                                  {isVi ? 'Địa điểm' : 'Place'}
                                </div>
                              </div>
                              <div style={{ padding: '14px 16px 16px' }}>
                                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#C9A24C', marginBottom: 5 }}>{name}</div>
                                <div className="font-heading" style={{ fontSize: 18, fontWeight: 600, color: '#3A3833', lineHeight: 1.25, marginBottom: 6 }}>{title}</div>
                                {lede && <div style={{ fontSize: 12.5, color: '#6E6A60', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{lede}</div>}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid #E9E6DE' }}>
                                  <span style={{ fontSize: 10, color: '#6E6A60', background: '#E9E6DE', padding: '2px 7px', borderRadius: 100 }}>{isVi ? 'Địa điểm' : 'Place'}</span>
                                  {href && <span style={{ color: '#C8102E', fontSize: 14 }}>→</span>}
                                </div>
                              </div>
                            </>
                          );
                          return href ? (
                            <Link key={post.id} href={href} style={placeCardStyle} className="content-card">{placeCardInner}</Link>
                          ) : (
                            <div key={post.id} style={placeCardStyle}>{placeCardInner}</div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                )}

                {/* ── Divider before festivals ── */}
                {festivals.length > 0 && (placePosts.length > 0 || foodPosts.length > 0) && (
                  <div style={{ height: 1, background: '#E9E6DE', margin: '56px 0' }} />
                )}

                {/* ── Festivals section ── */}
                {festivals.length > 0 && (
                  <section id="festivals" style={{ scrollMarginTop: 130 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 28 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A6C00', marginBottom: 6 }}>
                          <span style={{ width: 24, height: 2, background: 'currentColor', display: 'inline-block', flexShrink: 0, borderRadius: 2 }} />
                          03 · {isVi ? 'Lễ hội truyền thống' : 'Festivals'}
                        </div>
                        <h2 className="font-heading" style={{ fontSize: 'clamp(22px,2.5vw,30px)', fontWeight: 600, color: '#8E0A1F', lineHeight: 1.15 }}>
                          {isVi ? 'Nhịp sống văn hoá' : 'Cultural rhythms'}
                        </h2>
                      </div>
                      <span style={{ fontSize: 12, color: '#6E6A60', flexShrink: 0 }}>
                        {festivals.length} {isVi ? 'lễ hội' : 'festivals'}
                      </span>
                    </div>

                    <div style={{ borderTop: '1px solid #E9E6DE' }}>
                      {festivals.map((festival, idx) => {
                        const fi = festivalItemByFestivalId[festival.id];
                        const imageUrl = fi?.image_url ?? null;
                        const festivalName = isVi ? festival.name_vi : festival.name_en;
                        const lede = fi
                          ? (isVi ? fi.lede_vi : fi.lede_en)
                          : (isVi ? festival.description_vi : festival.description_en);
                        const startDate = new Date(festival.start_date);
                        const lang = isVi ? 'vi-VN' : 'en-US';
                        const dateDisplay = startDate.toLocaleDateString(lang, { day: 'numeric', month: 'long' });
                        const href = festival.slug ? `/${locale}/${typeSlug}/${slug}/le-hoi/${festival.slug}` : undefined;

                        const rowContent = (
                          <>
                            <div style={{ width: 110, height: 80, borderRadius: 8, overflow: 'hidden', position: 'relative', flexShrink: 0, background: 'linear-gradient(135deg,#3D1A1F,#1B2A4A)' }}>
                              {imageUrl ? (
                                <img src={imageUrl} alt={festivalName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                              ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <svg width="28" height="28" viewBox="0 0 48 48" fill="none" opacity="0.5">
                                    <circle cx="24" cy="24" r="20" stroke="#DEC07F" strokeWidth="1.5"/>
                                    <path d="M24 8 L26 18 L36 18 L28 24 L31 34 L24 28 L17 34 L20 24 L12 18 L22 18 Z" fill="#DEC07F"/>
                                  </svg>
                                </div>
                              )}
                              <div style={{ position: 'absolute', top: 6, left: 6, width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3A3833' }}>
                                {idx + 1}
                              </div>
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6E6A60', fontWeight: 700, marginBottom: 4 }}>
                                {dateDisplay}{festival.is_lunar === 1 ? (isVi ? ' · Âm lịch' : ' · Lunar') : ''}
                              </div>
                              <div className="font-heading" style={{ fontSize: 'clamp(1.05rem,1.5vw+0.3rem,1.25rem)', fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.01em', color: '#3A3833', marginBottom: 5 }}>
                                {festivalName}
                              </div>
                              {lede && (
                                <p style={{ fontSize: '0.875rem', color: '#6E6A60', lineHeight: 1.65, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                  {lede}
                                </p>
                              )}
                              {festival.is_trending === 1 && (
                                <span style={{ display: 'inline-block', marginTop: 7, fontSize: '0.68rem', letterSpacing: '0.06em', padding: '2px 8px', borderRadius: 999, background: '#FBF6E8', color: '#8A6C00', fontWeight: 600 }}>
                                  ✦ {isVi ? 'Nổi bật' : 'Trending'}
                                </span>
                              )}
                            </div>
                            {href ? (
                              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F0EDE6', color: '#6E6A60', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M5 12h14M13 5l7 7-7 7"/>
                                </svg>
                              </div>
                            ) : <div />}
                          </>
                        );

                        const rowStyle: React.CSSProperties = {
                          display: 'grid',
                          gridTemplateColumns: '110px minmax(0,1fr) auto',
                          gap: 'clamp(1rem,2vw,1.5rem)',
                          padding: '18px 8px',
                          borderBottom: '1px solid #E9E6DE',
                          alignItems: 'center',
                          textDecoration: 'none',
                          color: 'inherit',
                          borderRadius: 6,
                          cursor: href ? 'pointer' : 'default',
                        };

                        return href ? (
                          <Link key={festival.id} href={href} style={rowStyle} className="post-row-item">
                            {rowContent}
                          </Link>
                        ) : (
                          <div key={festival.id} style={rowStyle}>
                            {rowContent}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* ── Divider ── */}
                <div style={{ height: 1, background: '#E9E6DE', margin: '56px 0' }} />

                {/* ── Contribute CTA ── */}
                <section
                  className="rounded-3xl p-10 text-center"
                  style={{ background: 'linear-gradient(135deg,#1F5B40 0%,#2E7D5A 100%)' }}
                >
                  <span className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#DEC07F' }}>
                    {isVi ? 'Đóng góp' : 'Contribute'}
                  </span>
                  <h3 className="font-heading text-2xl font-semibold text-white mb-3">
                    {isVi ? 'Bạn biết một điều chúng tôi chưa có?' : "Know something we're missing?"}
                  </h3>
                  <p className="text-sm leading-relaxed max-w-lg mx-auto mb-6" style={{ color: 'rgba(251,248,241,0.78)' }}>
                    {isVi
                      ? 'Mỗi đóng góp đều được biên tập viên đối chiếu với ít nhất 2 nguồn độc lập trước khi đăng.'
                      : 'Every contribution is cross-checked by our editors against at least 2 independent sources before publishing.'}
                  </p>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
                    style={{ background: '#DEC07F', color: '#3D1A1F' }}
                  >
                    {isVi ? 'Gửi đề xuất →' : 'Submit a suggestion →'}
                  </a>
                </section>
              </article>

              {/* ══ Sidebar ══ */}
              <aside
                className="lg:w-[300px] flex-shrink-0 flex flex-col gap-4"
                style={{ position: 'sticky', top: 'calc(64px + 52px + 16px)' }}
              >
                {/* Quick nav */}
                <div style={{ background: '#fff', border: '1px solid #E9E6DE', borderRadius: 12, padding: 18, boxShadow: '0 2px 12px rgba(58,56,51,0.08)' }}>
                  <div className="font-heading" style={{ fontSize: 16, fontWeight: 600, color: '#3A3833', marginBottom: 14 }}>
                    {isVi ? 'Trên trang này' : 'On this page'}
                  </div>
                  <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {foodPosts.length > 0 && (
                      <a href="#food" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6E6A60', padding: '7px 10px', borderRadius: 6, textDecoration: 'none' }}
                        className="hover:bg-vn-fog hover:text-vn-ink transition-colors">
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C8102E', flexShrink: 0, display: 'inline-block' }} />
                        {isVi ? 'Ẩm thực' : 'Cuisine'} ({foodPosts.length})
                      </a>
                    )}
                    {placePosts.length > 0 && (
                      <a href="#places" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6E6A60', padding: '7px 10px', borderRadius: 6, textDecoration: 'none' }}
                        className="hover:bg-vn-fog hover:text-vn-ink transition-colors">
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2E7D5A', flexShrink: 0, display: 'inline-block' }} />
                        {isVi ? 'Địa điểm' : 'Places'} ({placePosts.length})
                      </a>
                    )}
                    {festivals.length > 0 && (
                      <a href="#festivals" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6E6A60', padding: '7px 10px', borderRadius: 6, textDecoration: 'none' }}
                        className="hover:bg-vn-fog hover:text-vn-ink transition-colors">
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A24C', flexShrink: 0, display: 'inline-block' }} />
                        {isVi ? 'Lễ hội' : 'Festivals'} ({festivals.length})
                      </a>
                    )}
                  </nav>
                </div>

                {/* Quick facts */}
                <div style={{ background: '#fff', border: '1px solid #E9E6DE', borderRadius: 12, padding: 18, boxShadow: '0 2px 12px rgba(58,56,51,0.08)' }}>
                  <div className="font-heading" style={{ fontSize: 16, fontWeight: 600, color: '#3A3833', marginBottom: 14 }}>
                    {isVi ? 'Thông tin nhanh' : 'Quick facts'}
                  </div>
                  <dl>
                    {province.population && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, padding: '10px 0', borderBottom: '1px solid #E9E6DE' }}>
                        <dt style={{ color: '#6E6A60' }}>{isVi ? 'Dân số' : 'Population'}</dt>
                        <dd style={{ fontWeight: 600, color: '#3A3833', textAlign: 'right' }}>{province.population}</dd>
                      </div>
                    )}
                    {province.area_km2 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, padding: '10px 0', borderBottom: '1px solid #E9E6DE' }}>
                        <dt style={{ color: '#6E6A60' }}>{isVi ? 'Diện tích' : 'Area'}</dt>
                        <dd style={{ fontWeight: 600, color: '#3A3833', textAlign: 'right' }}>{province.area_km2.toLocaleString()} km²</dd>
                      </div>
                    )}
                    {province.region_vi && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, padding: '10px 0', borderBottom: '1px solid #E9E6DE' }}>
                        <dt style={{ color: '#6E6A60' }}>{isVi ? 'Vùng' : 'Region'}</dt>
                        <dd style={{ fontWeight: 600, color: '#3A3833', textAlign: 'right' }}>{isVi ? province.region_vi : province.region_en}</dd>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, padding: '10px 0' }}>
                      <dt style={{ color: '#6E6A60' }}>{isVi ? 'Loại' : 'Type'}</dt>
                      <dd style={{ fontWeight: 600, color: '#3A3833', textAlign: 'right' }}>{typeLabel}</dd>
                    </div>
                  </dl>
                </div>

                {/* Highlight festival */}
                {trendingFestival && (
                  <div style={{ background: 'linear-gradient(135deg,#3D1A1F,#5C2A1F)', borderRadius: 12, padding: 18 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#DEC07F', marginBottom: 8 }}>
                      {isVi ? 'Lễ hội nổi bật' : 'Featured festival'}
                    </div>
                    <div className="font-heading" style={{ fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 6, lineHeight: 1.3 }}>
                      {isVi ? trendingFestival.name_vi : trendingFestival.name_en}
                    </div>
                    {trendingFestivalItem && (
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.55, marginBottom: 14 }}>
                        {(isVi ? trendingFestivalItem.lede_vi : trendingFestivalItem.lede_en)?.slice(0, 100)}…
                      </div>
                    )}
                    {trendingFestival.slug && (
                      <Link
                        href={`/${locale}/${typeSlug}/${slug}/le-hoi/${trendingFestival.slug}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#3D1A1F', background: '#DEC07F', padding: '8px 16px', borderRadius: 100, textDecoration: 'none' }}
                      >
                        {isVi ? 'Xem chi tiết →' : 'View details →'}
                      </Link>
                    )}
                  </div>
                )}

                {/* Related provinces */}
                {relatedProvinces.length > 0 && (
                  <div style={{ background: '#fff', border: '1px solid #E9E6DE', borderRadius: 12, padding: 18, boxShadow: '0 2px 12px rgba(58,56,51,0.08)' }}>
                    <div className="font-heading" style={{ fontSize: 16, fontWeight: 600, color: '#3A3833', marginBottom: 14 }}>
                      {isVi ? 'Khám phá thêm' : 'Explore more'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {relatedProvinces.map((p) => {
                        const pTypeSlug = isVi ? p.type : p.type_en;
                        const pName = isVi ? p.name_vi : p.name_en;
                        const pRegion = isVi ? p.region_vi : p.region_en;
                        const pHeroImg = PROVINCE_HERO[p.slug];
                        const pBg = PROVINCE_BG[p.slug] ?? 'linear-gradient(135deg,#2E7D5A,#5AAA88)';
                        return (
                          <Link
                            key={p.slug}
                            href={`/${locale}/${pTypeSlug}/${p.slug}`}
                            style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit' }}
                            className="hover:opacity-75 transition-opacity"
                          >
                            <div style={{ width: 44, height: 44, borderRadius: 8, flexShrink: 0, overflow: 'hidden', background: pBg, position: 'relative' }}>
                              {pHeroImg && (
                                <img src={pHeroImg} alt={pName} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                              )}
                            </div>
                            <div>
                              {pRegion && <div style={{ fontSize: 11, color: '#6E6A60' }}>{pRegion}</div>}
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#3A3833' }}>{pName}</div>
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
        </main>

        {/* ── Footer ── */}
        <footer style={{ background: '#3D1A1F' }} className="text-white/60">
          <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
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
                <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
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
                  <li><Link href={`/${locale}#festivals`} className="hover:text-vn-gold transition-colors">{isVi ? 'Lễ hội' : 'Festivals'}</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-heading text-white text-sm font-medium mb-4">{isVi ? 'Nguồn ưu tiên' : 'Priority sources'}</h4>
                <ul className="flex flex-col gap-2 text-sm">
                  <li><a href="https://nhandan.vn" className="hover:text-vn-gold transition-colors" target="_blank" rel="noopener">nhandan.vn</a></li>
                  <li><a href="https://baotanglichsu.vn" className="hover:text-vn-gold transition-colors" target="_blank" rel="noopener">baotanglichsu.vn</a></li>
                  <li><a href="https://vietnamtourism.gov.vn" className="hover:text-vn-gold transition-colors" target="_blank" rel="noopener">vietnamtourism.gov.vn</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-heading text-white text-sm font-medium mb-4">{isVi ? 'Về chúng tôi' : 'About'}</h4>
                <ul className="flex flex-col gap-2 text-sm">
                  <li><a href="#" className="hover:text-vn-gold transition-colors">{isVi ? 'Quy tắc nội dung' : 'Content rules'}</a></li>
                  <li><a href="#" className="hover:text-vn-gold transition-colors">{isVi ? 'Báo cáo lỗi nguồn' : 'Report source error'}</a></li>
                  <li><a href="#" className="hover:text-vn-gold transition-colors">{isVi ? 'Đề xuất sự kiện' : 'Suggest event'}</a></li>
                </ul>
              </div>
            </div>
            <div
              className="border-t pt-6 flex flex-wrap items-center justify-between gap-3 text-xs"
              style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}
            >
              <span>© {new Date().getFullYear()} {isVi ? 'Khám Phá Việt Nam' : 'Explore Vietnam'}</span>
              <span style={{ color: '#C9A24C', letterSpacing: '0.08em' }}>❖ HERITAGE JOURNEY</span>
              <span>{isVi ? 'Không phải nguồn học thuật chính thức' : 'Not an official academic source'}</span>
            </div>
          </div>
        </footer>

      </div>

      <style>{`
        .content-card:hover {
          box-shadow: 0 8px 32px rgba(58,56,51,0.16);
          transform: translateY(-3px);
          border-color: #D9D3C5 !important;
        }
        .content-card:hover img { transform: scale(1.05); }
        .content-card img { transition: transform 500ms ease; }
        .post-row-item:hover { background: #FBF6E8; }
      `}</style>
    </>
  );
}
