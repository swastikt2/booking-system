'use client';
import { useEffect, useState } from 'react';
import { bookingAPI } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

const STATUS_COLORS = { CONFIRMED: 'badge-success', PENDING: 'badge-warning', CANCELLED: 'badge-danger', COMPLETED: 'badge-info', EXPIRED: 'badge-danger', HELD: 'badge-warning' };
const TYPE_ICONS = { HOTEL: '🏨', FLIGHT: '✈️', TRAIN: '🚂', BUS: '🚌' };

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    bookingAPI.myBookings({ page: 1, limit: 20 }).then(res => setBookings(res.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const handleCancel = async (ref) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await bookingAPI.cancel(ref);
      toast.success('Booking cancelled');
      setBookings(prev => prev.map(b => b.bookingRef === ref ? { ...b, status: 'CANCELLED' } : b));
    } catch (err) { toast.error('Cancel failed'); }
  };

  if (!user) return <div className="container" style={{ padding: 60, textAlign: 'center' }}><h2>Please <a href="/auth/login" style={{ color: 'var(--primary)' }}>login</a> to view bookings</h2></div>;

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <h1 style={{ fontWeight: 800, fontSize: 28, marginBottom: 24 }}>My Bookings 📋</h1>
      {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12, marginBottom: 16 }} />) :
      bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}><div style={{ fontSize: 48, marginBottom: 16 }}>📋</div><h3>No bookings yet</h3><p style={{ color: 'var(--text-light)' }}>Start planning your trip!</p><a href="/" className="btn btn-primary" style={{ marginTop: 16 }}>Search Now</a></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {bookings.map(booking => (
            <div key={booking.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 32 }}>{TYPE_ICONS[booking.bookingType]}</div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 16 }}>{booking.hotel?.name || booking.flight?.airline + ' ' + (booking.flight?.flightNumber || '') || booking.train?.trainName || booking.bus?.operator || booking.bookingType}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-light)' }}>Ref: {booking.bookingRef} • {formatDate(booking.createdAt)}</p>
                  <span className={`badge ${STATUS_COLORS[booking.status] || 'badge-info'}`}>{booking.status}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--primary)' }}>{formatPrice(booking.totalAmount)}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <a href={`/booking/${booking.bookingRef}`} className="btn btn-outline btn-sm">View</a>
                  {['PENDING', 'CONFIRMED', 'HELD'].includes(booking.status) && (
                    <button onClick={() => handleCancel(booking.bookingRef)} className="btn btn-danger btn-sm">Cancel</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
