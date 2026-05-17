'use client';
import { useState, useEffect } from 'react';
import { getBranch, BRANCHES } from '../lib/data';
import { BranchTag } from './App';

function isoDate(d) { return d.toISOString().split('T')[0]; }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function daysBetween(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); }
function dateInRange(date, start, end) { return date >= start && date <= end; }

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const STATUS_STYLE = {
  pending:  { bg: '#fef9c3', border: '#fde047', color: '#854d0e', label: 'Pending' },
  approved: { bg: '#dcfce7', border: '#86efac', color: '#166534', label: 'Approved' },
  rejected: { bg: '#fee2e2', border: '#fca5a5', color: '#991b1b', label: 'Rejected' },
};

export default function VacationPlanner({ user, selBr, activeBranch, staff, vacationRequests, setVacationRequests }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxOverlap, setMaxOverlap] = useState(2);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');
  // Request form
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formErr, setFormErr] = useState('');
  // Selected day detail
  const [selectedDay, setSelectedDay] = useState(null);
  // Which branch to show (for admin)
  const effectiveBranch = user.isAdmin ? (selBr === 'all' ? null : selBr) : user.branchId;

  const load = async () => {
    setLoading(true);
    try {
      const param = user.isHOD
        ? (effectiveBranch ? `branch_id=${effectiveBranch}` : '')
        : `user_id=${user.id}`;
      const r = await fetch(`/api/vacations${param ? `?${param}` : ''}`);
      if (r.ok) setRequests(await r.json());
    } catch { /* ignore */ }
    setLoading(false);
  };

  const loadSettings = async (branchId) => {
    if (!branchId) return;
    try {
      const r = await fetch(`/api/vacation-settings?branch_id=${branchId}`);
      if (r.ok) { const d = await r.json(); setMaxOverlap(d.max_overlap ?? 2); }
    } catch { /* ignore */ }
  };

  useEffect(() => { load(); }, [selBr]);
  useEffect(() => { if (effectiveBranch) loadSettings(effectiveBranch); }, [effectiveBranch]);

  const saveSettings = async () => {
    if (!effectiveBranch) return;
    setSavingSettings(true);
    await fetch('/api/vacation-settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branch_id: effectiveBranch, max_overlap: maxOverlap }),
    });
    setSettingsMsg('✓ Saved');
    setSavingSettings(false);
    setTimeout(() => setSettingsMsg(''), 2000);
  };

  const submitRequest = async () => {
    if (!startDate || !endDate) { setFormErr('Please select start and end dates.'); return; }
    if (endDate < startDate) { setFormErr('End date must be after start date.'); return; }
    if (startDate < isoDate(today)) { setFormErr('Start date cannot be in the past.'); return; }
    // Check overlap limit (against approved requests on the same branch)
    const approved = requests.filter(r => r.status === 'approved' && r.branch_id === user.branchId);
    const days = daysBetween(startDate, endDate) + 1;
    for (let i = 0; i < days; i++) {
      const d = isoDate(addDays(new Date(startDate), i));
      const overlapping = approved.filter(r => dateInRange(d, r.start_date, r.end_date)).length;
      if (overlapping >= maxOverlap) {
        setFormErr(`⚠ The limit of ${maxOverlap} concurrent vacation${maxOverlap > 1 ? 's' : ''} is already reached on ${d}. Please choose different dates.`);
        return;
      }
    }
    setSubmitting(true); setFormErr('');
    const r = await fetch('/api/vacations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, user_name: user.name, branch_id: user.branchId, start_date: startDate, end_date: endDate, notes }),
    });
    if (r.ok) {
      const req = await r.json();
      setRequests(p => [...p, req]);
      setShowForm(false); setStartDate(''); setEndDate(''); setNotes('');
    } else {
      const err = await r.json();
      setFormErr(err.error || 'Failed to submit.');
    }
    setSubmitting(false);
  };

  const review = async (id, status) => {
    const r = await fetch('/api/vacations', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, reviewed_by: user.name }),
    });
    if (r.ok) {
      const updated = await r.json();
      setRequests(p => p.map(x => x.id === id ? updated : x));
    }
  };

  const cancel = async (id) => {
    if (!confirm('Cancel this vacation request?')) return;
    await fetch('/api/vacations', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setRequests(p => p.filter(x => x.id !== id));
  };

  // Calendar helpers
  const calStart = new Date(calYear, calMonth, 1);
  const calEnd = new Date(calYear, calMonth + 1, 0);
  const firstDow = calStart.getDay();
  const totalDays = calEnd.getDate();

  const branchRequests = effectiveBranch
    ? requests.filter(r => r.branch_id === effectiveBranch)
    : requests;

  const dayData = (dayNum) => {
    const dateStr = isoDate(new Date(calYear, calMonth, dayNum));
    const dayReqs = branchRequests.filter(r =>
      r.status !== 'rejected' && dateInRange(dateStr, r.start_date, r.end_date)
    );
    const approved = dayReqs.filter(r => r.status === 'approved').length;
    const pending = dayReqs.filter(r => r.status === 'pending').length;
    const isToday = dateStr === isoDate(today);
    const isPast = dateStr < isoDate(today);
    const overLimit = approved >= maxOverlap;
    return { dateStr, dayReqs, approved, pending, isToday, isPast, overLimit };
  };

  const prevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); };

  const pendingForHOD = requests.filter(r =>
    r.status === 'pending' && (effectiveBranch ? r.branch_id === effectiveBranch : true)
  );

  const myRequests = user.isHOD ? [] : requests;

  return (
    <>
      <div className="ph">
        <div className="ph-row">
          <div>
            <div className="pt">Vacation Planner</div>
            <div className="ps">Request & track planned leave · branch calendar · overlap management</div>
          </div>
          <BranchTag br={selBr === 'all' ? { full: 'All Branches', color: '#0096b4' } : activeBranch} />
        </div>
      </div>

      <div className="cnt">
        {/* HOD: pending alert */}
        {user.isHOD && pendingForHOD.length > 0 && (
          <div className="abanner" style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>📅</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#92400e', fontWeight: 600 }}>
                {pendingForHOD.length} vacation request{pendingForHOD.length > 1 ? 's' : ''} awaiting your review
              </div>
              <div style={{ fontSize: 10, color: '#b45309', marginTop: 1 }}>Scroll down to Pending Requests</div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: user.isHOD ? '1fr 320px' : '1fr 300px', gap: 14, alignItems: 'start' }}>

          {/* ── Calendar ── */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Calendar header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--bd)' }}>
              <button onClick={prevMonth} style={{ background: 'var(--sur2)', border: '1px solid var(--bd)', borderRadius: 7, width: 30, height: 30, cursor: 'pointer', fontSize: 14, color: 'var(--t2)' }}>‹</button>
              <div style={{ font: '700 14px var(--sora)', color: 'var(--t)' }}>{MONTHS[calMonth]} {calYear}</div>
              <button onClick={nextMonth} style={{ background: 'var(--sur2)', border: '1px solid var(--bd)', borderRadius: 7, width: 30, height: 30, cursor: 'pointer', fontSize: 14, color: 'var(--t2)' }}>›</button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', background: 'var(--sur2)', borderBottom: '1px solid var(--bd)' }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 9.5, fontWeight: 700, color: 'var(--t3)', padding: '7px 0', fontFamily: 'var(--sora)' }}>{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
              {Array.from({ length: firstDow }).map((_, i) => (
                <div key={`e${i}`} style={{ minHeight: 64, borderRight: '1px solid var(--bd)', borderBottom: '1px solid var(--bd)', background: 'var(--sur2)' }} />
              ))}
              {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
                const { dateStr, dayReqs, approved, pending, isToday, isPast, overLimit } = dayData(day);
                const col = (firstDow + day - 1) % 7;
                return (
                  <div key={day} onClick={() => setSelectedDay(selectedDay === dateStr ? null : dateStr)}
                    style={{
                      minHeight: 64, borderRight: '1px solid var(--bd)', borderBottom: '1px solid var(--bd)',
                      padding: '5px 6px', cursor: dayReqs.length > 0 ? 'pointer' : 'default',
                      background: isToday ? 'rgba(0,150,180,.07)' : isPast ? 'var(--sur2)' : 'var(--sur)',
                      opacity: isPast ? 0.6 : 1,
                      outline: selectedDay === dateStr ? '2px solid var(--a)' : 'none',
                      position: 'relative',
                    }}>
                    {/* Day number */}
                    <div style={{ fontSize: 11, fontWeight: isToday ? 800 : 500, color: isToday ? 'var(--a)' : 'var(--t)', marginBottom: 3,
                      ...(isToday ? { background: 'var(--a)', color: '#fff', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 } : {}) }}>
                      {day}
                    </div>
                    {/* Overlap limit indicator */}
                    {overLimit && !isPast && (
                      <div style={{ position: 'absolute', top: 3, right: 4, width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} title="At capacity" />
                    )}
                    {/* Vacation dots */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {approved > 0 && (
                        <div style={{ fontSize: 8.5, fontWeight: 600, color: '#166534', background: '#dcfce7', borderRadius: 3, padding: '1px 4px', lineHeight: 1.3 }}>
                          ✓ {approved} on leave
                        </div>
                      )}
                      {pending > 0 && (
                        <div style={{ fontSize: 8.5, fontWeight: 600, color: '#854d0e', background: '#fef9c3', borderRadius: 3, padding: '1px 4px', lineHeight: 1.3 }}>
                          ⏳ {pending} pending
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 14, padding: '10px 16px', borderTop: '1px solid var(--bd)', background: 'var(--sur2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--t2)' }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: '#dcfce7', border: '1px solid #86efac' }} /> Approved
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--t2)' }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: '#fef9c3', border: '1px solid #fde047' }} /> Pending
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--t2)' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} /> At max overlap ({maxOverlap})
              </div>
            </div>

            {/* Selected day detail */}
            {selectedDay && (() => {
              const dayReqs = branchRequests.filter(r => r.status !== 'rejected' && dateInRange(selectedDay, r.start_date, r.end_date));
              return dayReqs.length > 0 ? (
                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--bd)', background: '#f8fafc' }}>
                  <div style={{ font: '600 11px var(--sora)', color: 'var(--t)', marginBottom: 8 }}>
                    📅 {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                    {' '}— {dayReqs.filter(r=>r.status==='approved').length} approved, {dayReqs.filter(r=>r.status==='pending').length} pending
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {dayReqs.map(r => {
                      const s = STATUS_STYLE[r.status];
                      return (
                        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 9px', borderRadius: 6, background: s.bg, border: `1px solid ${s.border}` }}>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{r.user_name}</span>
                            <span style={{ fontSize: 10, color: s.color, marginLeft: 6 }}>{r.start_date} → {r.end_date}</span>
                          </div>
                          <span style={{ fontSize: 9.5, fontWeight: 700, color: s.color }}>{s.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null;
            })()}
          </div>

          {/* ── Right panel ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* HOD: Settings card */}
            {user.isHOD && (
              <div className="card">
                <div style={{ font: '600 11px var(--sora)', color: 'var(--t)', marginBottom: 10 }}>⚙️ Overlap Settings</div>
                <div style={{ fontSize: 10.5, color: 'var(--t2)', marginBottom: 10, lineHeight: 1.5 }}>
                  Maximum number of staff allowed on vacation simultaneously in this branch.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ fontSize: 11, color: 'var(--t2)', whiteSpace: 'nowrap' }}>Max overlap:</label>
                  <input type="number" min="1" max="20" value={maxOverlap}
                    onChange={e => setMaxOverlap(parseInt(e.target.value) || 1)}
                    className="inpf" style={{ width: 60, textAlign: 'center', padding: '5px 8px' }} />
                  <button className="btn pri" onClick={saveSettings} disabled={savingSettings} style={{ whiteSpace: 'nowrap', fontSize: 10 }}>
                    {savingSettings ? 'Saving…' : 'Save'}
                  </button>
                </div>
                {settingsMsg && <div style={{ fontSize: 10.5, color: '#166534', marginTop: 6, fontWeight: 600 }}>{settingsMsg}</div>}
              </div>
            )}

            {/* Staff: Request form */}
            {!user.isHOD && (
              <div className="card">
                <div style={{ font: '600 11px var(--sora)', color: 'var(--t)', marginBottom: 8 }}>📅 Request Vacation</div>
                <div style={{ fontSize: 10.5, color: 'var(--t2)', marginBottom: 10 }}>
                  Max {maxOverlap} staff on leave at the same time in your branch.
                </div>
                {!showForm ? (
                  <button className="btn pri" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowForm(true)}>
                    + New Vacation Request
                  </button>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                      <div className="ig" style={{ marginBottom: 0 }}>
                        <label className="inplbl">Start Date</label>
                        <input className="inpf" type="date" value={startDate} min={isoDate(today)}
                          onChange={e => { setStartDate(e.target.value); setFormErr(''); }} />
                      </div>
                      <div className="ig" style={{ marginBottom: 0 }}>
                        <label className="inplbl">End Date</label>
                        <input className="inpf" type="date" value={endDate} min={startDate || isoDate(today)}
                          onChange={e => { setEndDate(e.target.value); setFormErr(''); }} />
                      </div>
                    </div>
                    {startDate && endDate && endDate >= startDate && (
                      <div style={{ fontSize: 10, color: 'var(--a)', marginBottom: 6, fontWeight: 600 }}>
                        📆 {daysBetween(startDate, endDate) + 1} day{daysBetween(startDate, endDate) > 0 ? 's' : ''}
                      </div>
                    )}
                    <div className="ig" style={{ marginBottom: 8 }}>
                      <label className="inplbl">Notes (optional)</label>
                      <input className="inpf" value={notes} placeholder="e.g. Annual leave, travel…"
                        onChange={e => setNotes(e.target.value)} />
                    </div>
                    {formErr && (
                      <div style={{ fontSize: 10.5, padding: '7px 10px', borderRadius: 6, background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', marginBottom: 8 }}>
                        {formErr}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn" style={{ flex: 1, background: 'var(--sur2)', color: 'var(--t2)', justifyContent: 'center' }}
                        onClick={() => { setShowForm(false); setFormErr(''); }}>Cancel</button>
                      <button className="btn pri" style={{ flex: 1, justifyContent: 'center' }} onClick={submitRequest} disabled={submitting}>
                        {submitting ? 'Submitting…' : '📩 Submit'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Staff: My requests */}
            {!user.isHOD && (
              <div className="card">
                <div style={{ font: '600 11px var(--sora)', color: 'var(--t)', marginBottom: 10 }}>My Requests</div>
                {loading ? (
                  <div style={{ textAlign: 'center', color: 'var(--t3)', fontSize: 10.5, padding: 16 }}>Loading…</div>
                ) : myRequests.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--t3)', fontSize: 10.5, padding: 16 }}>No requests yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {[...myRequests].reverse().map(r => {
                      const s = STATUS_STYLE[r.status];
                      const days = daysBetween(r.start_date, r.end_date) + 1;
                      return (
                        <div key={r.id} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, padding: '9px 11px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 10.5, fontWeight: 700, color: s.color }}>{s.label}</span>
                            <span style={{ fontSize: 9.5, color: s.color }}>{days} day{days > 1 ? 's' : ''}</span>
                          </div>
                          <div style={{ fontSize: 10.5, color: s.color, marginTop: 3 }}>
                            {r.start_date} → {r.end_date}
                          </div>
                          {r.notes && <div style={{ fontSize: 10, color: s.color, marginTop: 2, opacity: 0.8 }}>{r.notes}</div>}
                          {r.status === 'pending' && (
                            <button onClick={() => cancel(r.id)}
                              style={{ marginTop: 6, fontSize: 9.5, padding: '2px 8px', background: 'rgba(0,0,0,.07)', color: s.color, border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--sora)' }}>
                              ✕ Cancel
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* HOD: Pending requests */}
            {user.isHOD && (
              <div className="card">
                <div style={{ font: '600 11px var(--sora)', color: 'var(--t)', marginBottom: 10 }}>
                  Pending Requests {pendingForHOD.length > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 9, marginLeft: 6 }}>{pendingForHOD.length}</span>}
                </div>
                {loading ? (
                  <div style={{ textAlign: 'center', color: 'var(--t3)', fontSize: 10.5, padding: 16 }}>Loading…</div>
                ) : pendingForHOD.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--t3)', fontSize: 10.5, padding: 16 }}>No pending requests</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {pendingForHOD.map(r => {
                      const days = daysBetween(r.start_date, r.end_date) + 1;
                      const br = getBranch(r.branch_id);
                      return (
                        <div key={r.id} style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 8, padding: '10px 12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#78350f' }}>{r.user_name}</span>
                            <span style={{ fontSize: 9.5, color: '#92400e' }}>{days}d</span>
                          </div>
                          {br && <div style={{ fontSize: 9.5, color: '#b45309', marginBottom: 3 }}>{br.full}</div>}
                          <div style={{ fontSize: 10.5, color: '#92400e', marginBottom: 5 }}>{r.start_date} → {r.end_date}</div>
                          {r.notes && <div style={{ fontSize: 10, color: '#a16207', marginBottom: 7, fontStyle: 'italic' }}>"{r.notes}"</div>}
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => review(r.id, 'approved')}
                              style={{ flex: 1, fontSize: 10, padding: '4px 0', background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: 5, cursor: 'pointer', fontFamily: 'var(--sora)', fontWeight: 600 }}>
                              ✓ Approve
                            </button>
                            <button onClick={() => review(r.id, 'rejected')}
                              style={{ flex: 1, fontSize: 10, padding: '4px 0', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: 5, cursor: 'pointer', fontFamily: 'var(--sora)', fontWeight: 600 }}>
                              ✗ Reject
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* HOD: All requests list */}
            {user.isHOD && (
              <div className="card">
                <div style={{ font: '600 11px var(--sora)', color: 'var(--t)', marginBottom: 10 }}>All Requests</div>
                {loading ? (
                  <div style={{ textAlign: 'center', color: 'var(--t3)', fontSize: 10.5, padding: 16 }}>Loading…</div>
                ) : requests.filter(r => r.status !== 'pending').length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--t3)', fontSize: 10.5, padding: 16 }}>No approved/rejected requests</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
                    {requests.filter(r => r.status !== 'pending').reverse().map(r => {
                      const s = STATUS_STYLE[r.status];
                      const days = daysBetween(r.start_date, r.end_date) + 1;
                      return (
                        <div key={r.id} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 7, padding: '8px 10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 10.5, fontWeight: 700, color: s.color }}>{r.user_name}</span>
                            <span className={`ratio-badge ${r.status === 'approved' ? 'ratio-ok' : 'ratio-bad'}`} style={{ fontSize: 9 }}>{s.label}</span>
                          </div>
                          <div style={{ fontSize: 10, color: s.color, marginTop: 2 }}>{r.start_date} → {r.end_date} · {days}d</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
