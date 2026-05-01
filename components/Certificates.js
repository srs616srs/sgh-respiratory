'use client';
import { useState } from 'react';
import { staffOf, getBranch, certStatus, daysUntil } from '../lib/data';
import { BranchTag } from './App';

const TYPES = ['BLS', 'ACLS', 'PALS', 'NRP'];

export default function Certificates({ certs, setCerts, selBr, activeBranch }) {
  const [addModal, setAddModal] = useState(null); // staffId
  const [newCert, setNewCert] = useState({ type: 'BLS', expiryDate: '' });
  const sl = staffOf(selBr);
  const gc = (sid, t) => certs.find(c => c.staffId === sid && c.type === t);
  const expC = certs.filter(c => sl.some(s => s.id === c.staffId) && certStatus(c.expiryDate) === 'expired').length;
  const expS = certs.filter(c => sl.some(s => s.id === c.staffId) && certStatus(c.expiryDate) === 'expiring').length;

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
          <div><div className="pt">Life Support Certificates</div><div className="ps">BLS · ACLS · PALS · NRP — 90-day auto-alerts</div></div>
          <BranchTag br={selBr === 'all' ? { full: 'All Branches', color: '#0096b4' } : activeBranch} />
        </div>
      </div>
      <div className="cnt">
        {(expC > 0 || expS > 0) && (
          <div className="abanner">
            <span style={{ fontSize: 16 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#991b1b', fontWeight: 600 }}>{expC} expired · {expS} expiring within 90 days</div>
              <div style={{ fontSize: 10, color: '#dc2626', marginTop: 1 }}>Staff and branch leads are notified 90 days before expiry</div>
            </div>
            <button className="btn dan sm">📧 Send Reminders</button>
          </div>
        )}
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
