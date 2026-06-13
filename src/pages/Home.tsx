/* ================================================================
   Home.tsx — Venue list with category filter and search
   ================================================================ */

import React, { useState, useMemo } from 'react';
import type { Venue, VenueType } from '../types';
import { VENUE_TYPE_LABELS, VENUE_TYPE_TAG_CLASS } from '../types';
import { getVenues } from '../utils/storage';

interface Props {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const ALL_CATEGORIES: ('all' | VenueType)[] = ['all', 'basketball', 'badminton', 'pingpong', 'tennis', 'football'];

const CATEGORY_LABELS: Record<string, string> = {
  all: '全部',
  ...VENUE_TYPE_LABELS,
};

function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '☆' : '') + '☆'.repeat(empty);
}

export default function Home({ onNavigate }: Props) {
  const venues = useMemo(() => getVenues(), []);
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = venues;
    if (category !== 'all') {
      list = list.filter((v) => v.type === category);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.location.toLowerCase().includes(q) ||
          VENUE_TYPE_LABELS[v.type].includes(q),
      );
    }
    return list;
  }, [venues, category, search]);

  return (
    <div>
      {/* Hero */}
      <div className="hero-section">
        <h1>运动场地预约平台</h1>
        <p>查找并预约您身边的优质运动场地</p>
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="搜索场地名称、位置或类型..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="main-content">
        {/* Category tabs */}
        <div className="category-tabs" style={{ marginTop: 20 }}>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-tab ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Venue grid */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🏟️</div>
            <p>没有找到符合条件的场地</p>
          </div>
        ) : (
          <div className="venue-grid">
            {filtered.map((venue) => (
              <VenueCard key={venue.id} venue={venue} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VenueCard({ venue, onNavigate }: { venue: Venue; onNavigate: Props['onNavigate'] }) {
  return (
    <div className="venue-card" onClick={() => onNavigate('detail', { id: venue.id })}>
      <img className="venue-card-img" src={venue.images[0]} alt={venue.name} loading="lazy" />
      <div className="venue-card-body">
        <div className="venue-card-title">{venue.name}</div>
        <span className={`venue-card-tag ${VENUE_TYPE_TAG_CLASS[venue.type]}`}>
          {VENUE_TYPE_LABELS[venue.type]}
        </span>
        <div className="venue-card-location">📍 {venue.location}</div>
        <div className="venue-card-rating">
          <span>{renderStars(venue.rating)}</span>
          <span>{venue.rating.toFixed(1)}</span>
          <span style={{ color: '#aaa', fontSize: '0.8rem' }}>({venue.reviewCount}条评价)</span>
        </div>
      </div>
    </div>
  );
}
