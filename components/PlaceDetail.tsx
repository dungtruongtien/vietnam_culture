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

function PlaceHeroIllustration() {
  return (
    <svg viewBox="0 0 400 360" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: '100%', maxWidth: 380 }}>
      <defs>
        <linearGradient id="skyGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#C5E3F7" />
          <stop offset="100%" stopColor="#EEF6F0" />
        </linearGradient>
        <linearGradient id="roofGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#C8102E" />
          <stop offset="100%" stopColor="#8E0A1F" />
        </linearGradient>
      </defs>
      <rect width="400" height="360" fill="url(#skyGrad)" />
      <ellipse cx="200" cy="340" rx="180" ry="22" fill="#2E7D5A" opacity="0.25" />
      <rect x="60" y="240" width="280" height="90" rx="4" fill="#FBF8F1" stroke="#D9D3C5" strokeWidth="1.5" />
      <rect x="140" y="260" width="120" height="70" rx="3" fill="#EDE3CC" />
      <rect x="170" y="290" width="60" height="40" rx="2" fill="#2E7D5A" opacity="0.5" />
      <polygon points="40,240 200,140 360,240" fill="url(#roofGrad)" />
      <polygon points="70,240 200,156 330,240" fill="#C8102E" opacity="0.15" />
      <line x1="200" y1="140" x2="200" y2="100" stroke="#C9A24C" strokeWidth="3" strokeLinecap="round" />
      <circle cx="200" cy="96" r="6" fill="#C9A24C" />
      <rect x="86" y="254" width="50" height="76" rx="3" fill="#FBF8F1" stroke="#D9D3C5" strokeWidth="1" />
      <rect x="264" y="254" width="50" height="76" rx="3" fill="#FBF8F1" stroke="#D9D3C5" strokeWidth="1" />
      <circle cx="90" cy="236" r="18" fill="#2E7D5A" opacity="0.35" />
      <circle cx="310" cy="236" r="22" fill="#2E7D5A" opacity="0.35" />
      <rect x="0" y="316" width="400" height="44" fill="#2E7D5A" opacity="0.18" rx="4" />
    </svg>
  );
}

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

  const HIGHLIGHT_COLORS = ['#FCE7EE', '#EEF6F0', '#FBF6E8', '#F0EEF8'];
  const HIGHLIGHT_ACCENTS = ['#C8102E', '#2E7D5A', '#C9A24C', '#6E5C9E'];

  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF' }}>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #EEF6F0 0%, #FBF8F1 60%)', borderBottom: '1px solid #D9D3C5' }}>
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest block mb-4" style={{ color: '#2E7D5A' }}>
                {isVi ? 'Địa điểm' : 'Places'} · {provinceName}
              </span>
              <h1 className="font-heading font-semibold leading-tight mb-4" style={{ fontSize: 'clamp(32px, 4vw, 52px)', color: '#1B1B1A' }}>
                {title.includes(' ') ? (
                  <>
                    {title.split(' ').slice(0, -2).join(' ')}{' '}
                    <em style={{ fontStyle: 'italic', color: '#2E7D5A' }}>
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
              {place.image_url ? (
                <img
                  src={place.image_url}
                  alt={title}
                  style={{ width: 320, height: 260, objectFit: 'cover', borderRadius: 16, display: 'block' }}
                />
              ) : (
                <PlaceHeroIllustration />
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
          <li><a href={`/${locale}/${provinceTypeSlug}/${provinceSlug}#culture`} className="hover:text-vn-ink transition-colors">{isVi ? 'Địa điểm' : 'Places'}</a></li>
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

        {/* Main article */}
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
                  label: isVi ? 'Địa chỉ' : 'Address',
                  value: isVi ? place.info_address_vi : place.info_address_en,
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                  label: isVi ? 'Giờ mở cửa' : 'Hours',
                  value: isVi ? place.info_hours_vi : place.info_hours_en,
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
                  label: isVi ? 'Vé vào' : 'Admission',
                  value: isVi ? place.info_price_vi : place.info_price_en,
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 6v6l4 2"/></svg>,
                  label: isVi ? 'Thời điểm tốt' : 'Best time',
                  value: isVi ? place.info_best_time_vi : place.info_best_time_en,
                },
              ].map((cell, i) => (
                <div key={i} className="flex items-start gap-3 p-4 border-r last:border-r-0 border-b md:border-b-0" style={{ borderColor: '#D9D3C5' }}>
                  <div className="flex-shrink-0 mt-0.5" style={{ color: '#2E7D5A' }}>{cell.icon}</div>
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
                  {isVi ? 'Lịch sử & câu chuyện.' : 'History & story.'}
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
              {(place.story_blockquote_vi || place.story_blockquote_en) && (
                <blockquote className="my-8 pl-5 border-l-4" style={{ borderColor: '#2E7D5A' }}>
                  <p className="font-heading text-lg font-medium text-vn-ink leading-relaxed italic">
                    {isVi ? place.story_blockquote_vi : place.story_blockquote_en}
                  </p>
                  {place.story_blockquote_cite && (
                    <cite className="block text-xs text-vn-stone mt-3 not-italic">{place.story_blockquote_cite}</cite>
                  )}
                </blockquote>
              )}
            </section>

            {/* Section 02 — Highlights */}
            {highlights.length > 0 && (
              <section className="mb-12" id="highlights">
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-heading text-3xl font-semibold" style={{ color: '#E8D48A' }}>02</span>
                  <h2 className="font-heading text-xl font-bold text-vn-ink">
                    {isVi ? 'Điểm nổi bật không thể bỏ qua.' : 'Highlights not to miss.'}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {highlights.map((h, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border p-5"
                      style={{
                        background: HIGHLIGHT_COLORS[i % 4],
                        borderColor: '#D9D3C5',
                      }}
                    >
                      <div
                        className="text-sm font-semibold mb-2"
                        style={{ color: HIGHLIGHT_ACCENTS[i % 4] }}
                      >
                        {isVi ? h.title_vi : h.title_en}
                      </div>
                      <p className="text-sm text-vn-stone leading-relaxed">
                        {isVi ? h.body_vi : h.body_en}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Tip card */}
                {(place.tip_title_vi || place.tip_title_en) && (
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
                      <div className="text-sm font-semibold text-vn-ink mb-1.5">{isVi ? place.tip_title_vi : place.tip_title_en}</div>
                      <p className="text-sm text-vn-stone leading-relaxed">{isVi ? place.tip_body_vi : place.tip_body_en}</p>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Section 03 — How to visit */}
            <section className="mb-12" id="how-to-visit">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-heading text-3xl font-semibold" style={{ color: '#E8D48A' }}>03</span>
                <h2 className="font-heading text-xl font-bold text-vn-ink">
                  {isVi ? 'Cách tham quan & di chuyển.' : 'How to visit & get there.'}
                </h2>
              </div>
              <div className="space-y-4">
                {visitSections.map((block, i) => {
                  if (block.startsWith('## ')) {
                    return <h3 key={i} className="font-heading text-base font-semibold text-vn-ink mt-6 mb-2">{block.slice(3)}</h3>;
                  }
                  const rendered = block.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
                  return <p key={i} className="text-base text-vn-stone leading-relaxed" dangerouslySetInnerHTML={{ __html: rendered }} />;
                })}
              </div>
            </section>

            {/* Prev / Next nav */}
            {(prevPlace || nextPlace) && (
              <nav
                className="grid grid-cols-2 gap-4 mt-12 pt-8"
                style={{ borderTop: '1px solid #D9D3C5' }}
                aria-label={isVi ? 'Địa điểm liên quan' : 'Related places'}
              >
                {prevPlace ? (
                  <a
                    href={`/${locale}/${provinceTypeSlug}/${provinceSlug}/dia-diem/${prevPlace.slug}`}
                    className="block rounded-xl border p-4 transition-all hover:border-vn-gold hover:shadow-sm"
                    style={{ borderColor: '#D9D3C5', background: '#FFFFFF', textDecoration: 'none' }}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-vn-stone mb-1.5">← {isVi ? 'Trước đó' : 'Previous'}</div>
                    <div className="font-heading text-base font-medium text-vn-ink leading-snug">
                      {isVi ? prevPlace.title_vi : prevPlace.title_en}
                    </div>
                  </a>
                ) : <div />}
                {nextPlace ? (
                  <a
                    href={`/${locale}/${provinceTypeSlug}/${provinceSlug}/dia-diem/${nextPlace.slug}`}
                    className="block rounded-xl border p-4 text-right transition-all hover:border-vn-gold hover:shadow-sm"
                    style={{ borderColor: '#D9D3C5', background: '#FFFFFF', textDecoration: 'none' }}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-vn-stone mb-1.5">{isVi ? 'Tiếp theo' : 'Next'} →</div>
                    <div className="font-heading text-base font-medium text-vn-ink leading-snug">
                      {isVi ? nextPlace.title_vi : nextPlace.title_en}
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
