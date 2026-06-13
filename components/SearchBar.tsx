'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type SearchResult = {
  provinces: Array<{ slug: string; name_vi: string; name_en: string; type: string; type_en: string }>;
  events: Array<{ id: number; title_vi: string; title_en: string; province_slug: string; province_type: string; province_type_en: string }>;
  cultural_posts: Array<{ id: number; title_vi: string; title_en: string; province_slug: string }>;
};

export default function SearchBar({ locale, hero }: { locale: string; hero?: boolean }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isVi = locale === 'vi';

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const search = (q: string) => {
    clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults(null); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&locale=${locale}`);
        const data = await res.json();
        setResults(data);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const totalResults =
    (results?.provinces.length ?? 0) +
    (results?.events.length ?? 0) +
    (results?.cultural_posts.length ?? 0);

  const dropdown = open && results && (
    <div
      className="absolute top-full mt-2 left-0 right-0 max-h-80 overflow-y-auto rounded-2xl z-50"
      style={{ background: '#FBF8F1', border: '1px solid #D9D3C5', boxShadow: '0 16px 32px rgba(27,27,26,0.12)' }}
    >
      {totalResults === 0 ? (
        <div className="p-4 text-sm text-vn-stone text-center">
          {isVi ? 'Không tìm thấy kết quả' : 'No results found'}
        </div>
      ) : (
        <>
          {results.provinces.length > 0 && (
            <div>
              <div className="px-3 py-2 text-[10px] font-semibold text-vn-stone uppercase tracking-wider border-b border-vn-mist">
                {isVi ? 'Tỉnh thành' : 'Provinces'}
              </div>
              {results.provinces.map((p) => {
                const typeSlug = isVi ? p.type : p.type_en;
                return (
                  <button key={p.slug} onClick={() => { router.push(`/${locale}/${typeSlug}/${p.slug}`); setOpen(false); setQuery(''); }}
                    className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors hover:bg-vn-fog" style={{ color: '#1B1B1A' }}>
                    <span>📍</span><span>{isVi ? p.name_vi : p.name_en}</span>
                  </button>
                );
              })}
            </div>
          )}
          {results.events.length > 0 && (
            <div>
              <div className="px-3 py-2 text-[10px] font-semibold text-vn-stone uppercase tracking-wider border-b border-vn-mist">
                {isVi ? 'Sự kiện lịch sử' : 'Historical events'}
              </div>
              {results.events.map((e) => {
                const typeSlug = isVi ? e.province_type : e.province_type_en;
                return (
                  <button key={e.id} onClick={() => { router.push(`/${locale}/${typeSlug}/${e.province_slug}`); setOpen(false); setQuery(''); }}
                    className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors hover:bg-vn-fog" style={{ color: '#1B1B1A' }}>
                    <span>📜</span><span className="line-clamp-1">{isVi ? e.title_vi : e.title_en}</span>
                  </button>
                );
              })}
            </div>
          )}
          {results.cultural_posts.length > 0 && (
            <div>
              <div className="px-3 py-2 text-[10px] font-semibold text-vn-stone uppercase tracking-wider border-b border-vn-mist">
                {isVi ? 'Văn hóa' : 'Culture'}
              </div>
              {results.cultural_posts.map((c) => (
                <button key={c.id} onClick={() => { router.push(`/${locale}/thanh-pho/${c.province_slug}`); setOpen(false); setQuery(''); }}
                  className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors hover:bg-vn-fog" style={{ color: '#1B1B1A' }}>
                  <span>🎭</span><span className="line-clamp-1">{isVi ? c.title_vi : c.title_en}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );

  // ── Hero variant — pill with icon + gold button ──────────────────────────────
  if (hero) {
    return (
      <div ref={containerRef} className="relative w-full" style={{ maxWidth: '520px' }}>
        <div
          className="flex items-center rounded-full gap-3 px-5 py-1.5 transition-all"
          style={{
            background: '#FFFFFF',
            border: `1px solid ${focused ? '#C8102E' : '#D9D3C5'}`,
            boxShadow: focused
              ? '0 0 0 6px rgba(200,16,46,0.10), 0 2px 4px rgba(27,27,26,0.05)'
              : '0 2px 4px rgba(27,27,26,0.05)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6E6A60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); search(e.target.value); }}
            onFocus={() => { setFocused(true); results && setOpen(true); }}
            onBlur={() => setFocused(false)}
            placeholder={isVi ? "Tìm 'Hội An', 'Tết Nguyên Đán'…" : "Search 'Hoi An', 'Tet holiday'…"}
            className="flex-1 bg-transparent outline-none text-sm py-2.5"
            style={{ color: '#1B1B1A' }}
          />
          {loading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 flex-shrink-0"
                 style={{ borderColor: '#D9D3C5', borderTopColor: '#C9A24C' }} />
          )}
          <button
            type="button"
            onClick={() => search(query)}
            className="flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
            style={{ background: '#C9A24C', color: '#1B1B1A' }}
          >
            {isVi ? 'Tìm' : 'Search'}
          </button>
        </div>
        {dropdown}
      </div>
    );
  }

  // ── Header variant — compact pill ───────────────────────────────────────────
  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); search(e.target.value); }}
          onFocus={() => { setFocused(true); results && setOpen(true); }}
          onBlur={() => setFocused(false)}
          placeholder={isVi ? 'Tìm kiếm...' : 'Search...'}
          className="w-44 md:w-56 rounded-full text-sm px-4 py-1.5 outline-none transition-all"
          style={{
            background: '#EDE3CC',
            border: `1px solid ${focused ? '#C9A24C' : '#D9D3C5'}`,
            boxShadow: focused ? '0 0 0 3px rgba(201,162,76,0.16)' : 'none',
            color: '#1B1B1A',
          }}
        />
        {loading && (
          <div className="absolute right-3 top-2 h-4 w-4 animate-spin rounded-full border-2"
               style={{ borderColor: '#D9D3C5', borderTopColor: '#C9A24C' }} />
        )}
      </div>
      {open && results && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-80 overflow-y-auto rounded-2xl z-50"
             style={{ background: '#FBF8F1', border: '1px solid #D9D3C5', boxShadow: '0 16px 32px rgba(27,27,26,0.12)' }}>
          {totalResults === 0 ? (
            <div className="p-4 text-sm text-vn-stone text-center">
              {isVi ? 'Không tìm thấy kết quả' : 'No results found'}
            </div>
          ) : (
            <>
              {results.provinces.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-[10px] font-semibold text-vn-stone uppercase tracking-wider border-b border-vn-mist">
                    {isVi ? 'Tỉnh thành' : 'Provinces'}
                  </div>
                  {results.provinces.map((p) => {
                    const typeSlug = isVi ? p.type : p.type_en;
                    return (
                      <button key={p.slug} onClick={() => { router.push(`/${locale}/${typeSlug}/${p.slug}`); setOpen(false); setQuery(''); }}
                        className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-vn-fog" style={{ color: '#1B1B1A' }}>
                        <span>📍</span><span>{isVi ? p.name_vi : p.name_en}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {results.events.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-[10px] font-semibold text-vn-stone uppercase tracking-wider border-b border-vn-mist">
                    {isVi ? 'Sự kiện lịch sử' : 'Historical events'}
                  </div>
                  {results.events.map((e) => {
                    const typeSlug = isVi ? e.province_type : e.province_type_en;
                    return (
                      <button key={e.id} onClick={() => { router.push(`/${locale}/${typeSlug}/${e.province_slug}`); setOpen(false); setQuery(''); }}
                        className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-vn-fog" style={{ color: '#1B1B1A' }}>
                        <span>📜</span><span className="line-clamp-1">{isVi ? e.title_vi : e.title_en}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {results.cultural_posts.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-[10px] font-semibold text-vn-stone uppercase tracking-wider border-b border-vn-mist">
                    {isVi ? 'Văn hóa' : 'Culture'}
                  </div>
                  {results.cultural_posts.map((c) => (
                    <button key={c.id} onClick={() => { router.push(`/${locale}/thanh-pho/${c.province_slug}`); setOpen(false); setQuery(''); }}
                      className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-vn-fog" style={{ color: '#1B1B1A' }}>
                      <span>🎭</span><span className="line-clamp-1">{isVi ? c.title_vi : c.title_en}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
