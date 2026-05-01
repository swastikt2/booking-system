'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { flightAPI } from '@/lib/api';
import { formatPrice, formatDuration, formatTime, formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function FlightDetailPage() {
  const { id } = useParams();
  const [flight, setFlight] = useState(null);
  const [seats, setSeats] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedClass, setSelectedClass] = useState('ECONOMY');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    Promise.all([flightAPI.get(id), flightAPI.seats(id)])
      .then(([flightRes, seatsRes]) => { setFlight(flightRes.data.data); setSeats(seatsRes.data.data); })
      .catch(() => toast.error('Failed to load flight'))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleSeat = (seat) => {
    if (!seat.isAvailable) return;
    setSelectedSeats(prev =>
      prev.find(s => s.id === seat.id) ? prev.filter(s => s.id !== seat.id) : [...prev, seat]
    );
  };

  const handleBook = () => {
    if (!user) return router.push('/auth/login');
    if (selectedSeats.length === 0) return toast.error('Please select at least one seat');
    const seatNums = selectedSeats.map(s => s.seatNumber).join(',');
    router.push(`/checkout?type=FLIGHT&id=${id}&seats=${seatNums}&class=${selectedClass}`);
  };

  if (loading) return <div className="container" style={{ padding: 60 }}><div className="skeleton" style={{ height: 200, borderRadius: 12 }} /></div>;
  if (!flight) return <div className="container" style={{ padding: 60, textAlign: 'center' }}><h2>Flight not found</h2></div>;

  const classSeats = seats?.[selectedClass] || [];

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      {/* Flight Info */}
      <div className="card" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 28 }}>{flight.airline} {flight.flightNumber}</h1>
            <p style={{ color: 'var(--text-light)' }}>{flight.aircraft} • {formatDate(flight.departureTime)}</p>
          </div>
          <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 24 }}>{formatTime(flight.departureTime)}</div>
              <div style={{ fontSize: 14, color: 'var(--text-light)' }}>{flight.originCity} ({flight.origin})</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: 'var(--text-light)' }}>{formatDuration(flight.duration)}</div>
              <div style={{ width: 120, height: 2, background: 'var(--primary)', margin: '8px 0' }} />
              <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop(s)`}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 24 }}>{formatTime(flight.arrivalTime)}</div>
              <div style={{ fontSize: 14, color: 'var(--text-light)' }}>{flight.destinationCity} ({flight.destination})</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }}>
        <div>
          {/* Class Selection */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            {['ECONOMY', 'BUSINESS', 'FIRST_CLASS'].map(cls => (
              <button key={cls} onClick={() => { setSelectedClass(cls); setSelectedSeats([]); }}
                className={`btn ${selectedClass === cls ? 'btn-primary' : 'btn-outline'}`}>
                {cls.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Seat Map */}
          <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 16 }}>Select Your Seats</h2>
          <div className="seat-map">
            <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 13 }}>
              <span><span className="seat available" style={{ display: 'inline-block', width: 20, height: 20 }} /> Available</span>
              <span><span className="seat taken" style={{ display: 'inline-block', width: 20, height: 20 }} /> Taken</span>
              <span><span className="seat selected" style={{ display: 'inline-block', width: 20, height: 20 }} /> Selected</span>
            </div>
            {Array.from({ length: Math.ceil(classSeats.length / 6) }).map((_, rowIdx) => (
              <div key={rowIdx} className="seat-row">
                {classSeats.slice(rowIdx * 6, rowIdx * 6 + 6).map((seat, i) => (
                  <div key={seat.id}>
                    <div onClick={() => toggleSeat(seat)}
                      className={`seat ${!seat.isAvailable ? 'taken' : selectedSeats.find(s => s.id === seat.id) ? 'selected' : 'available'}`}>
                      {seat.seatNumber}
                    </div>
                    {i === 2 && <div className="seat aisle" />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Booking Summary */}
        <div>
          <div className="card" style={{ position: 'sticky', top: 100 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Booking Summary</h3>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Class</span><span style={{ fontWeight: 600 }}>{selectedClass.replace('_', ' ')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Seats</span><span style={{ fontWeight: 600 }}>{selectedSeats.length > 0 ? selectedSeats.map(s => s.seatNumber).join(', ') : 'None'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 20, color: 'var(--primary)' }}>
              <span>Total</span>
              <span>{formatPrice(selectedSeats.reduce((sum, s) => sum + s.price, 0))}</span>
            </div>
            <button onClick={handleBook} className="btn btn-accent btn-lg" style={{ width: '100%', marginTop: 16 }} disabled={selectedSeats.length === 0}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
