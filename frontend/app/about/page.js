export default function AboutPage() {
  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: 800 }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 20 }}>About Us</h1>
      <div className="card" style={{ marginBottom: 24, textAlign: 'center', padding: '40px 20px' }}>
        <img src="/logo.png" alt="Mahasor Journey Logo" style={{ height: 60, marginBottom: 24 }} />
        <h2 style={{ fontSize: 24, marginBottom: 16 }}>Welcome to Mahasor Journey</h2>
        <p style={{ color: 'var(--text-light)', lineHeight: 1.6, fontSize: 16 }}>
          Mahasor Journey, a proud initiative by <strong>Soreng Holidays Private Limited</strong>, is your premier destination for seamless travel bookings. 
          We believe that every journey should be as memorable as the destination itself. Whether you're booking a luxury hotel, a quick flight, 
          a scenic train ride, or an overnight bus, we provide a unified, easy-to-use platform with real-time availability and transparent pricing.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 20, marginBottom: 12 }}>Our Mission</h3>
        <p style={{ color: 'var(--text-light)', lineHeight: 1.6 }}>
          To empower travelers by simplifying the booking process, offering competitive rates, and delivering exceptional customer service. We strive to be the trusted companion for all your travel needs across the globe.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 20, marginBottom: 12 }}>Contact Us</h3>
        <p style={{ color: 'var(--text-light)', lineHeight: 1.6 }}>
          <strong>Office Address:</strong><br />
          SORENG HOLIDAYS PRIVATE LIMITED<br />
          NO.56, GE, THE DISCOVERY, BLDG 6 SPECIAL STEEL,<br />
          Borivali East, Mumbai - 400066, Maharashtra
          <br /><br />
          <strong>Email:</strong> sorengholidays6@gmail.com<br />
          <strong>Phone:</strong> +91 89849 28560
        </p>
      </div>
    </div>
  );
}
