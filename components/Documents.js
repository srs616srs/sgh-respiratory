'use client';
import { useState, useRef } from 'react';
import { getBranch, BRANCHES } from '../lib/data';
import { BranchTag } from './App';

const CATS = ['Policy', 'Protocol', 'SOP', 'Form', 'Checklist', 'Guideline', 'Competency'];

function normDoc(d) {
  return {
    ...d,
    branchId:    d.branch_id    ?? d.branchId    ?? 'all',
    fileUrl:     d.file_url     ?? d.fileUrl     ?? null,
    storagePath: d.storage_path ?? d.storagePath ?? null,
  };
}

export default function Documents({ docs, setDocs, docAcks, setDocAcks, user, selBr, activeBranch }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [uploadModal, setUploadModal] = useState(false);
  const [bulkCat, setBulkCat] = useState('Protocol');
  const [bulkBranch, setBulkBranch] = useState(selBr === 'all' ? 'all' : selBr);
  // fileList: Array of { file, name, status: 'pending'|'uploading'|'done'|'error', error }
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const cats = ['All', ...CATS];
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

  // File picker → add to list (deduplicate by name)
  const onFilePick = (e) => {
    const picked = Array.from(e.target.files || []);
    setFileList(prev => {
      const existing = new Set(prev.map(f => f.file.name));
      const toAdd = picked.filter(f => !existing.has(f.name)).map(f => ({
        file: f,
        name: f.name.replace(/\.[^.]+$/, ''), // default name = filename without ext
        status: 'pending',
        error: null,
      }));
      return [...prev, ...toAdd];
    });
    e.target.value = ''; // reset so same files can be re-added after removal
  };

  const removeFile = (idx) => setFileList(p => p.filter((_, i) => i !== idx));
  const updateName = (idx, val) => setFileList(p => p.map((f, i) => i === idx ? { ...f, name: val } : f));

  const handleUpload = async () => {
    if (fileList.length === 0) return alert('Please select at least one file.');
    const allNamed = fileList.every(f => f.name.trim());
    if (!allNamed) return alert('Please give every file a name.');

    setUploading(true);

    // Upload sequentially, updating status per file
    for (let i = 0; i < fileList.length; i++) {
      setFileList(p => p.map((f, idx) => idx === i ? { ...f, status: 'uploading' } : f));
      try {
        const form = new FormData();
        form.append('file', fileList[i].file);
        form.append('name', fileList[i].name.trim());
        form.append('branchId', bulkBranch);
        form.append('category', bulkCat);
        const res = await fetch('/api/documents', { method: 'POST', body: form });
        const json = await res.json();
        if (json.document) {
          setFileList(p => p.map((f, idx) => idx === i ? { ...f, status: 'done' } : f));
        } else {
          setFileList(p => p.map((f, idx) => idx === i ? { ...f, status: 'error', error: json.error || 'Failed' } : f));
        }
      } catch (e) {
        setFileList(p => p.map((f, idx) => idx === i ? { ...f, status: 'error', error: 'Network error' } : f));
      }
    }

    // Reload full list from DB once all done
    try {
      const r = await fetch('/api/documents');
      if (r.ok) setDocs((await r.json()).map(normDoc));
    } catch { /* ignore */ }

    setUploading(false);

    // Auto-close if all succeeded
    const allOk = fileList.every(f => f.status === 'done'); // fileList state may be stale here
    // Use a small delay to let state settle
    setTimeout(() => {
      setFileList(prev => {
        if (prev.every(f => f.status === 'done')) {
          setUploadModal(false);
          return [];
        }
        return prev; // keep open if some errors
      });
    }, 600);
  };

  const openModal = () => {
    setFileList([]);
    setBulkCat('Protocol');
    setBulkBranch(selBr === 'all' ? 'all' : selBr);
    setUploadModal(true);
  };

  const doneCount  = fileList.filter(f => f.status === 'done').length;
  const errorCount = fileList.filter(f => f.status === 'error').length;

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
          {user.isHOD && <button className="btn pri" onClick={openModal}>⬆ Upload Documents</button>}
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
        <div className="ov" onClick={() => !uploading && setUploadModal(false)}>
          <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="m-title">⬆ Upload Documents</div>
            <div className="m-sub">All selected files will share the same category &amp; scope</div>

            {/* Shared settings */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 12 }}>
              <div className="ig" style={{ margin: 0 }}>
                <label className="inplbl">Category</label>
                <select className="inpf" value={bulkCat} onChange={e => setBulkCat(e.target.value)} disabled={uploading}>
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="ig" style={{ margin: 0 }}>
                <label className="inplbl">Scope</label>
                <select className="inpf" value={bulkBranch} onChange={e => setBulkBranch(e.target.value)} disabled={uploading}>
                  <option value="all">🌐 All Branches</option>
                  {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.full}</option>)}
                </select>
              </div>
            </div>

            {/* Drop zone / file picker */}
            <div className="uz" onClick={() => !uploading && fileRef.current?.click()} style={{ cursor: uploading ? 'default' : 'pointer', marginBottom: 10 }}>
              <input type="file" ref={fileRef} style={{ display: 'none' }} multiple
                accept=".pdf,.doc,.docx,.xlsx,.pptx,.txt"
                onChange={onFilePick} />
              <div className="uz-ico">📎</div>
              <div className="uz-t">{fileList.length > 0 ? `${fileList.length} file${fileList.length > 1 ? 's' : ''} selected — click to add more` : 'Click to select files'}</div>
              <div className="uz-s">PDF, Word, Excel, PowerPoint · select multiple at once</div>
            </div>

            {/* File list */}
            {fileList.length > 0 && (
              <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                {fileList.map((f, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 7, padding: '6px 10px',
                    borderRadius: 7, border: '1px solid var(--bd)',
                    background: f.status === 'done' ? '#f0fdf4' : f.status === 'error' ? '#fef2f2' : 'var(--sur2)',
                  }}>
                    <span style={{ fontSize: 13, flexShrink: 0 }}>
                      {f.status === 'done' ? '✅' : f.status === 'error' ? '❌' : f.status === 'uploading' ? '⏳' : '📄'}
                    </span>
                    <input
                      value={f.name}
                      onChange={e => updateName(i, e.target.value)}
                      disabled={uploading}
                      placeholder="Document name"
                      style={{
                        flex: 1, fontSize: 11, padding: '3px 7px', border: '1px solid var(--bd)',
                        borderRadius: 5, background: 'var(--bg)', color: 'var(--t)', fontFamily: 'var(--sora)',
                        outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: 9.5, color: 'var(--t3)', flexShrink: 0, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {(f.file.size / 1024) >= 1024
                        ? `${(f.file.size / 1048576).toFixed(1)} MB`
                        : `${Math.round(f.file.size / 1024)} KB`}
                    </span>
                    {f.status === 'error' && <span style={{ fontSize: 9, color: '#dc2626', flexShrink: 0 }}>{f.error}</span>}
                    {!uploading && f.status !== 'done' && (
                      <button onClick={() => removeFile(i)}
                        style={{ fontSize: 11, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', padding: '0 2px', flexShrink: 0 }}>✕</button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Progress summary while uploading */}
            {uploading && (
              <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
                <span className="spin" />
                Uploading {doneCount + errorCount + 1} of {fileList.length}…
                {doneCount > 0 && <span style={{ color: '#166534' }}>✓ {doneCount} done</span>}
                {errorCount > 0 && <span style={{ color: '#dc2626' }}>✕ {errorCount} failed</span>}
              </div>
            )}

            <div style={{ display: 'flex', gap: 7, justifyContent: 'flex-end' }}>
              <button className="btn out" onClick={() => setUploadModal(false)} disabled={uploading}>Cancel</button>
              <button className="btn pri" onClick={handleUpload} disabled={uploading || fileList.length === 0}>
                {uploading ? <><span className="spin" /> Uploading…</> : `⬆ Upload ${fileList.length > 1 ? `${fileList.length} Files` : 'File'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
