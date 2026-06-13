import type { FoodItem, FoodItemSource } from '@/lib/queries';

type Ingredient = { name_vi: string; name_en: string; role_vi: string; role_en: string; svgVariant: number };
type Eatery = { name: string; address: string; tags: string[]; price_vnd: string; price_note: string };
type BodyBlock =
  | { type: 'paragraph'; text_vi: string; text_en: string }
  | { type: 'heading'; text_vi: string; text_en: string }
  | { type: 'image'; url: string | null; caption_vi?: string; caption_en?: string; layout?: 'full' | 'wide' | 'inset-right' | 'inset-left' };

function BodyBlocks({ blocks, isVi, galleryImages }: { blocks: BodyBlock[]; isVi: boolean; galleryImages: string[] }) {
  // Pre-assign gallery images sequentially to image blocks that have no explicit url
  let galleryIdx = 0;
  const resolvedSrcs: (string | undefined)[] = blocks.map((block) => {
    if (block.type !== 'image') return undefined;
    if (block.url) return block.url;
    return galleryImages[galleryIdx++];
  });

  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return (
            <h3 key={i} className="font-heading text-base font-semibold text-vn-ink mt-6">
              {isVi ? block.text_vi : block.text_en}
            </h3>
          );
        }
        if (block.type === 'paragraph') {
          return (
            <p key={i} className="text-base text-vn-stone leading-relaxed">
              {isVi ? block.text_vi : block.text_en}
            </p>
          );
        }
        if (block.type === 'image') {
          const src = resolvedSrcs[i];
          if (!src) return null;
          const caption = isVi ? block.caption_vi : block.caption_en;
          return (
            <figure key={i} style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img
                src={src}
                alt={caption ?? ''}
                loading="lazy"
                style={{ width: '70%', height: 420, objectFit: 'cover', borderRadius: 12, display: 'block' }}
              />
              {caption && (
                <figcaption className="text-xs text-vn-stone mt-2 leading-snug">{caption}</figcaption>
              )}
            </figure>
          );
        }
        return null;
      })}
      <div style={{ clear: 'both' }} />
    </div>
  );
}

type Props = {
  locale: string;
  food: FoodItem;
  sources: FoodItemSource[];
  prevFood: { slug: string; title_vi: string; title_en: string } | null;
  nextFood: { slug: string; title_vi: string; title_en: string } | null;
  provinceName: string;
  provinceSlug: string;
  provinceTypeSlug: string;
};

function IngredientIcon({ svgVariant, svgBg, svgAccent }: { svgVariant: number; svgBg: string; svgAccent: string }) {
  const v = svgVariant % 4;
  return (
    <svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" style={{ width: 44, height: 44, display: 'block' }} aria-hidden="true">
      <rect width="44" height="44" rx="8" fill={svgBg} />
      {v === 0 && <g stroke={svgAccent} strokeWidth="2" fill="none">
        <path d="M6 18 Q22 14 38 18"/><path d="M6 22 Q22 18 38 22"/><path d="M6 26 Q22 22 38 26"/><path d="M6 30 Q22 26 38 30"/>
      </g>}
      {v === 1 && <>
        <path d="M10 22 Q18 8 30 14 Q36 22 28 28 Q14 32 10 22 Z" fill="#F4A6BD" stroke={svgAccent} strokeWidth="0.8"/>
        <circle cx="32" cy="18" r="1" fill={svgAccent}/>
        <line x1="36" y1="14" x2="40" y2="10" stroke={svgAccent} strokeWidth="0.8"/>
      </>}
      {v === 2 && <>
        <ellipse cx="22" cy="22" rx="14" ry="9" fill={svgAccent} opacity="0.3"/>
        <ellipse cx="22" cy="22" rx="11" ry="6" fill={svgAccent} opacity="0.6"/>
        <ellipse cx="22" cy="21" rx="5" ry="3" fill="#FBF8F1" opacity="0.8"/>
      </>}
      {v === 3 && <>
        <ellipse cx="14" cy="20" rx="6" ry="5" fill="#FBF8F1" stroke="#C9C5BD" strokeWidth="0.6"/>
        <ellipse cx="14" cy="20" rx="3" ry="2.5" fill={svgAccent} opacity="0.7"/>
        <ellipse cx="28" cy="26" rx="6" ry="5" fill="#FBF8F1" stroke="#C9C5BD" strokeWidth="0.6"/>
        <ellipse cx="28" cy="26" rx="3" ry="2.5" fill={svgAccent} opacity="0.7"/>
      </>}
    </svg>
  );
}

function FoodHeroIllustration() {
  return (
    <svg viewBox="0 0 400 360" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: '100%', maxWidth: 380 }}>
      <defs>
        <radialGradient id="bowlInner" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#E8B45A"/>
          <stop offset="100%" stopColor="#B5810A"/>
        </radialGradient>
        <linearGradient id="bowlSide" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#C8102E"/>
          <stop offset="100%" stopColor="#650616"/>
        </linearGradient>
      </defs>
      <g opacity="0.6">
        <path d="M120 70 Q140 42 120 22 Q100 42 120 70 Z" fill="#FBF8F1"/>
        <path d="M200 50 Q220 22 200 2 Q180 22 200 50 Z" fill="#FBF8F1"/>
        <path d="M280 70 Q300 42 280 22 Q260 42 280 70 Z" fill="#FBF8F1"/>
      </g>
      <path d="M40 185 Q200 360 360 185 Z" fill="url(#bowlSide)"/>
      <ellipse cx="200" cy="185" rx="160" ry="30" fill="#8E0A1F"/>
      <ellipse cx="200" cy="185" rx="148" ry="24" fill="url(#bowlInner)"/>
      <g stroke="#FBF6E8" strokeWidth="2.5" fill="none" opacity="0.9">
        <path d="M80 181 Q140 173 200 185 Q260 197 320 177"/>
        <path d="M84 185 Q150 181 210 189 Q270 197 318 183"/>
        <path d="M90 191 Q160 187 220 195 Q280 203 314 189"/>
      </g>
      <g transform="translate(155 170)">
        <path d="M0 0 Q14 -22 36 -8 Q44 6 32 18 Q14 22 0 12 Z" fill="#F4A6BD" stroke="#C8102E" strokeWidth="1"/>
        <circle cx="34" cy="-2" r="1.5" fill="#3D1A1F"/>
      </g>
      <ellipse cx="240" cy="181" rx="12" ry="10" fill="#FBF8F1"/>
      <ellipse cx="240" cy="180" rx="6" ry="5" fill="#D4A24C"/>
      <ellipse cx="262" cy="191" rx="10" ry="8" fill="#FBF8F1"/>
      <ellipse cx="262" cy="190" rx="5" ry="4" fill="#D4A24C"/>
      <ellipse cx="120" cy="191" rx="18" ry="6" fill="#A60D26"/>
      <ellipse cx="120" cy="191" rx="14" ry="4" fill="#C8102E" opacity="0.85"/>
      <g stroke="#2E7D5A" strokeWidth="2" fill="none" strokeLinecap="round">
        <line x1="100" y1="179" x2="108" y2="171"/>
        <line x1="156" y1="185" x2="166" y2="179"/>
        <line x1="296" y1="175" x2="304" y2="169"/>
      </g>
      <g fill="#D4A24C">
        <circle cx="140" cy="185" r="1.5"/><circle cx="180" cy="191" r="1.2"/>
        <circle cx="226" cy="183" r="1.5"/><circle cx="304" cy="179" r="1.3"/>
      </g>
      <path d="M280 115 L350 65" stroke="#FBF6E8" strokeWidth="6" strokeLinecap="round"/>
      <ellipse cx="296" cy="131" rx="14" ry="9" fill="#FBF6E8" opacity="0.9"/>
    </svg>
  );
}

export default function FoodDetail({ locale, food, prevFood, nextFood, provinceName, provinceSlug, provinceTypeSlug }: Props) {
  const isVi = locale === 'vi';

  const title = isVi ? food.title_vi : food.title_en;
  const lede = isVi ? food.lede_vi : food.lede_en;
  const tags: string[] = (() => { try { return JSON.parse(food.tags_json); } catch { return []; } })();
  const ingredients: Ingredient[] = (() => { try { return JSON.parse(food.ingredients_json); } catch { return []; } })();
  const eateries: Eatery[] = (() => { try { return JSON.parse(food.eateries_json); } catch { return []; } })();

  const bodyBlocks: BodyBlock[] | null = (() => {
    try { return food.body_blocks_json ? JSON.parse(food.body_blocks_json) as BodyBlock[] : null; } catch { return null; }
  })();
  const gallery: string[] = (() => { try { return JSON.parse(food.gallery_json); } catch { return []; } })();
  const storyParagraphs = (isVi ? food.story_vi : food.story_en).split('\n\n').filter(Boolean);
  const howSections = (isVi ? food.how_to_eat_vi : food.how_to_eat_en).split('\n\n').filter(Boolean);

  const INGREDIENT_COLORS: Record<number, { bg: string; accent: string }> = {
    0: { bg: '#FBF6E8', accent: '#D2B061' },
    1: { bg: '#FCE7EE', accent: '#C8102E' },
    2: { bg: '#F4D8B5', accent: '#A60D26' },
    3: { bg: '#FBF6E8', accent: '#D4A24C' },
  };

  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF' }}>

      {/* Post hero */}
      <section style={{ background: 'linear-gradient(135deg, #FDF0E8 0%, #FBF8F1 60%)', borderBottom: '1px solid #D9D3C5' }}>
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest block mb-4" style={{ color: '#2E7D5A' }}>
                {isVi ? 'Ẩm thực' : 'Cuisine'} · {provinceName}
              </span>
              <h1 className="font-heading font-bold leading-tight mb-4" style={{ fontSize: 'clamp(32px, 4vw, 52px)', color: '#1B1B1A' }}>
                {title.includes(' ') ? (
                  <>
                    {title.split(' ').slice(0, -2).join(' ')}{' '}
                    <em style={{ fontStyle: 'italic', color: '#8E0A1F' }}>
                      {title.split(' ').slice(-2).join(' ')}
                    </em>
                    {'.'}
                  </>
                ) : <>{title}.</>}
              </h1>
              <p className="text-base leading-relaxed max-w-xl" style={{ color: '#6E6A60' }}>{lede}</p>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium px-3 py-1.5 rounded-full border"
                      style={{ borderColor: '#D9D3C5', color: '#6E6A60', background: '#FFFFFF' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-shrink-0 hidden md:block" style={{ width: 320 }}>
              {food.image_url ? (
                <img
                  src={food.image_url}
                  alt={title}
                  style={{ width: 320, height: 260, objectFit: 'cover', borderRadius: 16, display: 'block' }}
                />
              ) : (
                <FoodHeroIllustration />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto w-full px-4 py-3" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-xs text-vn-stone flex-wrap">
          <li><a href={`/${locale}`} className="hover:text-vn-ink transition-colors">{isVi ? 'Trang chủ' : 'Home'}</a></li>
          <li aria-hidden="true" className="font-heading italic text-vn-mist">›</li>
          <li><a href={`/${locale}/${provinceTypeSlug}/${provinceSlug}`} className="hover:text-vn-ink transition-colors">{provinceName}</a></li>
          <li aria-hidden="true" className="font-heading italic text-vn-mist">›</li>
          <li><a href={`/${locale}/${provinceTypeSlug}/${provinceSlug}#culture`} className="hover:text-vn-ink transition-colors">{isVi ? 'Văn hóa' : 'Culture'}</a></li>
          <li aria-hidden="true" className="font-heading italic text-vn-mist">›</li>
          <li><a href={`/${locale}/${provinceTypeSlug}/${provinceSlug}#culture`} className="hover:text-vn-ink transition-colors">{isVi ? 'Ẩm thực' : 'Cuisine'}</a></li>
          <li aria-hidden="true" className="font-heading italic text-vn-mist">›</li>
          <li aria-current="page" className="text-vn-ink font-medium">{title}</li>
        </ol>
      </nav>

      {/* Main grid — 3-col: ad | content | ad */}
      <div className="max-w-[1500px] mx-auto px-4 py-8 flex gap-6 items-start">

        {/* Left ad column */}
        <aside className="hidden xl:flex flex-col gap-4 flex-shrink-0 w-[160px] sticky top-[80px]">
          <div className="w-[160px] h-[600px] rounded-xl flex items-center justify-center text-[10px] text-vn-mist" style={{ background: '#F0EDE7', border: '1px dashed #D9D3C5' }}>Ad</div>
        </aside>

        {/* ── Main article ── */}
        <div className="flex-1 min-w-0 rounded-2xl px-8 py-8" style={{ background: '#FFFFFF', border: '1px solid #EDE3CC' }}>
          <article className="space-y-0">

            {/* Info bar */}
            <div
              className="grid grid-cols-2 md:grid-cols-4 rounded-2xl border mb-12"
              style={{ background: '#FFFFFF', borderColor: '#D9D3C5', overflow: 'hidden' }}
            >
              {[
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                  label: isVi ? 'Gốc tích' : 'Origin',
                  value: isVi ? food.info_origin_vi : food.info_origin_en,
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                  label: isVi ? 'Thời điểm tốt' : 'Best time',
                  value: isVi ? food.info_best_time_vi : food.info_best_time_en,
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
                  label: isVi ? 'Mức giá' : 'Price',
                  value: food.info_price_range,
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
                  label: isVi ? 'Chay' : 'Vegetarian',
                  value: isVi ? food.info_vegetarian_vi : food.info_vegetarian_en,
                },
              ].map((cell, i) => (
                <div key={i} className="flex items-start gap-3 p-4 border-r last:border-r-0 border-b md:border-b-0" style={{ borderColor: '#D9D3C5' }}>
                  <div className="flex-shrink-0 mt-0.5" style={{ color: '#C9A24C' }}>{cell.icon}</div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-vn-stone mb-1">{cell.label}</div>
                    <div className="text-sm font-medium text-vn-ink">{cell.value || '—'}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Section 01 — Story */}
            <section className="mb-12" id="story">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-heading text-3xl font-semibold" style={{ color: '#E8D48A' }}>01</span>
                <h2 className="font-heading text-xl font-bold text-vn-ink">
                  {isVi ? 'Câu chuyện & lịch sử.' : 'Story & history.'}
                </h2>
              </div>
              {bodyBlocks ? (
                <BodyBlocks blocks={bodyBlocks} isVi={isVi} galleryImages={gallery} />
              ) : (
                <div className="space-y-4">
                  {storyParagraphs.map((para, i) => (
                    <p key={i} className="text-base text-vn-stone leading-relaxed">{para}</p>
                  ))}
                </div>
              )}
              {(food.story_blockquote_vi || food.story_blockquote_en) && (
                <blockquote
                  className="my-8 pl-5 border-l-4"
                  style={{ borderColor: '#C9A24C' }}
                >
                  <p className="font-heading text-lg font-medium text-vn-ink leading-relaxed italic">
                    {isVi ? food.story_blockquote_vi : food.story_blockquote_en}
                  </p>
                  {food.story_blockquote_cite && (
                    <cite className="block text-xs text-vn-stone mt-3 not-italic">{food.story_blockquote_cite}</cite>
                  )}
                </blockquote>
              )}
            </section>

            {/* Section 02 — Ingredients */}
            {ingredients.length > 0 && (
              <section className="mb-12" id="ingredients">
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-heading text-3xl font-semibold" style={{ color: '#E8D48A' }}>02</span>
                  <h2 className="font-heading text-xl font-bold text-vn-ink">
                    {isVi ? 'Nguyên liệu — những gì tạo nên hương vị.' : 'Ingredients — what makes the flavour.'}
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {ingredients.map((ing, i) => {
                    const colors = INGREDIENT_COLORS[ing.svgVariant % 4];
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl border p-3"
                        style={{ background: '#FFFFFF', borderColor: '#D9D3C5' }}
                      >
                        <div className="flex-shrink-0 rounded-lg overflow-hidden">
                          <IngredientIcon svgVariant={ing.svgVariant} svgBg={colors.bg} svgAccent={colors.accent} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-vn-ink truncate">{isVi ? ing.name_vi : ing.name_en}</div>
                          <div className="text-xs text-vn-stone mt-0.5">{isVi ? ing.role_vi : ing.role_en}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tip card */}
                {(food.tip_title_vi || food.tip_title_en) && (
                  <div
                    className="flex gap-4 rounded-2xl p-5 mt-6"
                    style={{ background: '#EEF6F0', border: '1px solid #A3D4B8' }}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E7D5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-vn-ink mb-1.5">{isVi ? food.tip_title_vi : food.tip_title_en}</div>
                      <p className="text-sm text-vn-stone leading-relaxed">{isVi ? food.tip_body_vi : food.tip_body_en}</p>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Section 03 — How to eat */}
            <section className="mb-12" id="how-to-eat">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-heading text-3xl font-semibold" style={{ color: '#E8D48A' }}>03</span>
                <h2 className="font-heading text-xl font-bold text-vn-ink">
                  {isVi ? 'Cách thưởng thức đúng điệu.' : 'How to enjoy it properly.'}
                </h2>
              </div>
              <div className="space-y-4">
                {howSections.map((block, i) => {
                  if (block.startsWith('## ')) {
                    return <h3 key={i} className="font-heading text-base font-semibold text-vn-ink mt-6 mb-2">{block.slice(3)}</h3>;
                  }
                  const rendered = block.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
                  return <p key={i} className="text-base text-vn-stone leading-relaxed" dangerouslySetInnerHTML={{ __html: rendered }} />;
                })}
              </div>
            </section>

            {/* Section 04 — Eateries */}
            {eateries.length > 0 && (
              <section className="mb-12" id="eateries">
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-heading text-3xl font-semibold" style={{ color: '#E8D48A' }}>04</span>
                  <h2 className="font-heading text-xl font-bold text-vn-ink">
                    {isVi ? 'Quán biên tập viên gợi ý.' : 'Editor-recommended eateries.'}
                  </h2>
                </div>
                <div className="space-y-3">
                  {eateries.map((eatery, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 rounded-2xl border p-4"
                      style={{ background: '#FFFFFF', borderColor: '#D9D3C5' }}
                    >
                      <div className="flex-shrink-0 mt-0.5" style={{ color: '#C8102E' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-vn-ink">{eatery.name}</div>
                        <div className="text-xs text-vn-stone mt-0.5">{eatery.address}</div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {eatery.tags.map((tag, j) => (
                            <span
                              key={j}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                              style={{ background: '#FBF6E8', color: '#8A6C00', border: '1px solid #E8D48A' }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="font-heading text-base font-semibold" style={{ color: '#8E0A1F' }}>{eatery.price_vnd}</div>
                        <div className="text-[10px] text-vn-stone mt-0.5">{eatery.price_note}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-vn-stone mt-4 leading-relaxed">
                  {isVi
                    ? 'ⓘ Địa chỉ và giá có thể thay đổi. Vui lòng kiểm tra lại trước khi đến.'
                    : 'ⓘ Addresses and prices may change. Please verify before visiting.'}
                </p>
              </section>
            )}

            {/* Prev / Next nav */}
            {(prevFood || nextFood) && (
              <nav
                className="grid grid-cols-2 gap-4 mt-12 pt-8"
                style={{ borderTop: '1px solid #D9D3C5' }}
                aria-label={isVi ? 'Bài viết liên quan' : 'Related articles'}
              >
                {prevFood ? (
                  <a
                    href={`/${locale}/${provinceTypeSlug}/${provinceSlug}/am-thuc/${prevFood.slug}`}
                    className="block rounded-xl border p-4 transition-all hover:border-vn-gold hover:shadow-sm"
                    style={{ borderColor: '#D9D3C5', background: '#FFFFFF', textDecoration: 'none' }}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-vn-stone mb-1.5">← {isVi ? 'Trước đó' : 'Previous'}</div>
                    <div className="font-heading text-base font-medium text-vn-ink leading-snug">
                      {isVi ? prevFood.title_vi : prevFood.title_en}
                    </div>
                  </a>
                ) : <div />}
                {nextFood ? (
                  <a
                    href={`/${locale}/${provinceTypeSlug}/${provinceSlug}/am-thuc/${nextFood.slug}`}
                    className="block rounded-xl border p-4 text-right transition-all hover:border-vn-gold hover:shadow-sm"
                    style={{ borderColor: '#D9D3C5', background: '#FFFFFF', textDecoration: 'none' }}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-vn-stone mb-1.5">{isVi ? 'Tiếp theo' : 'Next'} →</div>
                    <div className="font-heading text-base font-medium text-vn-ink leading-snug">
                      {isVi ? nextFood.title_vi : nextFood.title_en}
                    </div>
                  </a>
                ) : <div />}
              </nav>
            )}

          </article>
        </div>

        {/* Right ad column */}
        <aside className="hidden xl:flex flex-col gap-4 flex-shrink-0 w-[160px] sticky top-[80px]">
          <div className="w-[160px] h-[600px] rounded-xl flex items-center justify-center text-[10px] text-vn-mist" style={{ background: '#F0EDE7', border: '1px dashed #D9D3C5' }}>Ad</div>
        </aside>

      </div>
    </div>
  );
}
