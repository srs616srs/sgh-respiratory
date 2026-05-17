'use client';
import { useState } from 'react';
import { getBranch, daysUntil, SCHED_MONTH_NAME, SCHED_DAYS_COUNT } from '../lib/data';
import { BranchTag } from './App';

export default function StaffManagement({ staffMeta, setStaffMeta, vacations, setVacations, folders, setFolders, schedules, setSchedules, saveSchedule, monthYear, user, selBr, activeBranch, staff }) {
  const [tab, setTab] = useState(0);
  const [showFolderModal, setShowFolderModal] = useState(null);
  const [folderNote, setFolderNote] = useState('');
  const [folderType, setFolderType] = useState('Warning');
  const [vacModal, setVacModal] = useState(false);
  const [newVac, setNewVac] = useState({ staffId: '', start: '', end: '', type: 'Annual', days: 0, status: 'pending' });
  const [newZoneName, setNewZoneName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  // Shift swap
  const [swapRequests, setSwapRequests] = useState([]);
  const [swapForm, setSwapForm] = useState({ date: '', myShift: 'D', targetStaff: '', theirShift: 'O', notes: '' });
  const [swapSubmitted, setSwapSubmitted] = useState(false);

  // HODs always see only their own branch staff; admins see by selBr
  const effectiveBranch = user.isAdmin ? selBr : user.branchId;
  const sl = staff ? staff.filter(s => (effectiveBranch === 'all' || s.branchId === effectiveBranch) && !s.isHOD) : [];
  // Only HOD/admin can edit schedules — staff is always read-only
  const canEdit = user.isHOD && (user.isAdmin || selBr === user.branchId);
  const getStaffById = (id) => staff?.find(s => s.id === id);
  const getMeta = (sid) => staffMeta.find(m => m.staffId === sid) || {};
  const expiring90 = staffMeta.filter(m => {
    const s = getStaffById(m.staffId);
    return (selBr === 'all' || s?.branchId === selBr) && daysUntil(m.contractEnd) <= 90 && daysUntil(m.contractEnd) > 0;
  });

  // Schedule helpers — keyed by branchId
  const branchKey = selBr === 'all' ? 'all' : selBr;
  const brSched = schedules[branchKey] || { zones: [], staff: {} };
  const zones = brSched.zones || [];

  const setZones = (zns) => setSchedules(p => ({
    ...p,
    [branchKey]: { ...brSched, zones: zns },
  }));
  const setStaffSched = (staffId, data) => setSchedules(p => ({
    ...p,
    [branchKey]: {
      ...brSched,
      staff: { ...(brSched.staff || {}), [staffId]: data },
    },
  }));

  const addZone = () => {
    const name = newZoneName.trim() || `Z${zones.length + 1}`;
    if (zones.includes(name)) return;
    setZones([...zones, name]);
    setNewZoneName('');
  };
  const removeZone = (z) => setZones(zones.filter(x => x !== z));

  const getStaffZone = (sid) => brSched.staff?.[sid]?.zone || '';
  const getStaffDays = (sid) => brSched.staff?.[sid]?.days || Array(SCHED_DAYS_COUNT).fill('O');

  const cycleDay = (sid, dayIdx) => {
    const days = [...getStaffDays(sid)];
    const current = days[dayIdx];
    days[dayIdx] = current === 'D' ? 'N' : current === 'N' ? 'O' : 'D';
    setStaffSched(sid, { zone: getStaffZone(sid), days });
  };

  const setZoneForStaff = (sid, zone) => {
    setStaffSched(sid, { zone, days: getStaffDays(sid) });
  };

  const getDayLabel = (sid, dayIdx) => {
    const zone = getStaffZone(sid);
    const day = getStaffDays(sid)[dayIdx];
    if (day === 'O') return 'O';
    return `${day}${zone || ''}`;
  };

  const dayBg = (code) => {
    if (code === 'O') return { bg: '#f3f4f6', color: '#9ca3af' };
    if (code.startsWith('D')) return { bg: '#dbeafe', color: '#1d4ed8' };
    if (code.startsWith('N')) return { bg: '#ede9fe', color: '#5b21b6' };
    return { bg: '#f3f4f6', color: '#9ca3af' };
  };

  const handleSave = async () => {
    setSaving(true);
    const key = selBr === 'all' ? 'all' : selBr;
    await saveSchedule(key, brSched);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const today = new Date().getDate() - 1;
  const isDayShift = (sid) => {
    const day = getStaffDays(sid)[today];
    return day === 'D';
  };
  const isNightShift = (sid) => {
    const day = getStaffDays(sid)[today];
    return day === 'N';
  };

  const addFolder = () => {
    if (!folderNote.trim()) return;
    setFolders(p => [...p, { id: Date.now(), staffId: showFolderModal, date: new Date().toISOString().split('T')[0], type: folderType, note: folderNote, severity: folderType === 'Commendation' ? 'positive' : folderType === 'Negligence' ? 'high' : 'medium' }]);
    setFolderNote(''); setShowFolderModal(null);
  };
  const approveVac = (vid) => setVacations(p => p.map(v => v.id === vid ? { ...v, status: 'approved' } : v));
  const rejectVac = (vid) => setVacations(p => p.filter(v => v.id !== vid));

  const addVac = () => {
    if (!newVac.staffId || !newVac.start || !newVac.end) return;
    const days = Math.ceil((new Date(newVac.end) - new Date(newVac.start)) / 86400000) + 1;
    setVacations(p => [...p, { id: Date.now(), ...newVac, days, status: 'pending' }]);
    setVacModal(false);
    setNewVac({ staffId: '', start: '', end: '', type: 'Annual', days: 0, status: 'pending' });
  };

  const TABS = user.isHOD
    ? ['📋 Overview', '📅 Schedule', '🏖️ Vacations', '🟢 Active Duty', '📁 Staff Folders']
    : ['📅 Schedule', '🟢 Active Duty', '🔄 Shift Swap'];

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
            {expiring90.slice(0, 3).map(m => {
              const s = getStaffById(m.staffId);
              return (
                <div key={m.staffId} style={{ fontSize: 10.5, color: '#78350f' }}>
                  • {s?.name} ({getBranch(s?.branchId)?.name}) — Expires in {daysUntil(m.contractEnd)} days ({m.contractEnd})
                </div>
              );
            })}
            {expiring90.length > 3 && <div style={{ fontSize: 10, color: '#92400e', marginTop: 3 }}>+{expiring90.length - 3} more…</div>}
          </div>
        )}

        <div className="tabs">{TABS.map((t, i) => <div key={i} className={`tab ${tab === i ? 'act' : ''}`} onClick={() => setTab(i)}>{t}</div>)}</div>

        {/* HOD: Overview tab (index 0) */}
        {user.isHOD && tab === 0 && (
          <div className="card"><div className="tw"><table>
            <thead><tr><th>Name</th><th>Branch</th><th>Role</th><th>Contract End</th><th>Status</th></tr></thead>
            <tbody>{sl.map(s => {
              const m = getMeta(s.id);
              const days = m.contractEnd ? daysUntil(m.contractEnd) : 999;
              return (
                <tr key={s.id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div className="av lg">{s.avatar}</div><span style={{ color: 'var(--t)', fontWeight: 500 }}>{s.name}</span></div></td>
                  <td><span style={{ fontSize: 9, padding: '2px 5px', borderRadius: 4, background: getBranch(s.branchId)?.color + '20', color: getBranch(s.branchId)?.color, fontWeight: 600 }}>{getBranch(s.branchId)?.short || s.branchId}</span></td>
                  <td style={{ fontSize: 10.5 }}>{s.role}</td>
                  <td style={{ fontSize: 10.5 }}><span style={{ color: days <= 90 ? 'var(--dan)' : days <= 180 ? 'var(--warn)' : 'var(--t2)' }}>{m.contractEnd || '—'}</span>{days <= 90 && days > 0 && <span style={{ fontSize: 8.5, color: 'var(--dan)', marginLeft: 4 }}>({days}d)</span>}</td>
                  <td><span className={`b ${days > 0 ? 'valid' : 'expired'}`}>{days > 0 ? 'Active' : 'Expired'}</span></td>
                </tr>
              );
            })}</tbody>
          </table></div></div>
        )}

        {/* Schedule tab: HOD=1, Staff=0 */}
        {(user.isHOD ? tab === 1 : tab === 0) && (
          <div>
            {/* Zone management */}
            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ font: '600 12px var(--sora)', color: 'var(--t)' }}>📍 Zone Setup</div>
                {canEdit && (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input className="inpf" style={{ width: 80, padding: '4px 8px', fontSize: 10.5 }} placeholder="Z1, ICU…" value={newZoneName} onChange={e => setNewZoneName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addZone()} />
                    <button className="btn pri sm" onClick={addZone}>+ Add Zone</button>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {zones.length === 0 && <span style={{ fontSize: 10.5, color: 'var(--t3)' }}>No zones defined yet — add zone names (e.g. Z1, Z2, ICU, Ward…)</span>}
                {zones.map(z => (
                  <span key={z} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: '#e0f2fe', color: '#075985', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                    {z}
                    {canEdit && <span onClick={() => removeZone(z)} style={{ cursor: 'pointer', color: '#dc2626', marginLeft: 2 }}>×</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* Schedule grid */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div className="stitle" style={{ margin: 0 }}>📅 {SCHED_MONTH_NAME} — 12-Hour Shift Schedule</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {saved && <span style={{ fontSize: 10.5, color: '#166534', fontWeight: 600 }}>✓ Saved</span>}
                  {canEdit && (
                    <button className="btn pri sm" onClick={handleSave} disabled={saving}>
                      {saving ? '⏳ Saving…' : '💾 Save Schedule'}
                    </button>
                  )}
                <div className="sched-legend">
                  {[['D', 'Day (07:00–19:00)', '#dbeafe', '#1d4ed8'], ['N', 'Night (19:00–07:00)', '#ede9fe', '#5b21b6'], ['O', 'Off', '#f3f4f6', '#9ca3af']].map(([c, l, bg, col]) => (
                    <div key={c} className="sleg"><div className="sleg-dot" style={{ background: bg, color: col, fontWeight: 700, fontSize: 9 }}>{c}</div>{l}</div>
                  ))}
                </div>
                </div>
              </div>
              <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 8 }}>
                {canEdit ? 'Click any cell to cycle: Day → Night → Off. Set zone per staff.' : 'View-only — contact your HOD to update shifts.'}
              </div>
              <div className="sched-wrap">
                <table className="sched-tbl">
                  <thead>
                    <tr>
                      <th className="sched-th" style={{ textAlign: 'left', minWidth: 110 }}>Staff</th>
                      <th className="sched-th" style={{ minWidth: 70 }}>Zone</th>
                      {Array.from({ length: SCHED_DAYS_COUNT }, (_, i) => <th key={i} className="sched-th">{i + 1}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {sl.map(s => (
                      <tr key={s.id}>
                        <td className="sched-name">{s.name.split(' ').slice(0, 2).join(' ')}</td>
                        <td>
                          {canEdit ? (
                            <select value={getStaffZone(s.id)} onChange={e => setZoneForStaff(s.id, e.target.value)}
                              style={{ fontSize: 9.5, padding: '2px 4px', borderRadius: 4, border: '1px solid var(--bd)', background: 'var(--sur2)', color: 'var(--t)', width: '100%' }}>
                              <option value="">—</option>
                              {zones.map(z => <option key={z} value={z}>{z}</option>)}
                            </select>
                          ) : (
                            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--a)' }}>{getStaffZone(s.id) || '—'}</span>
                          )}
                        </td>
                        {Array.from({ length: SCHED_DAYS_COUNT }, (_, i) => {
                          const label = getDayLabel(s.id, i);
                          const { bg, color } = dayBg(label);
                          return (
                            <td key={i} onClick={() => canEdit && cycleDay(s.id, i)} style={{ cursor: canEdit ? 'pointer' : 'default' }}>
                              <div style={{ minWidth: 28, textAlign: 'center', padding: '3px 2px', borderRadius: 4, background: bg, color, fontSize: 8.5, fontWeight: 700 }}>{label}</div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Vacations tab: HOD only (index 2) */}
        {user.isHOD && tab === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}>
              <div className="stitle" style={{ margin: 0 }}>Vacation Planner</div>
              <button className="btn pri sm" onClick={() => setVacModal(true)}>+ Add Request</button>
            </div>
            <div className="vac-list">
              {vacations.filter(v => { const s = getStaffById(v.staffId); return selBr === 'all' || s?.branchId === selBr; }).map(v => {
                const s = getStaffById(v.staffId);
                const br = getBranch(s?.branchId);
                return (
                  <div key={v.id} className="vac-card">
                    <div className="av lg">{s?.avatar}</div>
                    <div className="vac-info">
                      <div className="vac-name">{s?.name} <span style={{ fontSize: 9, color: br?.color, fontWeight: 600 }}>• {br?.name}</span></div>
                      <div className="vac-dates">📅 {v.start} → {v.end} · {v.days} days · {v.type}</div>
                    </div>
                    <span className={`b ${v.status === 'approved' ? 'valid' : 'pending-v'}`}>{v.status === 'approved' ? '✓ Approved' : '⏳ Pending'}</span>
                    {canEdit && v.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="btn grn sm" onClick={() => approveVac(v.id)}>✓</button>
                        <button className="btn dan sm" onClick={() => rejectVac(v.id)}>✗</button>
                      </div>
                    )}
                  </div>
                );
              })}
              {vacations.filter(v => { const s = getStaffById(v.staffId); return selBr === 'all' || s?.branchId === selBr; }).length === 0 && (
                <div className="es"><div className="es-ico">🏖️</div>No vacation requests for this branch</div>
              )}
            </div>
          </div>
        )}

        {/* Active Duty: HOD=3, Staff=1 */}
        {(user.isHOD ? tab === 3 : tab === 1) && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13 }}>
              <div className="stitle" style={{ margin: 0 }}>Active Duty Status — Today</div>
              <span style={{ fontSize: 10.5, background: '#e0f2fe', color: '#075985', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>

            <div className="duty-grid">
              {[
                { label: 'Day Shift', sub: '07:00 – 19:00', filter: isDayShift, bg: '#dbeafe', color: '#1d4ed8' },
                { label: 'Night Shift', sub: '19:00 – 07:00', filter: isNightShift, bg: '#ede9fe', color: '#5b21b6' },
                { label: 'Off Duty', sub: 'Rest day', filter: (sid) => !isDayShift(sid) && !isNightShift(sid), bg: '#f3f4f6', color: '#6b7280' },
              ].map(shift => {
                const onShift = sl.filter(s => shift.filter(s.id));
                return (
                  <div key={shift.label} className="duty-card">
                    <div className="duty-shift" style={{ color: shift.color }}>{shift.label}</div>
                    <div style={{ fontSize: 9.5, color: shift.color, marginBottom: 4, opacity: 0.7 }}>{shift.sub}</div>
                    <div className="duty-val" style={{ color: shift.color }}>{onShift.length}</div>
                    <div className="duty-lbl">RTs scheduled</div>
                    <div className="duty-staff">
                      {onShift.map(s => {
                        const zone = getStaffZone(s.id);
                        return (
                          <div key={s.id} title={`${s.name}${zone ? ' · ' + zone : ''}`}>
                            <div className="av sm" style={{ background: `linear-gradient(135deg,${getBranch(s.branchId)?.color || '#0096b4'},#7c3aed)` }}>{s.avatar}</div>
                            {zone && <div style={{ fontSize: 7.5, textAlign: 'center', color: shift.color, fontWeight: 700, marginTop: 1 }}>{zone}</div>}
                          </div>
                        );
                      })}
                      {onShift.length === 0 && <span style={{ fontSize: 10, color: 'var(--t3)' }}>No staff</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Zone summary */}
            {zones.length > 0 && (
              <div className="card" style={{ marginTop: 12 }}>
                <div className="stitle">Zone Coverage Today</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
                  {zones.map(z => {
                    const dayInZone = sl.filter(s => getStaffZone(s.id) === z && isDayShift(s.id));
                    const nightInZone = sl.filter(s => getStaffZone(s.id) === z && isNightShift(s.id));
                    return (
                      <div key={z} style={{ background: 'var(--sur2)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--bd)', textAlign: 'center' }}>
                        <div style={{ font: '700 14px var(--sora)', color: 'var(--t)' }}>{z}</div>
                        <div style={{ fontSize: 9.5, marginTop: 4, color: '#1d4ed8' }}>☀ {dayInZone.length} Day</div>
                        <div style={{ fontSize: 9.5, color: '#5b21b6' }}>🌙 {nightInZone.length} Night</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Staff Folders: HOD only (index 4) */}
        {user.isHOD && tab === 4 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}>
              <div className="stitle" style={{ margin: 0 }}>Staff Personal Folders</div>
              <span style={{ fontSize: 10.5, color: 'var(--t3)' }}>Warnings · Delays · Negligence · Commendations</span>
            </div>
            {sl.map(s => {
              const sf = folders.filter(f => f.staffId === s.id);
              if (!sf.length && !canEdit) return null;
              return (
                <div key={s.id} className="card" style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: sf.length ? 10 : 0 }}>
                    <div className="av lg">{s.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t)' }}>{s.name}</div>
                      <div style={{ fontSize: 9.5, color: 'var(--t3)' }}>{s.role} · {getMeta(s.id).sghId}</div>
                    </div>
                    <span style={{ fontSize: 10.5, color: 'var(--t3)' }}>{sf.length} record{sf.length !== 1 ? 's' : ''}</span>
                    {canEdit && <button className="btn pri sm" onClick={() => setShowFolderModal(s.id)}>+ Add Record</button>}
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
            {sl.length === 0 && <div className="es"><div className="es-ico">📁</div>No staff in this branch</div>}
          </div>
        )}
      </div>

      {showFolderModal && (
        <div className="ov" onClick={() => setShowFolderModal(null)}>
          <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="m-title">Add Record — {getStaffById(showFolderModal)?.name}</div>
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

        {/* Shift Swap tab: Staff only (index 2) */}
        {!user.isHOD && tab === 2 && (
          <div>
            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ font: '600 12px var(--sora)', color: 'var(--t)', marginBottom: 12 }}>🔄 Request Shift Swap</div>
              <div style={{ fontSize: 10.5, color: 'var(--t2)', marginBottom: 14, lineHeight: 1.6 }}>
                Request to swap a shift with another staff member from your branch. Your HOD will be notified for approval.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div className="ig" style={{ marginBottom: 0 }}>
                  <label className="inplbl">Date</label>
                  <input className="inpf" type="date" value={swapForm.date}
                    onChange={e => setSwapForm(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="ig" style={{ marginBottom: 0 }}>
                  <label className="inplbl">My Shift on That Day</label>
                  <select className="inpf" value={swapForm.myShift}
                    onChange={e => setSwapForm(p => ({ ...p, myShift: e.target.value }))}>
                    <option value="D">Day (ON → OFF)</option>
                    <option value="N">Night (ON → OFF)</option>
                    <option value="O">Off (OFF → ON)</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div className="ig" style={{ marginBottom: 0 }}>
                  <label className="inplbl">Covering Staff</label>
                  <select className="inpf" value={swapForm.targetStaff}
                    onChange={e => setSwapForm(p => ({ ...p, targetStaff: e.target.value }))}>
                    <option value="">Select staff member…</option>
                    {sl.filter(s => s.id !== user.id).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="ig" style={{ marginBottom: 0 }}>
                  <label className="inplbl">Their Shift on That Day</label>
                  <select className="inpf" value={swapForm.theirShift}
                    onChange={e => setSwapForm(p => ({ ...p, theirShift: e.target.value }))}>
                    <option value="D">Day (ON → OFF)</option>
                    <option value="N">Night (ON → OFF)</option>
                    <option value="O">Off (OFF → ON)</option>
                  </select>
                </div>
              </div>
              <div className="ig" style={{ marginBottom: 12 }}>
                <label className="inplbl">Notes (optional)</label>
                <input className="inpf" value={swapForm.notes} placeholder="e.g. Family emergency, medical appointment…"
                  onChange={e => setSwapForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              {swapSubmitted && (
                <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 7, padding: '8px 12px', marginBottom: 10, fontSize: 11, color: '#166534', fontWeight: 600 }}>
                  ✓ Swap request submitted — your HOD has been notified.
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn pri"
                  disabled={!swapForm.date || !swapForm.targetStaff}
                  onClick={() => {
                    const coveringStaff = sl.find(s => s.id === swapForm.targetStaff);
                    const shiftLabel = { D: 'Day', N: 'Night', O: 'Off' };
                    setSwapRequests(p => [...p, {
                      id: Date.now(),
                      requesterId: user.id, requesterName: user.name,
                      targetId: swapForm.targetStaff, targetName: coveringStaff?.name,
                      date: swapForm.date,
                      myShift: swapForm.myShift, theirShift: swapForm.theirShift,
                      notes: swapForm.notes, status: 'pending',
                      branchId: user.branchId, createdAt: new Date().toISOString(),
                    }]);
                    setSwapForm({ date: '', myShift: 'D', targetStaff: '', theirShift: 'O', notes: '' });
                    setSwapSubmitted(true);
                    setTimeout(() => setSwapSubmitted(false), 4000);
                  }}>
                  📩 Submit Swap Request
                </button>
              </div>
            </div>

            {/* My swap requests history */}
            {swapRequests.filter(r => r.requesterId === user.id).length > 0 && (
              <div className="card">
                <div style={{ font: '600 11px var(--sora)', color: 'var(--t)', marginBottom: 10 }}>My Swap Requests</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {swapRequests.filter(r => r.requesterId === user.id).reverse().map(r => {
                    const shiftLabel = { D: 'Day', N: 'Night', O: 'Off' };
                    const statusStyle = r.status === 'approved' ? { bg: '#dcfce7', color: '#166534', border: '#86efac' }
                      : r.status === 'rejected' ? { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' }
                      : { bg: '#fef9c3', color: '#854d0e', border: '#fde047' };
                    return (
                      <div key={r.id} style={{ background: statusStyle.bg, border: `1px solid ${statusStyle.border}`, borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: statusStyle.color }}>📅 {r.date}</span>
                          <span className={`ratio-badge ${r.status === 'approved' ? 'ratio-ok' : r.status === 'rejected' ? 'ratio-bad' : 'ratio-warn'}`}>
                            {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                          </span>
                        </div>
                        <div style={{ fontSize: 10.5, color: statusStyle.color }}>
                          My {shiftLabel[r.myShift]} → swap with {r.targetName}'s {shiftLabel[r.theirShift]} shift
                        </div>
                        {r.notes && <div style={{ fontSize: 10, color: statusStyle.color, marginTop: 3, fontStyle: 'italic' }}>{r.notes}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* HOD pending swaps (shown to HOD in their own view — not staff) */}
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
