'use client';
import { useState, useRef } from 'react';
import { getBranch } from '../lib/data';
import { BranchTag } from './App';

export default function Documents({ docs, setDocs, selBr, activeBranch }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [uploading, setUploading] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', category: 'Policy', branchId: selBr === 'all' ? 'all' : selBr });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef();

  const cats = ['All', 'Policy', 'Protocol', 'SOP', 'Form', 'Checklist', 'Guideline'];
  const vis = docs.filter(d =>
    (d.branchId === 'all' || d.branchId === selBr || selBr === 'all') &&
    (cat === 'All' || d.category === cat) &&
    d.name.toLowerCase().includes(q.toLowerCase())
  );

  const handleUpload = async () => {
    if (!newDoc.name.trim()) return alert('Please enter a document name.');
    setUploading(true);

    if (selectedFile) {
      try {
        const form = new FormData();
        form.append('file', selectedFile);
        form.append('name', newDoc.name);
        form.append('category', newDoc.category);
        form.append('branchId', newDoc.branchId);
        const res = await fetch('/api/documents', { method: 'POST', body: form });
        const json = await res.json();
        if (json.document) {
          setDocs(p => [json.document, ...p]);
          setUploadModal(false);
          setSelectedFile(null);
          setNewDoc({ name: '', category: 'Policy', branchId: selBr === 'all' ? 'all' : selBr });
        } else {
          // fallback: add locally
          addLocally();
        }
      } catch {
        addLocally();
      }
    } else {
      addLocally();
    }
    setUploading(false);
  };

  const addLocally = () => {
    const icons = { Policy: '📋', Protocol: '📄', SOP: '📋', Form: '📝', Checklist: '✅', Guideline: '📘' };
    const sizeStr = selectedFile ? `${Math.round(selectedFile.size / 1024)} KB` : '—';
    setDocs(p => [{
      id: Date.now(), name: newDoc.name, category: newDoc.category, branchId: newDoc.branchId,
      date: new Date().toISOString().split('T')[0], size: sizeStr,
      icon: icons[newDoc.category] || '📄', fileUrl: selectedFile ? URL.createObjectURL(selectedFile) : null,
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
          <button className="btn pri" onClick={() => setUploadModal(true)}>⬆ Upload Document</button>
        </div>
        <div className="fps">{cats.map(c => <div key={c} className={`pill ${cat === c ? 'act' : ''}`} onClick={() => setCat(c)}>{c}</div>)}</div>

        <div className="card">
          <div className="tw">
            <table>
              <thead><tr><th>Document</th><th>Category</th><th>Scope</th><th>Date</th><th>Size</th><th></th></tr></thead>
              <tbody>
                {vis.map(d => (
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
                      {d.fileUrl
                        ? <a href={d.fileUrl} target="_blank" rel="noreferrer" className="btn out sm" style={{ textDecoration: 'none' }}>⬇ Download</a>
                        : <button className="btn out sm" disabled style={{ opacity: .5 }}>⬇ Download</button>}
                    </td>
                  </tr>
                ))}
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
                {['Policy', 'Protocol', 'SOP', 'Form', 'Checklist', 'Guideline'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="ig">
              <label className="inplbl">Scope</label>
              <select className="inpf" value={newDoc.branchId} onChange={e => setNewDoc(p => ({ ...p, branchId: e.target.value }))}>
                <option value="all">🌐 All Branches (Network)</option>
                {[{id:'jeddah',name:'SGH Jeddah'},{id:'riyadh',name:'SGH Riyadh'},{id:'madinah',name:'SGH Madinah'},{id:'makkah',name:'SGH Makkah'},{id:'aseer',name:'SGH Aseer'},{id:'dammam',name:'SGH Dammam'},{id:'hail',name:'SGH Hail'},{id:'haijamea',name:'SGH Hai Aljamea'}].map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="uz">
              <input type="file" ref={fileRef} onChange={e => setSelectedFile(e.target.files[0])} accept=".pdf,.doc,.docx,.xlsx,.pptx,.txt" />
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
