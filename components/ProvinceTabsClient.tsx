'use client';

import { useState } from 'react';
import Timeline from './Timeline';
import CulturalPostList from './CulturalPostList';
import type { Event, CulturalPost, Source } from '@/lib/queries';

type EventWithSources = Event & { sources: Source[] };
type PostWithSources = CulturalPost & { sources: Source[] };

type Props = {
  locale: string;
  events: EventWithSources[];
  culturalPosts: PostWithSources[];
  provinceSlug: string;
  provinceTypeSlug: string;
};

export default function ProvinceTabsClient({ locale, events, culturalPosts, provinceSlug, provinceTypeSlug }: Props) {
  const [tab, setTab] = useState<'history' | 'culture'>('history');
  const isVi = locale === 'vi';

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-vn-mist mb-6">
        <button
          onClick={() => setTab('history')}
          className="px-5 py-3 text-sm font-medium border-b-2 transition-colors"
          style={
            tab === 'history'
              ? { borderColor: '#C8102E', color: '#C8102E' }
              : { borderColor: 'transparent', color: '#6E6A60' }
          }
        >
          📜 {isVi ? 'Lịch sử' : 'History'}
          {events.length > 0 && (
            <span
              className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
              style={{ background: '#E9E6DE', color: '#6E6A60' }}
            >
              {events.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('culture')}
          className="px-5 py-3 text-sm font-medium border-b-2 transition-colors"
          style={
            tab === 'culture'
              ? { borderColor: '#2E7D5A', color: '#2E7D5A' }
              : { borderColor: 'transparent', color: '#6E6A60' }
          }
        >
          🎭 {isVi ? 'Văn hóa' : 'Culture'}
          {culturalPosts.length > 0 && (
            <span
              className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
              style={{ background: '#E9E6DE', color: '#6E6A60' }}
            >
              {culturalPosts.length}
            </span>
          )}
        </button>
      </div>

      {tab === 'history' ? (
        <Timeline locale={locale} events={events} provinceSlug={provinceSlug} provinceTypeSlug={provinceTypeSlug} />
      ) : (
        <CulturalPostList locale={locale} posts={culturalPosts} />
      )}
    </div>
  );
}
