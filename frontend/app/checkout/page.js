'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { bookingAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

import { Suspense } from 'react';

function CheckoutForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(900);
  const [booking, setBooking] = useState(null);
  const [form, setForm] = useState(() => {
    let count = 1;
    if (params.get('seats')) count = params.get('seats').split(',').length;
    else if (params.get('adults')) count = parseInt(params.get('adults'));
    return {
      passengers: Array.from({ length: count }).map(() => ({ name: '', age: '', gender: 'M' })),
      specialRequests: ''
    };
  });

  const type = params.get('type');
  const entityId = params.get('id');

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  useEffect(() => {
    const seats = params.get('seats');
    const adults = params.get('adults');
    let count = 0;
    if (seats) count = seats.split(',').length;
    else if (adults) count = parseInt(adults);

    if (count > 0 && form.passengers.length !== count) {
      setForm(f => ({
        ...f,
        passengers: Array.from({ length: count }).map((_, i) => f.passengers[i] || { name: '', age: '', gender: 'M' })
      }));
    }
  }, [params]);

  // 15-min countdown
  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timer === 0) { toast.error('Booking hold expired!'); router.push('/'); }
  }, [timer]);

  const createBooking = async () => {
    const bookingType = (type || '').toUpperCase();
    try {
      const { data } = await bookingAPI.create({
        bookingType, entityId,
        roomTypeId: params.get('roomId') || undefined,
        seatNumbers: params.get('seats') ? params.get('seats').split(',') : undefined,
        seatClass: params.get('class') ? params.get('class').toUpperCase() : undefined,
        passengerDetails: form.passengers,
        specialRequests: form.specialRequests || undefined,
        adults: form.passengers.length,
        checkIn: params.get('checkin') || undefined, 
        checkOut: params.get('checkout') || undefined,
      });
      setBooking(data.booking);
      setStep(3);
      toast.success('Booking created! Proceed to payment.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
  };

  const formatTimer = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="container checkout-layout">
      <div>
        {/* Timer */}
        <div className="countdown-timer">
          <div style={{ fontSize: 14, marginBottom: 4 }}>⏰ Complete your booking in</div>
          <div className="countdown-time">{formatTimer(timer)}</div>
        </div>

        {/* Steps */}
        <div className="checkout-steps">
          <div className={`step ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`}><span className="step-num">1</span> Traveller Details</div>
          <div className={`step ${step >= 2 ? (step > 2 ? 'done' : 'active') : ''}`}><span className="step-num">2</span> Review</div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}><span className="step-num">3</span> Payment</div>
        </div>

        {/* Step 1: Passenger Details */}
        {step === 1 && (
          <div className="card">
            <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Traveller Details</h2>
            {form.passengers.map((p, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px', gap: 12, marginBottom: 16 }}>
                <div className="input-group"><label>Full Name</label>
                  <input className="input" value={p.name} onChange={e => { const ps = [...form.passengers]; ps[i].name = e.target.value; setForm(f => ({ ...f, passengers: ps })); }} required /></div>
                <div className="input-group"><label>Age</label>
                  <input className="input" type="number" value={p.age} onChange={e => { const ps = [...form.passengers]; ps[i].age = e.target.value; setForm(f => ({ ...f, passengers: ps })); }} required /></div>
                <div className="input-group"><label>Gender</label>
                  <select className="input" value={p.gender} onChange={e => { const ps = [...form.passengers]; ps[i].gender = e.target.value; setForm(f => ({ ...f, passengers: ps })); }}>
                    <option value="M">Male</option><option value="F">Female</option><option value="O">Other</option>
                  </select></div>
              </div>
            ))}
            <button className="btn btn-outline btn-sm" onClick={() => setForm(f => ({ ...f, passengers: [...f.passengers, { name: '', age: '', gender: 'M' }] }))}>+ Add Passenger</button>
            <div className="input-group" style={{ marginTop: 16 }}><label>Special Requests</label>
              <textarea className="input" rows={3} value={form.specialRequests} onChange={e => setForm(f => ({ ...f, specialRequests: e.target.value }))} placeholder="Any special requirements..." /></div>
            <button className="btn btn-primary btn-lg" style={{ marginTop: 20 }} onClick={() => setStep(2)}>Continue to Review</button>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="card">
            <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Review Your Booking</h2>
            <div style={{ marginBottom: 16 }}>
              <h4>Booking Type: {type}</h4>
              <p style={{ color: 'var(--text-light)' }}>Passengers: {form.passengers.map(p => p.name).join(', ')}</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary btn-lg" onClick={createBooking}>Confirm & Pay</button>
            </div>
          </div>
        )}

        {/* Step 3: Payment redirect */}
        {step === 3 && booking && (
          <div className="card" style={{ textAlign: 'center' }}>
            <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Booking Created! 🎉</h2>
            <p>Reference: <strong>{booking.bookingRef}</strong></p>
            <p style={{ color: 'var(--text-light)', marginBottom: 20 }}>Total: {formatPrice(booking.totalAmount)}</p>
            <a href={`/payment?bookingId=${booking.id}&amount=${booking.totalAmount}&ref=${booking.bookingRef}`} className="btn btn-accent btn-lg">Proceed to Payment →</a>
          </div>
        )}
      </div>

      {/* Summary Sidebar */}
      <div>
        <div className="card" style={{ position: 'sticky', top: 100 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Booking Summary</h3>
          <div style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 8 }}>
            <div>Type: <strong>{type}</strong></div>
            <div>Passengers: <strong>{form.passengers.length}</strong></div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--text-light)', fontStyle: 'italic' }}>Secure Checkout</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>Loading checkout...</div>}>
      <CheckoutForm />
    </Suspense>
  );
}
