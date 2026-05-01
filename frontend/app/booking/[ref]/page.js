'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { bookingAPI } from '@/lib/api';
import { formatPrice, formatDate, formatTime } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export default function BookingDetailPage() {
  const { ref } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    bookingAPI.get(ref).then(res => setBooking(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [ref, user]);

  if (loading) return <div className="container" style={{ padding: 60 }}><div className="skeleton" style={{ height: 300, borderRadius: 12 }} /></div>;
  if (!booking) return <div className="container" style={{ padding: 60, textAlign: 'center' }}><h2>Booking not found</h2></div>;

  return (
    <div className="container" style={{ padding: '32px 20px', maxWidth: 800, margin: '0 auto' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{booking.status === 'CONFIRMED' ? '✅' : booking.status === 'CANCELLED' ? '❌' : '⏳'}</div>
          <h1 style={{ fontWeight: 800, fontSize: 28 }}>Booking {booking.status === 'CONFIRMED' ? 'Confirmed' : booking.status}</h1>
          <p style={{ color: 'var(--text-light)', fontSize: 16 }}>Reference: <strong>{booking.bookingRef}</strong></p>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Booking Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><span style={{ color: 'var(--text-light)', fontSize: 13 }}>Type</span><br/><strong>{booking.bookingType}</strong></div>
            <div><span style={{ color: 'var(--text-light)', fontSize: 13 }}>Status</span><br/><strong>{booking.status}</strong></div>
            <div><span style={{ color: 'var(--text-light)', fontSize: 13 }}>Booked On</span><br/><strong>{formatDate(booking.createdAt)}</strong></div>
            <div><span style={{ color: 'var(--text-light)', fontSize: 13 }}>Passengers</span><br/><strong>{booking.adults} Adult(s){booking.children > 0 ? `, ${booking.children} Child(ren)` : ''}</strong></div>
          </div>
        </div>

        <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Price Breakdown</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Base Amount</span><span>{formatPrice(booking.baseAmount)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>GST</span><span>{formatPrice(booking.gstAmount)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Convenience Fee</span><span>{formatPrice(booking.convenienceFee)}</span></div>
          {booking.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'var(--success)' }}><span>Discount</span><span>-{formatPrice(booking.discount)}</span></div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 20, borderTop: '2px solid var(--border)', paddingTop: 12, marginTop: 12 }}>
            <span>Total</span><span style={{ color: 'var(--primary)' }}>{formatPrice(booking.totalAmount)}</span>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>

        </div>
      </div>
    </div>
  );
}
