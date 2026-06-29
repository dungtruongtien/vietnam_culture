import { getTranslations } from 'next-intl/server';
import {
  getProvinces,
  getEventsOnThisDay,
  getEventsInMonth,
  getFeaturedPlaces,
  getFeaturedFoods,
  getUpcomingFestivals,
} from '@/lib/queries';
import VietnamMap from '@/components/VietnamMap';
import OnThisDay from '@/components/OnThisDay';
import SearchBar from '@/components/SearchBar';
import type { Metadata } from 'next';
import Link from 'next/link';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });
  return {
    title: t('name'),
    description: t('description'),
    openGraph: {
      title: t('name'),
      description: t('description'),
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      type: 'website',
    },
  };
}

// ── Province hero images (from our downloaded assets) ─────────────────────────
const PROVINCE_HERO: Record<string, string> = {
  'ho-chi-minh':  '/places/dinh-doc-lap/hero.jpg',
  'ha-noi':       '/places/hoang-thanh-thang-long/hero.jpg',
  'ha-giang':     '/places/deo-ma-pi-leng/hero.jpg',
  'dak-lak':      '/places/ho-lak/hero.jpg',
  'da-nang':      '/places/bai-bien-my-khe/hero.jpg',
  'thua-thien-hue': '/places/dai-noi-hue/hero.jpg',
  'binh-dinh':    '/places/thap-doi/hero.jpg',
  'quang-ngai':   '/places/ly-son/hero.jpg',
};

const PROVINCE_ACCENT: Record<string, string> = {
  'ho-chi-minh':  '#8E0A1F',
  'ha-noi':       '#2E4A6E',
  'ha-giang':     '#2E7D5A',
  'dak-lak':      '#5C3D1E',
  'da-nang':      '#1A5276',
  'thua-thien-hue': '#6B3A8E',
  'binh-dinh':    '#1E5F3A',
  'quang-ngai':   '#2C5F6E',
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });

  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const isVi = locale === 'vi';
  const otherLocale = isVi ? 'en' : 'vi';
  const otherLang = isVi ? 'English' : 'Tiếng Việt';

  const ALL_PROVINCE_SLUGS = ['ho-chi-minh', 'ha-noi', 'ha-giang', 'dak-lak', 'da-nang', 'thua-thien-hue'];
  const FOOD_PROVINCES = ['ho-chi-minh', 'ha-noi', 'ha-giang', 'dak-lak', 'da-nang', 'thua-thien-hue'];

  const [provinces, todayEvents, monthEvents, featuredPlaces, featuredFoods, upcomingFestivals] = await Promise.all([
    getProvinces(),
    getEventsOnThisDay(month, day),
    getEventsInMonth(month),
    getFeaturedPlaces(ALL_PROVINCE_SLUGS),
    getFeaturedFoods(FOOD_PROVINCES),
    getUpcomingFestivals(8),
  ]);

  const activeProvinces = provinces.map((p) => ({
    slug: p.slug,
    type: p.type,
    type_en: p.type_en,
  }));

  // Featured province cards — fixed order for layout
  const FEATURED_SLUGS = ['ho-chi-minh', 'ha-noi', 'ha-giang', 'dak-lak'];
  const featuredProvinces = FEATURED_SLUGS
    .map(slug => provinces.find(p => p.slug === slug))
    .filter(Boolean) as typeof provinces;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FBF8F1' }}>

      {/* ── Topbar ─────────────────────────────────────────────────────────── */}
      <div style={{ background: '#3D1A1F', color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
        <div className="max-w-7xl mx-auto px-6 py-1.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#C9A24C' }} />
            <span className="truncate">
              {isVi
                ? 'Nội dung có trích dẫn nguồn — không phải tài liệu học thuật chính thức.'
                : 'Sourced from public records — not an official academic reference.'}
            </span>
          </div>
          <Link href={`/${otherLocale}`} className="flex-shrink-0 hover:text-white transition-colors font-medium">
            {otherLang}
          </Link>
        </div>
      </div>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: 'rgba(251,248,241,0.92)',
          backdropFilter: 'saturate(150%) blur(14px)',
          WebkitBackdropFilter: 'saturate(150%) blur(14px)',
          borderColor: '#D9D3C5',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
          <Link href={`/${locale}`} className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#C8102E' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 16 C10 16 4 11 4 7 C4 4.8 6 3 8 4 C8.8 4.4 9.4 5 10 6 C10.6 5 11.2 4.4 12 4 C14 3 16 4.8 16 7 C16 11 10 16 10 16Z" stroke="#DEC07F" strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
                <path d="M10 16 L10 9" stroke="#DEC07F" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="leading-none">
              <div className="font-heading font-semibold text-lg leading-tight" style={{ color: '#8E0A1F' }}>
                {isVi ? 'Khám Phá Việt Nam' : 'Explore Vietnam'}
              </div>
              <div className="text-[10px] tracking-wider" style={{ color: '#6E6A60' }}>
                {isVi ? 'Hành trình di sản' : 'Heritage Journey'}
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 flex-1">
            {[
              { href: '#provinces', label: isVi ? 'Tỉnh thành' : 'Provinces' },
              { href: '#content',   label: isVi ? 'Ẩm thực' : 'Cuisine' },
              { href: '#places',    label: isVi ? 'Địa điểm' : 'Places' },
              { href: '#festivals', label: isVi ? 'Lễ hội' : 'Festivals' },
            ].map(({ href, label }) => (
              <a key={href} href={href} className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors hover:bg-vn-fog" style={{ color: '#3A3833' }}>
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 ml-auto">
            <SearchBar locale={locale} />
            <a href="#map" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-90" style={{ background: '#C8102E', color: '#FBF8F1' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 7l6-3 6 3 6-3v14l-6 3-6-3-6 3V7z"/>
              </svg>
              {isVi ? 'Bản đồ' : 'Map'}
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section id="map" className="relative overflow-hidden" style={{ background: '#FBF8F1' }}>
          {/* Gold radial glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(201,162,76,0.15), transparent 60%)' }} />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] pointer-events-none" style={{ background: 'radial-gradient(circle at 20% 80%, rgba(200,16,46,0.06), transparent 60%)' }} />

          <div className="max-w-7xl mx-auto px-6" style={{ paddingBlock: 'clamp(40px, 6vw, 72px) clamp(32px, 4vw, 48px)' }}>
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] items-center" style={{ gap: 'clamp(32px, 5vw, 64px)' }}>

              {/* Left: copy */}
              <div className="flex flex-col gap-5">
                <div className="inline-flex items-center gap-2 w-fit px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase" style={{ background: '#F5EDD8', border: '1px solid #DEC07F', color: '#8E0A1F' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C8102E' }} />
                  {isVi ? '63 tỉnh thành · 4 000 năm văn hiến' : '63 provinces · 4,000 years of heritage'}
                </div>

                <h1 className="font-heading font-semibold leading-[1.08] tracking-tight" style={{ fontSize: 'clamp(42px,5vw,64px)', color: '#8E0A1F' }}>
                  {isVi ? (
                    <>Khám phá <em style={{ fontStyle: 'italic', color: '#C9A24C' }}>di sản</em><br />và văn hoá Việt Nam</>
                  ) : (
                    <>Discover Vietnam's<br /><em style={{ fontStyle: 'italic', color: '#C9A24C' }}>heritage</em> &amp; culture</>
                  )}
                </h1>

                <p className="text-base leading-relaxed" style={{ color: '#6E6A60', maxWidth: '46ch' }}>
                  {isVi
                    ? 'Hành trình qua ẩm thực, địa danh và lễ hội của 63 tỉnh thành. Mỗi nội dung đều có trích dẫn nguồn — dành cho người Việt và du khách quốc tế.'
                    : 'A journey through food, landmarks, and festivals across 63 provinces. Every article is source-cited — for Vietnamese locals and international visitors alike.'}
                </p>

                {/* Hero search */}
                <div>
                  <SearchBar locale={locale} hero />
                </div>

                <div className="flex flex-wrap gap-3">
                  <a href="#provinces" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90" style={{ background: '#C8102E', color: '#FBF8F1' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3 7l6-3 6 3 6-3v14l-6 3-6-3-6 3V7z"/>
                    </svg>
                    {isVi ? 'Khám phá tỉnh thành' : 'Explore provinces'}
                  </a>
                  <a href="#content" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors hover:bg-vn-fog" style={{ borderColor: '#D9D3C5', color: '#3A3833' }}>
                    {isVi ? 'Ẩm thực đặc sản →' : 'Local cuisine →'}
                  </a>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-6 pt-5 border-t" style={{ borderColor: '#D9D3C5' }}>
                  {[
                    { num: `${provinces.length}`, label: isVi ? 'Tỉnh thành\ncó nội dung' : 'Provinces\nwith content' },
                    { num: '80+', label: isVi ? 'Món ăn\nđặc sản' : 'Local\ndishes' },
                    { num: '40+', label: isVi ? 'Lễ hội\ncó trích dẫn' : 'Festivals\ncited' },
                  ].map(({ num, label }) => (
                    <div key={num}>
                      <div className="font-heading text-4xl font-semibold leading-none" style={{ color: '#C8102E' }}>{num}</div>
                      <div className="text-xs mt-2 whitespace-pre-line leading-relaxed" style={{ color: '#6E6A60' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: map panel */}
              <div className="relative rounded-3xl border overflow-hidden" style={{ background: '#fff', borderColor: '#D9D3C5', boxShadow: '0 16px 48px rgba(58,56,51,0.12), 0 4px 12px rgba(58,56,51,0.06)', padding: '16px 20px 20px' }}>
                {/* subtle dot grid */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 75% 15%, rgba(201,162,76,0.08), transparent 50%), url("data:image/svg+xml,%3Csvg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'1\' fill=\'%23C9A24C\' fill-opacity=\'0.08\'/%3E%3C/svg%3E")' }} />

                <div className="relative flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest block" style={{ color: '#6E6A60' }}>
                      {isVi ? 'Bản đồ tương tác' : 'Interactive map'}
                    </span>
                    <h2 className="font-heading text-xl font-semibold" style={{ color: '#3A3833' }}>Việt Nam</h2>
                  </div>
                  <div className="flex flex-col gap-1.5 text-[10px]" style={{ color: '#6E6A60' }}>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#C8102E' }} />
                      {isVi ? 'Đang mở' : 'Available'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#D9D3C5' }} />
                      {isVi ? 'Sắp ra mắt' : 'Coming soon'}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <VietnamMap locale={locale} activeProvinces={activeProvinces} />
                </div>

                <div className="relative flex items-center justify-between pt-3 border-t text-[10px]" style={{ borderColor: '#D9D3C5', color: '#6E6A60', marginTop: '4px' }}>
                  <span>{isVi ? 'Nhấp vào tỉnh thành để khám phá' : 'Click a province to explore'}</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C8102E' }} />
                    {activeProvinces.length} {isVi ? 'đang mở' : 'open'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Purpose strip ────────────────────────────────────────────────── */}
        <div style={{ background: '#fff', borderTop: '1px solid #E9E6DE', borderBottom: '1px solid #E9E6DE', marginTop: '48px' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3" style={{ borderLeft: '1px solid #E9E6DE' }}>
              {[
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M12 2a7 7 0 0 1 7 7c0 4-3 6-7 6s-7-2-7-6a7 7 0 0 1 7-7z"/>
                      <path d="M5 15v2a7 7 0 0 0 14 0v-2"/>
                    </svg>
                  ),
                  iconBg: 'rgba(200,16,46,0.08)', iconColor: '#C8102E',
                  title: isVi ? 'Ẩm thực' : 'Cuisine',
                  desc: isVi ? 'Hơn 80 món đặc sản — câu chuyện nguồn gốc, hướng dẫn thưởng thức và địa chỉ ăn ngon.' : 'Over 80 local specialties — origin stories, tasting guides, and where to eat.',
                  count: '80+ ' + (isVi ? 'món đặc sản' : 'dishes'),
                },
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                      <circle cx="12" cy="9" r="2.5"/>
                    </svg>
                  ),
                  iconBg: 'rgba(46,125,90,0.08)', iconColor: '#2E7D5A',
                  title: isVi ? 'Địa điểm' : 'Places',
                  desc: isVi ? 'Từ thành cổ nghìn năm đến thác nước hùng vĩ — lịch sử chi tiết, có trích nguồn.' : 'From ancient citadels to majestic waterfalls — detailed history, source-cited.',
                  count: '70+ ' + (isVi ? 'địa điểm' : 'places'),
                },
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ),
                  iconBg: 'rgba(201,162,76,0.12)', iconColor: '#A07820',
                  title: isVi ? 'Lễ hội' : 'Festivals',
                  desc: isVi ? 'Lịch lễ hội theo mùa, phong tục và ý nghĩa văn hoá — để bạn đến đúng lúc.' : 'Seasonal festival calendar, customs and cultural meaning — arrive at the right time.',
                  count: '40+ ' + (isVi ? 'lễ hội' : 'festivals'),
                },
              ].map(({ icon, iconBg, iconColor, title, desc, count }) => (
                <div key={title} className="flex flex-col items-center text-center gap-3 py-10" style={{ padding: '40px 32px', borderRight: '1px solid #E9E6DE' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg, color: iconColor }}>
                    {icon}
                  </div>
                  <div className="font-heading text-xl font-semibold" style={{ color: '#8E0A1F' }}>{title}</div>
                  <p className="text-sm leading-relaxed" style={{ color: '#6E6A60' }}>{desc}</p>
                  <div className="text-xs font-semibold mt-auto pt-2" style={{ color: '#C9A24C' }}>{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Today in history ─────────────────────────────────────────────── */}
        <div id="today" className="max-w-7xl mx-auto px-4" style={{ paddingTop: '64px', paddingBottom: '64px' }}>
          <OnThisDay
            locale={locale}
            todayEvents={todayEvents}
            monthEvents={monthEvents}
            today={{ month, day, year: now.getFullYear() }}
          />
        </div>

        {/* ── Featured provinces ───────────────────────────────────────────── */}
        <section id="provinces" style={{ background: '#EDE3CC', padding: '72px 0' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-8">
              <span className="text-xs font-bold tracking-widest uppercase block mb-2" style={{ color: '#C9A24C' }}>
                {isVi ? 'Tỉnh thành nổi bật' : 'Featured provinces'}
              </span>
              <h2 className="font-heading text-4xl font-semibold" style={{ color: '#8E0A1F' }}>
                {isVi ? 'Bắt đầu hành trình từ đâu?' : 'Where will you start?'}
              </h2>
              <p className="text-sm mt-2" style={{ color: '#6E6A60' }}>
                {isVi ? 'Chọn một tỉnh thành để xem toàn bộ ẩm thực, địa điểm và lễ hội.' : 'Choose a province to explore its food, places, and festivals.'}
              </p>
            </div>

            {/* Province grid: 1 wide + 3 regular */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
              {featuredProvinces.map((p, i) => {
                const typeSlug = isVi ? p.type : p.type_en;
                const name = isVi ? p.name_vi : p.name_en;
                const region = isVi ? p.region_vi : p.region_en;
                const heroImg = PROVINCE_HERO[p.slug];
                const accent = PROVINCE_ACCENT[p.slug] ?? '#3D1A1F';
                const isFeatured = i === 0;
                return (
                  <Link
                    key={p.slug}
                    href={`/${locale}/${typeSlug}/${p.slug}`}
                    className={`group relative rounded-2xl overflow-hidden cursor-pointer ${isFeatured ? 'lg:col-span-2 row-span-1' : ''}`}
                    style={{ minHeight: isFeatured ? '320px' : '260px' }}
                  >
                    {heroImg ? (
                      <img
                        src={heroImg}
                        alt={name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}99)` }} />
                    )}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(20,6,8,0.88) 0%, rgba(20,6,8,0.2) 55%, transparent 100%)' }} />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: '#C9A24C' }}>{region}</div>
                      <div className="font-heading font-semibold text-white leading-tight" style={{ fontSize: isFeatured ? '28px' : '20px' }}>{name}</div>
                      <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>
                        {isVi ? 'Khám phá →' : 'Explore →'}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Food section ─────────────────────────────────────────────────── */}
        <section id="content" className="max-w-7xl mx-auto px-6" style={{ paddingTop: '72px', paddingBottom: '72px' }}>
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase block mb-2" style={{ color: '#C9A24C' }}>
                {isVi ? 'Ẩm thực đặc sản' : 'Local cuisine'}
              </span>
              <h2 className="font-heading text-4xl font-semibold" style={{ color: '#8E0A1F' }}>
                {isVi ? 'Câu chuyện trong từng bát, từng đĩa.' : 'A story in every bowl and plate.'}
              </h2>
            </div>
            <a href="#" className="hidden md:inline-flex items-center text-sm font-medium px-4 py-2 rounded-lg border transition-colors hover:bg-vn-fog flex-shrink-0" style={{ borderColor: '#D9D3C5', color: '#3A3833' }}>
              {isVi ? 'Xem tất cả →' : 'View all →'}
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredFoods.slice(0, 6).map((food) => {
              const typeSlug = isVi ? food.province_type : food.province_type_en;
              const href = `/${locale}/${typeSlug}/${food.province_slug}/am-thuc/${food.slug}`;
              const title = isVi ? food.title_vi : food.title_en;
              const lede = isVi ? food.lede_vi : food.lede_en;
              const provName = isVi ? food.province_name_vi : food.province_name_en;
              return (
                <Link
                  key={food.slug}
                  href={href}
                  className="group rounded-2xl overflow-hidden border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                  style={{ background: '#fff', borderColor: '#E9E6DE', boxShadow: '0 2px 8px rgba(58,56,51,0.06)' }}
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: '16/10', background: '#EDE3CC' }}>
                    {food.image_url && (
                      <img
                        src={food.image_url}
                        alt={title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ background: 'rgba(200,16,46,0.85)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                      {isVi ? 'Ẩm thực' : 'Cuisine'}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#C9A24C' }}>{provName}</div>
                    <h3 className="font-heading text-lg font-semibold leading-snug mb-2 group-hover:text-vn-red transition-colors" style={{ color: '#3A3833' }}>{title}</h3>
                    {lede && <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#6E6A60' }}>{lede}</p>}
                    <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: '#E9E6DE' }}>
                      <span className="text-xs font-medium" style={{ color: '#C9A24C' }}>{isVi ? 'Đọc thêm' : 'Read more'}</span>
                      <span style={{ color: '#C8102E', fontSize: '16px' }}>→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Places section ───────────────────────────────────────────────── */}
        <section id="places" style={{ background: '#fff', padding: '72px 0' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold tracking-widest uppercase block mb-2" style={{ color: '#C9A24C' }}>
                  {isVi ? 'Địa điểm nổi bật' : 'Highlighted places'}
                </span>
                <h2 className="font-heading text-4xl font-semibold" style={{ color: '#8E0A1F' }}>
                  {isVi ? 'Những nơi nhất định phải ghé thăm.' : 'Places you must not miss.'}
                </h2>
              </div>
              <a href="#" className="hidden md:inline-flex items-center text-sm font-medium px-4 py-2 rounded-lg border transition-colors hover:bg-vn-fog flex-shrink-0" style={{ borderColor: '#D9D3C5', color: '#3A3833' }}>
                {isVi ? 'Xem tất cả →' : 'View all →'}
              </a>
            </div>

            {/* Masonry-style: 1 tall left + 4 right grid */}
            <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr_1fr] gap-4">
              {/* Featured tall card */}
              {featuredPlaces[0] && (() => {
                const p = featuredPlaces[0];
                const typeSlug = isVi ? p.province_type : p.province_type_en;
                const href = `/${locale}/${typeSlug}/${p.province_slug}/dia-diem/${p.slug}`;
                const title = isVi ? p.title_vi : p.title_en;
                const lede = isVi ? p.lede_vi : p.lede_en;
                const provName = isVi ? p.province_name_vi : p.province_name_en;
                return (
                  <Link href={href} className="group relative rounded-2xl overflow-hidden row-span-2" style={{ minHeight: '380px', background: '#EDE3CC' }}>
                    {p.image_url && (
                      <img src={p.image_url} alt={title} loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    )}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(20,6,8,0.85) 0%, rgba(20,6,8,0.15) 55%, transparent 100%)' }} />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#C9A24C' }}>{isVi ? `Địa điểm · ${provName}` : `Place · ${provName}`}</div>
                      <h3 className="font-heading text-2xl font-semibold text-white leading-snug">{title}</h3>
                      {lede && <p className="text-xs text-white/70 mt-2 line-clamp-3 leading-relaxed">{lede}</p>}
                    </div>
                  </Link>
                );
              })()}

              {/* Right 4 smaller cards */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                {featuredPlaces.slice(1, 5).map((p) => {
                  const typeSlug = isVi ? p.province_type : p.province_type_en;
                  const href = `/${locale}/${typeSlug}/${p.province_slug}/dia-diem/${p.slug}`;
                  const title = isVi ? p.title_vi : p.title_en;
                  const provName = isVi ? p.province_name_vi : p.province_name_en;
                  return (
                    <Link key={p.slug} href={href}
                      className="group relative rounded-2xl overflow-hidden"
                      style={{ minHeight: '175px', background: '#EDE3CC' }}
                    >
                      {p.image_url && (
                        <img src={p.image_url} alt={title} loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(20,6,8,0.8) 0%, transparent 60%)' }} />
                      <div className="absolute bottom-0 left-0 right-0 p-3.5">
                        <div className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: '#C9A24C' }}>{provName}</div>
                        <h3 className="font-heading text-sm font-semibold text-white leading-snug line-clamp-2">{title}</h3>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Upcoming festivals ───────────────────────────────────────────── */}
        {upcomingFestivals.length > 0 && (
          <section id="festivals" style={{ background: '#3D1A1F', padding: '72px 0' }}>
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-end justify-between mb-8 gap-4">
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase block mb-2" style={{ color: '#C9A24C' }}>
                    {isVi ? 'Lễ hội sắp diễn ra' : 'Upcoming festivals'}
                  </span>
                  <h2 className="font-heading text-4xl font-semibold text-white">
                    {isVi ? 'Theo lịch âm và dương — đừng bỏ lỡ.' : "Don't miss the season's festivals."}
                  </h2>
                </div>
                <a href="#" className="hidden md:inline-flex items-center text-sm font-medium px-4 py-2 rounded-lg border flex-shrink-0 transition-colors" style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)' }}>
                  {isVi ? 'Xem lịch đầy đủ →' : 'Full calendar →'}
                </a>
              </div>

              {/* Horizontal scroll rail */}
              <div
                className="flex gap-4 overflow-x-auto pb-2"
                style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {upcomingFestivals.map((f) => {
                  const festivalName = isVi ? f.name_vi : f.name_en;
                  const provName = isVi ? f.province_name_vi : f.province_name_en;
                  const typeSlug = isVi ? f.province_type : f.province_type_en;
                  const href = `/${locale}/${typeSlug}/${f.province_slug}/le-hoi/${f.slug}`;
                  const startDate = new Date(f.start_date);
                  const lang = isVi ? 'vi-VN' : 'en-US';
                  const dayNum = startDate.toLocaleDateString(lang, { day: 'numeric' });
                  const monthStr = startDate.toLocaleDateString(lang, { month: 'short' });
                  return (
                    <Link
                      key={f.slug}
                      href={href}
                      className="group flex-shrink-0 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1"
                      style={{ width: 210, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', scrollSnapAlign: 'start', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
                    >
                      <div className="relative overflow-hidden" style={{ height: 130, background: 'linear-gradient(135deg,#5C1A20,#1B2A4A)' }}>
                        {f.fi_image_url && (
                          <img src={f.fi_image_url} alt={festivalName} loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-3">
                          <div className="font-heading text-2xl font-semibold text-white leading-none">{dayNum}</div>
                          <div className="text-[10px] font-medium uppercase tracking-wider text-white/70">{monthStr}</div>
                        </div>
                        {f.is_lunar === 1 && (
                          <span className="absolute top-2.5 right-2.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(222,192,127,0.2)', color: '#DEC07F', border: '1px solid rgba(222,192,127,0.3)' }}>
                            {isVi ? 'ÂL' : 'Lunar'}
                          </span>
                        )}
                      </div>
                      <div className="p-3.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#C9A24C' }}>{provName}</p>
                        <h3 className="font-heading text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-vn-gold transition-colors">{festivalName}</h3>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Search CTA ───────────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 text-center" style={{ paddingTop: '72px', paddingBottom: '72px' }}>
          <span className="text-xs font-bold tracking-widest uppercase block mb-3" style={{ color: '#C9A24C' }}>
            {isVi ? 'Tìm kiếm' : 'Search'}
          </span>
          <h2 className="font-heading text-3xl font-semibold mb-6" style={{ color: '#8E0A1F' }}>
            {isVi ? 'Tìm theo tên món, tỉnh thành hoặc lễ hội' : 'Search by dish, province or festival'}
          </h2>
          <div className="max-w-xl mx-auto mb-5">
            <SearchBar locale={locale} hero />
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            <span className="text-xs" style={{ color: '#6E6A60' }}>{isVi ? 'Thử:' : 'Try:'}</span>
            {(isVi
              ? ['Phở bò Hà Nội', 'Hà Giang', 'Tết Nguyên Đán', 'Cà phê Ban Mê']
              : ['Pho Hanoi', 'Ha Giang', 'Tet Festival', 'Ban Me Coffee']
            ).map(q => (
              <span key={q} className="text-xs px-3 py-1 rounded-full cursor-pointer transition-colors" style={{ color: '#C8102E', background: 'rgba(200,16,46,0.07)' }}>{q}</span>
            ))}
          </div>
        </section>

      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer style={{ background: '#3D1A1F', color: 'rgba(255,255,255,0.55)' }}>
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#C8102E' }}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M10 16 C10 16 4 11 4 7 C4 4.8 6 3 8 4 C8.8 4.4 9.4 5 10 6 C10.6 5 11.2 4.4 12 4 C14 3 16 4.8 16 7 C16 11 10 16 10 16Z" stroke="#DEC07F" strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
                    <path d="M10 16 L10 9" stroke="#DEC07F" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="font-heading text-white text-lg font-semibold">{isVi ? 'Khám Phá Việt Nam' : 'Explore Vietnam'}</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {isVi
                  ? 'Hành trình khám phá di sản và văn hoá Việt Nam — 63 tỉnh thành, 4 000 năm lịch sử. Nội dung có trích dẫn nguồn.'
                  : 'Exploring Vietnam\'s heritage and culture — 63 provinces, 4,000 years of history. All content is source-cited.'}
              </p>
            </div>
            {[
              {
                heading: isVi ? 'Khám phá' : 'Explore',
                links: [
                  { href: '#content', label: isVi ? 'Ẩm thực' : 'Cuisine' },
                  { href: '#places',  label: isVi ? 'Địa điểm' : 'Places' },
                  { href: '#festivals', label: isVi ? 'Lễ hội' : 'Festivals' },
                  { href: '#map',     label: isVi ? 'Bản đồ tương tác' : 'Interactive map' },
                ],
              },
              {
                heading: isVi ? 'Tỉnh thành' : 'Provinces',
                links: provinces.slice(0, 5).map(p => ({
                  href: `/${locale}/${isVi ? p.type : p.type_en}/${p.slug}`,
                  label: isVi ? p.name_vi : p.name_en,
                })),
              },
              {
                heading: isVi ? 'Ngôn ngữ' : 'Language',
                links: [
                  { href: '/vi', label: 'Tiếng Việt' },
                  { href: '/en', label: 'English' },
                ],
              },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#C9A24C' }}>{heading}</h4>
                <ul className="flex flex-col gap-2.5">
                  {links.map(({ href, label }) => (
                    <li key={label}>
                      <Link href={href} className="text-sm transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t pt-6 flex flex-wrap items-center justify-between gap-3 text-xs" style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}>
            <span>© {now.getFullYear()} {t('name')}</span>
            <span style={{ color: '#C9A24C', letterSpacing: '0.08em' }}>❖ HERITAGE JOURNEY</span>
            <span>{isVi ? 'Không phải nguồn học thuật chính thức' : 'Not an official academic source'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
