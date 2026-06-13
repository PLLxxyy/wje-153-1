/* ================================================================
   VenueManagement.tsx — Admin venue management page
   ================================================================ */

import React, { useState, useMemo } from 'react';
import type { Venue, Booking, VenueType } from '../types';
import { VENUE_TYPE_LABELS, TIME_SLOT_LABELS, VENUE_TYPE_TAG_CLASS } from '../types';
import { getVenues, getBookings, updateBooking, saveVenues } from '../utils/storage';

interface Props {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function VenueManagement({ onNavigate, showToast }: Props) {
  const [venues, setVenues] = useState<Venue[]>(() => getVenues());
  const [bookings, setBookings] = useState<Booking[]>(() => getBookings());
  const [activeTab, setActiveTab] = useState<'today' | 'venues'>('today');
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  const todayBookings = useMemo(() => {
    return bookings
      .filter((b) => b.date === todayStr && b.status === 'pending')
      .sort((a, b) => {
        const slotOrder = { morning: 0, afternoon: 1, evening: 2 };
        return slotOrder[a.timeSlot] - slotOrder[b.timeSlot];
      });
  }, [bookings, todayStr]);

  function handleCheckIn(bookingId: string) {
    updateBooking(bookingId, { status: 'completed', checkedInAt: new Date().toISOString() });
    setBookings(getBookings());
    showToast('签到确认成功', 'success');
  }

  function handleSaveVenue(venue: Venue) {
    const updated = venues.map((v) => (v.id === venue.id ? venue : v));
    saveVenues(updated);
    setVenues(updated);
    setEditingVenue(null);
    showToast('场地信息已更新', 'success');
  }

  return (
    <div className="main-content" style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>场地管理</h1>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`} onClick={() => setActiveTab('today')}>
          今日预约 ({todayBookings.length})
        </button>
        <button className={`tab-btn ${activeTab === 'venues' ? 'active' : ''}`} onClick={() => setActiveTab('venues')}>
          场地列表 ({venues.length})
        </button>
      </div>

      {/* Today's Bookings */}
      {activeTab === 'today' && (
        <>
          {todayBookings.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📋</div>
              <p>今日暂无待签到预约</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>场地</th>
                  <th>时段</th>
                  <th>联系人</th>
                  <th>人数</th>
                  <th>签到码</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {todayBookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <strong>{b.venueName}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>{VENUE_TYPE_LABELS[b.venueType]}</div>
                    </td>
                    <td>{TIME_SLOT_LABELS[b.timeSlot]}</td>
                    <td>
                      {b.contactName}
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>{b.contactPhone}</div>
                    </td>
                    <td>{b.peopleCount}人</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#667eea' }}>{b.checkinCode}</td>
                    <td>
                      <button className="btn-success" style={{ fontSize: '0.85rem', padding: '6px 14px' }} onClick={() => handleCheckIn(b.id)}>
                        确认签到
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* Venue List */}
      {activeTab === 'venues' && (
        <>
          {venues.map((venue) => (
            <div key={venue.id} className="booking-card" style={{ alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <strong style={{ fontSize: '1.05rem' }}>{venue.name}</strong>
                  <span className={`venue-card-tag ${VENUE_TYPE_TAG_CLASS[venue.type]}`} style={{ fontSize: '0.75rem' }}>
                    {VENUE_TYPE_LABELS[venue.type]}
                  </span>
                </div>
                <div style={{ color: '#888', fontSize: '0.85rem' }}>📍 {venue.location}</div>
                <div style={{ color: '#888', fontSize: '0.85rem' }}>💰 {venue.price}元/时段 | 👥 容量{venue.capacity}人</div>
              </div>
              <button className="btn-secondary" style={{ fontSize: '0.85rem', padding: '8px 16px' }} onClick={() => setEditingVenue(venue)}>
                编辑
              </button>
            </div>
          ))}
        </>
      )}

      {/* Edit Modal */}
      {editingVenue && (
        <EditVenueModal
          venue={editingVenue}
          onSave={handleSaveVenue}
          onClose={() => setEditingVenue(null)}
        />
      )}
    </div>
  );
}

/* ---------- Edit Modal ---------- */

function EditVenueModal({
  venue,
  onSave,
  onClose,
}: {
  venue: Venue;
  onSave: (v: Venue) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(venue.name);
  const [location, setLocation] = useState(venue.location);
  const [description, setDescription] = useState(venue.description);
  const [price, setPrice] = useState(venue.price);
  const [capacity, setCapacity] = useState(venue.capacity);
  const [contactPhone, setContactPhone] = useState(venue.contactPhone);
  const [openingHours, setOpeningHours] = useState(venue.openingHours);
  const [facilitiesStr, setFacilitiesStr] = useState(venue.facilities.join(', '));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...venue,
      name: name.trim(),
      location: location.trim(),
      description: description.trim(),
      price,
      capacity,
      contactPhone: contactPhone.trim(),
      openingHours: openingHours.trim(),
      facilities: facilitiesStr.split(',').map((s) => s.trim()).filter(Boolean),
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>编辑场地信息</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>场地名称</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>地址</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>描述</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>价格 (元/时段)</label>
              <input type="number" value={price} onChange={(e) => setPrice(parseInt(e.target.value) || 0)} />
            </div>
            <div className="form-group">
              <label>容量 (人)</label>
              <input type="number" value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value) || 1)} />
            </div>
          </div>
          <div className="form-group">
            <label>联系电话</label>
            <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label>营业时间</label>
            <input value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} />
          </div>
          <div className="form-group">
            <label>设施 (逗号分隔)</label>
            <input value={facilitiesStr} onChange={(e) => setFacilitiesStr(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>取消</button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>保存</button>
          </div>
        </form>
      </div>
    </div>
  );
}
