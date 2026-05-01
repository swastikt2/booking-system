'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { hotelAPI, bookingAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function HotelDetailPage() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    hotelAPI.get(id).then(res => { setHotel(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!user) return router.push('/auth/login');
    if (!selectedRoom) return toast.error('Please select a room');
    router.push(`/checkout?type=HOTEL&id=${id}&roomId=${selectedRoom.id}`);
  };

  if (loading) return <div className="container" style={{ padding: 60 }}>{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12, marginBottom: 16 }} />)}</div>;
  if (!hotel) return <div className="container" style={{ padding: 60, textAlign: 'center' }}><h2>Hotel not found</h2></div>;

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      {/* Gallery */}
      <div className="hotel-gallery">
        <img src={hotel.images?.[0] || `https://picsum.photos/seed/${hotel.slug}/800/600`} alt={hotel.name} />
        <img src={`https://picsum.photos/seed/${hotel.slug}-2/400/300`} alt="" />
        <img src={`https://picsum.photos/seed/${hotel.slug}-3/400/300`} alt="" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <h1 style={{ fontWeight: 800, fontSize: 28 }}>{hotel.name}</h1>
            <span>{'⭐'.repeat(hotel.starRating)}</span>
          </div>
          <p style={{ color: 'var(--text-light)', marginBottom: 16 }}>{hotel.address}, {hotel.city}</p>
          {hotel.cancellationPolicy === 'FREE_CANCELLATION' && <span className="badge badge-success" style={{ marginBottom: 16 }}>✓ Free Cancellation</span>}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {(Array.isArray(hotel.amenities) ? hotel.amenities : []).map((a, i) => <span key={i} className="badge badge-info">{a}</span>)}
          </div>

          <p style={{ lineHeight: 1.8, marginBottom: 32 }}>{hotel.description}</p>

          {/* Room Types */}
          <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 16 }}>Choose Your Room</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {hotel.roomTypes?.map(room => (
              <div key={room.id} className="card" onClick={() => setSelectedRoom(room)}
                style={{ cursor: 'pointer', border: selectedRoom?.id === room.id ? '2px solid var(--primary)' : '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 16 }}>{room.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-light)' }}>{room.bedType} bed • {room.maxOccupancy} guests • {room.size}m²</p>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    {(Array.isArray(room.amenities) ? room.amenities : []).slice(0, 3).map((a, i) => <span key={i} className="badge badge-info" style={{ fontSize: 11 }}>{a}</span>)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--primary)' }}>{formatPrice(room.currentPrice)}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)' }}>per night</div>
                  {room.availableRooms <= 3 && <div className="urgency-badge" style={{ marginTop: 6 }}>🔥 {room.availableRooms} left</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Reviews */}
          <h2 style={{ fontWeight: 800, fontSize: 22, margin: '32px 0 16px' }}>Reviews ({hotel.reviewCount})</h2>
          {hotel.reviews?.map(review => (
            <div key={review.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div><strong>{review.user?.fullName}</strong> {review.verifiedStay && <span className="badge badge-success" style={{ fontSize: 10 }}>Verified</span>}</div>
                <span style={{ background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 13 }}>{review.rating}/5</span>
              </div>
              {review.title && <h4 style={{ marginBottom: 4 }}>{review.title}</h4>}
              <p style={{ fontSize: 14, color: 'var(--text-light)' }}>{review.body}</p>
            </div>
          ))}
        </div>

        {/* Booking Sidebar */}
        <div>
          <div className="card" style={{ position: 'sticky', top: 100 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Book This Hotel</h3>
            {hotel.avgRating && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
                <span style={{ background: 'var(--primary)', color: '#fff', padding: '6px 10px', borderRadius: 8, fontWeight: 800, fontSize: 16 }}>{hotel.avgRating}</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{hotel.avgRating >= 4 ? 'Excellent' : hotel.avgRating >= 3 ? 'Good' : 'Average'}</span>
              </div>
            )}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-light)' }}>Price per night</span>
                <span style={{ fontWeight: 700 }}>{formatPrice(selectedRoom?.currentPrice || hotel.basePrice)}</span>
              </div>
            </div>
            <button onClick={handleBook} className="btn btn-accent btn-lg" style={{ width: '100%', marginTop: 16 }}>
              {selectedRoom ? 'Book Now' : 'Select a Room First'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
