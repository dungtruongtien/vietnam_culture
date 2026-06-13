'use client';

import type { CulturalPost, Source } from '@/lib/queries';

type PostWithSources = CulturalPost & { sources: Source[] };

type Props = {
  locale: string;
  posts: PostWithSources[];
  provinceSlug?: string;
  provinceTypeSlug?: string;
  foodSlugs?: Record<number, string>;      // cultural_post_id → food slug
  placeSlugs?: Record<number, string>;     // cultural_post_id → place slug
  foodImageUrls?: Record<number, string>;  // cultural_post_id → image_url
  placeImageUrls?: Record<number, string>; // cultural_post_id → image_url
};

const TYPE_META: Record<string, {
  vi: string; en: string;
  eyebrowColor: string;
  svgBg: string; svgAccent: string;
  order: number;
}> = {
  'am-thuc':   { vi: 'Ẩm thực',   en: 'Cuisine',   eyebrowColor: '#8E5A1F', svgBg: '#F4D8B5', svgAccent: '#8E5A1F', order: 1 },
  'dia-diem':  { vi: 'Địa điểm',  en: 'Places',    eyebrowColor: '#8E0A1F', svgBg: '#EEF6F0', svgAccent: '#2E7D5A', order: 2 },
  'le-hoi':    { vi: 'Lễ hội',    en: 'Festivals', eyebrowColor: '#8A6C00', svgBg: '#FCE7EE', svgAccent: '#C8102E', order: 3 },
  'phong-tuc': { vi: 'Phong tục', en: 'Customs',   eyebrowColor: '#4A3F73', svgBg: '#EDE3CC', svgAccent: '#6E5C9E', order: 4 },
};

type ListItem = { item: string; description: string };

function ItemIllustration({ svgBg, svgAccent, idx }: { svgBg: string; svgAccent: string; idx: number }) {
  const variant = idx % 4;
  return (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="120" height="120" fill={svgBg} />
      {variant === 0 && <>
        <ellipse cx="60" cy="82" rx="52" ry="14" fill="#FBF8F1" />
        <ellipse cx="60" cy="72" rx="40" ry="13" fill={svgAccent} opacity="0.85" />
        <ellipse cx="60" cy="62" rx="28" ry="9" fill="#FBF8F1" opacity="0.7" />
        <circle cx="24" cy="76" r="5" fill={svgAccent} opacity="0.5" />
      </>}
      {variant === 1 && <>
        <rect x="28" y="34" width="64" height="44" rx="8" fill={svgAccent} opacity="0.25" />
        <rect x="38" y="46" width="44" height="24" rx="5" fill={svgAccent} opacity="0.55" />
        <circle cx="60" cy="58" r="9" fill="#FBF8F1" opacity="0.8" />
        <rect x="8" y="94" width="104" height="10" rx="5" fill={svgAccent} opacity="0.3" />
      </>}
      {variant === 2 && <>
        <path d="M12 108 Q60 36 108 108 Z" fill={svgAccent} opacity="0.2" />
        <path d="M24 108 Q60 52 96 108 Z" fill={svgAccent} opacity="0.4" />
        <circle cx="60" cy="48" r="10" fill={svgAccent} opacity="0.7" />
        <circle cx="60" cy="48" r="4" fill="#FBF8F1" />
      </>}
      {variant === 3 && <>
        <rect x="18" y="22" width="84" height="72" rx="10" fill={svgAccent} opacity="0.15" />
        <rect x="30" y="34" width="60" height="48" rx="6" fill={svgAccent} opacity="0.3" />
        <line x1="60" y1="34" x2="60" y2="82" stroke={svgAccent} strokeWidth="2" opacity="0.6" />
        <line x1="30" y1="58" x2="90" y2="58" stroke={svgAccent} strokeWidth="2" opacity="0.6" />
        <circle cx="60" cy="58" r="8" fill="#FBF8F1" opacity="0.9" />
      </>}
    </svg>
  );
}

function formatUpdateDate(locale: string): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  return locale === 'vi' ? `Cập nhật ${mm}/${yyyy}` : `Updated ${mm}/${yyyy}`;
}

const CATEGORY_NUM: Record<string, string> = {
  'am-thuc':   '01',
  'dia-diem':  '02',
  'le-hoi':    '03',
  'phong-tuc': '04',
};

export default function CulturalPostList({ locale, posts, provinceSlug, provinceTypeSlug, foodSlugs, placeSlugs, foodImageUrls, placeImageUrls }: Props) {
  const isVi = locale === 'vi';

  if (posts.length === 0) {
    return (
      <div className="text-center text-vn-stone py-12">
        {isVi ? 'Chưa có bài viết văn hóa nào' : 'No cultural posts yet'}
      </div>
    );
  }

  const typeOrder = ['am-thuc', 'dia-diem', 'le-hoi', 'phong-tuc'];
  const grouped = typeOrder
    .map((type) => ({ type, items: posts.filter((p) => p.type === type) }))
    .filter((g) => g.items.length > 0);

  const updateDate = formatUpdateDate(locale);

  return (
    <div>
      {/* Culture section header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{
          fontFamily: 'var(--font-body, system-ui)',
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#6E6A60',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
        }}>
          <span style={{ width: 24, height: 1.5, background: 'currentColor', display: 'inline-block' }} />
          {isVi ? 'Văn hóa' : 'Culture'}
        </span>
        <h2 className="font-heading" style={{ fontSize: 'clamp(1.5rem, 2vw + 0.75rem, 2rem)', fontWeight: 500, color: '#1B1B1A', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
          {isVi ? 'Hương vị, không gian và nhịp sống.' : 'Flavours, spaces and rhythms of life.'}
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#6E6A60', marginTop: '0.5rem', lineHeight: 1.65 }}>
          {isVi
            ? 'Những danh sách được biên tập viên tuyển chọn — gợi ý dành cho lần đầu khám phá.'
            : 'Editor-curated lists — suggestions for first-time visitors.'}
        </p>
      </div>

      {grouped.map(({ type, items }, groupIdx) => {
        const meta = TYPE_META[type] || { vi: type, en: type, eyebrowColor: '#6E6A60', svgBg: '#EDE3CC', svgAccent: '#6E6A60', order: 99 };
        const label = isVi ? meta.vi : meta.en;
        const catNum = CATEGORY_NUM[type] || '0' + (groupIdx + 1);

        return (
          <section key={type} style={{
            paddingTop: groupIdx === 0 ? '1.5rem' : '3rem',
            marginTop: groupIdx === 0 ? 0 : '1.5rem',
            borderTop: groupIdx === 0 ? 'none' : '1px solid #D9D3C5',
          }}>
            {/* Category header */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: meta.eyebrowColor,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '6px',
                }}>
                  <span style={{ width: 24, height: 1.5, background: 'currentColor', display: 'inline-block' }} />
                  {catNum} · {label}
                </span>
                <h3 className="font-heading" style={{ fontSize: 'clamp(1.4rem, 2vw + 0.5rem, 1.9rem)', fontWeight: 500, color: '#1B1B1A', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
                  {isVi
                    ? `Top ${items.length} ${meta.vi.toLowerCase()} không thể bỏ qua.`
                    : `Top ${items.length} ${meta.en.toLowerCase()} not to miss.`}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem', color: '#6E6A60', flexShrink: 0 }}>
                <span>{items.length} {isVi ? 'bài' : 'posts'}</span>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#D9D3C5', display: 'inline-block' }} />
                <span>{updateDate}</span>
              </div>
            </div>

            {/* Post row list */}
            <div style={{ borderTop: '1px solid #D9D3C5' }}>
              {items.map((post, idx) => {
                const title = isVi ? post.title_vi : post.title_en;
                let listItems: ListItem[] = [];
                try {
                  listItems = JSON.parse(isVi ? post.content_vi : post.content_en) as ListItem[];
                } catch { /* plain text */ }

                const kicker = listItems.length > 0 ? listItems[0].item : '';
                const excerpt = listItems.length > 0
                  ? listItems[0].description
                  : (isVi ? post.content_vi : post.content_en).slice(0, 140);

                const rank = idx + 1;

                const foodSlug = type === 'am-thuc' ? foodSlugs?.[post.id] : undefined;
                const placeSlug = type === 'dia-diem' ? placeSlugs?.[post.id] : undefined;
                const thumbUrl = post.image_url
                  ?? (type === 'am-thuc' ? foodImageUrls?.[post.id] : undefined)
                  ?? (type === 'dia-diem' ? placeImageUrls?.[post.id] : undefined);
                const href = provinceSlug && provinceTypeSlug
                  ? foodSlug
                    ? `/${locale}/${provinceTypeSlug}/${provinceSlug}/am-thuc/${foodSlug}`
                    : placeSlug
                      ? `/${locale}/${provinceTypeSlug}/${provinceSlug}/dia-diem/${placeSlug}`
                      : undefined
                  : undefined;

                const CardEl = href ? 'a' : 'div';

                return (
                  <CardEl
                    key={post.id}
                    {...(href ? { href } : {})}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '120px minmax(0,1fr) auto',
                      gap: 'clamp(1rem, 2vw, 1.75rem)',
                      padding: '1.1rem 0.5rem',
                      borderBottom: '1px solid #D9D3C5',
                      alignItems: 'center',
                      textDecoration: 'none',
                      color: 'inherit',
                      position: 'relative',
                      transition: 'background 0.2s ease, padding-left 0.2s ease',
                      borderRadius: 4,
                      cursor: href ? 'pointer' : 'default',
                    }}
                    className={href ? 'post-row-item' : undefined}
                  >
                    {/* Thumbnail with rank badge */}
                    <div style={{ width: 120, height: 120, borderRadius: 8, overflow: 'hidden', position: 'relative', flexShrink: 0, background: '#EDE3CC' }}>
                      {thumbUrl ? (
                        <img
                          src={thumbUrl}
                          alt={post.title_vi}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <ItemIllustration svgBg={meta.svgBg} svgAccent={meta.svgAccent} idx={idx} />
                      )}
                      {/* Rank badge */}
                      <div style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.95)',
                        color: '#1B1B1A',
                        fontFamily: 'var(--font-heading, Georgia, serif)',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        display: 'grid',
                        placeItems: 'center',
                        boxShadow: '0 1px 3px rgba(27,27,26,0.2)',
                        zIndex: 2,
                      }}>
                        {rank}
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{ minWidth: 0 }}>
                      {kicker && (
                        <div style={{
                          fontSize: '0.68rem',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: '#6E6A60',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: 4,
                        }}>
                          {kicker}
                        </div>
                      )}
                      <h4 className="font-heading" style={{
                        fontSize: 'clamp(1.1rem, 1.5vw + 0.4rem, 1.4rem)',
                        fontWeight: 500,
                        lineHeight: 1.25,
                        letterSpacing: '-0.01em',
                        color: '#1B1B1A',
                        marginBottom: 6,
                        transition: 'color 0.15s ease',
                      }}>
                        {title}
                      </h4>
                      {excerpt && (
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#6E6A60',
                          lineHeight: 1.65,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}>
                          {excerpt}
                        </p>
                      )}
                      {/* Tags row */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                        {type === 'am-thuc' && foodSlug && (
                          <span style={{
                            fontSize: '0.68rem',
                            letterSpacing: '0.06em',
                            padding: '3px 9px',
                            borderRadius: 999,
                            background: '#FBF6E8',
                            color: '#8A6C00',
                            fontWeight: 500,
                          }}>
                            {isVi ? 'Có bài chi tiết' : 'Full article'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    {href && (
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: '#F0EDE6',
                        color: '#6E6A60',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        transition: 'background 0.2s ease, color 0.2s ease, transform 0.2s ease',
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M13 5l7 7-7 7"/>
                        </svg>
                      </div>
                    )}
                    {!href && <div />}
                  </CardEl>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
