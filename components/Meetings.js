'use client';
import { useState } from 'react';
import { getBranch, getStaff } from '../lib/data';
import { BranchTag } from './App';

export default function Meetings({ meetings, setMeetings, user, selBr, activeBranch }) {
  const [viewMOM, setViewMOM] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const vis = meetings.filter(m => selBr === 'all' || m.branchId === 'all' || m.branchId === selBr);

  const sign = (mid) => setMeetings(p => p.map(m =>
    m.id !== mid || m.signatures.includes(user.id) ? m : { ...m, signatures: [...m.signatures, user.id] }
  ));
  const saveMOM = (mom, title) => {
    setMeetings(p => [{
      id: Date.now(), title, date: new Date().toISOString().split('T')[0],
      time: '—', attendees: [], branchId: selBr === 'all' ? 'all' : selBr, mom, signatures: [],
    }, ...p]);
    setShowAI(false);
  };

  return (
    <>
      <div className="ph">
        <div className="ph-row">
          <div><div className="pt">Meetings & Minutes</div><div className="ps">AI-generated MOM · digital signatures · branch & network</div></div>
          <BranchTag br={selBr === 'all' ? { full: 'All Branches', color: '#0096b4' } : activeBranch} />
        </div>
      </div>
      <div className="cnt">
        <div className="tb">
          <span style={{ fontSize: 11.5, color: 'var(--t2)' }}>{vis.length} meetings</span>
          <div className="tbs" />
          <button className="btn pri" onClick={() => setShowAI(true)}>🤖 AI Generate MOM</button>
          {user.isHOD && <button className="btn out">+ Schedule</button>}
        </div>

        {vis.map(m => {
          const brInfo = m.branchId === 'all' ? null : getBranch(m.branchId);
          return (
            <div key={m.id} className="mc">
              <div className="mh">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                    <div className="mt">{m.title}</div>
                    {brInfo
                      ? <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: brInfo.color + '20', color: brInfo.color, fontWeight: 600, border: `1px solid ${brInfo.color}44` }}>{brInfo.name}</span>
                      : <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: '#e0f2fe', color: '#075985', fontWeight: 600 }}>🌐 Network</span>}
                  </div>
                  <div className="md">📅 {m.date} · ⏰ {m.time} · {m.attendees.length} attendees</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button className="btn out sm" onClick={() => setViewMOM(m)}>📄 MOM</button>
                  {!m.signatures.includes(user.id)
                    ? <button className="btn pri sm" onClick={() => sign(m.id)}>✍️ Sign</button>
                    : <span className="b valid">✓ Signed</span>}
                </div>
              </div>
              {m.signatures.length > 0 && (
                <div>
                  <div style={{ fontSize: 8.5, color: 'var(--t3)', fontWeight: 600, marginBottom: 4 }}>SIGNED:</div>
                  <div className="scg">
                    {m.signatures.map(id => { const s = getStaff(id); return s ? <div key={id} className="sch">✓ {s.name}</div> : null; })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {viewMOM && (
          <div className="ov" onClick={() => setViewMOM(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="m-title">{viewMOM.title}</div>
              <div className="m-sub">📅 {viewMOM.date} · {viewMOM.signatures.length} signatures</div>
              <div className="mom-out">{viewMOM.mom}</div>
              <div style={{ display: 'flex', gap: 7, marginTop: 13, justifyContent: 'flex-end' }}>
                {!viewMOM.signatures.includes(user.id) && (
                  <button className="btn pri" onClick={() => { sign(viewMOM.id); setViewMOM(null); }}>✍️ Sign</button>
                )}
                <button className="btn out sm" onClick={() => {
                  const blob = new Blob([viewMOM.mom], { type: 'text/plain' });
                  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
                  a.download = `${viewMOM.title}.txt`; a.click();
                }}>⬇ Export</button>
                <button className="btn out" onClick={() => setViewMOM(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {showAI && <AIMOMModal onClose={() => setShowAI(false)} onSave={saveMOM} selBr={selBr} activeBranch={activeBranch} />}
      </div>
    </>
  );
}

function AIMOMModal({ onClose, onSave, selBr, activeBranch }) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [mom, setMom] = useState('');
  const [err, setErr] = useState('');
  const brCtx = selBr === 'all' ? 'SGH Network (All 8 Branches)' : activeBranch?.full;

  const generate = async () => {
    if (!notes.trim()) { setErr('Please paste meeting notes first.'); return; }
    setStep(2); setErr('');
    try {
      const res = await fetch('/api/ai-mom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, title, branchContext: brCtx }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMom(data.mom); setStep(3);
    } catch (e) {
      setErr(e.message || 'Generation failed — try again.'); setStep(1);
    }
  };

  return (
    <div className="ov">
      <div className="modal">
        <div className="m-title">🤖 AI Minutes Generator</div>
        <div className="m-sub">Scope: <strong style={{ color: 'var(--a)' }}>{brCtx}</strong></div>

        {step === 1 && (
          <>
            <div className="ig">
              <label className="inplbl">Meeting Title</label>
              <input className="inpf" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Monthly Meeting – May 2026" />
            </div>
            <div className="uz" style={{ pointerEvents: 'none' }}>
              <div className="uz-ico">🎙️</div>
              <div className="uz-t">Drop recording (MP3/MP4/WAV)</div>
              <div className="uz-s">or paste transcript/notes below</div>
            </div>
            <textarea className="ta" rows={6} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder={'Attendees: Ahmad, Sara, Khalid\n- BLS expired for 2 staff — urgent renewal\n- Updated HFNC protocol — all staff to sign\n- Next meeting: 20 May 2026 at 9am'} />
            {err && <div className="err" style={{ marginTop: 5 }}>{err}</div>}
            <div style={{ display: 'flex', gap: 7, marginTop: 12, justifyContent: 'flex-end' }}>
              <button className="btn out" onClick={onClose}>Cancel</button>
              <button className="btn pri" onClick={generate}>✨ Generate MOM</button>
            </div>
          </>
        )}

        {step === 2 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🤖</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 12, color: 'var(--t2)' }}>
              <div className="spin" />Generating minutes…
            </div>
          </div>
        )}

        {step === 3 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9, background: '#dcfce7', padding: '8px 12px', borderRadius: 8 }}>
              <span style={{ color: '#166534', fontSize: 15 }}>✓</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>MOM Generated Successfully</span>
            </div>
            <div className="mom-out">{mom}</div>
            <div style={{ display: 'flex', gap: 7, marginTop: 12, justifyContent: 'flex-end' }}>
              <button className="btn out" onClick={() => setStep(1)}>← Redo</button>
              <button className="btn out" onClick={onClose}>Discard</button>
              <button className="btn pri" onClick={() => onSave(mom, title || 'AI-Generated MOM')}>💾 Save</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
