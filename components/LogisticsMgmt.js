'use client';
import { BRANCHES } from '../lib/data';
import { BranchTag } from './App';

const EQUIP = [
  { key: 'ventilators',   label: 'Ventilators',           icon: '🫀', sub: 'Mechanical ventilators (invasive)' },
  { key: 'hfnc',          label: 'HFNC Devices',          icon: '💨', sub: 'High-Flow Nasal Cannula units' },
  { key: 'transportVent', label: 'Transport Ventilators',  icon: '🚑', sub: 'Portable / transport ventilators' },
];

export default function LogisticsMgmt({ logistics, setLogistics, user, selBr, activeBranch }) {
  const adj = (bid, key, delta) => {
    setLogistics(p => ({ ...p, [bid]: { ...p[bid], [key]: Math.max(0, (p[bid]?.[key] || 0) + delta) } }));
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
            {EQUIP.map(eq => (
              <div key={eq.key} className="lg-card">
                <div className="lg-ico">{eq.icon}</div>
                <div className="lg-val">{lg[eq.key] || 0}</div>
                <div className="lg-lbl">{eq.label}</div>
                <div style={{ fontSize: 9.5, color: 'var(--t3)', marginTop: 3 }}>{eq.sub}</div>
                <div className="lg-adj">
                  <button className="adj-btn" onClick={() => adj(br.id, eq.key, -1)}>−</button>
                  <button className="adj-btn" onClick={() => adj(br.id, eq.key, +1)}>+</button>
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
          <BranchTag br={{ full: 'All Branches', color: '#0096b4' }} />
        </div>
      </div>
      <div className="cnt">
        <div className="sg" style={{ marginBottom: 14 }}>
          <div className="sc bl"><div className="sc-ico">🫀</div><div className="sc-val">{Object.values(logistics).reduce((s, b) => s + (b.ventilators || 0), 0)}</div><div className="sc-lbl">Total Ventilators</div></div>
          <div className="sc gr"><div className="sc-ico">💨</div><div className="sc-val">{Object.values(logistics).reduce((s, b) => s + (b.hfnc || 0), 0)}</div><div className="sc-lbl">Total HFNC</div></div>
          <div className="sc wn"><div className="sc-ico">🚑</div><div className="sc-val">{Object.values(logistics).reduce((s, b) => s + (b.transportVent || 0), 0)}</div><div className="sc-lbl">Transport Vents</div></div>
          <div className="sc pu"><div className="sc-ico">🏥</div><div className="sc-val">{BRANCHES.length}</div><div className="sc-lbl">Active Branches</div></div>
        </div>
        <div className="card">
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Branch</th>
                  <th style={{ textAlign: 'center' }}>🫀 Ventilators</th>
                  <th style={{ textAlign: 'center' }}>💨 HFNC</th>
                  <th style={{ textAlign: 'center' }}>🚑 Transport Vents</th>
                  <th style={{ textAlign: 'center' }}>Total Equipment</th>
                </tr>
              </thead>
              <tbody>
                {BRANCHES.map(br => {
                  const lg = logistics[br.id] || {};
                  const total = (lg.ventilators || 0) + (lg.hfnc || 0) + (lg.transportVent || 0);
                  return (
                    <tr key={br.id}>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: br.color, display: 'inline-block' }} />
                        <span style={{ color: 'var(--t)', fontWeight: 500 }}>{br.full}</span>
                      </div></td>
                      {EQUIP.map(eq => (
                        <td key={eq.key} style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <span style={{ font: '700 16px var(--sora)', color: 'var(--t)' }}>{lg[eq.key] || 0}</span>
                            <div style={{ display: 'flex', gap: 3 }}>
                              <button className="adj-btn" style={{ width: 20, height: 20, fontSize: 11 }} onClick={() => adj(br.id, eq.key, -1)}>−</button>
                              <button className="adj-btn" style={{ width: 20, height: 20, fontSize: 11 }} onClick={() => adj(br.id, eq.key, +1)}>+</button>
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
    </>
  );
}
