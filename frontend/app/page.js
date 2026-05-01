'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { searchAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

const TABS = [
  { id: 'flights', icon: '✈️', label: 'Flights' },
  { id: 'hotels', icon: '🏨', label: 'Hotels' },
  { id: 'trains', icon: '🚂', label: 'Trains' },
  { id: 'buses', icon: '🚌', label: 'Buses' },
];

const HERO_BACKGROUNDS = [
  { url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=2874&auto=format&fit=crop', name: 'Goa Beaches', highlight: 'Tropical Escape' },
  { url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2942&auto=format&fit=crop', name: 'Himalayan Mountains', highlight: 'Mountain Retreat' },
  { url: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=2952&auto=format&fit=crop', name: 'Taj Mahal', highlight: 'Heritage Journey' },
  { url: 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?q=80&w=2835&auto=format&fit=crop', name: 'Jaipur Palaces', highlight: 'Royal Vacation' }
];

const POPULAR_DESTINATIONS = [
  { city: 'Goa', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800', price: 4999, tag: 'Beach Side' },
  { city: 'Manali', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800', price: 6500, tag: 'Adventure' },
  { city: 'Kerala', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800', price: 8200, tag: 'Serene' },
  { city: 'Jaipur', image: 'https://images.unsplash.com/photo-1599661046289-e31887846eac?q=80&w=800', price: 3500, tag: 'Cultural' },
  { city: 'Darjeeling', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800', price: 5400, tag: 'Hill Station' },
  { city: 'Andaman', image: 'https://images.unsplash.com/photo-1589136142558-90c211609312?q=80&w=800', price: 12500, tag: 'Exotic' },
];

const DEALS = [
  { title: 'Domestic Flights', desc: 'Up to 25% OFF on domestic flights', icon: '✈️', color: '#2EC4B6' },
  { title: 'Hotel Stays', desc: 'Flat 30% OFF on 4 & 5 star hotels', icon: '🏨', color: '#10b981' },
  { title: 'Train Tickets', desc: 'Tatkal booking with instant confirmation', icon: '🚂', color: '#FF7A00' },
  { title: 'Bus Passes', desc: 'Starting at ₹299 for AC buses', icon: '🚌', color: '#ef4444' },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('flights');
  const [form, setForm] = useState({ from: '', to: '', date: '', returnDate: '', checkin: '', checkout: '', city: '', adults: '1', rooms: '1', class: 'ECONOMY' });
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState('');
  const [bgIndex, setBgIndex] = useState(0);
  const router = useRouter();

  // Dynamic Background Slider
  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleAutocomplete = async (value, field) => {
    setForm(f => ({ ...f, [field]: value }));
    if (value.length >= 2) {
      try {
        const { data } = await searchAPI.autocomplete(value);
        setSuggestions(data.data || []);
        setActiveField(field);
      } catch { setSuggestions([]); }
    } else { setSuggestions([]); }
  };

  const selectSuggestion = (s, field) => {
    setForm(f => ({ ...f, [field]: `${s.name} (${s.code})` }));
    setSuggestions([]);
    setActiveField('');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (activeTab === 'flights') {
      const fromCode = form.from.match(/\((\w+)\)/)?.[1] || form.from;
      const toCode = form.to.match(/\((\w+)\)/)?.[1] || form.to;
      params.set('from', fromCode); params.set('to', toCode);
      params.set('date', form.date); params.set('adults', form.adults);
      params.set('class', form.class);
      if (form.returnDate) params.set('returnDate', form.returnDate);
    } else if (activeTab === 'hotels') {
      params.set('city', form.city); params.set('checkin', form.checkin);
      params.set('checkout', form.checkout); params.set('rooms', form.rooms);
      params.set('adults', form.adults);
    } else {
      const fromVal = form.from.match(/\((\w+)\)/)?.[1] || form.from;
      const toVal = form.to.match(/\((\w+)\)/)?.[1] || form.to;
      params.set('from', fromVal); params.set('to', toVal);
      params.set('date', form.date);
    }
    router.push(`/search/${activeTab}?${params.toString()}`);
  };

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero" style={{ padding: '140px 0 100px', position: 'relative', overflow: 'hidden' }}>
        
        {/* DYNAMIC BACKGROUND IMAGES */}
        {HERO_BACKGROUNDS.map((bg, index) => (
          <div 
            key={index} 
            style={{
              position: 'absolute', inset: 0, zIndex: 0,
              backgroundImage: `url('${bg.url}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: bgIndex === index ? 1 : 0,
              transform: bgIndex === index ? 'scale(1.05)' : 'scale(1)',
              transition: 'opacity 1.5s ease-in-out, transform 8s linear'
            }} 
          />
        ))}
        {/* OVERLAY GRADIENT */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to bottom, rgba(30, 41, 59, 0.3) 0%, rgba(30, 41, 59, 0.7) 100%)' }} />

        {/* FLOATING GLASS ICONS (Premium 3D Touch) */}
        <div style={{ position: 'absolute', top: '15%', right: '10%', animation: 'float 6s ease-in-out infinite', zIndex: 2 }}>
          <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', borderRadius: 20, border: '1px solid rgba(46, 196, 182, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, boxShadow: '0 8px 32px rgba(46, 196, 182, 0.15)', transform: 'rotate(15deg)' }}>✈️</div>
        </div>
        <div style={{ position: 'absolute', bottom: '25%', left: '5%', animation: 'float 8s ease-in-out infinite reverse', zIndex: 2 }}>
          <div style={{ width: 100, height: 100, background: 'rgba(167, 243, 208, 0.4)', backdropFilter: 'blur(16px)', borderRadius: '50%', border: '1px solid rgba(46, 196, 182, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, boxShadow: '0 0 40px rgba(46, 196, 182, 0.1)' }}>🏨</div>
        </div>
        <div style={{ position: 'absolute', top: '40%', right: '25%', animation: 'float 7s ease-in-out infinite 1s', zIndex: 2 }}>
          <div style={{ width: 60, height: 60, background: 'rgba(255, 122, 0, 0.1)', backdropFilter: 'blur(8px)', borderRadius: 15, border: '1px solid rgba(255, 122, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, transform: 'rotate(-20deg)' }}>🚂</div>
        </div>
        
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <h1 style={{ color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.4)', transition: 'all 0.5s ease' }}>
            Find Your Next <span style={{ color: 'var(--secondary)' }}>{HERO_BACKGROUNDS[bgIndex].highlight}</span> 🌍<br />
            <span style={{ fontSize: '0.4em', fontWeight: 500, opacity: 0.9, display: 'inline-block', marginTop: '12px' }}>📍 Featured: {HERO_BACKGROUNDS[bgIndex].name}</span>
          </h1>
          <p style={{ color: '#f8fafc', textShadow: '0 2px 10px rgba(0,0,0,0.5)', maxWidth: '600px' }}>Search, compare & book hotels, flights, trains and buses — all in one place. Discover hand-picked destinations just for you.</p>

          {/* SEARCH TABS */}
          <div className="search-tabs">
            {TABS.map(tab => (
              <button key={tab.id} className={`search-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* SEARCH FORM */}
          <form className="search-form" onSubmit={handleSearch}>
            {activeTab === 'flights' && (
              <>
                <div className="input-group" style={{ position: 'relative' }}>
                  <label>From</label>
                  <input className="input" placeholder="City or Airport" value={form.from}
                    onChange={e => handleAutocomplete(e.target.value, 'from')} required />
                  {activeField === 'from' && suggestions.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', zIndex: 50, maxHeight: 250, overflow: 'auto' }}>
                      {suggestions.map(s => (
                        <div key={s.code} onClick={() => selectSuggestion(s, 'from')} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', fontSize: 14 }}>
                          <strong style={{ color: 'var(--text)' }}>{s.name}</strong> ({s.code}) <span style={{ color: '#9ca3af', fontSize: 12 }}>{s.country}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="input-group" style={{ position: 'relative' }}>
                  <label>To</label>
                  <input className="input" placeholder="City or Airport" value={form.to}
                    onChange={e => handleAutocomplete(e.target.value, 'to')} required />
                  {activeField === 'to' && suggestions.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', zIndex: 50, maxHeight: 250, overflow: 'auto' }}>
                      {suggestions.map(s => (
                        <div key={s.code} onClick={() => selectSuggestion(s, 'to')} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', fontSize: 14 }}>
                          <strong style={{ color: 'var(--text)' }}>{s.name}</strong> ({s.code}) <span style={{ color: '#9ca3af', fontSize: 12 }}>{s.country}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="input-group"><label>Departure</label><input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required /></div>
                <div className="input-group"><label>Return (Optional)</label><input className="input" type="date" value={form.returnDate} onChange={e => setForm(f => ({ ...f, returnDate: e.target.value }))} /></div>
                <div className="input-group"><label>Class</label>
                  <select className="input" value={form.class} onChange={e => setForm(f => ({ ...f, class: e.target.value }))}>
                    <option value="ECONOMY">Economy</option><option value="BUSINESS">Business</option><option value="FIRST_CLASS">First Class</option>
                  </select>
                </div>
              </>
            )}
            {activeTab === 'hotels' && (
              <>
                <div className="input-group"><label>City</label><input className="input" placeholder="Where are you going?" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} required /></div>
                <div className="input-group"><label>Check-in</label><input className="input" type="date" value={form.checkin} onChange={e => setForm(f => ({ ...f, checkin: e.target.value }))} required /></div>
                <div className="input-group"><label>Check-out</label><input className="input" type="date" value={form.checkout} onChange={e => setForm(f => ({ ...f, checkout: e.target.value }))} required /></div>
                <div className="input-group"><label>Rooms</label><select className="input" value={form.rooms} onChange={e => setForm(f => ({ ...f, rooms: e.target.value }))}>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Room{n>1?'s':''}</option>)}</select></div>
                <div className="input-group"><label>Guests</label><select className="input" value={form.adults} onChange={e => setForm(f => ({ ...f, adults: e.target.value }))}>{[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Adult{n>1?'s':''}</option>)}</select></div>
              </>
            )}
            {(activeTab === 'trains' || activeTab === 'buses') && (
              <>
                <div className="input-group"><label>From</label><input className="input" placeholder="Origin" value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))} required /></div>
                <div className="input-group"><label>To</label><input className="input" placeholder="Destination" value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))} required /></div>
                <div className="input-group"><label>Date</label><input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required /></div>
              </>
            )}
            <button type="submit" className="btn btn-accent btn-lg">🔍 Search</button>
          </form>
        </div>
      </section>

      {/* DEALS */}
      <section className="container" style={{ marginTop: -40, position: 'relative', zIndex: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          {DEALS.map((deal, i) => (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', padding: '20px' }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: deal.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{deal.icon}</div>
              <div><h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{deal.title}</h4><p style={{ fontSize: 13, color: 'var(--text-light)' }}>{deal.desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR DESTINATIONS */}
      <section className="container" style={{ padding: '80px 20px 60px' }}>
        <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 32, fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>Popular Destinations ✨</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: 40, fontSize: 16 }}>Trending places loved by travellers</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {POPULAR_DESTINATIONS.map((dest, i) => (
            <a key={i} href={`/search/hotels?city=${dest.city}`} className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', display: 'block' }}>
              <div style={{ position: 'relative', height: 220 }}>
                <img src={dest.image} alt={dest.city} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 16, right: 16 }}><span className="badge badge-info" style={{ backdropFilter: 'blur(10px)', background: 'rgba(255,255,255,0.9)' }}>{dest.tag}</span></div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 20px 20px', background: 'linear-gradient(transparent, rgba(30, 41, 59, 0.8))' }}>
                  <h3 style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>{dest.city}</h3>
                </div>
              </div>
              <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: 'var(--text-light)' }}>Starting from</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary-dark)' }}>{formatPrice(dest.price)}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* WHY MAHASOR JOURNEY */}
      <section style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '80px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 32, fontWeight: 800, color: 'var(--text)', marginBottom: 48 }}>Why Choose Mahasor Journey? 🏆</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
            {[
              { icon: '💰', title: 'Best Prices', desc: 'Dynamic pricing engine ensures you always get the best deal' },
              { icon: '⚡', title: 'Instant Booking', desc: 'Real-time seat availability with instant confirmation' },
              { icon: '🔒', title: 'Secure Payments', desc: 'Multiple payment options with bank-grade security' },
              { icon: '📱', title: '24/7 Support', desc: 'Round the clock customer support for all your queries' },
            ].map((f, i) => (
              <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 40, border: '1px solid var(--border)', boxShadow: 'var(--shadow)', transition: 'transform 0.3s ease' }} onMouseOver={e=>e.currentTarget.style.transform='translateY(-5px)'} onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
                <div style={{ fontSize: 48, marginBottom: 20 }}>{f.icon}</div>
                <h3 style={{ color: 'var(--text)', fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-light)', fontSize: 15 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

