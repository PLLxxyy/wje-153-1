/* ================================================================
   ReviewPage.tsx — Write a review for a completed booking
   ================================================================ */

import React, { useState, useMemo } from 'react';
import { getBookingById, updateBooking, addReview, getVenueById, getReviews, saveVenues, getVenues } from '../utils/storage';

interface Props {
  bookingId: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function ReviewPage({ bookingId, onNavigate, showToast }: Props) {
  const booking = useMemo(() => getBookingById(bookingId), [bookingId]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!booking) {
    return (
      <div className="main-content">
        <div className="empty-state">
          <div className="icon">❌</div>
          <p>预约记录不存在</p>
        </div>
      </div>
    );
  }

  const currentBooking = booking;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('请输入评价内容', 'error');
      return;
    }
    setSubmitting(true);

    const review = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      venueId: currentBooking.venueId,
      bookingId: currentBooking.id,
      userId: 'user_1',
      userName: currentBooking.contactName,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    addReview(review);

    // Update booking with rating
    updateBooking(bookingId, { rating, review: comment.trim() });

    // Update venue rating (recalculate average)
    const venue = getVenueById(currentBooking.venueId);
    if (venue) {
      const allReviews = getReviews().filter((r) => r.venueId === currentBooking.venueId);
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      const venues = getVenues();
      const idx = venues.findIndex((v) => v.id === currentBooking.venueId);
      if (idx >= 0) {
        venues[idx] = { ...venues[idx], rating: Math.round(avgRating * 10) / 10, reviewCount: allReviews.length };
        saveVenues(venues);
      }
    }

    showToast('评价提交成功！', 'success');
    onNavigate('bookings');
  }

  const displayRating = hoverRating || rating;

  return (
    <div className="main-content" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="breadcrumb">
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('bookings'); }}>我的预约</a>
        <span>/</span>
        <span>评价</span>
      </div>

      <div className="detail-section">
        <h2>⭐ 评价场地</h2>
        <div style={{ background: '#f8f9ff', borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <strong>{booking.venueName}</strong>
          <div style={{ color: '#888', fontSize: '0.9rem', marginTop: 4 }}>
            {booking.date} | {booking.timeSlot === 'morning' ? '上午' : booking.timeSlot === 'afternoon' ? '下午' : '晚上'}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>评分</label>
            <div className="star-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${star <= displayRating ? 'filled' : ''}`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
              <span style={{ marginLeft: 8, fontSize: '1rem', color: '#f5a623', fontWeight: 600 }}>
                {displayRating} 分
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>评价内容</label>
            <textarea
              rows={4}
              placeholder="分享您的体验..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => onNavigate('bookings')}>
              取消
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? '提交中...' : '提交评价'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
