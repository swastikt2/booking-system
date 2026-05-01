'use client';
import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      adminAPI.stats().then(res => setStats(res.data.data)).catch(() => {}).finally(() => setLoading(false));
    } else { setLoading(false); }
  }, [user]);

  if (!user || user.role !== 'ADMIN') return <div className="container" style={{ padding: 60, textAlign: 'center' }}><h2>Admin access required</h2><p>Login as admin@travelnest.com</p></div>;

  if (loading) return <div className="container" style={{ padding: 60 }}>{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12, marginBottom: 16 }} />)}</div>;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: '👥', color: '#003580' },
    { label: 'Total Bookings', value: stats?.totalBookings, icon: '📋', color: '#00a698' },
    { label: 'Today Bookings', value: stats?.todayBookings, icon: '📅', color: '#ff8c00' },
    { label: 'Revenue (Demo)', value: formatPrice(stats?.totalRevenue || 0), icon: '💰', color: '#d4111e' },
    { label: 'Confirmed', value: stats?.confirmedBookings, icon: '✅', color: '#059669' },
    { label: 'Cancelled', value: stats?.cancelledBookings, icon: '❌', color: '#dc2626' },
    { label: 'Hotels', value: stats?.inventory?.hotels, icon: '🏨', color: '#6366f1' },
    { label: 'Flights', value: stats?.inventory?.flights, icon: '✈️', color: '#0ea5e9' },
  ];

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 28 }}>Admin Dashboard 🎛️</h1>
          <p style={{ color: 'var(--text-light)' }}>Live booking & revenue stats</p>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {statCards.map((s, i) => (
          <div key={i} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 24, color: s.color }}>{s.value || 0}</div>
            <div style={{ fontSize: 13, color: 'var(--text-light)', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Booking Type Breakdown */}
      {stats?.bookingsByType && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Bookings by Type</h3>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {stats.bookingsByType.map((bt, i) => (
              <div key={i} style={{ flex: 1, minWidth: 120, textAlign: 'center', padding: 16, background: '#f8fafc', borderRadius: 12 }}>
                <div style={{ fontWeight: 800, fontSize: 20 }}>{bt._count?.id || 0}</div>
                <div style={{ fontSize: 13, color: 'var(--text-light)' }}>{bt.bookingType}</div>
                <div style={{ fontSize: 12, color: 'var(--primary)' }}>{formatPrice(bt._sum?.totalAmount || 0)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Recent Bookings</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: 12, color: 'var(--text-light)', fontSize: 12, textTransform: 'uppercase' }}>Ref</th>
                <th style={{ textAlign: 'left', padding: 12, color: 'var(--text-light)', fontSize: 12 }}>User</th>
                <th style={{ textAlign: 'left', padding: 12, color: 'var(--text-light)', fontSize: 12 }}>Type</th>
                <th style={{ textAlign: 'left', padding: 12, color: 'var(--text-light)', fontSize: 12 }}>Amount</th>
                <th style={{ textAlign: 'left', padding: 12, color: 'var(--text-light)', fontSize: 12 }}>Status</th>
                <th style={{ textAlign: 'left', padding: 12, color: 'var(--text-light)', fontSize: 12 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentBookings?.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 12, fontWeight: 600 }}>{b.bookingRef}</td>
                  <td style={{ padding: 12 }}>{b.user?.fullName}</td>
                  <td style={{ padding: 12 }}>{b.bookingType}</td>
                  <td style={{ padding: 12, fontWeight: 700 }}>{formatPrice(b.totalAmount)}</td>
                  <td style={{ padding: 12 }}><span className={`badge ${b.status === 'CONFIRMED' ? 'badge-success' : 'badge-warning'}`}>{b.status}</span></td>
                  <td style={{ padding: 12, color: 'var(--text-light)' }}>{formatDate(b.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
