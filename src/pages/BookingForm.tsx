/* ================================================================
   BookingForm.tsx — Booking confirmation form
   ================================================================ */

import React, { useState, useMemo } from 'react';
import type { TimeSlot } from '../types';
import { VENUE_TYPE_LABELS, VENUE_TYPE_TAG_CLASS, TIME_SLOT_LABELS } from '../types';
import { getVenueById, addBooking, getDaySlot, upsertDaySlot, getUser } from '../utils/storage';

interface Props {
  venueId: string;
  date: string;
  timeSlot: TimeSlot;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

function generateCheckinCode(): string {
  return String(100000 + Math.floor(Math.random() * 900000));
}

export default function BookingForm({ venueId, date, timeSlot, onNavigate, showToast }: Props) {
  const venue = useMemo(() => getVenueById(venueId), [venueId]);
  const user = useMemo(() => getUser(), []);

  const [peopleCount, setPeopleCount] = useState(1);
  const [contactName, setContactName] = useState(user.name || '');
  const [contactPhone, setContactPhone] = useState(user.phone || '');
  const [submitting, setSubmitting] = useState(false);

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

  const timeSlotLabel = TIME_SLOT_LABELS[timeSlot];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) {
      showToast('请填写姓名和手机号', 'error');
      return;
    }
    if (peopleCount < 1 || peopleCount > venue!.capacity) {
      showToast(`人数范围: 1 - ${venue!.capacity}`, 'error');
      return;
    }

    setSubmitting(true);
    const checkinCode = generateCheckinCode();
    const bookingId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

    const booking = {
      id: bookingId,
      venueId: venue!.id,
      venueName: venue!.name,
      venueType: venue!.type,
      date,
      timeSlot,
      peopleCount,
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      checkinCode,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    addBooking(booking);

    // Update day slot availability
    const existing = getDaySlot(venueId, date);
    const updatedSlot = existing
      ? { ...existing }
      : {
          date,
          venueId,
          morning: { available: true, maxCapacity: venue!.capacity, currentCount: 0 },
          afternoon: { available: true, maxCapacity: venue!.capacity, currentCount: 0 },
          evening: { available: true, maxCapacity: venue!.capacity, currentCount: 0 },
        };

    const slotData = updatedSlot[timeSlot];
    slotData.currentCount += peopleCount;
    if (slotData.currentCount >= slotData.maxCapacity) {
      slotData.available = false;
      slotData.bookingId = bookingId;
    }
    upsertDaySlot(updatedSlot);

    showToast('预约成功！请查看签到码', 'success');
    onNavigate('checkin', { bookingId });
  }

  return (
    <div className="main-content" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="breadcrumb">
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>首页</a>
        <span>/</span>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('detail', { id: venueId }); }}>{venue.name}</a>
        <span>/</span>
        <span>预约确认</span>
      </div>

      <div className="detail-section">
        <h2>📋 预约确认</h2>

        {/* Summary */}
        <div style={{ background: '#f8f9ff', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 12 }}>{venue.name}</div>
          <div className="detail-info-row">
            <span className={`venue-card-tag ${VENUE_TYPE_TAG_CLASS[venue.type]}`}
              style={{ display: 'inline-block' }}>
              {VENUE_TYPE_LABELS[venue.type]}
            </span>
          </div>
          <div className="detail-info-row">📅 <strong>日期：</strong>{date}</div>
          <div className="detail-info-row">🕐 <strong>时段：</strong>{timeSlotLabel}</div>
          <div className="detail-info-row">💰 <strong>费用：</strong>{venue.price} 元</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>预约人数</label>
            <input
              type="number"
              min={1}
              max={venue.capacity}
              value={peopleCount}
              onChange={(e) => setPeopleCount(parseInt(e.target.value) || 1)}
            />
            <p style={{ fontSize: '0.8rem', color: '#999', marginTop: 4 }}>最大容纳 {venue.capacity} 人</p>
          </div>

          <div className="form-group">
            <label>联系人姓名</label>
            <input
              type="text"
              placeholder="请输入姓名"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>联系人手机号</label>
            <input
              type="tel"
              placeholder="请输入手机号"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              maxLength={11}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => onNavigate('detail', { id: venueId })}>
              返回修改
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? '提交中...' : '确认预约'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
