'use client';
import { useState } from 'react';
import { STAFF } from '../lib/data';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('sultanalshehri@sghgroup.net');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');

  const go = () => {
    const s = STAFF.find(st => st.email.toLowerCase() === email.toLowerCase().trim());
    if (s) onLogin(s);
    else setErr('No SGH account found for this email.');
  };

  return (
    <div className="ls">
      <div className="ls-bg" />
      <div className="lc">
        <div style={{ textAlign: 'center', fontSize: 34, marginBottom: 10 }}>🫁</div>
        <div className="ll">SAUDI GERMAN HOSPITAL · MEAHCO NETWORK</div>
        <div className="lt">Respiratory Services</div>
        <div className="lsub">Sign in with your @sghgroup.net email</div>
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
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && go()}
            placeholder="••••••••" />
        </div>
        {err && <div className="err">⚠ {err}</div>}
        <button className="lbtn" onClick={go}>Sign In →</button>
        <div className="lhint">
          <strong style={{ display: 'block', marginBottom: 4, color: 'var(--t2)' }}>Demo Accounts (8 Branches)</strong>
          Network Director: sultanalshehri@sghgroup.net<br />
          Jeddah: ahmad.zahrani@sghgroup.net<br />
          Riyadh: khalid.dosari@sghgroup.net · Makkah: yasser.ghamdi@sghgroup.net<br />
          Hai Aljamea: bader.harbi@sghgroup.net
        </div>
      </div>
    </div>
  );
}
