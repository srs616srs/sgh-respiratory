'use client';
import { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('sultanalshehri@sghgroup.net');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const go = async () => {
    if (!username.trim()) { setErr('Please enter your SGH ID or email.'); return; }
    setLoading(true);
    setErr('');
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: pass }),
      });
      if (r.ok) {
        onLogin(await r.json());
        return;
      }
      const result = await r.json();
      setErr(result.error || 'Sign in failed.');
    } catch {
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
        <div className="lsub">Sign in with your SGH ID or @sghgroup.net email</div>
        <div className="ig">
          <label className="inplbl">SGH ID or Email</label>
          <input className="inpf" type="text" value={username}
            onChange={e => { setUsername(e.target.value); setErr(''); }}
            onKeyDown={e => e.key === 'Enter' && go()}
            placeholder="e.g. SGH-12345 or name@sghgroup.net" />
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

        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <span onClick={() => setShowForgot(f => !f)}
            style={{ fontSize: 11, color: 'var(--a)', cursor: 'pointer', textDecoration: 'underline' }}>
            Forgot password?
          </span>
        </div>

        {showForgot && (
          <div style={{ marginTop: 10, background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 9, padding: '12px 14px', fontSize: 11, color: '#075985', lineHeight: 1.6 }}>
            🔒 <strong>Password Reset</strong><br />
            Please contact the <strong>Network Admin</strong> to reset your password:<br />
            <a href="mailto:sultanalshehri@sghgroup.net" style={{ color: '#0284c7', fontWeight: 600 }}>
              sultanalshehri@sghgroup.net
            </a>
          </div>
        )}

        <div className="lhint">
          <strong style={{ display: 'block', marginBottom: 4, color: 'var(--t2)' }}>Network Admin Login</strong>
          sultanalshehri@sghgroup.net · password: Admin@SGH2025
        </div>
      </div>
    </div>
  );
}
