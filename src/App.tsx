/* ================================================================
   App.tsx — Root component with simple hash-based routing
   ================================================================ */

import React, { useState, useEffect, useCallback } from 'react';
import { seedData } from './utils/seed';
import { getUser } from './utils/storage';

import Home from './pages/Home';
import CourtDetail from './pages/CourtDetail';
import BookingForm from './pages/BookingForm';
import MyBookings from './pages/MyBookings';
import CheckIn from './pages/CheckIn';
import ReviewPage from './pages/ReviewPage';
import VenueManagement from './pages/VenueManagement';
import Profile from './pages/Profile';

/* ---------- Types ---------- */

type Page = 'home' | 'detail' | 'booking' | 'bookings' | 'checkin' | 'review' | 'admin' | 'profile';

interface RouterState {
  page: Page;
  params: Record<string, string>;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

/* ---------- App ---------- */

export default function App() {
  // Initialize seed data on first load
  useEffect(() => {
    seedData();
  }, []);

  const [router, setRouter] = useState<RouterState>({ page: 'home', params: {} });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [bookingRefreshKey, setBookingRefreshKey] = useState(0);
  const [user, setUser] = useState(() => getUser());

  /* ---- Navigation ---- */
  const navigate = useCallback((page: string, params: Record<string, string> = {}) => {
    setRouter({ page: page as Page, params });
    setBookingRefreshKey((k) => k + 1);
    setUser(getUser()); // refresh user state on every navigation
    window.scrollTo(0, 0);
  }, []);

  /* ---- Toast ---- */
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  /* ---- Page rendering ---- */
  function renderPage() {
    switch (router.page) {
      case 'home':
        return <Home onNavigate={navigate} />;
      case 'detail':
        return <CourtDetail venueId={router.params.id} onNavigate={navigate} />;
      case 'booking':
        return (
          <BookingForm
            venueId={router.params.venueId}
            date={router.params.date}
            timeSlot={router.params.timeSlot as any}
            onNavigate={navigate}
            showToast={showToast}
          />
        );
      case 'bookings':
        return <MyBookings onNavigate={navigate} showToast={showToast} refreshKey={bookingRefreshKey} />;
      case 'checkin':
        return <CheckIn bookingId={router.params.bookingId} onNavigate={navigate} showToast={showToast} />;
      case 'review':
        return <ReviewPage bookingId={router.params.bookingId} onNavigate={navigate} showToast={showToast} />;
      case 'admin':
        return <VenueManagement onNavigate={navigate} showToast={showToast} />;
      case 'profile':
        return <Profile onNavigate={navigate} showToast={showToast} />;
      default:
        return <Home onNavigate={navigate} />;
    }
  }

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('home')}>
          🏟️ 运动预约
        </div>
        <div className="navbar-links">
          <a
            href="#"
            className={router.page === 'home' ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); navigate('home'); }}
          >
            首页
          </a>
          <a
            href="#"
            className={router.page === 'bookings' ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); navigate('bookings'); }}
          >
            我的预约
          </a>
          {user.isAdmin && (
            <a
              href="#"
              className={router.page === 'admin' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); navigate('admin'); }}
            >
              场地管理
            </a>
          )}
          <a
            href="#"
            className={router.page === 'profile' ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); navigate('profile'); }}
          >
            个人中心
          </a>
        </div>
      </nav>

      {/* Main content */}
      {renderPage()}

      {/* Toast notifications */}
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
