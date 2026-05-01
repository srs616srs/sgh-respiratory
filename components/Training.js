'use client';
import { useState, useRef } from 'react';
import { staffOf, getStaff, getBranch, BRANCHES } from '../lib/data';
import { BranchTag } from './App';

export default function Training({ courses, setCourses, user, selBr, activeBranch }) {
  const [uploadModal, setUploadModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', instructor: user.name, duration: '', modules: 1, branchId: selBr === 'all' ? 'all' : selBr, thumb: '🎓' });
  const sl = staffOf(selBr);
  const vis = courses.filter(c => selBr === 'all' || c.branchId === 'all' || c.branchId === selBr);

  const toggle = (cid, sid) => setCourses(p => p.map(c => {
    if (c.id !== cid) return c;
    const a = c.attendance.includes(sid) ? c.attendance.filter(i => i !== sid) : [...c.attendance, sid];
    return { ...c, attendance: a };
  }));

  const addCourse = () => {
    if (!newCourse.name.trim()) return;
    setCourses(p => [{
      id: Date.now(), ...newCourse,
      modules: parseInt(newCourse.modules) || 1,
      uploaded: new Date().toISOString().split('T')[0],
      attendance: [],
    }, ...p]);
    setUploadModal(false);
    setNewCourse({ name: '', instructor: user.name, duration: '', modules: 1, branchId: selBr === 'all' ? 'all' : selBr, thumb: '🎓' });
  };

  const THUMBS = ['🎓','🫁','💨','🧤','🩸','🌬️','👶','🕌','🏭','🕋','🎯','📋','🏥'];

  return (
    <>
      <div className="ph">
        <div className="ph-row">
          <div><div className="pt">Online Training</div><div className="ps">Course library · attendance tracking · HOD notifications</div></div>
          <BranchTag br={selBr === 'all' ? { full: 'All Branches', color: '#0096b4' } : activeBranch} />
        </div>
      </div>
      <div className="cnt">
        <div className="tb">
          <span style={{ fontSize: 11.5, color: 'var(--t2)' }}>{vis.length} courses</span>
          <div className="tbs" />
          {user.isHOD && <button className="btn pri" onClick={() => setUploadModal(true)}>⬆ Upload Course</button>}
        </div>
        <div className="cg">
          {vis.map(c => {
            const brAtt = c.attendance.filter(id => selBr === 'all' || getStaff(id)?.branchId === selBr);
            const tot = sl.length || 1;
            const pct = Math.round(brAtt.length / tot * 100);
            const br = c.branchId !== 'all' ? getBranch(c.branchId) : null;
            return (
              <div key={c.id} className="cc">
                <div className="cth">
                  {c.thumb}
                  <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, padding: '2px 6px', borderRadius: 5, background: br ? br.color + '25' : 'rgba(0,150,180,.15)', color: br ? br.color : 'var(--a)', fontWeight: 700, border: `1px solid ${br ? br.color + '44' : 'rgba(0,150,180,.3)'}` }}>
                    {br ? br.name : '🌐 Network'}
                  </span>
                </div>
                <div className="cbd">
                  <div className="cname">{c.name}</div>
                  <div className="cmeta">{c.instructor} · {c.duration} · {c.modules} modules</div>
                  <div className="pb"><div className="pf" style={{ width: `${pct}%` }} /></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: 'var(--t3)', marginBottom: 7 }}>
                    <span>{pct}% attended</span><span>{brAtt.length}/{tot}</span>
                  </div>
                  <div className="att-row">
                    {sl.map(s => (
                      <div key={s.id} title={s.name} onClick={() => user.isHOD && toggle(c.id, s.id)} style={{ cursor: user.isHOD ? 'pointer' : 'default' }}>
                        <div className="av sm" style={{ background: c.attendance.includes(s.id) ? 'linear-gradient(135deg,#059669,#0096b4)' : 'var(--sur3)', color: c.attendance.includes(s.id) ? '#fff' : 'var(--t3)', border: c.attendance.includes(s.id) ? 'none' : '1px solid var(--bd)' }}>{s.avatar}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn pri sm" style={{ flex: 1 }}>▶ Watch</button>
                    {user.isHOD && <button className="btn out sm">📧 Remind</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {uploadModal && (
        <div className="ov" onClick={() => setUploadModal(false)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="m-title">⬆ Upload New Course</div>
            <div className="m-sub">Add a training course to the library</div>
            <div className="ig">
              <label className="inplbl">Thumbnail Emoji</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                {THUMBS.map(t => <span key={t} style={{ fontSize: 22, cursor: 'pointer', opacity: newCourse.thumb === t ? 1 : .5, transition: 'opacity .15s' }} onClick={() => setNewCourse(p => ({ ...p, thumb: t }))}>{t}</span>)}
              </div>
            </div>
            <div className="ig">
              <label className="inplbl">Course Title</label>
              <input className="inpf" value={newCourse.name} onChange={e => setNewCourse(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Advanced Ventilator Weaning 2026" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="ig">
                <label className="inplbl">Instructor</label>
                <input className="inpf" value={newCourse.instructor} onChange={e => setNewCourse(p => ({ ...p, instructor: e.target.value }))} />
              </div>
              <div className="ig">
                <label className="inplbl">Duration</label>
                <input className="inpf" value={newCourse.duration} onChange={e => setNewCourse(p => ({ ...p, duration: e.target.value }))} placeholder="e.g. 2h 30m" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="ig">
                <label className="inplbl">Modules</label>
                <input className="inpf" type="number" min="1" value={newCourse.modules} onChange={e => setNewCourse(p => ({ ...p, modules: e.target.value }))} />
              </div>
              <div className="ig">
                <label className="inplbl">Scope</label>
                <select className="inpf" value={newCourse.branchId} onChange={e => setNewCourse(p => ({ ...p, branchId: e.target.value }))}>
                  <option value="all">🌐 All Branches</option>
                  {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
            <div className="uz">
              <div className="uz-ico">🎬</div>
              <div className="uz-t">Upload course video or materials</div>
              <div className="uz-s">MP4, PDF, ZIP (coming soon — link Supabase Storage)</div>
            </div>
            <div style={{ display: 'flex', gap: 7, justifyContent: 'flex-end' }}>
              <button className="btn out" onClick={() => setUploadModal(false)}>Cancel</button>
              <button className="btn pri" onClick={addCourse}>Add Course</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
