'use client';
import { useState } from 'react';
import { getBranch, certStatus, daysUntil } from '../lib/data';
import { BranchTag } from './App';

const TYPES = ['BLS', 'ACLS', 'PALS', 'NRP'];

export default function Certificates({ certs, setCerts, selBr, activeBranch, staff, user }) {
  const [tab, setTab] = useState('certs'); // 'certs' | 'moh'
  const [addModal, setAddModal] = useState(null);
  const [newCert, setNewCert] = useState({ type: 'BLS', expiryDate: '' });

  // Staff see only their own row; HOD sees all branch staff
  const sl = staff
    ? user.isHOD
      ? staff.filter(s => (selBr === 'all' || s.branchId === selBr) && !s.isHOD)
      : staff.filter(s => s.id === user.id)
    : [];

  const gc = (sid, t) => certs.find(c => c.staffId === sid && c.type === t);
  const expC = certs.filter(c => sl.some(s => s.id === c.staffId) && certStatus(c.expiryDate) === 'expired').length;
  const expS = certs.filter(c => sl.some(s => s.id === c.staffId) && certStatus(c.expiryDate) === 'expiring').length;

  // MOH license status helpers
  const mohStatus = (expiry) => {
    if (!expiry) return 'missing';
    const d = Math.ceil((new Date(expiry) - new Date()) / 86400000);
    return d < 0 ? 'expired' : d <= 90 ? 'expiring' : 'valid';
  };
  const mohDays = (expiry) => expiry ? Math.ceil((new Date(expiry) - new Date()) / 86400000) : null;

  const mohMissing = sl.filter(s => !s.mohLicenseUrl).length;
  const mohExpired = sl.filter(s => s.mohLicenseExpiry && mohStatus(s.mohLicenseExpiry) === 'expired').length;
  const mohExpiring = sl.filter(s => s.mohLicenseExpiry && mohStatus(s.mohLicenseExpiry) === 'expiring').length;

  const saveCert = () => {
    if (!newCert.expiryDate) return;
    setCerts(p => {
      const filtered = p.filter(c => !(c.staffId === addModal && c.type === newCert.type));
      return [...filtered, { id: Date.now(), staffId: addModal, type: newCert.type, expiryDate: newCert.expiryDate }];
    });
    setAddModal(null);
    setNewCert({ type: 'BLS', expiryDate: '' });
  };

  return (
    <>
      <div className="ph">
        <div className="ph-row">
          <div><div className="pt">Certificates & Licenses</div><div className="ps">BLS · ACLS · PALS · NRP · MOH License — 90-day auto-alerts</div></div>
          <BranchTag br={selBr === 'all' ? { full: 'All Branches', color: '#0096b4' } : activeBranch} />
        </div>
      </div>
      <div className="cnt">
        {/* Summary alerts */}
        {(expC > 0 || expS > 0 || mohExpired > 0 || mohExpiring > 0) && (
          <div className="abanner">
            <span style={{ fontSize: 16 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#991b1b', fontWeight: 600 }}>
                {expC > 0 && `${expC} life support expired · `}{expS > 0 && `${expS} life support expiring · `}
                {mohExpired > 0 && `${mohExpired} MOH expired · `}{mohExpiring > 0 && `${mohExpiring} MOH expiring`}
              </div>
              <div style={{ fontSize: 10, color: '#dc2626', marginTop: 1 }}>Staff notified 90 days before expiry</div>
            </div>
          </div>
        )}

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          <button onClick={() => setTab('certs')}
            style={{ padding: '6px 18px', borderRadius: 7, border: '1px solid var(--bd)', cursor: 'pointer', fontFamily: 'var(--sora)', fontSize: 11, fontWeight: tab === 'certs' ? 700 : 400,
              background: tab === 'certs' ? 'var(--a)' : 'var(--sur2)', color: tab === 'certs' ? '#fff' : 'var(--t2)' }}>
            🛡️ Life Support Certs
          </button>
          {(user.isHOD || !user.isHOD) && (
            <button onClick={() => setTab('moh')}
              style={{ padding: '6px 18px', borderRadius: 7, border: '1px solid var(--bd)', cursor: 'pointer', fontFamily: 'var(--sora)', fontSize: 11, fontWeight: tab === 'moh' ? 700 : 400,
                background: tab === 'moh' ? 'var(--a)' : 'var(--sur2)', color: tab === 'moh' ? '#fff' : 'var(--t2)' }}>
              🏥 MOH License {user.isHOD && mohMissing > 0 && `(${mohMissing} missing)`}
            </button>
          )}
        </div>

        {/* ── Life Support Certs Tab ── */}
        {tab === 'certs' && (
          <div className="card">
            <div className="tw">
              <table>
                <thead>
                  <tr><th>Staff</th><th>Branch</th><th>Role</th>{TYPES.map(t => <th key={t} style={{ textAlign: 'center' }}>{t}</th>)}<th></th></tr>
                </thead>
                <tbody>
                  {sl.map(s => (
                    <tr key={s.id}>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><div className="av lg">{s.avatar}</div><span style={{ color: 'var(--t)', fontWeight: 500 }}>{s.name}</span></div></td>
                      <td><span style={{ fontSize: 9.5, padding: '2px 6px', borderRadius: 5, background: getBranch(s.branchId)?.color + '20', color: getBranch(s.branchId)?.color, fontWeight: 600, border: `1px solid ${getBranch(s.branchId)?.color}44` }}>{getBranch(s.branchId)?.name}</span></td>
                      <td style={{ fontSize: 10.5 }}>{s.role}</td>
                      {TYPES.map(t => {
                        const cert = gc(s.id, t);
                        if (!cert) return <td key={t} style={{ textAlign: 'center' }}><span style={{ color: 'var(--t3)' }}>○</span></td>;
                        const st = certStatus(cert.expiryDate);
                        return (
                          <td key={t} style={{ textAlign: 'center' }}>
                            <span className={`b ${st}`}>{st === 'valid' ? '✓' : st === 'expiring' ? `${daysUntil(cert.expiryDate)}d` : '✗'} {t}</span>
                            <div style={{ fontSize: 8, color: 'var(--t3)', marginTop: 2 }}>{cert.expiryDate}</div>
                          </td>
                        );
                      })}
                      <td><button className="btn out sm" onClick={() => setAddModal(s.id)}>+ Update</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── MOH License Tab ── */}
        {tab === 'moh' && (
          <div className="card">
            {user.isHOD ? (
              // HOD/Admin: see all staff MOH status
              <div className="tw">
                <table>
                  <thead>
                    <tr>
                      <th>Staff</th>
                      <th>Branch</th>
                      <th style={{ textAlign: 'center' }}>MOH License</th>
                      <th style={{ textAlign: 'center' }}>Expiry</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sl.map(s => {
                      const st = mohStatus(s.mohLicenseExpiry);
                      const days = mohDays(s.mohLicenseExpiry);
                      return (
                        <tr key={s.id}>
                          <td><div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><div className="av lg">{s.avatar}</div><span style={{ color: 'var(--t)', fontWeight: 500 }}>{s.name}</span></div></td>
                          <td><span style={{ fontSize: 9.5, padding: '2px 6px', borderRadius: 5, background: getBranch(s.branchId)?.color + '20', color: getBranch(s.branchId)?.color, fontWeight: 600, border: `1px solid ${getBranch(s.branchId)?.color}44` }}>{getBranch(s.branchId)?.name}</span></td>
                          <td style={{ textAlign: 'center' }}>
                            {s.mohLicenseUrl
                              ? <a href={s.mohLicenseUrl} target="_blank" rel="noreferrer" style={{ fontSize: 10.5, color: 'var(--a)', fontWeight: 600, textDecoration: 'none' }}>📄 View PDF</a>
                              : <span style={{ fontSize: 10.5, color: 'var(--t3)' }}>—</span>}
                          </td>
                          <td style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--t2)' }}>
                            {s.mohLicenseExpiry || '—'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {!s.mohLicenseUrl
                              ? <span className="ratio-badge ratio-bad">Not Submitted</span>
                              : !s.mohLicenseExpiry
                              ? <span className="ratio-badge ratio-warn">No Expiry</span>
                              : st === 'expired'
                              ? <span className="ratio-badge ratio-bad">Expired {Math.abs(days)}d ago</span>
                              : st === 'expiring'
                              ? <span className="ratio-badge ratio-warn">Exp. in {days}d</span>
                              : <span className="ratio-badge ratio-ok">Valid · {days}d</span>}
                          </td>
                          <td>
                            <span style={{ fontSize: 9.5, color: 'var(--t3)' }}>Staff uploads via Profile</span>
                          </td>
                        </tr>
                      );
                    })}
                    {sl.length === 0 && (
                      <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--t3)', padding: 30 }}>No staff found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              // Staff: see only their own MOH status + link to upload
              <div>
                {(() => {
                  const me = sl[0];
                  if (!me) return null;
                  const st = mohStatus(me.mohLicenseExpiry);
                  const days = mohDays(me.mohLicenseExpiry);
                  return (
                    <div style={{ padding: 20 }}>
                      <div style={{ font: '600 13px var(--sora)', color: 'var(--t)', marginBottom: 16 }}>🏥 My MOH License</div>
                      {me.mohLicenseUrl ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--sur2)', borderRadius: 10, padding: '14px 18px', marginBottom: 14 }}>
                          <span style={{ fontSize: 28 }}>📄</span>
                          <div style={{ flex: 1 }}>
                            <a href={me.mohLicenseUrl} target="_blank" rel="noreferrer"
                              style={{ fontSize: 13, fontWeight: 700, color: 'var(--a)', textDecoration: 'none' }}>
                              View My MOH License ↗
                            </a>
                            <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 3 }}>
                              Expiry: {me.mohLicenseExpiry || 'Not set'}
                            </div>
                          </div>
                          {me.mohLicenseExpiry && (
                            <span className={`ratio-badge ${st === 'expired' ? 'ratio-bad' : st === 'expiring' ? 'ratio-warn' : 'ratio-ok'}`}>
                              {st === 'expired' ? `Expired ${Math.abs(days)}d ago` : st === 'expiring' ? `Exp. in ${days}d` : `Valid · ${days}d`}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '14px 18px', marginBottom: 14 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#c2410c', marginBottom: 6 }}>⚠ MOH License Not Submitted</div>
                          <div style={{ fontSize: 11, color: '#9a3412' }}>Please upload your MOH license PDF and expiry date in your Profile.</div>
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: 'var(--t3)', background: 'var(--sur2)', borderRadius: 8, padding: '10px 14px' }}>
                        💡 To upload or update your MOH license, click <strong>👤 Profile</strong> in the sidebar.
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {addModal && (
        <div className="ov" onClick={() => setAddModal(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="m-title">Update Certificate</div>
            <div className="m-sub">{sl.find(s => s.id === addModal)?.name}</div>
            <div className="ig">
              <label className="inplbl">Certificate Type</label>
              <select className="inpf" value={newCert.type} onChange={e => setNewCert(p => ({ ...p, type: e.target.value }))}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="ig">
              <label className="inplbl">Expiry Date</label>
              <input className="inpf" type="date" value={newCert.expiryDate} onChange={e => setNewCert(p => ({ ...p, expiryDate: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 7, justifyContent: 'flex-end' }}>
              <button className="btn out" onClick={() => setAddModal(null)}>Cancel</button>
              <button className="btn pri" onClick={saveCert}>Save Certificate</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
