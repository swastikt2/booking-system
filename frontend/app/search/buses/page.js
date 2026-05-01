'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchAPI } from '@/lib/api';
import { formatPrice, formatDuration, formatTime } from '@/lib/utils';
import toast from 'react-hot-toast';

import { Suspense } from 'react';

function BusSearchForm() {
  const params = useSearchParams();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await searchAPI.buses({ from: params.get('from'), to: params.get('to'), date: params.get('date') });
        setBuses(data.data || []);
      } catch { toast.error('Search failed'); }
      setLoading(false);
    };
    fetch();
  }, [params]);

  return (
    <div className="results-page container">
      <div className="results-header">
        <h2 style={{ fontWeight: 800, fontSize: 24 }}>🚌 {params.get('from')} → {params.get('to')}</h2>
        <p className="results-count">{buses.length} buses found</p>
      </div>
      <div className="results-grid">
        {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />) :
        buses.length === 0 ? <div className="card" style={{ textAlign: 'center', padding: 60 }}><div style={{ fontSize: 48 }}>🚌</div><h3>No buses found</h3></div> :
        buses.map(bus => (
          <div key={bus.id} className="result-card" style={{ gridTemplateColumns: '1fr auto' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <h3 style={{ fontWeight: 700, fontSize: 16 }}>{bus.operator}</h3>
                <span className="badge badge-info">{bus.type.replace('_', ' ')}</span>
              </div>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <div><div style={{ fontWeight: 800, fontSize: 18 }}>{formatTime(bus.departureTime)}</div><div style={{ fontSize: 12, color: 'var(--text-light)' }}>{bus.originCity}</div></div>
                <div style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: 13 }}>{formatDuration(bus.duration)}</div>
                <div><div style={{ fontWeight: 800, fontSize: 18 }}>{formatTime(bus.arrivalTime)}</div><div style={{ fontSize: 12, color: 'var(--text-light)' }}>{bus.destinationCity}</div></div>
              </div>
              <div style={{ fontSize: 12, color: bus.availableSeats < 10 ? 'var(--danger)' : 'var(--text-light)', marginTop: 8 }}>{bus.availableSeats} seats available</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: 24, color: 'var(--primary)' }}>{formatPrice(bus.currentPrice)}</div>
              <a href={`/bus/${bus.id}`} className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Select Seats</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export default function BusSearchPage() { return <Suspense fallback={<div style={{padding: 60, textAlign: 'center'}}>Loading search results...</div>}><BusSearchForm /></Suspense>; }