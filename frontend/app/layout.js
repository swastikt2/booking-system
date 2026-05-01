import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/Header';

export const metadata = {
  title: 'Mahasor Journey — Hotels, Flights, Trains & Bus Booking',
  description: 'Book hotels, flights, trains, and buses at the best prices with Mahasor Journey. Real-time availability and instant confirmation.',
  keywords: 'travel booking, Mahasor Journey, hotels, flights, trains, buses, cheap flights, hotel deals',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <Header />
          <main style={{ minHeight: '80vh' }}>
            {children}
          </main>
          <Footer />
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-grid">
          <div>
            <h3 className="footer-logo">Mahasor<span> Journey</span></h3>
            <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 12 }}>
              Your ultimate travel companion for booking hotels, flights, trains, and buses worldwide.
            </p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/search/hotels">Hotels</a></li>
              <li><a href="/search/flights">Flights</a></li>
              <li><a href="/search/trains">Trains</a></li>
              <li><a href="/search/buses">Buses</a></li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul className="footer-links">
              <li><a href="/about">About Us</a></li>
              <li><a href="/help">Help Center</a></li>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul className="footer-links">
              <li style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6' }}>
                <strong>OFFICE ADDRESS</strong> - SORENG HOLIDAYS PRIVATE LIMITED<br />
                NO.56, GE, THE DISCOVERY, BLDG 6 SPECIAL STEEL,<br />
                Borivali East, Mumbai- 400066, Maharashtra
              </li>
              <li style={{ color: '#cbd5e1', marginTop: '8px' }}>📧 sorengholidays6@gmail.com</li>
              <li style={{ color: '#cbd5e1' }}>📞 +91 89849 28560</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Mahasor Journey. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
