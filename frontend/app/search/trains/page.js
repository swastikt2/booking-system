'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchAPI } from '@/lib/api';
import { formatPrice, formatDuration, formatTime } from '@/lib/utils';
import toast from 'react-hot-toast';

import { Suspense } from 'react';

function TrainSearchForm() {
  const params = useSearchParams();
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState({});

  useEffect(() => {
    const fetchTrains = async () => {
      setLoading(true);
      try {
        const { data } = await searchAPI.trains({ from: params.get('from'), to: params.get('to'), date: params.get('date') });
        setTrains(data.data || []);
      } catch { toast.error('Search failed'); }
      setLoading(false);
    };
    fetchTrains();
  }, [params]);

  return (
    <div className="results-page container">
      <div className="results-header">
        <h2 style={{ fontWeight: 800, fontSize: 24 }}>🚂 {params.get('from')} → {params.get('to')}</h2>
        <p className="results-count">{trains.length} trains found for {params.get('date')}</p>
      </div>
      <div className="results-grid">
        {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />) :
        trains.length === 0 ? <div className="card" style={{ textAlign: 'center', padding: 60 }}><div style={{ fontSize: 48, marginBottom: 16 }}>🚂</div><h3>No trains found</h3></div> :
        trains.map(train => {
          const currentClass = selectedClass[train.id] || (train.classes && train.classes[0] ? train.classes[0].name : 'SL');
          return (
          <div key={train.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 16 }}>{train.trainName}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-light)' }}>#{train.trainNumber}</p>
            </div>
            <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}><div style={{ fontWeight: 800, fontSize: 18 }}>{formatTime(train.departureTime)}</div><div style={{ fontSize: 12, color: 'var(--text-light)' }}>{train.originCity}</div></div>
              <div style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: 13 }}>{formatDuration(train.duration)}<div style={{ height: 2, background: 'var(--border)', width: 80, margin: '4px auto' }} /></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontWeight: 800, fontSize: 18 }}>{formatTime(train.arrivalTime)}</div><div style={{ fontSize: 12, color: 'var(--text-light)' }}>{train.destinationCity}</div></div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {(train.classes || []).map(cls => (
                <div key={cls.name} onClick={() => setSelectedClass(prev => ({...prev, [train.id]: cls.name}))} 
                  style={{ 
                    padding: '12px 16px', 
                    border: currentClass === cls.name ? '2px solid var(--accent)' : '1px solid var(--border)', 
                    borderRadius: 12, 
                    textAlign: 'center', 
                    minWidth: 90, 
                    cursor: 'pointer', 
                    background: currentClass === cls.name ? 'rgba(255, 122, 0, 0.05)' : 'white',
                    transition: 'all 0.2s ease',
                    boxShadow: currentClass === cls.name ? '0 4px 12px rgba(255, 122, 0, 0.15)' : 'none'
                  }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: currentClass === cls.name ? 'var(--accent)' : 'var(--text-light)', marginBottom: 4 }}>{cls.name}</div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--primary)' }}>{formatPrice(cls.price)}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: cls.seats < 10 ? 'var(--danger)' : 'var(--success)', marginTop: 4 }}>{cls.seats} seats</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 8 }}>Selected: <strong>{currentClass}</strong></div>
              <a href={`/checkout?type=TRAIN&id=${train.id}&class=${currentClass}`} className="btn btn-accent btn-lg">Book {currentClass}</a>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}


export default function TrainSearchPage() { return <Suspense fallback={<div style={{padding: 60, textAlign: 'center'}}>Loading search results...</div>}><TrainSearchForm /></Suspense>; }