'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { busAPI } from '@/lib/api';
import { formatPrice, formatDuration, formatTime, formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function BusDetailPage() {
  const { id } = useParams();
  const [bus, setBus] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    Promise.all([busAPI.get(id), busAPI.seats(id)])
      .then(([busRes, seatsRes]) => { 
        setBus(busRes.data.data); 
        setSeats(seatsRes.data.data); 
      })
      .catch(() => toast.error('Failed to load bus details'))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleSeat = (seat) => {
    if (seat.status !== 'AVAILABLE') return;
    setSelectedSeats(prev =>
      prev.find(s => s.id === seat.id) ? prev.filter(s => s.id !== seat.id) : [...prev, seat]
    );
  };

  const handleBook = () => {
    if (!user) return router.push('/auth/login');
    if (selectedSeats.length === 0) return toast.error('Please select at least one seat');
    const seatNums = selectedSeats.map(s => s.seatNumber).join(',');
    router.push(`/checkout?type=BUS&id=${id}&seats=${seatNums}`);
  };

  if (loading) return <div className="container" style={{ padding: 60 }}><div className="skeleton" style={{ height: 200, borderRadius: 12 }} /></div>;
  if (!bus) return <div className="container" style={{ padding: 60, textAlign: 'center' }}><h2>Bus not found</h2></div>;

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <div className="card" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 28 }}>{bus.operator}</h1>
            <p style={{ color: 'var(--text-light)' }}>{bus.type.replace('_', ' ')} • {formatDate(bus.departureTime)}</p>
          </div>
          <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 24 }}>{formatTime(bus.departureTime)}</div>
              <div style={{ fontSize: 14, color: 'var(--text-light)' }}>{bus.originCity}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: 'var(--text-light)' }}>{formatDuration(bus.duration)}</div>
              <div style={{ width: 120, height: 2, background: 'var(--primary)', margin: '8px 0' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 24 }}>{formatTime(bus.arrivalTime)}</div>
              <div style={{ fontSize: 14, color: 'var(--text-light)' }}>{bus.destinationCity}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 16 }}>Select Your Seats</h2>
          
          <div className="bus-layout-container" style={{ background: '#f8fafc', padding: 40, borderRadius: 24, display: 'inline-block' }}>
            <div className="bus-front" style={{ textAlign: 'right', marginBottom: 20 }}>
              <span style={{ background: '#e2e8f0', padding: '4px 12px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>STEERING WHEEL 🎡</span>
            </div>
            
            <div className="bus-seats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 50px)', gap: '15px 10px' }}>
              {seats.map((seat, i) => (
                <div key={seat.id} style={{ display: 'flex' }}>
                  <div 
                    onClick={() => toggleSeat(seat)}
                    className={`seat ${seat.status !== 'AVAILABLE' ? 'taken' : selectedSeats.find(s => s.id === seat.id) ? 'selected' : 'available'}`}
                    style={{ 
                      width: 50, 
                      height: 50, 
                      borderRadius: 8, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: seat.status === 'AVAILABLE' ? 'pointer' : 'not-allowed',
                      fontSize: 12,
                      fontWeight: 700
                    }}
                  >
                    {seat.seatNumber}
                  </div>
                  {(i + 1) % 2 === 0 && (i + 1) % 4 !== 0 && <div style={{ width: 40 }} />}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, marginTop: 24, fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="seat available" style={{ width: 20, height: 20, borderRadius: 4 }} /> Available
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="seat taken" style={{ width: 20, height: 20, borderRadius: 4 }} /> Booked
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="seat selected" style={{ width: 20, height: 20, borderRadius: 4 }} /> Selected
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ position: 'sticky', top: 100 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Booking Summary</h3>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Selected Seats</span>
                <span style={{ fontWeight: 600 }}>{selectedSeats.length > 0 ? selectedSeats.map(s => s.seatNumber).join(', ') : 'None'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 20, color: 'var(--primary)' }}>
              <span>Total Price</span>
              <span>{formatPrice(selectedSeats.reduce((sum, s) => sum + s.price, 0))}</span>
            </div>
            <button 
              onClick={handleBook} 
              className="btn btn-accent btn-lg" 
              style={{ width: '100%', marginTop: 16 }} 
              disabled={selectedSeats.length === 0}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
