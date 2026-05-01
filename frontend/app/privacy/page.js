export default function PrivacyPage() {
  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: 800 }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 20 }}>Privacy Policy</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: 40, lineHeight: 1.6 }}>
        Soreng Holidays Private Limited ("we", "our", or "us") is committed to protecting your privacy. This policy explains how we collect, use, and share your personal information.
      </p>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 20, marginBottom: 12 }}>Information We Collect</h3>
        <p style={{ color: 'var(--text-light)' }}>
          We collect personal details such as your name, email address, phone number, and payment information when you make a booking or register an account on Mahasor Journey.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 20, marginBottom: 12 }}>How We Use Information</h3>
        <p style={{ color: 'var(--text-light)' }}>
          We use the information to process your bookings, communicate with you regarding your travel plans, and improve our services. We do not sell your personal data to third parties.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 20, marginBottom: 12 }}>Data Security</h3>
        <p style={{ color: 'var(--text-light)' }}>
          We employ industry-standard encryption to protect your sensitive information during transmission and storage. However, no electronic transmission is completely secure, and we cannot guarantee absolute security.
        </p>
      </div>
    </div>
  );
}
