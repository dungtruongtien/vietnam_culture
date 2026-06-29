import type { FoodItem, FoodItemSource } from '@/lib/queries';

type Ingredient = { name_vi: string; name_en: string; role_vi: string; role_en: string; svgVariant: number };
type Eatery = { name: string; address: string; tags: string[]; price_vnd: string; price_note: string };
type BodyBlock =
  | { type: 'paragraph'; text_vi: string; text_en: string }
  | { type: 'heading'; text_vi: string; text_en: string }
  | { type: 'image'; url: string | null; caption_vi?: string; caption_en?: string; layout?: 'full' | 'wide' | 'inset-right' | 'inset-left' };
function BodyBlocks({ blocks, isVi, galleryImages }: { blocks: BodyBlock[]; isVi: boolean; galleryImages: string[] }) {
  let galleryIdx = 0;
  const resolvedSrcs: (string | undefined)[] = blocks.map((block) => {
    if (block.type !== 'image') return undefined;
    if (block.url) return block.url;
    return galleryImages[galleryIdx++];
  });

  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return (
            <h2 key={i} className="font-heading" style={{ fontSize: 26, fontWeight: 600, color: '#8E0A1F', margin: '40px 0 14px', lineHeight: 1.2 }}>
              {isVi ? block.text_vi : block.text_en}
            </h2>
          );
        }
        if (block.type === 'paragraph') {
          return (
            <p key={i} style={{ fontSize: 15, lineHeight: 1.75, color: '#3A3833', marginBottom: 18 }}>
              {isVi ? block.text_vi : block.text_en}
            </p>
          );
        }
        if (block.type === 'image') {
          const src = resolvedSrcs[i];
          if (!src) return null;
          const caption = isVi ? block.caption_vi : block.caption_en;
          return (
            <div key={i}>
              <div style={{ borderRadius: 12, overflow: 'hidden', margin: '28px 0 6px' }}>
                <img src={src} alt={caption ?? ''} loading="lazy" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
              </div>
              {caption && <p style={{ textAlign: 'center', fontSize: 11, color: '#6E6A60', marginBottom: 28 }}>{caption}</p>}
            </div>
          );
        }
        return null;
      })}
    </>
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
    <svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" style={{ width: 36, height: 36, display: 'block', flexShrink: 0, borderRadius: 6 }} aria-hidden="true">
      <rect width="36" height="36" rx="6" fill={svgBg} />
      {v === 0 && <g stroke={svgAccent} strokeWidth="1.8" fill="none">
        <path d="M5 15 Q18 11 31 15"/><path d="M5 18 Q18 15 31 18"/><path d="M5 21 Q18 18 31 21"/><path d="M5 24 Q18 21 31 24"/>
      </g>}
      {v === 1 && <>
        <path d="M8 18 Q14 6 24 11 Q30 18 22 23 Q11 26 8 18 Z" fill="#F4A6BD" stroke={svgAccent} strokeWidth="0.7"/>
        <circle cx="26" cy="14" r="1" fill={svgAccent}/>
      </>}
      {v === 2 && <>
        <ellipse cx="18" cy="18" rx="11" ry="7" fill={svgAccent} opacity="0.3"/>
        <ellipse cx="18" cy="18" rx="8" ry="5" fill={svgAccent} opacity="0.6"/>
        <ellipse cx="18" cy="17" rx="4" ry="2.5" fill="#FBF8F1" opacity="0.8"/>
      </>}
      {v === 3 && <>
        <ellipse cx="11" cy="16" rx="5" ry="4" fill="#FBF8F1" stroke="#C9C5BD" strokeWidth="0.5"/>
        <ellipse cx="11" cy="16" rx="2.5" ry="2" fill={svgAccent} opacity="0.7"/>
        <ellipse cx="23" cy="21" rx="5" ry="4" fill="#FBF8F1" stroke="#C9C5BD" strokeWidth="0.5"/>
        <ellipse cx="23" cy="21" rx="2.5" ry="2" fill={svgAccent} opacity="0.7"/>
      </>}
    </svg>
  );
}

const INGREDIENT_COLORS: Record<number, { bg: string; accent: string }> = {
  0: { bg: '#FBF6E8', accent: '#D2B061' },
  1: { bg: '#FCE7EE', accent: '#C8102E' },
  2: { bg: '#F4D8B5', accent: '#A60D26' },
  3: { bg: '#FBF6E8', accent: '#D4A24C' },
};

export default function FoodDetail({ locale, food, sources, prevFood, nextFood, provinceName, provinceSlug, provinceTypeSlug }: Props) {
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

  return (
    <div>
      {/* Full-bleed photo hero */}
      <section style={{ position: 'relative', minHeight: 480, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' }}>
        {food.image_url ? (
          <img src={food.image_url} alt={title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,#5C2E1A,#3D1A0F,#2A1010)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(20,6,8,0.90) 0%,rgba(20,6,8,0.35) 55%,transparent 100%)' }} />
        <div style={{ position: 'relative', padding: '0 0 48px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: 'rgba(200,16,46,0.85)', backdropFilter: 'blur(4px)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff', width: 'fit-content' }}>
              {isVi ? 'Ẩm thực' : 'Cuisine'} · {provinceName}
            </div>
            <h1 className="font-heading" style={{ fontSize: 'clamp(36px,5vw,52px)', fontWeight: 600, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.01em', maxWidth: 780 }}>
              {title}
            </h1>
            <p className="font-heading" style={{ fontStyle: 'italic', fontSize: 20, color: '#DEC07F', lineHeight: 1.5, maxWidth: '52ch' }}>{lede}</p>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <nav style={{ padding: '12px 0', fontSize: 12, color: '#6E6A60', borderBottom: '1px solid #E9E6DE', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <a href={`/${locale}`} style={{ color: '#6E6A60', textDecoration: 'none' }}>{isVi ? 'Trang chủ' : 'Home'}</a>
          <span className="font-heading" style={{ fontStyle: 'italic', color: '#D9D3C5' }}>›</span>
          <a href={`/${locale}/${provinceTypeSlug}/${provinceSlug}`} style={{ color: '#6E6A60', textDecoration: 'none' }}>{provinceName}</a>
          <span className="font-heading" style={{ fontStyle: 'italic', color: '#D9D3C5' }}>›</span>
          <a href={`/${locale}/${provinceTypeSlug}/${provinceSlug}#culture`} style={{ color: '#6E6A60', textDecoration: 'none' }}>{isVi ? 'Ẩm thực' : 'Cuisine'}</a>
          <span className="font-heading" style={{ fontStyle: 'italic', color: '#D9D3C5' }}>›</span>
          <span style={{ fontWeight: 600, color: '#3A3833' }}>{title}</span>
        </div>
      </nav>

      {/* Info Bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E9E6DE' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'stretch', flexWrap: 'wrap' }}>
          {[
            { label: isVi ? 'Xuất xứ' : 'Origin', value: isVi ? food.info_origin_vi : food.info_origin_en },
            { label: isVi ? 'Giá trung bình' : 'Price', value: food.info_price_range },
            { label: isVi ? 'Thời điểm ngon nhất' : 'Best time', value: isVi ? food.info_best_time_vi : food.info_best_time_en },
            { label: isVi ? 'Chay không?' : 'Vegetarian?', value: isVi ? food.info_vegetarian_vi : food.info_vegetarian_en },
          ].map((chip, i, arr) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '16px 24px', borderRight: i < arr.length - 1 ? '1px solid #E9E6DE' : 'none', flex: '1 1 140px' }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6E6A60' }}>{chip.label}</span>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: '#3A3833' }}>{chip.value || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Page body — article + sidebar */}
      <div style={{ background: '#fff', borderTop: '1px solid #E9E6DE' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 72px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 56, alignItems: 'start' }}>

          {/* Article */}
          <article>
            {/* Story */}
            {bodyBlocks ? (
              <BodyBlocks blocks={bodyBlocks} isVi={isVi} galleryImages={gallery} />
            ) : (
              storyParagraphs.map((para, i) => (
                <p key={i} style={{ fontSize: 15, lineHeight: 1.75, color: '#3A3833', marginBottom: 18 }}>{para}</p>
              ))
            )}

            {/* Blockquote */}
            {(food.story_blockquote_vi || food.story_blockquote_en) && (
              <blockquote style={{ borderLeft: '3px solid #C9A24C', paddingLeft: 20, margin: '32px 0' }}>
                <p className="font-heading" style={{ fontStyle: 'italic', fontSize: 22, color: '#3A3833', lineHeight: 1.5, marginBottom: 10 }}>
                  {isVi ? food.story_blockquote_vi : food.story_blockquote_en}
                </p>
                {food.story_blockquote_cite && (
                  <cite style={{ fontSize: 12, color: '#6E6A60', fontStyle: 'normal' }}>{food.story_blockquote_cite}</cite>
                )}
              </blockquote>
            )}

            {/* How to eat */}
            {howSections.length > 0 && (
              <div style={{ background: '#FBF8F1', borderRadius: 20, padding: '36px 32px', marginTop: 48, border: '1px solid #E9E6DE' }}>
                <h2 className="font-heading" style={{ fontSize: 26, fontWeight: 600, color: '#8E0A1F', marginBottom: 20 }}>
                  {isVi ? 'Cách thưởng thức đúng điệu' : 'How to enjoy it properly'}
                </h2>
                {howSections.map((block, i) => {
                  if (block.startsWith('## ')) {
                    return (
                      <div key={i} style={{ marginBottom: 20 }}>
                        <h3 className="font-heading" style={{ fontSize: 18, fontWeight: 600, color: '#3A3833', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                          {block.slice(3)}
                        </h3>
                      </div>
                    );
                  }
                  const rendered = block.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
                  return <p key={i} style={{ fontSize: 14, color: '#6E6A60', lineHeight: 1.7, marginBottom: 14 }} dangerouslySetInnerHTML={{ __html: rendered }} />;
                })}
              </div>
            )}

          </article>

          {/* Sidebar */}
          <aside style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Quick facts */}
            <div style={{ background: '#fff', border: '1px solid #E9E6DE', borderRadius: 12, padding: 20, boxShadow: '0 2px 12px rgba(58,56,51,0.10)' }}>
              <div className="font-heading" style={{ fontSize: 17, fontWeight: 600, color: '#3A3833', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #E9E6DE' }}>
                {isVi ? 'Thông tin nhanh' : 'Quick info'}
              </div>
              <div>
                {[
                  { label: isVi ? 'Xuất xứ' : 'Origin', value: isVi ? food.info_origin_vi : food.info_origin_en },
                  { label: isVi ? 'Giá' : 'Price', value: food.info_price_range },
                  { label: isVi ? 'Thời điểm' : 'Best time', value: isVi ? food.info_best_time_vi : food.info_best_time_en },
                  { label: isVi ? 'Phiên bản chay' : 'Vegetarian', value: isVi ? food.info_vegetarian_vi : food.info_vegetarian_en },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, fontSize: 13, padding: '10px 0', borderBottom: '1px solid #E9E6DE' }}>
                    <span style={{ color: '#6E6A60', flexShrink: 0 }}>{row.label}</span>
                    <span style={{ fontWeight: 600, color: '#3A3833', textAlign: 'right' }}>{row.value || '—'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingredients */}
            {ingredients.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #E9E6DE', borderRadius: 12, padding: 20, boxShadow: '0 2px 12px rgba(58,56,51,0.10)' }}>
                <div className="font-heading" style={{ fontSize: 17, fontWeight: 600, color: '#3A3833', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #E9E6DE' }}>
                  {isVi ? 'Nguyên liệu chính' : 'Key ingredients'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {ingredients.slice(0, 8).map((ing, i) => {
                    const colors = INGREDIENT_COLORS[ing.svgVariant % 4];
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <IngredientIcon svgVariant={ing.svgVariant} svgBg={colors.bg} svgAccent={colors.accent} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#3A3833', lineHeight: 1.2 }}>{isVi ? ing.name_vi : ing.name_en}</div>
                          <div style={{ fontSize: 11, color: '#6E6A60' }}>{isVi ? ing.role_vi : ing.role_en}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Eateries */}
            {eateries.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #E9E6DE', borderRadius: 12, padding: 20, boxShadow: '0 2px 12px rgba(58,56,51,0.10)' }}>
                <div className="font-heading" style={{ fontSize: 17, fontWeight: 600, color: '#3A3833', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #E9E6DE' }}>
                  {isVi ? 'Quán ngon nên thử' : 'Recommended eateries'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {eateries.map((eatery, i) => (
                    <div key={i} style={{ paddingBottom: 14, borderBottom: i < eateries.length - 1 ? '1px solid #E9E6DE' : 'none' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#3A3833', marginBottom: 2 }}>{eatery.name}</div>
                      <div style={{ fontSize: 11, color: '#6E6A60', marginBottom: 6 }}>{eatery.address}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: '#F5EDD8', color: '#7A5500' }}>{eatery.price_vnd}</span>
                        {eatery.tags.map((tag, j) => (
                          <span key={j} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: '#E9E6DE', color: '#6E6A60' }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sources */}
            {sources.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #E9E6DE', borderRadius: 12, padding: 20, boxShadow: '0 2px 12px rgba(58,56,51,0.10)' }}>
                <div className="font-heading" style={{ fontSize: 17, fontWeight: 600, color: '#3A3833', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #E9E6DE' }}>
                  {isVi ? 'Nguồn tham khảo' : 'Sources'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {sources.map((s, i) => (
                    <div key={s.id} style={{ fontSize: 12, borderBottom: i < sources.length - 1 ? '1px solid #E9E6DE' : 'none', paddingBottom: i < sources.length - 1 ? 10 : 0 }}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: '#C8102E', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2 }}>{s.title}</a>
                      <div style={{ color: '#6E6A60', fontSize: 11, marginTop: 2 }}>{s.publisher} · {s.accessed_date}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </aside>
        </div>
      </div>

      {/* Prev / Next nav */}
      {(prevFood || nextFood) && (
        <nav style={{ borderTop: '1px solid #E9E6DE', background: '#fff' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            {prevFood ? (
              <a href={`/${locale}/${provinceTypeSlug}/${provinceSlug}/am-thuc/${prevFood.slug}`} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 4, textDecoration: 'none', borderRight: '1px solid #E9E6DE', transition: 'background 220ms' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#E9E6DE')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6E6A60' }}>← {isVi ? 'Món trước' : 'Previous'}</span>
                <span className="font-heading" style={{ fontSize: 18, fontWeight: 600, color: '#3A3833', lineHeight: 1.2 }}>{isVi ? prevFood.title_vi : prevFood.title_en}</span>
              </a>
            ) : <div />}
            {nextFood ? (
              <a href={`/${locale}/${provinceTypeSlug}/${provinceSlug}/am-thuc/${nextFood.slug}`} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 4, textDecoration: 'none', textAlign: 'right', transition: 'background 220ms' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#E9E6DE')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6E6A60' }}>{isVi ? 'Món tiếp theo' : 'Next'} →</span>
                <span className="font-heading" style={{ fontSize: 18, fontWeight: 600, color: '#3A3833', lineHeight: 1.2 }}>{isVi ? nextFood.title_vi : nextFood.title_en}</span>
              </a>
            ) : <div />}
          </div>
        </nav>
      )}
    </div>
  );
}
