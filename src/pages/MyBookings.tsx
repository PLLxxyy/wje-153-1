/* ================================================================
   MyBookings.tsx — My bookings list with tabs
   ================================================================ */

import React, { useState, useMemo } from 'react';
import type { Booking, BookingStatus } from '../types';
import { VENUE_TYPE_LABELS, TIME_SLOT_LABELS } from '../types';
import { getBookings, updateBooking, getDaySlot, upsertDaySlot } from '../utils/storage';

interface Props {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  refreshKey?: number;
}

const TABS: { key: BookingStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待签到' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: '待签到',
  completed: '已完成',
  cancelled: '已取消',
};

const STATUS_CLASS: Record<BookingStatus, string> = {
  pending: 'status-pending',
  completed: 'status-completed',
  cancelled: 'status-cancelled',
};

export default function MyBookings({ onNavigate, showToast, refreshKey }: Props) {
  const [activeTab, setActiveTab] = useState<BookingStatus | 'all'>('all');

  const bookings = useMemo(() => {
    return getBookings().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [refreshKey]);

  const filtered = useMemo(() => {
    if (activeTab === 'all') return bookings;
    return bookings.filter((b) => b.status === activeTab);
  }, [bookings, activeTab]);

  function handleCancel(booking: Booking) {
    if (!window.confirm(`确定取消 ${booking.venueName} ${booking.date} 的预约吗？`)) return;

    updateBooking(booking.id, { status: 'cancelled' });

    // Restore slot availability
    const slot = getDaySlot(booking.venueId, booking.date);
    if (slot) {
      const slotData = slot[booking.timeSlot];
      slotData.currentCount = Math.max(0, slotData.currentCount - booking.peopleCount);
      slotData.available = true;
      delete slotData.bookingId;
      upsertDaySlot(slot);
    }

    showToast('预约已取消', 'success');
    setActiveTab('cancelled');
  }

  return (
    <div className="main-content" style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>我的预约</h1>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.key !== 'all' && (
              <span style={{ marginLeft: 4, fontSize: '0.8rem', opacity: 0.7 }}>
                ({bookings.filter((b) => tab.key === 'all' || b.status === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📋</div>
          <p>暂无预约记录</p>
        </div>
      ) : (
        filtered.map((booking) => (
          <div key={booking.id} className="booking-card">
            <div className="booking-info">
              <h3>{booking.venueName}</h3>
              <div className="booking-detail">🏷️ {VENUE_TYPE_LABELS[booking.venueType]}</div>
              <div className="booking-detail">📅 {booking.date}</div>
              <div className="booking-detail">🕐 {TIME_SLOT_LABELS[booking.timeSlot]}</div>
              <div className="booking-detail">👥 {booking.peopleCount} 人</div>
              <div className="booking-detail">👤 {booking.contactName} / {booking.contactPhone}</div>
              {booking.status === 'pending' && (
                <div className="booking-detail" style={{ color: '#667eea', fontWeight: 600 }}>
                  🔑 签到码：{booking.checkinCode}
                </div>
              )}
            </div>
            <div className="booking-actions">
              <span className={`booking-status ${STATUS_CLASS[booking.status]}`}>
                {STATUS_LABELS[booking.status]}
              </span>
              {booking.status === 'pending' && (
                <>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                    onClick={() => onNavigate('checkin', { bookingId: booking.id })}
                  >
                    查看签到码
                  </button>
                  <button
                    className="btn-danger"
                    style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                    onClick={() => handleCancel(booking)}
                  >
                    取消预约
                  </button>
                </>
              )}
              {booking.status === 'completed' && !booking.rating && (
                <button
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                  onClick={() => onNavigate('review', { bookingId: booking.id })}
                >
                  去评价
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
