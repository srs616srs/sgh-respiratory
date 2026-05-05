'use client';
import { useState } from 'react';
import { BRANCHES } from '../lib/data';
import { BranchTag } from './App';

const ICONS = ['🫀','💨','🚑','🏥','🩺','💊','🔧','📦','🛏️','💉','🩻','🌡️'];

export default function LogisticsMgmt({ logistics, setLogistics, logisticsTypes, setLogisticsTypes, user, selBr, activeBranch }) {
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [newType, setNewType] = useState({ label: '', icon: '🫀', sub: '' });

  const adj = (bid, key, delta) => {
    setLogistics(p => ({ ...p, [bid]: { ...p[bid], [key]: Math.max(0, (p[bid]?.[key] || 0) + delta) } }));
  };

  const addType = () => {
    if (!newType.label.trim()) return;
    const id = newType.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    if (logisticsTypes.find(t => t.id === id)) return alert('Equipment type already exists.');
    setLogisticsTypes(p => [...p, { id, label: newType.label.trim(), icon: newType.icon, sub: newType.sub.trim() }]);
    // Init count for all branches
    setLogistics(p => {
      const updated = { ...p };
      BRANCHES.forEach(br => { updated[br.id] = { ...(updated[br.id] || {}), [id]: 0 }; });
      return updated;
    });
    setNewType({ label: '', icon: '🫀', sub: '' });
    setShowTypeModal(false);
  };

  const removeType = (id) => {
    if (!confirm('Remove this equipment type from all branches?')) return;
    setLogisticsTypes(p => p.filter(t => t.id !== id));
  };

  if (selBr !== 'all') {
    const br = activeBranch;
    if (!br) return null;
    const lg = logistics[br.id] || {};
    return (
      <>
        <div className="ph">
          <div className="ph-row">
            <div><div className="pt">Logistics Management</div><div className="ps">Equipment inventory — click ＋/－ to update</div></div>
            <BranchTag br={br} />
          </div>
        </div>
        <div className="cnt">
          <div className="lg-grid">
            {logisticsTypes.map(eq => (
              <div key={eq.id} className="lg-card">
                <div className="lg-ico">{eq.icon}</div>
                <div className="lg-val">{lg[eq.id] || 0}</div>
                <div className="lg-lbl">{eq.label}</div>
                <div style={{ fontSize: 9.5, color: 'var(--t3)', marginTop: 3 }}>{eq.sub}</div>
                <div className="lg-adj">
                  <button className="adj-btn" onClick={() => adj(br.id, eq.id, -1)}>−</button>
                  <button className="adj-btn" onClick={() => adj(br.id, eq.id, +1)}>+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  // Network overview
  return (
    <>
      <div className="ph">
        <div className="ph-row">
          <div><div className="pt">Logistics Management</div><div className="ps">Equipment inventory across all 8 branches</div></div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {user.isAdmin && (
              <button className="btn pri sm" onClick={() => setShowTypeModal(true)}>+ Equipment Type</button>
            )}
            <BranchTag br={{ full: 'All Branches', color: '#0096b4' }} />
          </div>
        </div>
      </div>
      <div className="cnt">
        <div className="sg" style={{ marginBottom: 14 }}>
          {logisticsTypes.map((eq, i) => {
            const classes = ['bl', 'gr', 'wn', 'pu', 'or'];
            const cls = classes[i % classes.length];
            const total = Object.values(logistics).reduce((s, b) => s + (b[eq.id] || 0), 0);
            return (
              <div key={eq.id} className={`sc ${cls}`}>
                <div className="sc-ico">{eq.icon}</div>
                <div className="sc-val">{total}</div>
                <div className="sc-lbl">Total {eq.label}</div>
                {user.isAdmin && (
                  <button onClick={() => removeType(eq.id)} style={{ marginTop: 4, fontSize: 9, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--sora)' }}>✕ Remove</button>
                )}
              </div>
            );
          })}
          <div className="sc pu"><div className="sc-ico">🏥</div><div className="sc-val">{BRANCHES.length}</div><div className="sc-lbl">Active Branches</div></div>
        </div>
        <div className="card">
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Branch</th>
                  {logisticsTypes.map(eq => <th key={eq.id} style={{ textAlign: 'center' }}>{eq.icon} {eq.label}</th>)}
                  <th style={{ textAlign: 'center' }}>Total Equipment</th>
                </tr>
              </thead>
              <tbody>
                {BRANCHES.map(br => {
                  const lg = logistics[br.id] || {};
                  const total = logisticsTypes.reduce((s, eq) => s + (lg[eq.id] || 0), 0);
                  return (
                    <tr key={br.id}>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: br.color, display: 'inline-block' }} />
                        <span style={{ color: 'var(--t)', fontWeight: 500 }}>{br.full}</span>
                      </div></td>
                      {logisticsTypes.map(eq => (
                        <td key={eq.id} style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <span style={{ font: '700 16px var(--sora)', color: 'var(--t)' }}>{lg[eq.id] || 0}</span>
                            <div style={{ display: 'flex', gap: 3 }}>
                              <button className="adj-btn" style={{ width: 20, height: 20, fontSize: 11 }} onClick={() => adj(br.id, eq.id, -1)}>−</button>
                              <button className="adj-btn" style={{ width: 20, height: 20, fontSize: 11 }} onClick={() => adj(br.id, eq.id, +1)}>+</button>
                            </div>
                          </div>
                        </td>
                      ))}
                      <td style={{ textAlign: 'center', font: '600 14px var(--sora)', color: 'var(--t)' }}>{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showTypeModal && (
        <div className="ov" onClick={() => setShowTypeModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="m-title">+ Add Equipment Type</div>
            <div className="m-sub">New type will appear for all branches</div>
            <div className="ig">
              <label className="inplbl">Equipment Name</label>
              <input className="inpf" value={newType.label} onChange={e => setNewType(p => ({ ...p, label: e.target.value }))} placeholder="e.g. BiPAP Devices" />
            </div>
            <div className="ig">
              <label className="inplbl">Description (optional)</label>
              <input className="inpf" value={newType.sub} onChange={e => setNewType(p => ({ ...p, sub: e.target.value }))} placeholder="e.g. Non-invasive positive pressure ventilation" />
            </div>
            <div className="ig">
              <label className="inplbl">Icon</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ICONS.map(ic => (
                  <span key={ic} onClick={() => setNewType(p => ({ ...p, icon: ic }))}
                    style={{ fontSize: 22, cursor: 'pointer', opacity: newType.icon === ic ? 1 : 0.4, transition: 'opacity .15s' }}>
                    {ic}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 7, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn out" onClick={() => setShowTypeModal(false)}>Cancel</button>
              <button className="btn pri" onClick={addType}>Add Type</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
