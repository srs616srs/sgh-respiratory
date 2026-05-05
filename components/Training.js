'use client';
import { useState, useRef } from 'react';
import { getBranch, BRANCHES } from '../lib/data';
import { BranchTag } from './App';

export default function Training({ courses, setCourses, trainingRequests, setTrainingRequests, user, selBr, activeBranch, staff, pendingRequests }) {
  const [uploadModal, setUploadModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', instructor: user.name, duration: '', modules: 1, branchId: selBr === 'all' ? 'all' : selBr, thumb: '🎓' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef();

  const sl = staff ? staff.filter(s => (selBr === 'all' || s.branchId === selBr) && !s.isHOD) : [];
  const vis = courses.filter(c => selBr === 'all' || c.branchId === 'all' || c.branchId === selBr);

  const toggle = (cid, sid) => setCourses(p => p.map(c => {
    if (c.id !== cid) return c;
    const a = c.attendance.includes(sid) ? c.attendance.filter(i => i !== sid) : [...c.attendance, sid];
    return { ...c, attendance: a };
  }));

  const addCourse = async () => {
    if (!newCourse.name.trim()) return;
    setUploading(true);
    let fileUrl = null;
    let fileName = null;

    if (selectedFile) {
      try {
        const form = new FormData();
        form.append('file', selectedFile);
        form.append('folder', 'courses');
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        const json = await res.json();
        if (json.url) { fileUrl = json.url; fileName = selectedFile.name; }
      } catch { /* ignore */ }
    }

    setCourses(p => [{
      id: Date.now(), ...newCourse,
      modules: parseInt(newCourse.modules) || 1,
      uploaded: new Date().toISOString().split('T')[0],
      attendance: [],
      fileUrl,
      fileName,
    }, ...p]);
    setUploadModal(false);
    setUploading(false);
    setSelectedFile(null);
    setNewCourse({ name: '', instructor: user.name, duration: '', modules: 1, branchId: selBr === 'all' ? 'all' : selBr, thumb: '🎓' });
  };

  const submitRequest = () => {
    if (!requestText.trim()) return;
    setSubmitting(true);
    const req = {
      id: Date.now(),
      staffId: user.id,
      staffName: user.name,
      branchId: user.branchId,
      text: requestText,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setTrainingRequests(p => [...p, req]);
    setRequestText('');
    setSubmitted(true);
    setSubmitting(false);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const markRead = (id) => {
    setTrainingRequests(p => p.map(r => r.id === id ? { ...r, status: 'read' } : r));
  };

  const THUMBS = ['🎓','🫁','💨','🧤','🩸','🌬️','👶','🕌','🏭','🕋','🎯','📋','🏥'];

  return (
    <>
      <div className="ph">
        <div className="ph-row">
          <div><div className="pt">Online Training</div><div className="ps">Course library · attendance tracking · training requests</div></div>
          <BranchTag br={selBr === 'all' ? { full: 'All Branches', color: '#0096b4' } : activeBranch} />
        </div>
      </div>
      <div className="cnt">

        {/* HOD: pending requests panel */}
        {user.isHOD && pendingRequests && pendingRequests.length > 0 && (
          <div className="card" style={{ background: '#fffbeb', border: '1px solid #fde68a', marginBottom: 12 }}>
            <div style={{ font: '600 12px var(--sora)', color: '#92400e', marginBottom: 8 }}>
              📬 Training Requests — {pendingRequests.length} pending
            </div>
            {pendingRequests.map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid #fde68a' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#78350f' }}>{r.staffName}</div>
                  <div style={{ fontSize: 10.5, color: '#92400e', marginTop: 2 }}>{r.text}</div>
                  <div style={{ fontSize: 9.5, color: '#b45309', marginTop: 2 }}>{new Date(r.createdAt).toLocaleDateString('en-GB')}</div>
                </div>
                <button onClick={() => markRead(r.id)}
                  style={{ fontSize: 10, padding: '3px 10px', background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: 5, cursor: 'pointer', fontFamily: 'var(--sora)', whiteSpace: 'nowrap' }}>
                  ✓ Mark Read
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="tb">
          <span style={{ fontSize: 11.5, color: 'var(--t2)' }}>{vis.length} courses</span>
          <div className="tbs" />
          {user.isHOD && <button className="btn pri" onClick={() => setUploadModal(true)}>⬆ Upload Course</button>}
        </div>

        <div className="cg">
          {vis.map(c => {
            const brAtt = c.attendance.filter(id => selBr === 'all' || sl.find(s => s.id === id));
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
                    {c.fileUrl
                      ? <a href={c.fileUrl} target="_blank" rel="noreferrer" className="btn pri sm" style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}>⬇ Download</a>
                      : <button className="btn pri sm" style={{ flex: 1 }} disabled>No File</button>}
                    {user.isHOD && <button className="btn out sm">📧 Remind</button>}
                  </div>
                </div>
              </div>
            );
          })}
          {vis.length === 0 && <div className="es"><div className="es-ico">🎓</div>No courses available yet</div>}
        </div>

        {/* Staff: submit training request */}
        {!user.isHOD && (
          <div className="card" style={{ marginTop: 16 }}>
            <div style={{ font: '600 12px var(--sora)', color: 'var(--t)', marginBottom: 6 }}>📩 Request Training</div>
            <div style={{ fontSize: 10.5, color: 'var(--t2)', marginBottom: 10 }}>
              Submit a training request to your Head of Department. Describe what topic or skill you'd like training on.
            </div>
            {submitted && (
              <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 7, padding: '8px 12px', marginBottom: 10, fontSize: 11, color: '#166534', fontWeight: 600 }}>
                ✓ Request submitted to your HOD.
              </div>
            )}
            <textarea
              className="ta" rows={3} value={requestText}
              onChange={e => setRequestText(e.target.value)}
              placeholder="e.g. I'd like training on advanced NIV settings and HFNC weaning protocols…"
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn pri" onClick={submitRequest} disabled={submitting || !requestText.trim()}>
                {submitting ? 'Submitting…' : '📩 Submit Request'}
              </button>
            </div>
          </div>
        )}
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
            <div className="uz" onClick={() => fileRef.current?.click()} style={{ cursor: 'pointer' }}>
              <input type="file" ref={fileRef} style={{ display: 'none' }} onChange={e => setSelectedFile(e.target.files[0])} accept=".pdf,.mp4,.zip,.pptx,.docx" />
              <div className="uz-ico">🎬</div>
              <div className="uz-t">{selectedFile ? selectedFile.name : 'Click to attach course file (PDF, Video, ZIP)'}</div>
              <div className="uz-s">Optional — staff can download from the course card</div>
            </div>
            <div style={{ display: 'flex', gap: 7, justifyContent: 'flex-end' }}>
              <button className="btn out" onClick={() => setUploadModal(false)}>Cancel</button>
              <button className="btn pri" onClick={addCourse} disabled={uploading}>
                {uploading ? <><span className="spin" /> Uploading…</> : 'Add Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
