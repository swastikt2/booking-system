'use client';
import { useAuth } from '@/lib/auth';

export default function Header() {
  const { user, logout } = useAuth();
  
  return (
    <header className="header">
      <div className="container header-inner">
        <a href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="Mahasor Journey Logo" style={{ height: '32px', width: 'auto', borderRadius: '4px' }} />
          Mahasor<span> Journey</span>
        </a>
        <nav className="header-nav">
          <a href="/search/flights">✈️ Flights</a>
          <a href="/search/hotels">🏨 Hotels</a>
          <a href="/search/trains">🚂 Trains</a>
          <a href="/search/buses">🚌 Buses</a>
          <a href="/my-bookings">📋 My Bookings</a>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Hi, {user.fullName.split(' ')[0]}</span>
              <button onClick={logout} className="btn btn-sm" style={{ background: '#eee', color: '#333' }}>Logout</button>
            </div>
          ) : (
            <a href="/auth/login" className="btn btn-accent btn-sm">Login</a>
          )}
        </nav>
      </div>
    </header>
  );
}
