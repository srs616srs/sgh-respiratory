'use client';
import { useState, useRef } from 'react';
import { getBranch, BRANCHES } from '../lib/data';
import { BranchTag } from './App';

export default function Documents({ docs, setDocs, docAcks, setDocAcks, user, selBr, activeBranch }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [uploading, setUploading] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', category: 'Policy', branchId: selBr === 'all' ? 'all' : selBr });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef();

  const cats = ['All', 'Policy', 'Protocol', 'SOP', 'Form', 'Checklist', 'Guideline', 'Competency'];
  const vis = docs.filter(d =>
    (d.branchId === 'all' || d.branchId === selBr || selBr === 'all') &&
    (cat === 'All' || d.category === cat) &&
    d.name.toLowerCase().includes(q.toLowerCase())
  );

  const isAcknowledged = (docId) => docAcks.some(a => a.docId === docId && a.staffId === user.id);
  const acknowledge = (docId) => {
    if (!isAcknowledged(docId)) {
      setDocAcks(p => [...p, { docId, staffId: user.id, at: new Date().toISOString() }]);
    }
  };

  const handleUpload = async () => {
    if (!newDoc.name.trim()) return alert('Please enter a document name.');
    setUploading(true);

    if (selectedFile) {
      try {
        const form = new FormData();
        form.append('file', selectedFile);
        form.append('folder', 'docs');
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: form });
        const uploadJson = await uploadRes.json();

        if (uploadJson.url) {
          const icons = { Policy: '📋', Protocol: '📄', SOP: '📋', Form: '📝', Checklist: '✅', Guideline: '📘', Competency: '🎯' };
          const doc = {
            id: Date.now(), name: newDoc.name, category: newDoc.category, branchId: newDoc.branchId,
            date: new Date().toISOString().split('T')[0],
            size: `${Math.round(selectedFile.size / 1024)} KB`,
            icon: icons[newDoc.category] || '📄',
            fileUrl: uploadJson.url,
          };
          setDocs(p => [doc, ...p]);
          setUploadModal(false);
          setSelectedFile(null);
          setNewDoc({ name: '', category: 'Policy', branchId: selBr === 'all' ? 'all' : selBr });
          setUploading(false);
          return;
        }
      } catch { /* fall through */ }
    }

    // Local fallback
    addLocally();
    setUploading(false);
  };

  const addLocally = () => {
    const icons = { Policy: '📋', Protocol: '📄', SOP: '📋', Form: '📝', Checklist: '✅', Guideline: '📘', Competency: '🎯' };
    const sizeStr = selectedFile ? `${Math.round(selectedFile.size / 1024)} KB` : '—';
    setDocs(p => [{
      id: Date.now(), name: newDoc.name, category: newDoc.category, branchId: newDoc.branchId,
      date: new Date().toISOString().split('T')[0], size: sizeStr,
      icon: icons[newDoc.category] || '📄',
      fileUrl: selectedFile ? URL.createObjectURL(selectedFile) : null,
    }, ...p]);
    setUploadModal(false);
    setSelectedFile(null);
    setNewDoc({ name: '', category: 'Policy', branchId: selBr === 'all' ? 'all' : selBr });
  };

  return (
    <>
      <div className="ph">
        <div className="ph-row">
          <div><div className="pt">Documents & Forms</div><div className="ps">Network-wide and branch-specific documents</div></div>
          <BranchTag br={selBr === 'all' ? { full: 'All Branches', color: '#0096b4' } : activeBranch} />
        </div>
      </div>
      <div className="cnt">
        <div className="tb">
          <div className="srch" style={{ flex: 1 }}>
            <span style={{ color: 'var(--t3)' }}>🔍</span>
            <input placeholder="Search documents…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          {user.isHOD && <button className="btn pri" onClick={() => setUploadModal(true)}>⬆ Upload Document</button>}
        </div>
        <div className="fps">{cats.map(c => <div key={c} className={`pill ${cat === c ? 'act' : ''}`} onClick={() => setCat(c)}>{c}</div>)}</div>

        <div className="card">
          <div className="tw">
            <table>
              <thead><tr><th>Document</th><th>Category</th><th>Scope</th><th>Date</th><th>Size</th><th>Actions</th></tr></thead>
              <tbody>
                {vis.map(d => {
                  const acked = isAcknowledged(d.id);
                  return (
                    <tr key={d.id}>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 15 }}>{d.icon}</span><span style={{ color: 'var(--t)', fontWeight: 500 }}>{d.name}</span></div></td>
                      <td><span className={`b ${d.category}`}>{d.category}</span></td>
                      <td>{d.branchId === 'all'
                        ? <span className="b net">🌐 Network</span>
                        : <span className="b" style={{ background: getBranch(d.branchId)?.color + '20', color: getBranch(d.branchId)?.color, border: `1px solid ${getBranch(d.branchId)?.color}44` }}>{getBranch(d.branchId)?.name}</span>}
                      </td>
                      <td style={{ fontSize: 10.5 }}>{d.date}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 10.5, color: 'var(--t3)' }}>{d.size}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {d.fileUrl
                            ? <a href={d.fileUrl} target="_blank" rel="noreferrer" className="btn out sm" style={{ textDecoration: 'none' }}>⬇ Download</a>
                            : <span style={{ fontSize: 10, color: 'var(--t3)' }}>No file</span>}
                          {!user.isHOD && (
                            acked
                              ? <span style={{ fontSize: 10, padding: '3px 8px', background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: 5, fontWeight: 600 }}>✓ Acknowledged</span>
                              : <button onClick={() => acknowledge(d.id)}
                                  style={{ fontSize: 10, padding: '3px 8px', background: '#e0f2fe', color: '#075985', border: '1px solid #7dd3fc', borderRadius: 5, cursor: 'pointer', fontFamily: 'var(--sora)', fontWeight: 600 }}>
                                  ✍ Acknowledge
                                </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {vis.length === 0 && <tr><td colSpan={6}><div className="es"><div className="es-ico">📂</div>No documents found</div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {uploadModal && (
        <div className="ov" onClick={() => setUploadModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="m-title">⬆ Upload Document</div>
            <div className="m-sub">Add a new document to the library</div>
            <div className="ig">
              <label className="inplbl">Document Name</label>
              <input className="inpf" value={newDoc.name} onChange={e => setNewDoc(p => ({ ...p, name: e.target.value }))} placeholder="e.g. ICU Ventilator Protocol 2026" />
            </div>
            <div className="ig">
              <label className="inplbl">Category</label>
              <select className="inpf" value={newDoc.category} onChange={e => setNewDoc(p => ({ ...p, category: e.target.value }))}>
                {['Policy', 'Protocol', 'SOP', 'Form', 'Checklist', 'Guideline', 'Competency'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="ig">
              <label className="inplbl">Scope</label>
              <select className="inpf" value={newDoc.branchId} onChange={e => setNewDoc(p => ({ ...p, branchId: e.target.value }))}>
                <option value="all">🌐 All Branches (Network)</option>
                {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.full}</option>)}
              </select>
            </div>
            <div className="uz" onClick={() => fileRef.current?.click()} style={{ cursor: 'pointer' }}>
              <input type="file" ref={fileRef} style={{ display: 'none' }} onChange={e => setSelectedFile(e.target.files[0])} accept=".pdf,.doc,.docx,.xlsx,.pptx,.txt" />
              <div className="uz-ico">📎</div>
              <div className="uz-t">{selectedFile ? selectedFile.name : 'Click or drag to attach file'}</div>
              <div className="uz-s">PDF, Word, Excel, PowerPoint (optional)</div>
            </div>
            <div style={{ display: 'flex', gap: 7, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn out" onClick={() => setUploadModal(false)}>Cancel</button>
              <button className="btn pri" onClick={handleUpload} disabled={uploading}>
                {uploading ? <><span className="spin" /> Uploading…</> : '⬆ Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
