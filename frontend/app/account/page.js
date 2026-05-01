'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { userAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const [loyalty, setLoyalty] = useState(null);

  useEffect(() => {
    if (user) userAPI.loyaltyPoints().then(res => setLoyalty(res.data.data)).catch(() => {});
  }, [user]);

  if (!user) return <div className="container" style={{ padding: 60, textAlign: 'center' }}><h2>Please <a href="/auth/login" style={{ color: 'var(--primary)' }}>login</a></h2></div>;

  return (
    <div className="container" style={{ padding: '32px 20px', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontWeight: 800, fontSize: 28, marginBottom: 24 }}>My Account 👤</h1>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Profile</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><span style={{ color: 'var(--text-light)', fontSize: 13 }}>Name</span><br/><strong>{user.fullName}</strong></div>
          <div><span style={{ color: 'var(--text-light)', fontSize: 13 }}>Email</span><br/><strong>{user.email}</strong></div>
          <div><span style={{ color: 'var(--text-light)', fontSize: 13 }}>Role</span><br/><strong>{user.role}</strong></div>
          <div><span style={{ color: 'var(--text-light)', fontSize: 13 }}>Tier</span><br/><span className="badge badge-info">{user.tier || loyalty?.tier}</span></div>
        </div>
      </div>
      {loyalty && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #feba02 0%, #ff8c00 100%)', color: '#1a1a2e' }}>
            <div style={{ fontSize: 36, fontWeight: 800 }}>{loyalty.loyaltyPoints}</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>🏆 Loyalty Points</div>
          </div>
          <div className="card" style={{ textAlign: 'center', background: 'var(--gradient-primary)', color: '#fff' }}>
            <div style={{ fontSize: 36, fontWeight: 800 }}>{formatPrice(loyalty.travelCredits || 0)}</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>💳 Travel Credits</div>
          </div>
        </div>
      )}
      <button onClick={() => { logout(); window.location.href = '/'; }} className="btn btn-danger">Logout</button>
    </div>
  );
}
