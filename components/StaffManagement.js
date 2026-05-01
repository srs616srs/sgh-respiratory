'use client';
import { useState } from 'react';
import { staffOf, getBranch, getStaff, daysUntil, genSched, SCHED_MONTH_NAME, SCHED_DAYS_COUNT, getCurrentShift, BRANCHES } from '../lib/data';
import { BranchTag } from './App';

const SHIFT_BG = { M: '#dbeafe', E: '#dcfce7', N: '#ede9fe', O: '#f3f4f6', L: '#fef3c7' };
const SHIFT_COLORS = { M: '#1d4ed8', E: '#166534', N: '#5b21b6', O: '#9ca3af', L: '#92400e' };

export default function StaffManagement({ staffMeta, setStaffMeta, vacations, setVacations, folders, setFolders, user, selBr, activeBranch }) {
  const [tab, setTab] = useState(0);
  const [showFolderModal, setShowFolderModal] = useState(null);
  const [folderNote, setFolderNote] = useState('');
  const [folderType, setFolderType] = useState('Warning');
  const [vacModal, setVacModal] = useState(false);
  const [newVac, setNewVac] = useState({ staffId: '', start: '', end: '', type: 'Annual', days: 0, status: 'pending' });

  const sl = staffOf(selBr);
  const getMeta = (sid) => staffMeta.find(m => m.staffId === sid) || {};
  const expiring90 = staffMeta.filter(m => {
    const s = getStaff(m.staffId);
    return (selBr === 'all' || s?.branchId === selBr) && daysUntil(m.contractEnd) <= 90 && daysUntil(m.contractEnd) > 0;
  });

  const addFolder = () => {
    if (!folderNote.trim()) return;
    setFolders(p => [...p, { id: Date.now(), staffId: showFolderModal, date: new Date().toISOString().split('T')[0], type: folderType, note: folderNote, severity: folderType === 'Commendation' ? 'positive' : folderType === 'Negligence' ? 'high' : 'medium' }]);
    setFolderNote(''); setShowFolderModal(null);
  };
  const toggleDuty = (sid) => setStaffMeta(p => p.map(m => m.staffId === sid ? { ...m, onDuty: !m.onDuty } : m));
  const approveVac = (vid) => setVacations(p => p.map(v => v.id === vid ? { ...v, status: 'approved' } : v));
  const rejectVac = (vid) => setVacations(p => p.filter(v => v.id !== vid));

  const addVac = () => {
    if (!newVac.staffId || !newVac.start || !newVac.end) return;
    const days = Math.ceil((new Date(newVac.end) - new Date(newVac.start)) / 86400000) + 1;
    setVacations(p => [...p, { id: Date.now(), ...newVac, staffId: parseInt(newVac.staffId), days, status: 'pending' }]);
    setVacModal(false);
    setNewVac({ staffId: '', start: '', end: '', type: 'Annual', days: 0, status: 'pending' });
  };

  const TABS = ['📋 Overview', '📅 Schedule', '🏖️ Vacations', '🟢 Active Duty', '📁 Staff Folders'];

  return (
    <>
      <div className="ph">
        <div className="ph-row">
          <div><div className="pt">Staff Management</div><div className="ps">Contracts · schedules · vacation planning · staff records</div></div>
          <BranchTag br={selBr === 'all' ? { full: 'All Branches', color: '#0096b4' } : activeBranch} />
        </div>
      </div>
      <div className="cnt">
        {expiring90.length > 0 && (
          <div className="contract-alert">
            <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>⚠️ Contract Expiry Alerts — {expiring90.length} staff within 90 days</div>
            {expiring90.slice(0, 3).map(m => (
              <div key={m.staffId} style={{ fontSize: 10.5, color: '#78350f' }}>
                • {getStaff(m.staffId)?.name} ({getBranch(getStaff(m.staffId)?.branchId)?.name}) — Expires in {daysUntil(m.contractEnd)} days ({m.contractEnd})
              </div>
            ))}
            {expiring90.length > 3 && <div style={{ fontSize: 10, color: '#92400e', marginTop: 3 }}>+{expiring90.length - 3} more…</div>}
          </div>
        )}

        <div className="tabs">{TABS.map((t, i) => <div key={i} className={`tab ${tab === i ? 'act' : ''}`} onClick={() => setTab(i)}>{t}</div>)}</div>

        {tab === 0 && (
          <div className="card"><div className="tw"><table>
            <thead><tr><th>SGH ID</th><th>Name</th><th>Branch</th><th>Role</th><th>Admin</th><th>Logistics</th><th>Education</th><th>Contract End</th><th>Status</th></tr></thead>
            <tbody>{sl.map(s => {
              const m = getMeta(s.id);
              const days = m.contractEnd ? daysUntil(m.contractEnd) : 999;
              return (
                <tr key={s.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 10.5, color: 'var(--t3)' }}>{m.sghId || '—'}</td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div className="av lg">{s.avatar}</div><span style={{ color: 'var(--t)', fontWeight: 500 }}>{s.name}</span></div></td>
                  <td><span style={{ fontSize: 9, padding: '2px 5px', borderRadius: 4, background: getBranch(s.branchId)?.color + '20', color: getBranch(s.branchId)?.color, fontWeight: 600 }}>{getBranch(s.branchId)?.short}</span></td>
                  <td style={{ fontSize: 10.5 }}>{s.role}</td>
                  <td style={{ textAlign: 'center' }}>{m.resp?.admin ? <span style={{ color: '#059669', fontSize: 14 }}>✓</span> : <span style={{ color: 'var(--t3)' }}>—</span>}</td>
                  <td style={{ textAlign: 'center' }}>{m.resp?.logistics ? <span style={{ color: '#059669', fontSize: 14 }}>✓</span> : <span style={{ color: 'var(--t3)' }}>—</span>}</td>
                  <td style={{ textAlign: 'center' }}>{m.resp?.education ? <span style={{ color: '#059669', fontSize: 14 }}>✓</span> : <span style={{ color: 'var(--t3)' }}>—</span>}</td>
                  <td style={{ fontSize: 10.5 }}><span style={{ color: days <= 90 ? 'var(--dan)' : days <= 180 ? 'var(--warn)' : 'var(--t2)' }}>{m.contractEnd || '—'}</span>{days <= 90 && days > 0 && <span style={{ fontSize: 8.5, color: 'var(--dan)', marginLeft: 4 }}>({days}d)</span>}</td>
                  <td><span className={`b ${days > 0 ? 'valid' : 'expired'}`}>{days > 0 ? 'Active' : 'Expired'}</span></td>
                </tr>
              );
            })}</tbody>
          </table></div></div>
        )}

        {tab === 1 && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div className="stitle" style={{ margin: 0 }}>📅 {SCHED_MONTH_NAME} — Shift Schedule</div>
              <div className="sched-legend">
                {[['M', 'Morning'], ['E', 'Evening'], ['N', 'Night'], ['O', 'Off'], ['L', 'Leave']].map(([c, l]) => (
                  <div key={c} className="sleg"><div className="sleg-dot" style={{ background: SHIFT_BG[c], color: SHIFT_COLORS[c] }}>{c}</div>{l}</div>
                ))}
              </div>
            </div>
            <div className="sched-wrap">
              <table className="sched-tbl">
                <thead>
                  <tr>
                    <th className="sched-th" style={{ textAlign: 'left', paddingRight: 10 }}>Staff</th>
                    {Array.from({ length: SCHED_DAYS_COUNT }, (_, i) => <th key={i} className="sched-th">{i + 1}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {sl.map(s => {
                    const sched = genSched(s.id);
                    return (
                      <tr key={s.id}>
                        <td className="sched-name">{s.name.split(' ').slice(0, 2).join(' ')}</td>
                        {sched.map((sh, i) => <td key={i}><div className={`sched-cell sh-${sh}`}>{sh}</div></td>)}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}>
              <div className="stitle" style={{ margin: 0 }}>Vacation Planner</div>
              <button className="btn pri sm" onClick={() => setVacModal(true)}>+ Add Request</button>
            </div>
            <div className="vac-list">
              {vacations.filter(v => { const s = getStaff(v.staffId); return selBr === 'all' || s?.branchId === selBr; }).map(v => {
                const s = getStaff(v.staffId);
                const br = getBranch(s?.branchId);
                return (
                  <div key={v.id} className="vac-card">
                    <div className="av lg">{s?.avatar}</div>
                    <div className="vac-info">
                      <div className="vac-name">{s?.name} <span style={{ fontSize: 9, color: br?.color, fontWeight: 600 }}>• {br?.name}</span></div>
                      <div className="vac-dates">📅 {v.start} → {v.end} · {v.days} days · {v.type}</div>
                    </div>
                    <span className={`b ${v.status === 'approved' ? 'valid' : 'pending-v'}`}>{v.status === 'approved' ? '✓ Approved' : '⏳ Pending'}</span>
                    {user.isHOD && v.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="btn grn sm" onClick={() => approveVac(v.id)}>✓</button>
                        <button className="btn dan sm" onClick={() => rejectVac(v.id)}>✗</button>
                      </div>
                    )}
                  </div>
                );
              })}
              {vacations.filter(v => { const s = getStaff(v.staffId); return selBr === 'all' || s?.branchId === selBr; }).length === 0 && (
                <div className="es"><div className="es-ico">🏖️</div>No vacation requests for this branch</div>
              )}
            </div>
          </div>
        )}

        {tab === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13 }}>
              <div className="stitle" style={{ margin: 0 }}>Active Duty Status</div>
              <span style={{ fontSize: 10.5, background: '#e0f2fe', color: '#075985', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>Current Shift: {getCurrentShift()}</span>
            </div>
            <div className="duty-grid">
              {['Morning', 'Evening', 'Night'].map(shift => {
                const shiftCode = shift[0];
                const onShift = sl.filter(s => { const sched = genSched(s.id); return sched[new Date().getDate() - 1] === shiftCode; });
                const bgColors = { Morning: '#dbeafe', Evening: '#dcfce7', Night: '#ede9fe' };
                const txColors = { Morning: '#1d4ed8', Evening: '#166534', Night: '#5b21b6' };
                return (
                  <div key={shift} className="duty-card">
                    <div className="duty-shift" style={{ color: txColors[shift] }}>{shift} Shift</div>
                    <div className="duty-val" style={{ color: txColors[shift] }}>{onShift.length}</div>
                    <div className="duty-lbl">RTs scheduled</div>
                    <div className="duty-staff">
                      {onShift.map(s => <div key={s.id} title={s.name}><div className="av sm" style={{ background: `linear-gradient(135deg,${getBranch(s.branchId)?.color || '#0096b4'},#7c3aed)` }}>{s.avatar}</div></div>)}
                      {onShift.length === 0 && <span style={{ fontSize: 10, color: 'var(--t3)' }}>No staff scheduled</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="card">
              <div className="stitle">On-Duty Toggle</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {sl.map(s => {
                  const m = getMeta(s.id);
                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 11px', background: m.onDuty ? '#dcfce7' : 'var(--sur2)', border: `1px solid ${m.onDuty ? '#86efac' : 'var(--bd)'}`, borderRadius: 9, cursor: 'pointer', transition: 'all .15s' }} onClick={() => toggleDuty(s.id)}>
                      <div className="av sm">{s.avatar}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--t)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                        <div style={{ fontSize: 8.5, color: 'var(--t3)' }}>{s.role}</div>
                      </div>
                      <span style={{ fontSize: 12 }}>{m.onDuty ? '🟢' : '⚫'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === 4 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}>
              <div className="stitle" style={{ margin: 0 }}>Staff Personal Folders</div>
              <span style={{ fontSize: 10.5, color: 'var(--t3)' }}>Warnings · Delays · Negligence · Commendations</span>
            </div>
            {sl.map(s => {
              const sf = folders.filter(f => f.staffId === s.id);
              if (!sf.length && !user.isHOD) return null;
              return (
                <div key={s.id} className="card" style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: sf.length ? 10 : 0 }}>
                    <div className="av lg">{s.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t)' }}>{s.name}</div>
                      <div style={{ fontSize: 9.5, color: 'var(--t3)' }}>{s.role} · {getMeta(s.id).sghId}</div>
                    </div>
                    <span style={{ fontSize: 10.5, color: 'var(--t3)' }}>{sf.length} record{sf.length !== 1 ? 's' : ''}</span>
                    {user.isHOD && <button className="btn pri sm" onClick={() => setShowFolderModal(s.id)}>+ Add Record</button>}
                  </div>
                  <div className="folder-list">
                    {sf.map(f => (
                      <div key={f.id} className={`fe ${f.type.toLowerCase()}`}>
                        <div className="fe-head">
                          <span className={`b ${f.type.toLowerCase()}`}>{f.type === 'Commendation' ? '⭐' : f.type === 'Negligence' ? '🔴' : f.type === 'Warning' ? '🟡' : '🟠'} {f.type}</span>
                          <span style={{ fontSize: 10, color: 'var(--t3)', marginLeft: 'auto' }}>{f.date}</span>
                        </div>
                        <div className="fe-note">{f.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showFolderModal && (
        <div className="ov" onClick={() => setShowFolderModal(null)}>
          <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="m-title">Add Record — {getStaff(showFolderModal)?.name}</div>
            <div className="ig">
              <label className="inplbl">Record Type</label>
              <select className="inpf" value={folderType} onChange={e => setFolderType(e.target.value)}>
                {['Warning', 'Delay', 'Negligence', 'Commendation'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="ig">
              <label className="inplbl">Notes</label>
              <textarea className="ta" rows={4} value={folderNote} onChange={e => setFolderNote(e.target.value)} placeholder="Describe the incident or commendation…" />
            </div>
            <div style={{ display: 'flex', gap: 7, justifyContent: 'flex-end' }}>
              <button className="btn out" onClick={() => setShowFolderModal(null)}>Cancel</button>
              <button className="btn pri" onClick={addFolder}>Save Record</button>
            </div>
          </div>
        </div>
      )}

      {vacModal && (
        <div className="ov" onClick={() => setVacModal(false)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="m-title">+ Vacation Request</div>
            <div className="ig">
              <label className="inplbl">Staff Member</label>
              <select className="inpf" value={newVac.staffId} onChange={e => setNewVac(p => ({ ...p, staffId: e.target.value }))}>
                <option value="">Select staff…</option>
                {sl.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="ig">
                <label className="inplbl">Start Date</label>
                <input className="inpf" type="date" value={newVac.start} onChange={e => setNewVac(p => ({ ...p, start: e.target.value }))} />
              </div>
              <div className="ig">
                <label className="inplbl">End Date</label>
                <input className="inpf" type="date" value={newVac.end} onChange={e => setNewVac(p => ({ ...p, end: e.target.value }))} />
              </div>
            </div>
            <div className="ig">
              <label className="inplbl">Leave Type</label>
              <select className="inpf" value={newVac.type} onChange={e => setNewVac(p => ({ ...p, type: e.target.value }))}>
                {['Annual', 'Emergency', 'Medical', 'Maternity'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 7, justifyContent: 'flex-end' }}>
              <button className="btn out" onClick={() => setVacModal(false)}>Cancel</button>
              <button className="btn pri" onClick={addVac}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
