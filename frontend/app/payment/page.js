'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { paymentAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

const METHODS = [
  { id: 'VISA', label: 'Visa', icon: '💳' },
  { id: 'MASTERCARD', label: 'Mastercard', icon: '💳' },
  { id: 'RUPAY', label: 'RuPay', icon: '💳' },
  { id: 'UPI', label: 'UPI', icon: '📱' },
  { id: 'GPAY', label: 'GPay', icon: '📱' },
  { id: 'PHONEPE', label: 'PhonePe', icon: '📱' },
  { id: 'PAYTM', label: 'Paytm', icon: '📱' },
  { id: 'NETBANKING', label: 'Net Banking', icon: '🏦' },
  { id: 'WALLET', label: 'Wallet', icon: '👛' },
  { id: 'EMI', label: 'EMI', icon: '📅' },
];

import { Suspense } from 'react';

function PaymentForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const bookingId = params.get('bookingId');
  const amount = parseFloat(params.get('amount') || 0);
  const bookingRef = params.get('ref');

  const handlePay = async () => {
    if (!selectedMethod) return toast.error('Select a payment method');
    setProcessing(true);
    try {
      const { data: initData } = await paymentAPI.initiate({ bookingId, amount, method: selectedMethod });
      toast.loading('Processing payment...', { id: 'payment' });
      // Verify
      const { data: verifyData } = await paymentAPI.verify(initData.transactionId);
      toast.dismiss('payment');

      if (verifyData.status === 'SUCCESS') {
        setPaymentResult({ success: true, ...verifyData });
        toast.success('Payment successful! 🎉');
      } else {
        setPaymentResult({ success: false, ...verifyData });
        toast.error('Payment failed. Try again.');
      }
    } catch (err) {
      toast.dismiss('payment');
      toast.error('Payment error');
    }
    setProcessing(false);
  };

  if (paymentResult?.success) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
        <div className="card">
          <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
          <h1 style={{ fontWeight: 800, color: 'var(--success)', marginBottom: 8 }}>Payment Successful!</h1>
          <p style={{ fontSize: 18, marginBottom: 24 }}>Your booking has been confirmed.</p>
          <div style={{ background: '#f0fdf4', padding: 20, borderRadius: 12, marginBottom: 24 }}>
            <div style={{ fontSize: 14, color: 'var(--text-light)' }}>Booking Reference</div>
            <div style={{ fontWeight: 800, fontSize: 24 }}>{bookingRef}</div>
            <div style={{ fontSize: 14, marginTop: 8 }}>Amount: <strong>{formatPrice(amount)}</strong></div>
            {paymentResult.loyaltyPointsEarned > 0 && <div style={{ fontSize: 14, color: 'var(--success)', marginTop: 4 }}>+{paymentResult.loyaltyPointsEarned} loyalty points earned 🏆</div>}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
            <a href={`/booking/${bookingRef}`} className="btn btn-primary">View Booking</a>
            <a href="/my-bookings" className="btn btn-outline">My Bookings</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: 700, margin: '0 auto' }}>
      <div className="card">


        <h1 style={{ fontWeight: 800, fontSize: 28, marginBottom: 8 }}>Complete Payment</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: 16, background: '#f8fafc', borderRadius: 12 }}>
          <span style={{ color: 'var(--text-light)' }}>Booking: {bookingRef}</span>
          <span style={{ fontWeight: 800, fontSize: 24, color: 'var(--primary)' }}>{formatPrice(amount)}</span>
        </div>

        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Select Payment Method</h3>
        <div className="payment-methods">
          {METHODS.map(m => (
            <div key={m.id} className={`payment-method ${selectedMethod === m.id ? 'selected' : ''}`} onClick={() => setSelectedMethod(m.id)}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{m.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {selectedMethod && ['VISA', 'MASTERCARD', 'RUPAY'].includes(selectedMethod) && (
          <div style={{ marginTop: 24 }}>
            <div className="input-group"><label>Card Number</label><input className="input" placeholder="XXXX XXXX XXXX XXXX" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div className="input-group"><label>Expiry</label><input className="input" placeholder="MM/YY" /></div>
              <div className="input-group"><label>CVV</label><input className="input" placeholder="123" /></div>
            </div>
          </div>
        )}

        {selectedMethod && ['UPI', 'GPAY', 'PHONEPE', 'PAYTM'].includes(selectedMethod) && (
          <div style={{ marginTop: 24 }}>
            <div className="input-group"><label>UPI ID</label><input className="input" placeholder="username@bank" /></div>
          </div>
        )}

        <button className="btn btn-accent btn-lg" style={{ width: '100%', marginTop: 24 }} onClick={handlePay} disabled={processing || !selectedMethod}>
          {processing ? '⏳ Processing...' : `Pay ${formatPrice(amount)}`}
        </button>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>Loading payment options...</div>}>
      <PaymentForm />
    </Suspense>
  );
}
