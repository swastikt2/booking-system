'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! 🎉 +100 loyalty points welcome bonus!');
      router.push('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card" style={{ maxWidth: 440, width: '100%' }}>
        <h1 style={{ fontWeight: 800, fontSize: 28, marginBottom: 8, textAlign: 'center' }}>Create Account ✨</h1>
        <p style={{ color: 'var(--text-light)', textAlign: 'center', marginBottom: 32 }}>Join Mahasor Journey and start your journey</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: 16 }}><label>Full Name</label><input className="input" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required /></div>
          <div className="input-group" style={{ marginBottom: 16 }}><label>Email</label><input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
          <div className="input-group" style={{ marginBottom: 16 }}><label>Phone</label><input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div className="input-group" style={{ marginBottom: 24 }}><label>Password</label><input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} /></div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>{loading ? '⏳ Creating...' : 'Create Account'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-light)' }}>
          Already have an account? <a href="/auth/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</a>
        </p>
      </div>
    </div>
  );
}
