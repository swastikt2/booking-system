'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

import { Suspense } from 'react';

function HotelSearchForm() {
  const params = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recommended');

  useEffect(() => { fetchHotels(); }, [params, sortBy]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const { data } = await searchAPI.hotels({
        city: params.get('city'), checkin: params.get('checkin'),
        checkout: params.get('checkout'), rooms: params.get('rooms') || 1,
        adults: params.get('adults') || 2, sortBy
      });
      setHotels(data.data || []);
    } catch { toast.error('Search failed'); }
    setLoading(false);
  };

  const renderStars = (n) => '⭐'.repeat(n);

  return (
    <div className="results-page container">
      <div className="results-header">
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 24 }}>Hotels in {params.get('city') || 'India'}</h2>
          <p className="results-count">{hotels.length} properties found</p>
        </div>
        <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="recommended">Recommended</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Rating: Best First</option>
        </select>
      </div>

      <div className="results-grid">
        {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 12 }} />) :
        hotels.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏨</div>
            <h3>No hotels found</h3><p style={{ color: 'var(--text-light)' }}>Try a different city or dates</p>
          </div>
        ) : hotels.map(hotel => (
          <a key={hotel.id} href={`/hotel/${hotel.id}`} className="result-card" style={{ gridTemplateColumns: '240px 1fr auto', textDecoration: 'none' }}>
            <div style={{ height: 160, borderRadius: 8, overflow: 'hidden' }}>
              <img src={hotel.images?.[0] || `https://picsum.photos/seed/${hotel.slug}/400/300`} alt={hotel.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <h3 style={{ fontWeight: 700, fontSize: 18 }}>{hotel.name}</h3>
                <span style={{ fontSize: 12 }}>{renderStars(hotel.starRating)}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 8 }}>{hotel.address}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                {(Array.isArray(hotel.amenities) ? hotel.amenities : []).slice(0, 4).map((a, i) => (
                  <span key={i} className="badge badge-info">{a}</span>
                ))}
              </div>
              {hotel.avgRating && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ background: 'var(--primary)', color: '#fff', padding: '4px 8px', borderRadius: 6, fontWeight: 700, fontSize: 13 }}>{hotel.avgRating}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-light)' }}>{hotel.reviewCount} reviews</span>
                </div>
              )}
              {hotel.cancellationPolicy === 'FREE_CANCELLATION' && <span className="badge badge-success" style={{ marginTop: 6 }}>Free Cancellation</span>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{hotel.nights || 1} night{hotel.nights > 1 ? 's' : ''}</div>
              <div style={{ fontWeight: 800, fontSize: 24, color: 'var(--primary)', marginTop: 4 }}>{formatPrice(hotel.cheapestPrice)}</div>
              <div style={{ fontSize: 12, color: 'var(--text-light)' }}>per night</div>
              {hotel.totalPrice && <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>Total: {formatPrice(hotel.totalPrice)}</div>}
              {hotel.availableRooms <= 3 && <div className="urgency-badge" style={{ marginTop: 8 }}>🔥 Only {hotel.availableRooms} left!</div>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}


export default function HotelSearchPage() { return <Suspense fallback={<div style={{padding: 60, textAlign: 'center'}}>Loading search results...</div>}><HotelSearchForm /></Suspense>; }