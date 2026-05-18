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

  const handleDelete = async (doc) => {
    if (!confirm(`Delete "${doc.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch('/api/documents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: doc.id, storagePath: doc.storagePath || doc.storage_path }),
      });
      const json = await res.json();
      if (json.ok) {
        setDocs(p => p.filter(d => d.id !== doc.id));
      } else {
        alert(json.error || 'Delete failed.');
      }
    } catch { alert('Delete failed. Check your connection.'); }
  };

  const handleUpload = async () => {
    if (!newDoc.name.trim()) return alert('Please enter a document name.');
    if (!selectedFile) return alert('Please select a file to upload.');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', selectedFile);
      form.append('name', newDoc.name);
      form.append('branchId', newDoc.branchId);
      form.append('category', newDoc.category);
      const res = await fetch('/api/documents', { method: 'POST', body: form });
      const json = await res.json();
      if (json.document) {
        // Reload all docs from DB so all users see the new doc
        const r2 = await fetch('/api/documents');
        if (r2.ok) {
          const raw = await r2.json();
          // Normalise snake_case DB columns to camelCase
          setDocs(raw.map(d => ({
            ...d,
            branchId:    d.branch_id    ?? d.branchId    ?? 'all',
            fileUrl:     d.file_url     ?? d.fileUrl     ?? null,
            storagePath: d.storage_path ?? d.storagePath ?? null,
          })));
        }
        setUploadModal(false);
        setSelectedFile(null);
        setNewDoc({ name: '', category: 'Policy', branchId: selBr === 'all' ? 'all' : selBr });
      } else {
        alert(json.error || 'Upload failed.');
      }
    } catch { alert('Upload failed. Check your connection.'); }
    setUploading(false);
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
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
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
                          {user.isAdmin && (
                            <button onClick={() => handleDelete(d)}
                              style={{ fontSize: 10, padding: '3px 8px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 5, cursor: 'pointer', fontFamily: 'var(--sora)', fontWeight: 600 }}>
                              🗑 Delete
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
