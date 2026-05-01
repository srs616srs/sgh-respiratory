'use client';
import { useState } from 'react';
import { STAFF } from '../lib/data';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('sultanalshehri@sghgroup.net');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const go = async () => {
    if (!email.trim()) { setErr('Please enter your email.'); return; }
    setLoading(true);
    setErr('');
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: pass }),
      });
      if (r.ok) {
        onLogin(await r.json());
        return;
      }
      const result = await r.json();
      if (r.status === 503) {
        // Supabase not configured — fall back to demo mode
        const s = STAFF.find(st => st.email.toLowerCase() === email.toLowerCase().trim());
        if (s) { onLogin(s); return; }
      }
      setErr(result.error || 'Sign in failed.');
    } catch {
      // Network error — demo fallback
      const s = STAFF.find(st => st.email.toLowerCase() === email.toLowerCase().trim());
      if (s) { onLogin(s); return; }
      setErr('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ls">
      <div className="ls-bg" />
      <div className="lc">
        <div style={{ textAlign: 'center', fontSize: 34, marginBottom: 10 }}>🫁</div>
        <div className="ll">SAUDI GERMAN HOSPITAL · MEAHCO NETWORK</div>
        <div className="lt">Respiratory Services</div>
        <div className="lsub">Sign in with your @sghgroup.net account</div>
        <div className="ig">
          <label className="inplbl">Email Address</label>
          <input className="inpf" type="email" value={email}
            onChange={e => { setEmail(e.target.value); setErr(''); }}
            onKeyDown={e => e.key === 'Enter' && go()}
            placeholder="name@sghgroup.net" />
        </div>
        <div className="ig">
          <label className="inplbl">Password</label>
          <input className="inpf" type="password" value={pass}
            onChange={e => { setPass(e.target.value); setErr(''); }}
            onKeyDown={e => e.key === 'Enter' && go()}
            placeholder="••••••••" />
        </div>
        {err && <div className="err">⚠ {err}</div>}
        <button className="lbtn" onClick={go} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>
        <div className="lhint">
          <strong style={{ display: 'block', marginBottom: 4, color: 'var(--t2)' }}>Network Admin Login</strong>
          sultanalshehri@sghgroup.net · password: Admin@SGH2025
        </div>
      </div>
    </div>
  );
}
