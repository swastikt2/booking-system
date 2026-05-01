export default function FAQPage() {
  const faqs = [
    { q: "How do I book a ticket?", a: "You can book by searching for your desired destination and dates on our homepage, selecting the best option, and proceeding to checkout." },
    { q: "What are the payment methods accepted?", a: "We accept major credit/debit cards, UPI, and net banking." },
    { q: "How can I cancel my booking?", a: "Go to 'My Bookings', select the booking you wish to cancel, and click 'Cancel Booking'. Please review the cancellation policy before proceeding." },
    { q: "How long does a refund take?", a: "Refunds are processed within 5-7 business days, depending on your bank and the service provider." },
    { q: "How do I contact customer support?", a: "You can reach us at sorengholidays6@gmail.com or call +91 89849 28560." }
  ];

  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: 800 }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 20 }}>Frequently Asked Questions</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: 40 }}>Find answers to common questions about Mahasor Journey below.</p>

      {faqs.map((faq, i) => (
        <div key={i} className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>{faq.q}</h3>
          <p style={{ color: 'var(--text-light)' }}>{faq.a}</p>
        </div>
      ))}
    </div>
  );
}
