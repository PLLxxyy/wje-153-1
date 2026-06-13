/* ================================================================
   CourtDetail.tsx — Venue detail + calendar + time slot booking
   ================================================================ */

import React, { useState, useMemo, useEffect } from 'react';
import type { Venue, DaySlot, TimeSlot, Review } from '../types';
import { VENUE_TYPE_LABELS, VENUE_TYPE_TAG_CLASS, TIME_SLOT_LABELS, TIME_SLOTS } from '../types';
import { getVenueById, getDaySlot, getReviewsByVenue } from '../utils/storage';

interface Props {
  venueId: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const DAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  return '★'.repeat(full) + (half ? '☆' : '') + '☆'.repeat(5 - full - half);
}

export default function CourtDetail({ venueId, onNavigate }: Props) {
  const venue = useMemo(() => getVenueById(venueId), [venueId]);
  const reviews = useMemo(() => getReviewsByVenue(venueId), [venueId]);

  const [carouselIdx, setCarouselIdx] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Auto-rotate carousel
  useEffect(() => {
    if (!venue) return;
    const timer = setInterval(() => {
      setCarouselIdx((prev) => (prev + 1) % venue.images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [venue]);

  if (!venue) {
    return (
      <div className="main-content">
        <div className="empty-state">
          <div className="icon">❌</div>
          <p>场地不存在</p>
        </div>
      </div>
    );
  }

  /* ---- Calendar helpers ---- */
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset * 7);

  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    weekDays.push(d);
  }

  const todayStr = dateStr(today);

  /* ---- Time slots for selected date ---- */
  let daySlot: DaySlot | undefined;
  if (selectedDate) {
    daySlot = getDaySlot(venueId, selectedDate);
  }

  function slotAvailable(slot: TimeSlot): boolean {
    if (!daySlot) return true;
    return daySlot[slot].available;
  }

  function handleSlotClick(slot: TimeSlot) {
    if (!selectedDate) return;
    if (!slotAvailable(slot)) return;
    setSelectedSlot(slot);
  }

  function handleBook() {
    if (!selectedDate || !selectedSlot) return;
    onNavigate('booking', {
      venueId,
      date: selectedDate,
      timeSlot: selectedSlot,
    });
  }

  return (
    <div className="main-content detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>首页</a>
        <span>/</span>
        <span>{venue.name}</span>
      </div>

      {/* Carousel */}
      <div className="carousel">
        <img src={venue.images[carouselIdx]} alt={venue.name} />
        {venue.images.length > 1 && (
          <>
            <button
              className="carousel-btn prev"
              onClick={() => setCarouselIdx((carouselIdx - 1 + venue.images.length) % venue.images.length)}
            >
              ‹
            </button>
            <button
              className="carousel-btn next"
              onClick={() => setCarouselIdx((carouselIdx + 1) % venue.images.length)}
            >
              ›
            </button>
            <div className="carousel-dots">
              {venue.images.map((_, i) => (
                <div
                  key={i}
                  className={`carousel-dot ${i === carouselIdx ? 'active' : ''}`}
                  onClick={() => setCarouselIdx(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Basic Info */}
      <div className="detail-section">
        <h2>
          <span className={`venue-card-tag ${VENUE_TYPE_TAG_CLASS[venue.type]}`} style={{ fontSize: '0.8rem' }}>
            {VENUE_TYPE_LABELS[venue.type]}
          </span>
          {venue.name}
        </h2>
        <p style={{ color: '#555', marginBottom: 16, lineHeight: 1.8 }}>{venue.description}</p>
        <div className="detail-info-row">📍 <strong>地址：</strong>{venue.location}</div>
        <div className="detail-info-row">🕐 <strong>营业时间：</strong>{venue.openingHours}</div>
        <div className="detail-info-row">📞 <strong>电话：</strong>{venue.contactPhone}</div>
        <div className="detail-info-row">💰 <strong>价格：</strong>{venue.price} 元/时段</div>
        <div className="detail-info-row">👥 <strong>容量：</strong>{venue.capacity} 人</div>
        <div className="detail-info-row" style={{ color: '#f5a623' }}>
          <strong>评分：</strong> {renderStars(venue.rating)} {venue.rating.toFixed(1)} ({venue.reviewCount}条评价)
        </div>
      </div>

      {/* Facilities */}
      <div className="detail-section">
        <h2>🏷️ 设施服务</h2>
        <div className="facility-tags">
          {venue.facilities.map((f) => (
            <span key={f} className="facility-tag">{f}</span>
          ))}
        </div>
      </div>

      {/* Calendar & Booking */}
      <div className="detail-section">
        <h2>📅 选择预约时段</h2>

        {/* Calendar navigation */}
        <div className="calendar-header">
          <button className="calendar-nav-btn" onClick={() => setWeekOffset((w) => w - 1)} disabled={weekOffset <= 0}>
            ‹ 上一周
          </button>
          <h3>
            {weekDays[0].getFullYear()}年{weekDays[0].getMonth() + 1}月
          </h3>
          <button className="calendar-nav-btn" onClick={() => setWeekOffset((w) => w + 1)}>
            下一周 ›
          </button>
        </div>

        {/* Day headers */}
        <div className="calendar-grid">
          {DAY_NAMES.map((name) => (
            <div key={name} className="calendar-day-header">周{name}</div>
          ))}
          {weekDays.map((d) => {
            const ds = dateStr(d);
            const isPast = d < today;
            const isToday = ds === todayStr;
            const isSelected = ds === selectedDate;
            return (
              <div
                key={ds}
                className={`calendar-day${isPast ? ' past' : ''}${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}`}
                onClick={() => {
                  if (isPast) return;
                  setSelectedDate(ds);
                  setSelectedSlot(null);
                }}
              >
                {d.getDate()}
              </div>
            );
          })}
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div className="time-slots">
            <p style={{ fontWeight: 600, marginBottom: 4 }}>
              {selectedDate} 时段
            </p>
            {TIME_SLOTS.map((slot) => {
              const available = slotAvailable(slot);
              const isSelected = selectedSlot === slot;
              return (
                <div key={slot} className="time-slot-row">
                  <span className="time-slot-label">
                    {slot === 'morning' ? '上午' : slot === 'afternoon' ? '下午' : '晚上'}
                  </span>
                  <button
                    className={`time-slot-btn ${isSelected ? 'selected' : available ? 'available' : 'booked'}`}
                    onClick={() => handleSlotClick(slot)}
                    disabled={!available}
                  >
                    {isSelected ? '✓ 已选择 — ' : ''}{TIME_SLOT_LABELS[slot]}
                    {!available ? ' (已约满)' : ''}
                  </button>
                </div>
              );
            })}

            {/* Book button */}
            {selectedSlot && (
              <div style={{ marginTop: 16 }}>
                <button className="btn-primary" onClick={handleBook}>
                  立即预约 — {venue.price} 元
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="detail-section">
        <h2>💬 用户评价 ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <div className="empty-state" style={{ padding: 30 }}>
            <p>暂无评价</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <span className="review-user">{review.userName}</span>
                <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="review-stars">{renderStars(review.rating)}</div>
              <div className="review-text">{review.comment}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
