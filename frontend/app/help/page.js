export default function HelpPage() {
  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: 800 }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 20 }}>Help Center</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: 40, lineHeight: 1.6 }}>
        Need assistance with your bookings or navigating Mahasor Journey? We are here to help. Find the most common solutions below or contact our 24/7 customer support.
      </p>
      
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 20, marginBottom: 12 }}>Booking Issues</h3>
        <p style={{ color: 'var(--text-light)' }}>
          If you have trouble booking a hotel, flight, or bus, ensure your payment details are correct and your internet connection is stable. If the issue persists, contact us at sorengholidays6@gmail.com.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 20, marginBottom: 12 }}>Cancellations & Refunds</h3>
        <p style={{ color: 'var(--text-light)' }}>
          You can cancel eligible bookings directly from the "My Bookings" page. Refunds are processed within 5-7 business days, depending on the service provider's policy.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 20, marginBottom: 12 }}>Contact Support</h3>
        <p style={{ color: 'var(--text-light)' }}>
          Call us at +91 89849 28560 for immediate assistance. We are available Monday to Friday, 9:00 AM to 6:00 PM IST.
        </p>
      </div>
    </div>
  );
}
