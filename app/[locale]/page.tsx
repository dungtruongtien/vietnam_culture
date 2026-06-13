import { getTranslations } from 'next-intl/server';
import { getProvinces, getEventsOnThisDay, getEventsInMonth, getFeaturedPlaces, getFeaturedFoods } from '@/lib/queries';
import VietnamMap from '@/components/VietnamMap';
import OnThisDay from '@/components/OnThisDay';
import SearchBar from '@/components/SearchBar';
import AdSlot from '@/components/AdSlot';
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

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });

  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const FEATURED_PROVINCES = ['ho-chi-minh', 'ha-noi', 'da-nang', 'thua-thien-hue'];

  const [provinces, todayEvents, monthEvents, featuredPlaces, featuredFoods] = await Promise.all([
    getProvinces(),
    getEventsOnThisDay(month, day),
    getEventsInMonth(month),
    getFeaturedPlaces(FEATURED_PROVINCES),
    getFeaturedFoods(['ho-chi-minh', 'ha-noi', 'da-nang']),
  ]);

  const activeProvinces = provinces.map((p) => ({
    slug: p.slug,
    type: p.type,
    type_en: p.type_en,
  }));

  // Pick 2 random provinces for trending destinations (1 from each if >= 2 provinces)
  const shuffled = [...provinces].sort(() => Math.random() - 0.5);
  const trendingProvinces = shuffled.slice(0, 2);

  const otherLocale = locale === 'vi' ? 'en' : 'vi';
  const otherLang = locale === 'vi' ? 'English' : 'Tiếng Việt';
  const isVi = locale === 'vi';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FBF8F1' }}>

      {/* Topbar */}
      <div className="bg-vn-ink text-white/70 text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-vn-gold flex-shrink-0" />
            <span className="truncate">
              {isVi
                ? 'Thông tin tổng hợp từ nhiều nguồn — vui lòng kiểm tra từ nguồn chính thống'
                : 'Information aggregated from multiple sources — please verify from official sources'}
            </span>
          </div>
          <Link
            href={`/${otherLocale}`}
            className="flex-shrink-0 text-white/50 hover:text-vn-gold transition-colors"
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
          {/* Brand mark */}
          <Link href={`/${locale}`} className="flex items-center gap-3 flex-shrink-0">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: '#C8102E', boxShadow: '0 2px 4px rgba(27,27,26,0.15)' }}
            >
              {/* Lotus mark */}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 16 C10 16 4 11 4 7 C4 4.8 6 3 8 4 C8.8 4.4 9.4 5 10 6 C10.6 5 11.2 4.4 12 4 C14 3 16 4.8 16 7 C16 11 10 16 10 16Z" stroke="#DEC07F" strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
                <path d="M10 16 L10 9" stroke="#DEC07F" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span
              className="font-heading text-xl font-semibold text-vn-ink leading-none"
            >
              {isVi ? 'Khám Phá Việt Nam' : 'Explore Vietnam'}
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <SearchBar locale={locale} />
          </div>
        </div>
      </header>

      {/* Ad — top */}
      <div className="max-w-7xl mx-auto w-full px-4 mt-3">
        <AdSlot id="banner-top" size="leaderboard" />
      </div>

      {/* Hero — 2-column grid */}
      <section className="relative overflow-hidden">
        {/* Decorative gold corner ornament */}
        <div
          className="absolute top-[-120px] right-[-120px] w-[380px] h-[380px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(201,162,76,0.18), transparent 60%)' }}
        />
        <div
          className="max-w-7xl mx-auto px-4"
          style={{ paddingBlock: 'clamp(40px, 6vw, 72px) clamp(32px, 4vw, 48px)' }}
        >
          <div
            className="grid grid-cols-1 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] items-center"
            style={{ gap: 'clamp(32px, 5vw, 64px)' }}
          >
            {/* Left: eyebrow + title + lede + search + CTAs + stats */}
            <div className="flex flex-col" style={{ gap: '20px' }}>
              <span className="text-xs font-medium text-vn-stone uppercase tracking-widest">
                {isVi ? '34 tỉnh thành · 4 000 năm văn hiến' : '34 provinces · 4,000 years of heritage'}
              </span>

              <h1
                className="font-heading font-semibold leading-tight text-vn-ink"
                style={{ fontSize: 'clamp(40px, 4vw + 1rem, 56px)' }}
              >
                {isVi ? (
                  <>Hành trình <em style={{ fontStyle: 'italic', background: 'linear-gradient(90deg, #C8102E, #C9A24C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>di sản</em><br />từ Bắc chí Nam.</>
                ) : (
                  <>A journey through<br /><em style={{ fontStyle: 'italic', background: 'linear-gradient(90deg, #C8102E, #C9A24C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Vietnam&apos;s heritage.</em></>
                )}
              </h1>

              <p className="text-base text-vn-stone leading-relaxed" style={{ maxWidth: '46ch' }}>
                {isVi
                  ? 'Khám phá lịch sử, lễ hội và văn hóa Việt Nam — được tổng hợp từ nguồn báo chí, bảo tàng và cơ quan chính thức.'
                  : 'Explore history, festivals, and culture across Vietnam — sourced from press, museums, and official bodies.'}
              </p>

              {/* Search bar — hero variant */}
              <SearchBar locale={locale} hero />

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3">
                <a
                  href="#today"
                  className="inline-flex items-center rounded-full px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                  style={{ background: '#C8102E', color: '#FBF8F1' }}
                >
                  {isVi ? 'Sự kiện hôm nay' : 'Today in history'}
                </a>
                <a
                  href="#featured-places"
                  className="inline-flex items-center rounded-full px-6 py-2.5 text-sm font-medium border border-vn-mist hover:bg-vn-fog transition-colors"
                  style={{ color: '#1B1B1A' }}
                >
                  {isVi ? 'Địa điểm nổi bật →' : 'Highlighted places →'}
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-vn-mist">
                <div>
                  <div className="font-heading text-4xl font-semibold leading-none" style={{ color: '#C8102E' }}>34</div>
                  <div className="text-xs text-vn-stone uppercase tracking-wider mt-2">{isVi ? 'Tỉnh thành' : 'Provinces'}</div>
                </div>
                <div>
                  <div className="font-heading text-4xl font-semibold leading-none" style={{ color: '#C8102E' }}>4000+</div>
                  <div className="text-xs text-vn-stone uppercase tracking-wider mt-2">{isVi ? 'Năm lịch sử' : 'Years of history'}</div>
                </div>
                <div>
                  <div className="font-heading text-4xl font-semibold leading-none" style={{ color: '#C8102E' }}>54</div>
                  <div className="text-xs text-vn-stone uppercase tracking-wider mt-2">{isVi ? 'Dân tộc' : 'Ethnic groups'}</div>
                </div>
              </div>
            </div>

            {/* Right: map panel */}
            <div
              className="relative rounded-3xl border border-vn-mist overflow-hidden"
              style={{
                background: '#FFFFFF',
                padding: '16px 24px 24px',
                boxShadow: '0 16px 32px rgba(27,27,26,0.10), 0 4px 8px rgba(27,27,26,0.05)',
              }}
            >
              {/* Subtle gold radial + diagonal grid pattern */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 80% 20%, rgba(201,162,76,0.08), transparent 45%), repeating-linear-gradient(45deg, transparent 0 18px, rgba(110,106,96,0.03) 18px 19px)',
                }}
              />

              {/* Panel header */}
              <div className="relative flex items-start justify-between mb-1">
                <div>
                  <span className="text-[10px] font-medium text-vn-stone uppercase tracking-widest block">
                    {isVi ? 'Bản đồ tương tác' : 'Interactive map'}
                  </span>
                  <h2 className="font-heading text-xl font-medium text-vn-ink leading-tight">Việt Nam</h2>
                </div>
                {/* Legend */}
                <div className="flex flex-col gap-1.5 text-[10px] text-vn-stone pt-0.5">
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

              {/* Map */}
              <div className="relative">
                <VietnamMap locale={locale} activeProvinces={activeProvinces} />
              </div>

              {/* Bottom info strip */}
              <div className="relative flex items-center justify-between pt-3 border-t border-vn-mist mt-1 text-[10px] text-vn-stone">
                <span>{isVi ? '34 tỉnh thành · hình chữ S' : '63 provinces · S-shaped country'}</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C8102E' }} />
                  {activeProvinces.length} {isVi ? 'đang mở' : 'open'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 pb-12 space-y-14">

        <div id="today">
          <OnThisDay
            locale={locale}
            todayEvents={todayEvents}
            monthEvents={monthEvents}
            today={{ month, day, year: now.getFullYear() }}
          />
        </div>

        {/* ── Điểm đến trending ── */}
        <section id="destinations">
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className="text-xs font-medium text-vn-stone uppercase tracking-widest block mb-1">
                {isVi ? 'Điểm đến trending' : 'Trending destinations'}
              </span>
              <h2 className="font-heading text-3xl font-semibold text-vn-ink">
                {isVi ? 'Nơi du khách đang khám phá.' : 'Where travelers are exploring.'}
              </h2>
              <p className="text-sm text-vn-stone mt-1">
                {isVi
                  ? 'Tuyển chọn dựa trên đề xuất của ban biên tập và các sự kiện văn hóa đang diễn ra.'
                  : 'Curated by our editorial team based on ongoing cultural events.'}
              </p>
            </div>
            <a
              href="#"
              className="hidden md:inline-flex items-center text-sm font-medium border border-vn-mist rounded-full px-4 py-2 hover:bg-vn-fog transition-colors flex-shrink-0 mt-1"
              style={{ color: '#1B1B1A' }}
            >
              {isVi ? 'Xem tất cả →' : 'View all →'}
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Active provinces from DB — 2 random */}
            {trendingProvinces.map((p) => {
              const typeSlug = isVi ? p.type : p.type_en;
              const name = isVi ? p.name_vi : p.name_en;
              const description = isVi ? p.meta_description_vi : p.meta_description_en;
              const region = isVi ? p.region_vi : p.region_en;
              const isHCM = p.slug === 'ho-chi-minh';
              const bg = isHCM ? '#F1A6B2' : '#F4D8B5';
              return (
                <Link
                  key={p.slug}
                  href={`/${locale}/${typeSlug}/${p.slug}`}
                  className="group rounded-2xl border border-vn-mist overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
                  style={{ background: '#FFFFFF', boxShadow: '0 2px 8px rgba(27,27,26,0.06)' }}
                >
                  <div className="relative h-40 overflow-hidden" style={{ background: bg }}>
                    {isHCM ? (
                      <svg viewBox="0 0 320 160" className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                        <rect width="320" height="160" fill="#F1A6B2"/>
                        <rect x="20" y="70" width="25" height="90" fill="#8E0A1F"/>
                        <rect x="55" y="45" width="35" height="115" fill="#4D050F"/>
                        <rect x="100" y="25" width="20" height="135" fill="#A60D26"/>
                        <rect x="130" y="60" width="30" height="100" fill="#8E0A1F"/>
                        <rect x="170" y="38" width="24" height="122" fill="#4D050F"/>
                        <rect x="204" y="55" width="28" height="105" fill="#A60D26"/>
                        <rect x="244" y="70" width="36" height="90" fill="#8E0A1F"/>
                        <rect x="290" y="80" width="30" height="80" fill="#4D050F"/>
                        <circle cx="240" cy="25" r="16" fill="#FBF6E8" opacity="0.55"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 320 160" className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                        <rect width="320" height="160" fill="#F4D8B5"/>
                        <path d="M0 130 L40 100 L60 115 L80 90 L100 110 L130 85 L160 105 L185 80 L215 100 L245 85 L275 105 L320 90 L320 160 L0 160 Z" fill="#B5934F" opacity="0.9"/>
                        <path d="M0 145 L50 130 L80 138 L120 122 L160 135 L200 118 L240 132 L280 115 L320 128 L320 160 L0 160 Z" fill="#8E5A1F"/>
                        <circle cx="260" cy="35" r="18" fill="#FBF6E8" opacity="0.8"/>
                        <rect x="150" y="108" width="30" height="52" fill="#4D050F"/>
                        <rect x="250" y="100" width="32" height="60" fill="#4D050F"/>
                      </svg>
                    )}
                    <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full" style={{ background: '#C8102E', color: '#FBF8F1' }}>
                      {isVi ? 'Nổi bật' : 'Featured'}
                    </span>
                  </div>
                  <div className="p-4">
                    {region && <span className="text-[10px] font-medium uppercase tracking-wider text-vn-stone">{region}</span>}
                    <h3 className="font-heading text-base font-medium text-vn-ink mt-0.5 group-hover:text-vn-red transition-colors leading-snug">
                      {name}
                    </h3>
                    {description && (
                      <p className="text-xs text-vn-stone mt-1.5 line-clamp-2 leading-relaxed">{description}</p>
                    )}
                  </div>
                </Link>
              );
            })}

          </div>
        </section>

        {/* ── Địa điểm nổi bật ── */}
        <section id="featured-places">
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className="text-xs font-medium text-vn-stone uppercase tracking-widest block mb-1">
                {isVi ? 'Địa điểm nổi bật' : 'Highlighted places'}
              </span>
              <h2 className="font-heading text-3xl font-semibold text-vn-ink">
                {isVi ? 'Những nơi nhất định phải ghé thăm.' : 'Places you must not miss.'}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredPlaces.map((place) => {
              const typeSlug = isVi ? place.province_type : place.province_type_en;
              const href = `/${locale}/${typeSlug}/${place.province_slug}/dia-diem/${place.slug}`;
              const title = isVi ? place.title_vi : place.title_en;
              const lede = isVi ? place.lede_vi : place.lede_en;
              const provName = isVi ? place.province_name_vi : place.province_name_en;
              return (
                <a
                  key={place.slug}
                  href={href}
                  className="group rounded-2xl border border-vn-mist overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
                  style={{ background: '#FFFFFF', boxShadow: '0 2px 8px rgba(27,27,26,0.06)' }}
                >
                  <div className="relative h-44 overflow-hidden" style={{ background: '#EDE3CC' }}>
                    {place.image_url ? (
                      <img
                        src={place.image_url}
                        alt={title}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s ease' }}
                        className="group-hover:scale-105"
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #EDE3CC, #D9D3C5)' }} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full" style={{ background: '#C8102E', color: '#FBF8F1' }}>
                      {provName}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading text-base font-medium text-vn-ink group-hover:text-vn-red transition-colors leading-snug">
                      {title}
                    </h3>
                    {lede && (
                      <p className="text-xs text-vn-stone mt-1.5 line-clamp-2 leading-relaxed">{lede}</p>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* ── Câu chuyện văn hóa, ẩm thực và con người ── */}
        <section id="editorial">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-heading text-3xl font-semibold text-vn-ink">
                {isVi ? 'Câu chuyện văn hóa, ẩm thực và con người.' : 'Stories of culture, cuisine and people.'}
              </h2>
            </div>
          </div>

          {/* 2 place cards + 3 food cards */}
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-4">
            {/* Left column: 2 place cards stacked */}
            <div className="flex flex-col gap-4">
              {featuredPlaces.slice(0, 2).map((place) => {
                const typeSlug = isVi ? place.province_type : place.province_type_en;
                const href = `/${locale}/${typeSlug}/${place.province_slug}/dia-diem/${place.slug}`;
                const title = isVi ? place.title_vi : place.title_en;
                const lede = isVi ? place.lede_vi : place.lede_en;
                const provName = isVi ? place.province_name_vi : place.province_name_en;
                return (
                  <a
                    key={place.slug}
                    href={href}
                    className="group relative rounded-2xl overflow-hidden flex-1"
                    style={{ minHeight: '160px', background: '#EDE3CC' }}
                  >
                    {place.image_url ? (
                      <img
                        src={place.image_url}
                        alt={title}
                        loading="lazy"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <span className="text-[10px] font-medium uppercase tracking-wider block mb-1" style={{ color: '#DEC07F' }}>
                        {isVi ? `Địa điểm · ${provName}` : `Places · ${provName}`}
                      </span>
                      <h3 className="font-heading text-base font-semibold leading-snug text-white group-hover:text-vn-gold transition-colors line-clamp-2">
                        {title}
                      </h3>
                      {lede && (
                        <p className="text-[11px] text-white/70 mt-1 line-clamp-2 leading-relaxed">{lede}</p>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Right columns: 3 food cards */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {featuredFoods.slice(0, 3).map((food) => {
                const typeSlug = isVi ? food.province_type : food.province_type_en;
                const href = `/${locale}/${typeSlug}/${food.province_slug}/am-thuc/${food.slug}`;
                const title = isVi ? food.title_vi : food.title_en;
                const lede = isVi ? food.lede_vi : food.lede_en;
                const provName = isVi ? food.province_name_vi : food.province_name_en;
                return (
                  <a
                    key={food.slug}
                    href={href}
                    className="group rounded-2xl border border-vn-mist overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
                    style={{ background: '#FFFFFF', boxShadow: '0 2px 8px rgba(27,27,26,0.06)' }}
                  >
                    <div className="relative overflow-hidden" style={{ height: '140px', background: '#F4D8B5' }}>
                      {food.image_url ? (
                        <img
                          src={food.image_url}
                          alt={title}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          className="group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #F4D8B5, #DEC07F)' }} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                    <div className="p-3.5">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-vn-stone block mb-1">
                        {isVi ? `Ẩm thực · ${provName}` : `Cuisine · ${provName}`}
                      </span>
                      <h3 className="font-heading text-sm font-medium text-vn-ink group-hover:text-vn-red transition-colors leading-snug line-clamp-2">
                        {title}
                      </h3>
                      {lede && (
                        <p className="text-[11px] text-vn-stone mt-1.5 line-clamp-2 leading-relaxed">{lede}</p>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

      </main>

      {/* Ad — bottom */}
      <div className="max-w-7xl mx-auto w-full px-4 mb-3">
        <AdSlot id="banner-bottom" size="leaderboard" />
      </div>

      {/* Footer */}
      <footer style={{ background: '#1B1B1A' }} className="text-white/60 mt-8">
        <div className="max-w-7xl mx-auto px-4 pt-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-10 mb-10">
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
                  ? 'Thông tin lịch sử, văn hóa và du lịch các tỉnh thành Việt Nam được tổng hợp từ nhiều nguồn tham khảo.'
                  : 'History, culture, and tourism information for Vietnamese provinces, aggregated from multiple reference sources.'}
              </p>
            </div>
            <div>
              <h4 className="font-heading text-white text-sm font-medium mb-4">
                {isVi ? 'Ngôn ngữ' : 'Language'}
              </h4>
              <ul className="flex flex-col gap-2 text-sm">
                <li><Link href="/vi" className="hover:text-vn-gold transition-colors">Tiếng Việt</Link></li>
                <li><Link href="/en" className="hover:text-vn-gold transition-colors">English</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-white text-sm font-medium mb-4">
                {isVi ? 'Lưu ý' : 'Notice'}
              </h4>
              <p className="text-xs leading-relaxed text-white/40">
                {isVi
                  ? 'Thông tin tổng hợp có thể có sai sót. Vui lòng kiểm tra từ nguồn chính thức.'
                  : 'Aggregated information may contain errors. Please verify from official sources.'}
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-white/30">
            <span>© {now.getFullYear()} {t('name')}</span>
            <span>{isVi ? 'Không phải nguồn học thuật chính thức' : 'Not an official academic source'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
