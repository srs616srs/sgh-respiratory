'use client';
import { useState, useRef } from 'react';
import { getBranch, COMPETENCIES } from '../lib/data';
import { BranchTag } from './App';

export default function Competencies({ compRecs, setCompRecs, selBr, activeBranch, user, staff }) {
  const [sel, setSel] = useState(user.isHOD ? null : user.id);
  const [uploadingComp, setUploadingComp] = useState(null); // { staffId, compId }
  const fileRef = useRef();

  // HOD sees all branch staff; staff sees only their own row
  const sl = staff
    ? user.isHOD
      ? staff.filter(s => (selBr === 'all' || s.branchId === selBr) && !s.isHOD)
      : staff.filter(s => s.id === user.id)
    : [];
  const getStaffById = (id) => staff?.find(s => s.id === id);
  const gr = (sid, cid) => compRecs.find(r => r.staffId === sid && r.compId === cid) || { status: 'pending' };
  const ico = s => s === 'completed' ? '✓' : s === 'due' ? '!' : '–';
  const pct = sid => {
    const done = compRecs.filter(r => r.staffId === sid && r.status === 'completed').length;
    return Math.round(done / COMPETENCIES.length * 100);
  };

  const updateStatus = (sid, cid, status) => {
    setCompRecs(p => {
      const filtered = p.filter(r => !(r.staffId === sid && r.compId === cid));
      return [...filtered, { staffId: sid, compId: cid, status, date: status === 'completed' ? new Date().toISOString().split('T')[0] : undefined, ...gr(sid, cid) }];
    });
  };

  const handleEvidenceUpload = async (e, sid, cid) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingComp({ staffId: sid, compId: cid });
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'competency-evidence');
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const json = await res.json();
      if (json.url) {
        setCompRecs(p => {
          const filtered = p.filter(r => !(r.staffId === sid && r.compId === cid));
          const existing = p.find(r => r.staffId === sid && r.compId === cid) || {};
          return [...filtered, { ...existing, staffId: sid, compId: cid, status: existing.status || 'completed', date: existing.date || new Date().toISOString().split('T')[0], evidenceUrl: json.url, evidenceName: file.name }];
        });
      }
    } catch { /* ignore */ }
    setUploadingComp(null);
  };

  const triggerUpload = (sid, cid) => {
    // Create a one-time file input click
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.png,.docx';
    input.onchange = (e) => handleEvidenceUpload(e, sid, cid);
    input.click();
  };

  return (
    <>
      <div className="ph">
        <div className="ph-row">
          <div><div className="pt">Staff Competencies</div><div className="ps">Click a staff card to view individual detail</div></div>
          <BranchTag br={selBr === 'all' ? { full: 'All Branches', color: '#0096b4' } : activeBranch} />
        </div>
      </div>
      <div className="cnt">
        {user.isHOD && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 11 }}>
          {sl.map(s => {
            const due = compRecs.filter(r => r.staffId === s.id && r.status === 'due').length;
            const p = pct(s.id);
            const br = getBranch(s.branchId);
            return (
              <div key={s.id} className="card" style={{ cursor: 'pointer', borderColor: sel === s.id ? 'var(--a)' : 'var(--bd)', boxShadow: sel === s.id ? '0 0 0 2px rgba(0,150,180,.15)' : '' }} onClick={() => setSel(sel === s.id ? null : s.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                  <div className="av lg">{s.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                    <div style={{ fontSize: 9, color: 'var(--t3)' }}>{s.role}</div>
                  </div>
                  {due > 0 && <span className="b due">{due} due</span>}
                </div>
                {selBr === 'all' && <div style={{ fontSize: 8.5, color: br?.color, marginBottom: 4, fontWeight: 600 }}>● {br?.name}</div>}
                <div className="pb"><div className="pf" style={{ width: `${p}%`, background: br?.color || 'var(--a2)' }} /></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: 'var(--t3)', marginTop: 2 }}>
                  <span>{p}%</span>
                  <span>{compRecs.filter(r => r.staffId === s.id && r.status === 'completed').length}/{COMPETENCIES.length}</span>
                </div>
              </div>
            );
          })}
        </div>}

        {sel ? (
          <div className="card">
            <div className="stitle">📋 {getStaffById(sel)?.name} <span className="scnt">{getBranch(getStaffById(sel)?.branchId)?.name}</span></div>
            <table>
              <thead><tr><th>Competency</th><th>Status</th><th>Date</th><th>Evidence</th>{user.isHOD && <th>Update</th>}</tr></thead>
              <tbody>
                {COMPETENCIES.map(c => {
                  const r = gr(sel, c.id);
                  const isUploading = uploadingComp?.staffId === sel && uploadingComp?.compId === c.id;
                  return (
                    <tr key={c.id}>
                      <td style={{ color: 'var(--t)' }}>{c.name}</td>
                      <td><span className={`b ${r.status}`}>{ico(r.status)} {r.status}</span></td>
                      <td style={{ fontSize: 10.5 }}>{r.date || '—'}</td>
                      <td>
                        {r.evidenceUrl
                          ? <a href={r.evidenceUrl} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: 'var(--a)', textDecoration: 'underline' }}>📎 {r.evidenceName || 'View'}</a>
                          : user.isHOD
                            ? <button onClick={() => triggerUpload(sel, c.id)} disabled={isUploading}
                                style={{ fontSize: 10, padding: '2px 8px', background: 'var(--sur2)', color: 'var(--t2)', border: '1px solid var(--bd)', borderRadius: 5, cursor: 'pointer', fontFamily: 'var(--sora)' }}>
                                {isUploading ? '⏳' : '⬆ Upload PDF'}
                              </button>
                            : <span style={{ color: 'var(--t3)', fontSize: 10 }}>—</span>
                        }
                      </td>
                      {user.isHOD && (
                        <td>
                          <select className="inpf" style={{ width: 'auto', padding: '3px 7px', fontSize: 10 }} value={r.status} onChange={e => updateStatus(sel, c.id, e.target.value)}>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="due">Due</option>
                          </select>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : user.isHOD ? (
          <div className="card">
            <div className="stitle">Matrix — {selBr === 'all' ? 'All Branches' : activeBranch?.name}</div>
            <div className="mx">
              <table className="mxt">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Staff</th>
                    {selBr === 'all' && <th>Branch</th>}
                    {COMPETENCIES.map(c => <th key={c.id}>{c.name.split(' ').slice(0, 2).join(' ')}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {sl.map(s => (
                    <tr key={s.id}>
                      <td className="lft"><div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div className="av sm">{s.avatar}</div><span style={{ color: 'var(--t)', fontSize: 10.5 }}>{s.name.split(' ')[0]}</span></div></td>
                      {selBr === 'all' && <td><span style={{ fontSize: 8.5, padding: '1px 5px', borderRadius: 4, background: getBranch(s.branchId)?.color + '20', color: getBranch(s.branchId)?.color, fontWeight: 600 }}>{getBranch(s.branchId)?.short}</span></td>}
                      {COMPETENCIES.map(c => { const r = gr(s.id, c.id); return <td key={c.id}><div className={`mdot ${r.status}`}>{ico(r.status)}</div></td>; })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
