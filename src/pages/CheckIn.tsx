/* ================================================================
   CheckIn.tsx — Check-in code display and verification
   ================================================================ */

import React, { useMemo } from 'react';
import { getBookingById, updateBooking } from '../utils/storage';
import { VENUE_TYPE_LABELS, TIME_SLOT_LABELS } from '../types';

interface Props {
  bookingId: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

function drawQRCode(canvas: HTMLCanvasElement, text: string) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const size = 160;
  canvas.width = size;
  canvas.height = size;

  // Generate a deterministic pattern from the code
  const cellSize = 8;
  const grid = size / cellSize;

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#333';

  // Draw position patterns (top-left, top-right, bottom-left)
  const patterns = [[0, 0], [grid - 7, 0], [0, grid - 7]];
  for (const [px, py] of patterns) {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        if (y === 0 || y === 6 || x === 0 || x === 6 || (y >= 2 && y <= 4 && x >= 2 && x <= 4)) {
          ctx.fillRect((px + x) * cellSize, (py + y) * cellSize, cellSize, cellSize);
        }
      }
    }
  }

  // Fill data cells based on code hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      // Skip position pattern areas
      if ((x < 8 && y < 8) || (x >= grid - 8 && y < 8) || (x < 8 && y >= grid - 8)) continue;
      hash = ((hash * 16807) % 2147483647);
      if (hash % 3 !== 0) {
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }
}

function QRCodeCanvas({ code }: { code: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (canvasRef.current) {
      drawQRCode(canvasRef.current, code);
    }
  }, [code]);

  return (
    <div className="checkin-qr">
      <canvas ref={canvasRef} style={{ width: 160, height: 160 }} />
    </div>
  );
}

export default function CheckIn({ bookingId, onNavigate, showToast }: Props) {
  const booking = useMemo(() => getBookingById(bookingId), [bookingId]);

  if (!booking) {
    return (
      <div className="main-content">
        <div className="empty-state">
          <div className="icon">❌</div>
          <p>预约记录不存在</p>
          <button className="btn-secondary" style={{ marginTop: 16 }} onClick={() => onNavigate('bookings')}>
            返回我的预约
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="checkin-card">
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>签到码</h2>
        <p style={{ color: '#888', marginBottom: 8 }}>到场后出示此码核销</p>

        <div className="checkin-code">{booking.checkinCode}</div>

        <QRCodeCanvas code={booking.checkinCode} />

        <div style={{ textAlign: 'left', marginTop: 24 }}>
          <div className="detail-info-row" style={{ justifyContent: 'center' }}>
            <strong>{booking.venueName}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8, color: '#666', fontSize: '0.9rem' }}>
            <span>📅 {booking.date}</span>
            <span>🕐 {TIME_SLOT_LABELS[booking.timeSlot]}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 4, color: '#666', fontSize: '0.9rem' }}>
            <span>👥 {booking.peopleCount} 人</span>
            <span>👤 {booking.contactName}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={() => onNavigate('bookings')}>
            返回我的预约
          </button>
          {booking.status === 'pending' && (
            <button
              className="btn-primary"
              style={{ flex: 1 }}
              onClick={() => {
                updateBooking(bookingId, { status: 'completed', checkedInAt: new Date().toISOString() });
                showToast('签到成功！', 'success');
                onNavigate('bookings');
              }}
            >
              模拟签到
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
