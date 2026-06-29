import type { PlaceItem, PlaceItemSource } from '@/lib/queries';

type Highlight = { title_vi: string; title_en: string; body_vi: string; body_en: string };
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return (
            <h3 key={i} className="font-heading" style={{ fontSize: 20, fontWeight: 600, color: '#3A3833', marginTop: 8 }}>
              {isVi ? block.text_vi : block.text_en}
            </h3>
          );
        }
        if (block.type === 'paragraph') {
          return (
            <p key={i} style={{ fontSize: 16, color: '#6E6A60', lineHeight: 1.75 }}>
              {isVi ? block.text_vi : block.text_en}
            </p>
          );
        }
        if (block.type === 'image') {
          const src = resolvedSrcs[i];
          if (!src) return null;
          const caption = isVi ? block.caption_vi : block.caption_en;
          return (
            <figure key={i} style={{ margin: '8px 0' }}>
              <img
                src={src}
                alt={caption ?? ''}
                loading="lazy"
                style={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 12, display: 'block' }}
              />
              {caption && (
                <figcaption style={{ fontSize: 11, color: '#6E6A60', marginTop: 8, textAlign: 'center' }}>{caption}</figcaption>
              )}
            </figure>
          );
        }
        return null;
      })}
    </div>
  );
}

type Props = {
  locale: string;
  place: PlaceItem;
  sources: PlaceItemSource[];
  prevPlace: { slug: string; title_vi: string; title_en: string } | null;
  nextPlace: { slug: string; title_vi: string; title_en: string } | null;
  provinceName: string;
  provinceSlug: string;
  provinceTypeSlug: string;
};

const HIGHLIGHT_COLORS = ['#FCE7EE', '#EEF6F0', '#FBF6E8', '#F0EEF8'];
const HIGHLIGHT_ACCENTS = ['#C8102E', '#2E7D5A', '#C9A24C', '#6E5C9E'];

export default function PlaceDetail({
  locale, place, sources, prevPlace, nextPlace,
  provinceName, provinceSlug, provinceTypeSlug,
}: Props) {
  const isVi = locale === 'vi';

  const title = isVi ? place.title_vi : place.title_en;
  const lede = isVi ? place.lede_vi : place.lede_en;
  const tags: string[] = (() => { try { return JSON.parse(place.tags_json); } catch { return []; } })();
  const highlights: Highlight[] = (() => { try { return JSON.parse(place.highlights_json); } catch { return []; } })();
  const bodyBlocks: BodyBlock[] | null = (() => {
    try { return place.body_blocks_json ? JSON.parse(place.body_blocks_json) as BodyBlock[] : null; } catch { return null; }
  })();
  const gallery: string[] = (() => { try { return JSON.parse(place.gallery_json); } catch { return []; } })();
  const storyParagraphs = (isVi ? place.story_vi : place.story_en).split('\n\n').filter(Boolean);
  const visitSections = (isVi ? place.how_to_visit_vi : place.how_to_visit_en).split('\n\n').filter(Boolean);

  return (
    <div style={{ background: '#FBF8F1' }}>

      {/* Full-bleed photo hero */}
      <div style={{ position: 'relative', height: 480, overflow: 'hidden' }}>
        {place.image_url ? (
          <img
            src={place.image_url}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1F5B40,#2E7D5A)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,6,8,0.92) 0%, rgba(20,6,8,0.45) 55%, transparent 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 24px 40px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#2E7D5A', color: '#FBF8F1', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 12px', borderRadius: 20, marginBottom: 16 }}>
              {isVi ? 'Địa điểm' : 'Places'} · {provinceName}
            </span>
            <h1 className="font-heading" style={{ fontSize: 'clamp(32px,4.5vw,56px)', fontWeight: 600, color: '#FFFFFF', lineHeight: 1.15, marginBottom: 16, maxWidth: 780 }}>
              {title}
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', maxWidth: 600, lineHeight: 1.65, fontStyle: 'italic' }}>{lede}</p>
            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20 }}>
                {tags.map((tag, i) => (
                  <span key={i} style={{ fontSize: 11, fontWeight: 500, padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(163,212,184,0.5)', color: '#A3D4B8', background: 'rgba(46,125,90,0.15)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E9E6DE' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 24px' }}>
          <nav aria-label="Breadcrumb">
            <ol style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6E6A60', flexWrap: 'wrap', listStyle: 'none', margin: 0, padding: 0 }}>
              <li><a href={`/${locale}`} style={{ color: '#6E6A60', textDecoration: 'none' }}>{isVi ? 'Trang chủ' : 'Home'}</a></li>
              <li style={{ fontFamily: 'serif', fontStyle: 'italic', color: '#D9D3C5' }}>›</li>
              <li><a href={`/${locale}/${provinceTypeSlug}/${provinceSlug}`} style={{ color: '#6E6A60', textDecoration: 'none' }}>{provinceName}</a></li>
              <li style={{ fontFamily: 'serif', fontStyle: 'italic', color: '#D9D3C5' }}>›</li>
              <li><a href={`/${locale}/${provinceTypeSlug}/${provinceSlug}#culture`} style={{ color: '#6E6A60', textDecoration: 'none' }}>{isVi ? 'Địa điểm' : 'Places'}</a></li>
              <li style={{ fontFamily: 'serif', fontStyle: 'italic', color: '#D9D3C5' }}>›</li>
              <li style={{ color: '#3A3833', fontWeight: 500 }}>{title}</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Info bar */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E9E6DE' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap' }}>
          {[
            { label: isVi ? 'Địa chỉ' : 'Address', value: isVi ? place.info_address_vi : place.info_address_en },
            { label: isVi ? 'Giờ mở cửa' : 'Hours', value: isVi ? place.info_hours_vi : place.info_hours_en },
            { label: isVi ? 'Vé vào' : 'Admission', value: isVi ? place.info_price_vi : place.info_price_en },
            { label: isVi ? 'Thời điểm tốt' : 'Best time', value: isVi ? place.info_best_time_vi : place.info_best_time_en },
          ].map((cell, i, arr) => (
            <div key={i} style={{ flex: '1 1 160px', padding: '16px 24px', borderRight: i < arr.length - 1 ? '1px solid #E9E6DE' : 'none' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6E6A60', marginBottom: 4 }}>{cell.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#3A3833' }}>{cell.value || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main layout: article + sidebar */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px', display: 'flex', gap: 48, alignItems: 'flex-start' }}>

        {/* Article */}
        <article style={{ flex: 1, minWidth: 0 }}>

          {/* Section 01 — Story */}
          <section style={{ marginBottom: 56 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <span className="font-heading" style={{ fontSize: 36, fontWeight: 600, color: '#E8D48A', lineHeight: 1 }}>01</span>
              <h2 className="font-heading" style={{ fontSize: 22, fontWeight: 700, color: '#1B1B1A' }}>
                {isVi ? 'Lịch sử & câu chuyện.' : 'History & story.'}
              </h2>
            </div>
            {bodyBlocks ? (
              <BodyBlocks blocks={bodyBlocks} isVi={isVi} galleryImages={gallery} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {storyParagraphs.map((para, i) => (
                  <p key={i} style={{ fontSize: 16, color: '#6E6A60', lineHeight: 1.75 }}>{para}</p>
                ))}
              </div>
            )}
            {(place.story_blockquote_vi || place.story_blockquote_en) && (
              <blockquote style={{ margin: '32px 0', paddingLeft: 20, borderLeft: '3px solid #2E7D5A' }}>
                <p className="font-heading" style={{ fontSize: 22, fontStyle: 'italic', fontWeight: 500, color: '#3A3833', lineHeight: 1.55 }}>
                  {isVi ? place.story_blockquote_vi : place.story_blockquote_en}
                </p>
                {place.story_blockquote_cite && (
                  <cite style={{ display: 'block', fontSize: 11, color: '#6E6A60', marginTop: 12, fontStyle: 'normal' }}>{place.story_blockquote_cite}</cite>
                )}
              </blockquote>
            )}
          </section>

          {/* Section 02 — Highlights */}
          {highlights.length > 0 && (
            <section style={{ marginBottom: 56 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <span className="font-heading" style={{ fontSize: 36, fontWeight: 600, color: '#E8D48A', lineHeight: 1 }}>02</span>
                <h2 className="font-heading" style={{ fontSize: 22, fontWeight: 700, color: '#1B1B1A' }}>
                  {isVi ? 'Điểm nổi bật không thể bỏ qua.' : 'Highlights not to miss.'}
                </h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
                {highlights.map((h, i) => (
                  <div key={i} style={{ background: HIGHLIGHT_COLORS[i % 4], border: '1px solid #E9E6DE', borderRadius: 14, padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ width: 28, height: 28, borderRadius: '50%', background: HIGHLIGHT_ACCENTS[i % 4], color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                      <div className="font-heading" style={{ fontSize: 16, fontWeight: 600, color: HIGHLIGHT_ACCENTS[i % 4] }}>
                        {isVi ? h.title_vi : h.title_en}
                      </div>
                    </div>
                    <p style={{ fontSize: 13.5, color: '#6E6A60', lineHeight: 1.7 }}>
                      {isVi ? h.body_vi : h.body_en}
                    </p>
                  </div>
                ))}
              </div>
              {(place.tip_title_vi || place.tip_title_en) && (
                <div style={{ display: 'flex', gap: 16, background: '#EEF6F0', border: '1px solid #A3D4B8', borderRadius: 12, padding: 20, marginTop: 20 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E7D5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                    <path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z"/>
                  </svg>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1B1B1A', marginBottom: 6 }}>{isVi ? place.tip_title_vi : place.tip_title_en}</div>
                    <p style={{ fontSize: 13, color: '#6E6A60', lineHeight: 1.65 }}>{isVi ? place.tip_body_vi : place.tip_body_en}</p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Section 03 — How to visit */}
          <section style={{ marginBottom: 56 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <span className="font-heading" style={{ fontSize: 36, fontWeight: 600, color: '#E8D48A', lineHeight: 1 }}>03</span>
              <h2 className="font-heading" style={{ fontSize: 22, fontWeight: 700, color: '#1B1B1A' }}>
                {isVi ? 'Cách tham quan & di chuyển.' : 'How to visit & get there.'}
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {visitSections.map((block, i) => {
                if (block.startsWith('## ')) {
                  return <h3 key={i} className="font-heading" style={{ fontSize: 17, fontWeight: 600, color: '#3A3833', marginTop: 8, marginBottom: 0 }}>{block.slice(3)}</h3>;
                }
                const rendered = block.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
                return <p key={i} style={{ fontSize: 15, color: '#6E6A60', lineHeight: 1.75 }} dangerouslySetInnerHTML={{ __html: rendered }} />;
              })}
            </div>
          </section>

          {/* Sources */}
          {sources.length > 0 && (
            <section style={{ paddingTop: 32, borderTop: '1px solid #E9E6DE', marginBottom: 40 }}>
              <h2 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6E6A60', marginBottom: 16 }}>
                {isVi ? 'Nguồn tham khảo' : 'Sources'}
              </h2>
              <ol style={{ display: 'flex', flexDirection: 'column', gap: 12, listStyle: 'none', padding: 0, margin: 0 }}>
                {sources.map((s, i) => (
                  <li key={s.id} style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                    <span style={{ flexShrink: 0, fontWeight: 500, color: '#6E6A60' }}>{i + 1}.</span>
                    <div>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 500, color: '#C8102E', textDecoration: 'none' }}>{s.title}</a>
                      <p style={{ fontSize: 11, color: '#6E6A60', marginTop: 2 }}>{s.publisher} · {s.accessed_date}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Prev / Next nav */}
          {(prevPlace || nextPlace) && (
            <nav style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, borderTop: '1px solid #E9E6DE', paddingTop: 32 }}>
              {prevPlace ? (
                <a href={`/${locale}/${provinceTypeSlug}/${provinceSlug}/dia-diem/${prevPlace.slug}`} style={{ display: 'block', background: '#FFFFFF', border: '1px solid #E9E6DE', borderRadius: 12, padding: 16, textDecoration: 'none' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6E6A60', marginBottom: 6 }}>← {isVi ? 'Trước đó' : 'Previous'}</div>
                  <div className="font-heading" style={{ fontSize: 15, fontWeight: 500, color: '#3A3833', lineHeight: 1.4 }}>{isVi ? prevPlace.title_vi : prevPlace.title_en}</div>
                </a>
              ) : <div />}
              {nextPlace ? (
                <a href={`/${locale}/${provinceTypeSlug}/${provinceSlug}/dia-diem/${nextPlace.slug}`} style={{ display: 'block', background: '#FFFFFF', border: '1px solid #E9E6DE', borderRadius: 12, padding: 16, textDecoration: 'none', textAlign: 'right' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6E6A60', marginBottom: 6 }}>{isVi ? 'Tiếp theo' : 'Next'} →</div>
                  <div className="font-heading" style={{ fontSize: 15, fontWeight: 500, color: '#3A3833', lineHeight: 1.4 }}>{isVi ? nextPlace.title_vi : nextPlace.title_en}</div>
                </a>
              ) : <div />}
            </nav>
          )}

        </article>

        {/* Sticky sidebar */}
        <aside style={{ width: 300, flexShrink: 0, position: 'sticky', top: 'calc(64px + 16px)', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Quick info card */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E9E6DE', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #E9E6DE', background: '#FBF8F1' }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6E6A60' }}>{isVi ? 'Thông tin thực tế' : 'Practical info'}</span>
            </div>
            <div style={{ padding: '4px 0' }}>
              {[
                { label: isVi ? 'Địa chỉ' : 'Address', value: isVi ? place.info_address_vi : place.info_address_en },
                { label: isVi ? 'Giờ mở cửa' : 'Hours', value: isVi ? place.info_hours_vi : place.info_hours_en },
                { label: isVi ? 'Vé vào' : 'Admission', value: isVi ? place.info_price_vi : place.info_price_en },
                { label: isVi ? 'Thời điểm tốt' : 'Best time', value: isVi ? place.info_best_time_vi : place.info_best_time_en },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 18px', borderBottom: '1px solid #F4F1EC' }}>
                  <span style={{ fontSize: 11, color: '#6E6A60', flexShrink: 0 }}>{row.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#3A3833', textAlign: 'right', maxWidth: 170, marginLeft: 8 }}>{row.value || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery strip */}
          {gallery.length > 0 && (
            <div style={{ background: '#FFFFFF', border: '1px solid #E9E6DE', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #E9E6DE', background: '#FBF8F1' }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6E6A60' }}>{isVi ? 'Thư viện ảnh' : 'Gallery'}</span>
              </div>
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {gallery.slice(0, 5).map((src, i) => (
                  <img key={i} src={src} alt="" loading="lazy" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 8, display: 'block' }} />
                ))}
              </div>
            </div>
          )}

          {/* Highlights mini card */}
          {highlights.length > 0 && (
            <div style={{ background: '#FFFFFF', border: '1px solid #E9E6DE', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #E9E6DE', background: '#FBF8F1' }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6E6A60' }}>{isVi ? 'Điểm nổi bật' : 'Highlights'}</span>
              </div>
              <div style={{ padding: '8px 0' }}>
                {highlights.map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderBottom: '1px solid #F4F1EC' }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: HIGHLIGHT_ACCENTS[i % 4], color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#3A3833' }}>{isVi ? h.title_vi : h.title_en}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </aside>
      </div>
    </div>
  );
}
