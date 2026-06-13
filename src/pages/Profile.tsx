/* ================================================================
   Profile.tsx — User profile / personal center
   ================================================================ */

import React, { useState, useMemo } from 'react';
import { getUser, saveUser } from '../utils/storage';

interface Props {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function Profile({ onNavigate, showToast }: Props) {
  const user = useMemo(() => getUser(), []);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [isAdmin, setIsAdmin] = useState(user.isAdmin);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    saveUser({
      ...user,
      name: name.trim() || '用户',
      phone: phone.trim(),
      isAdmin,
    });
    showToast('个人信息已保存', 'success');
  }

  return (
    <div className="main-content" style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>个人中心</h1>

      <div className="detail-section">
        <h2>👤 个人信息</h2>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>昵称</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入昵称" />
          </div>
          <div className="form-group">
            <label>手机号</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="请输入手机号" maxLength={11} />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              以场地方身份登录（管理端）
            </label>
            <p style={{ fontSize: '0.8rem', color: '#999', marginTop: 4 }}>开启后可进入场地管理页面</p>
          </div>
          <button type="submit" className="btn-primary">保存</button>
        </form>
      </div>

      <div className="detail-section">
        <h2>⚡ 快捷入口</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            className="booking-card"
            style={{ textAlign: 'left', cursor: 'pointer', background: '#fff' }}
            onClick={() => onNavigate('bookings')}
          >
            <div>
              <strong>📋 我的预约</strong>
              <div style={{ color: '#888', fontSize: '0.85rem', marginTop: 4 }}>查看和管理所有预约记录</div>
            </div>
          </button>
          {isAdmin && (
            <button
              className="booking-card"
              style={{ textAlign: 'left', cursor: 'pointer', background: '#fff' }}
              onClick={() => onNavigate('admin')}
            >
              <div>
                <strong>🏟️ 场地管理</strong>
                <div style={{ color: '#888', fontSize: '0.85rem', marginTop: 4 }}>管理场地信息、查看今日预约</div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
