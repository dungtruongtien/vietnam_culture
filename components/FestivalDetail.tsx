import type { FestivalItem, FestivalItemSource } from '@/lib/queries';

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
  festivalItem: FestivalItem;
  festival: {
    id: number;
    name_vi: string;
    name_en: string;
    start_date: string;
    end_date: string | null;
    is_lunar: number;
    slug: string | null;
  };
  sources: FestivalItemSource[];
  prevFestival: { slug: string; title_vi: string; title_en: string } | null;
  nextFestival: { slug: string; title_vi: string; title_en: string } | null;
  provinceName: string;
  provinceSlug: string;
  provinceTypeSlug: string;
};

function FestivalHeroIllustration() {
  return (
    <svg viewBox="0 0 400 360" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: '100%', maxWidth: 380 }}>
      <defs>
        <linearGradient id="nightGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#1B2A4A" />
          <stop offset="100%" stopColor="#3D1A1F" />
        </linearGradient>
      </defs>
      <rect width="400" height="360" fill="url(#nightGrad)" />
      {/* Stars */}
      {[40,80,130,200,260,310,360].map((x,i) => (
        <circle key={i} cx={x} cy={20 + (i%3)*15} r="1.5" fill="#DEC07F" opacity="0.8" />
      ))}
      {/* Lanterns */}
      {[80,160,240,320].map((x,i) => (
        <g key={i} transform={`translate(${x}, ${60 + (i%2)*20})`}>
          <ellipse cx="0" cy="0" rx="18" ry="24" fill={i%2===0 ? '#C8102E' : '#C9A24C'} opacity="0.9" />
          <rect x="-2" y="-30" width="4" height="12" fill="#C9A24C" />
          <line x1="0" y1="24" x2="0" y2="36" stroke="#C9A24C" strokeWidth="1.5" />
          <ellipse cx="0" cy="37" rx="5" ry="2" fill="#C9A24C" opacity="0.6" />
        </g>
      ))}
      {/* Ground / crowd silhouette */}
      <rect x="0" y="280" width="400" height="80" fill="#1B1B1A" opacity="0.6" rx="4" />
      {[30,70,110,150,190,230,270,310,350].map((x,i) => (
        <ellipse key={i} cx={x} cy="278" rx="12" ry="18" fill="#1B1B1A" opacity="0.8" />
      ))}
      {/* Fireworks */}
      {[100,300].map((cx,fi) => (
        <g key={fi}>
          {Array.from({length:8},(_,i) => {
            const angle = (i/8)*Math.PI*2;
            const r = 45;
            return <line key={i} x1={cx} y1={160} x2={cx + Math.cos(angle)*r} y2={160 + Math.sin(angle)*r}
              stroke={fi===0?'#C8102E':'#C9A24C'} strokeWidth="2" strokeLinecap="round" opacity="0.85" />;
          })}
          <circle cx={cx} cy={160} r="5" fill={fi===0?'#C8102E':'#C9A24C'} />
        </g>
      ))}
    </svg>
  );
}

export default function FestivalDetail({
  locale, festivalItem, festival, sources, prevFestival, nextFestival,
  provinceName, provinceSlug, provinceTypeSlug,
}: Props) {
  const isVi = locale === 'vi';

  const title = isVi ? festivalItem.title_vi : festivalItem.title_en;
  const lede = isVi ? festivalItem.lede_vi : festivalItem.lede_en;
  const tags: string[] = (() => { try { return JSON.parse(festivalItem.tags_json); } catch { return []; } })();
  const highlights: Highlight[] = (() => { try { return JSON.parse(festivalItem.highlights_json); } catch { return []; } })();
  const bodyBlocks: BodyBlock[] | null = (() => {
    try { return festivalItem.body_blocks_json ? JSON.parse(festivalItem.body_blocks_json) as BodyBlock[] : null; } catch { return null; }
  })();
  const gallery: string[] = (() => { try { return JSON.parse(festivalItem.gallery_json); } catch { return []; } })();
  const storyParagraphs = (isVi ? festivalItem.story_vi : festivalItem.story_en).split('\n\n').filter(Boolean);
  const attendSections = (isVi ? festivalItem.how_to_attend_vi : festivalItem.how_to_attend_en).split('\n\n').filter(Boolean);

  const startDate = new Date(festival.start_date);
  const endDate = festival.end_date ? new Date(festival.end_date) : null;
  const lang = isVi ? 'vi-VN' : 'en-US';
  const dateOpts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
  const dateDisplay = endDate && festival.end_date !== festival.start_date
    ? `${startDate.toLocaleDateString(lang, dateOpts)} – ${endDate.toLocaleDateString(lang, dateOpts)}`
    : startDate.toLocaleDateString(lang, dateOpts);

  const HIGHLIGHT_COLORS = ['#FCE7EE', '#EEF6F0', '#FBF6E8', '#F0EEF8'];
  const HIGHLIGHT_ACCENTS = ['#C8102E', '#2E7D5A', '#C9A24C', '#6E5C9E'];

  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF' }}>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #3D1A1F 0%, #1B2A4A 60%)', borderBottom: '1px solid #D9D3C5' }}>
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#DEC07F' }}>
                  {isVi ? 'Lễ hội' : 'Festival'} · {provinceName}
                </span>
                {festival.is_lunar ? (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: '#DEC07F' }}>
                    🌙 {isVi ? 'Âm lịch' : 'Lunar'}
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: '#DEC07F' }}>
                    ☀️ {isVi ? 'Dương lịch' : 'Solar'}
                  </span>
                )}
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{dateDisplay}</span>
              </div>
              <h1 className="font-heading font-semibold leading-tight mb-4" style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', color: '#FFFFFF' }}>
                {title.includes(' ') ? (
                  <>
                    {title.split(' ').slice(0, -2).join(' ')}{' '}
                    <em style={{ fontStyle: 'italic', color: '#DEC07F' }}>
                      {title.split(' ').slice(-2).join(' ')}
                    </em>
                    {'.'}
                  </>
                ) : <>{title}.</>}
              </h1>
              <p className="text-base leading-relaxed max-w-xl" style={{ color: 'rgba(255,255,255,0.8)' }}>{lede}</p>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium px-3 py-1.5 rounded-full border"
                      style={{ borderColor: 'rgba(201,162,76,0.4)', color: '#DEC07F', background: 'rgba(201,162,76,0.1)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-shrink-0 hidden md:block" style={{ width: 320 }}>
              {festivalItem.image_url ? (
                <img
                  src={festivalItem.image_url}
                  alt={title}
                  style={{ width: 320, height: 260, objectFit: 'cover', borderRadius: 16, display: 'block' }}
                />
              ) : (
                <FestivalHeroIllustration />
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
          <li><a href={`/${locale}/${provinceTypeSlug}/${provinceSlug}#festivals`} className="hover:text-vn-ink transition-colors">{isVi ? 'Lễ hội' : 'Festivals'}</a></li>
          <li aria-hidden="true" className="font-heading italic text-vn-mist">›</li>
          <li aria-current="page" className="text-vn-ink font-medium">{title}</li>
        </ol>
      </nav>

      {/* Main grid — 3-col: ad | content | ad */}
      <div className="max-w-[1500px] mx-auto px-4 py-8 flex gap-6 items-start">

        {/* Left ad */}
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
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
                  label: isVi ? 'Thời gian' : 'When',
                  value: isVi ? festivalItem.info_when_vi : festivalItem.info_when_en,
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                  label: isVi ? 'Địa điểm' : 'Location',
                  value: isVi ? festivalItem.info_location_vi : festivalItem.info_location_en,
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
                  label: isVi ? 'Vé vào cửa' : 'Admission',
                  value: isVi ? festivalItem.info_admission_vi : festivalItem.info_admission_en,
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                  label: isVi ? 'Thời điểm tốt' : 'Best time',
                  value: isVi ? festivalItem.info_best_time_vi : festivalItem.info_best_time_en,
                },
              ].map((cell, i) => (
                <div key={i} className="flex items-start gap-3 p-4 border-r last:border-r-0 border-b md:border-b-0" style={{ borderColor: '#D9D3C5' }}>
                  <div className="flex-shrink-0 mt-0.5" style={{ color: '#C8102E' }}>{cell.icon}</div>
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
                  {isVi ? 'Lịch sử & ý nghĩa.' : 'History & meaning.'}
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
              {(festivalItem.story_blockquote_vi || festivalItem.story_blockquote_en) && (
                <blockquote className="my-8 pl-5 border-l-4" style={{ borderColor: '#C8102E' }}>
                  <p className="font-heading text-lg font-medium text-vn-ink leading-relaxed italic">
                    {isVi ? festivalItem.story_blockquote_vi : festivalItem.story_blockquote_en}
                  </p>
                  {festivalItem.story_blockquote_cite && (
                    <cite className="block text-xs text-vn-stone mt-3 not-italic">{festivalItem.story_blockquote_cite}</cite>
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
                    {isVi ? 'Điểm đặc sắc không thể bỏ qua.' : 'Highlights not to miss.'}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {highlights.map((h, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border p-5"
                      style={{ background: HIGHLIGHT_COLORS[i % 4], borderColor: '#D9D3C5' }}
                    >
                      <div className="text-sm font-semibold mb-2" style={{ color: HIGHLIGHT_ACCENTS[i % 4] }}>
                        {isVi ? h.title_vi : h.title_en}
                      </div>
                      <p className="text-sm text-vn-stone leading-relaxed">
                        {isVi ? h.body_vi : h.body_en}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Tip card */}
                {(festivalItem.tip_title_vi || festivalItem.tip_title_en) && (
                  <div className="flex gap-4 rounded-2xl p-5 mt-6" style={{ background: '#FBF6E8', border: '1px solid #E8D48A' }}>
                    <div className="flex-shrink-0 mt-0.5">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A24C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-vn-ink mb-1.5">{isVi ? festivalItem.tip_title_vi : festivalItem.tip_title_en}</div>
                      <p className="text-sm text-vn-stone leading-relaxed">{isVi ? festivalItem.tip_body_vi : festivalItem.tip_body_en}</p>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Section 03 — How to attend */}
            <section className="mb-12" id="how-to-attend">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-heading text-3xl font-semibold" style={{ color: '#E8D48A' }}>03</span>
                <h2 className="font-heading text-xl font-bold text-vn-ink">
                  {isVi ? 'Cách tham dự & di chuyển.' : 'How to attend & get there.'}
                </h2>
              </div>
              <div className="space-y-4">
                {attendSections.map((block, i) => {
                  if (block.startsWith('## ')) {
                    return <h3 key={i} className="font-heading text-base font-semibold text-vn-ink mt-6 mb-2">{block.slice(3)}</h3>;
                  }
                  const rendered = block.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
                  return <p key={i} className="text-base text-vn-stone leading-relaxed" dangerouslySetInnerHTML={{ __html: rendered }} />;
                })}
              </div>
            </section>

            {/* Sources */}
            {sources.length > 0 && (
              <section className="mt-10 pt-8 border-t border-vn-mist">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-vn-stone mb-4">
                  {isVi ? 'Nguồn tham khảo' : 'Sources'}
                </h2>
                <ol className="space-y-3">
                  {sources.map((s, i) => (
                    <li key={s.id} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 font-medium text-vn-stone">{i + 1}.</span>
                      <div>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium hover:underline"
                          style={{ color: '#C8102E' }}
                        >
                          {s.title}
                        </a>
                        <p className="text-xs text-vn-stone mt-0.5">{s.publisher} · {s.accessed_date}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Prev / Next nav */}
            {(prevFestival || nextFestival) && (
              <nav
                className="grid grid-cols-2 gap-4 mt-12 pt-8"
                style={{ borderTop: '1px solid #D9D3C5' }}
                aria-label={isVi ? 'Lễ hội liên quan' : 'Related festivals'}
              >
                {prevFestival ? (
                  <a
                    href={`/${locale}/${provinceTypeSlug}/${provinceSlug}/le-hoi/${prevFestival.slug}`}
                    className="block rounded-xl border p-4 transition-all hover:border-vn-gold hover:shadow-sm"
                    style={{ borderColor: '#D9D3C5', background: '#FFFFFF', textDecoration: 'none' }}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-vn-stone mb-1.5">← {isVi ? 'Trước đó' : 'Previous'}</div>
                    <div className="font-heading text-base font-medium text-vn-ink leading-snug">
                      {isVi ? prevFestival.title_vi : prevFestival.title_en}
                    </div>
                  </a>
                ) : <div />}
                {nextFestival ? (
                  <a
                    href={`/${locale}/${provinceTypeSlug}/${provinceSlug}/le-hoi/${nextFestival.slug}`}
                    className="block rounded-xl border p-4 text-right transition-all hover:border-vn-gold hover:shadow-sm"
                    style={{ borderColor: '#D9D3C5', background: '#FFFFFF', textDecoration: 'none' }}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-vn-stone mb-1.5">{isVi ? 'Tiếp theo' : 'Next'} →</div>
                    <div className="font-heading text-base font-medium text-vn-ink leading-snug">
                      {isVi ? nextFestival.title_vi : nextFestival.title_en}
                    </div>
                  </a>
                ) : <div />}
              </nav>
            )}

          </article>
        </div>

        {/* Right ad */}
        <aside className="hidden xl:flex flex-col gap-4 flex-shrink-0 w-[160px] sticky top-[80px]">
          <div className="w-[160px] h-[600px] rounded-xl flex items-center justify-center text-[10px] text-vn-mist" style={{ background: '#F0EDE7', border: '1px dashed #D9D3C5' }}>Ad</div>
        </aside>

      </div>
    </div>
  );
}
