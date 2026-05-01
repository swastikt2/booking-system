'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchAPI } from '@/lib/api';
import { formatPrice, formatDuration, formatTime, useSocket } from '@/lib/utils';
import toast from 'react-hot-toast';

import { Suspense } from 'react';

function FlightSearchForm() {
  const params = useSearchParams();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({});
  const [sortBy, setSortBy] = useState('price');
  const [filters, setFilters] = useState({ airlines: [], maxStops: '', maxPrice: '' });
  const { on } = useSocket();

  useEffect(() => {
    fetchFlights();
  }, [params, sortBy]);

  useEffect(() => {
    on?.('price:update', (data) => {
      if (data.type === 'FLIGHT') {
        setFlights(prev => prev.map(f => {
          if (f.id === data.id) {
            const change = parseFloat(data.changePercent);
            toast(change > 0 ? `✈️ ${f.flightNumber} price ↑ ${data.changePercent}%` : `✈️ ${f.flightNumber} price ↓ ${Math.abs(change)}%!`, { className: change > 0 ? 'toast-price-rise' : 'toast-price-drop' });
            return { ...f, economyCurrentPrice: data.newPrice, pricePerPerson: data.newPrice, priceUpdated: true };
          }
          return f;
        }));
        setTimeout(() => setFlights(prev => prev.map(f => ({ ...f, priceUpdated: false }))), 600);
      }
    });
  }, [on]);

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const { data } = await searchAPI.flights({
        from: params.get('from'), to: params.get('to'), date: params.get('date'),
        adults: params.get('adults') || 1, class: params.get('class') || 'ECONOMY',
        sortBy, ...filters
      });
      setFlights(data.data || []);
      setMeta(data.meta || {});
    } catch (err) {
      toast.error('Search failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="results-page container">
      <div className="results-header">
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 24 }}>
            {params.get('from')} → {params.get('to')}
          </h2>
          <p className="results-count">{flights.length} flights found for {params.get('date')}</p>
        </div>
        <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="price">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="duration">Duration: Shortest</option>
          <option value="departure">Departure: Earliest</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Filters */}
        <aside className="filters-sidebar" style={{ display: 'none' }}>
          {/* Can be expanded */}
        </aside>

        {/* Results */}
        <div className="results-grid" style={{ flex: 1 }}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />
            ))
          ) : flights.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✈️</div>
              <h3>No flights found</h3>
              <p style={{ color: 'var(--text-light)' }}>Try different dates or destinations</p>
            </div>
          ) : (
            flights.map(flight => (
              <a key={flight.id} href={`/flight/${flight.id}`} className="result-card" style={{ textDecoration: 'none' }}>
                <div style={{ textAlign: 'center', minWidth: 80 }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>✈️</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{flight.airlineCode}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{flight.flightNumber}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 20 }}>{formatTime(flight.departureTime)}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-light)' }}>{flight.origin}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 4 }}>{formatDuration(flight.duration)}</div>
                    <div style={{ height: 2, background: 'var(--border)', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '50%', top: -4, transform: 'translateX(-50%)', fontSize: 10, color: 'var(--primary)', fontWeight: 700 }}>
                        {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 20 }}>{formatTime(flight.arrivalTime)}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-light)' }}>{flight.destination}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 120 }}>
                  <div className={`${flight.priceUpdated ? 'price-updated' : ''}`} style={{ fontWeight: 800, fontSize: 24, color: 'var(--primary)' }}>
                    {formatPrice(flight.pricePerPerson || flight.economyCurrentPrice)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)' }}>per person</div>
                  {flight.seatsLeft && flight.seatsLeft <= 10 && (
                    <div className="urgency-badge" style={{ marginTop: 8 }}>🔥 {flight.seatsLeft} left</div>
                  )}
                </div>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


export default function FlightSearchPage() { return <Suspense fallback={<div style={{padding: 60, textAlign: 'center'}}>Loading search results...</div>}><FlightSearchForm /></Suspense>; }