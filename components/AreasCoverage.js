'use client';
import { BRANCHES, AREAS_LIST } from '../lib/data';
import { BranchTag } from './App';

export default function AreasCoverage({ coverage, setCoverage, user, selBr, activeBranch }) {
  const toggle = (bid, areaId) => {
    if (!user.isHOD && user.branchId !== bid) return;
    setCoverage(p => ({ ...p, [bid]: { ...p[bid], [areaId]: !p[bid]?.[areaId] } }));
  };

  const uncoveredAlerts = [];
  if (user.isHOD && selBr === 'all') {
    BRANCHES.forEach(br => {
      const cov = coverage[br.id] || {};
      AREAS_LIST.forEach(area => { if (!cov[area.id]) uncoveredAlerts.push({ branch: br.name, area: area.name, color: br.color }); });
    });
  }

  const branches = selBr === 'all' ? BRANCHES : [BRANCHES.find(b => b.id === selBr)].filter(Boolean);

  return (
    <>
      <div className="ph">
        <div className="ph-row">
          <div><div className="pt">Areas of Coverage</div><div className="ps">Select which service areas apply to each branch</div></div>
          <BranchTag br={selBr === 'all' ? { full: 'All Branches', color: '#0096b4' } : activeBranch} />
        </div>
      </div>
      <div className="cnt">
        {uncoveredAlerts.length > 0 && (
          <div className="abanner warn">
            <span style={{ fontSize: 16 }}>🔔</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>⚠️ {uncoveredAlerts.length} area(s) not covered across the network</div>
              <div style={{ fontSize: 10, color: '#78350f', marginTop: 3 }}>
                {uncoveredAlerts.slice(0, 5).map((a, i) => <span key={i} style={{ marginRight: 10 }}>• {a.branch}: {a.area}</span>)}
                {uncoveredAlerts.length > 5 && <span>+{uncoveredAlerts.length - 5} more</span>}
              </div>
            </div>
          </div>
        )}
        {branches.map(br => (
          <div key={br.id} className="card" style={{ marginBottom: 12 }}>
            <div className="stitle">
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: br.color, display: 'inline-block' }} />
              {br.full}
              <span style={{ fontSize: 9.5, color: 'var(--t3)', fontWeight: 400, marginLeft: 4 }}>{br.city}</span>
              <span className="scnt" style={{ marginLeft: 'auto' }}>{Object.values(coverage[br.id] || {}).filter(Boolean).length}/{AREAS_LIST.length} areas</span>
            </div>
            <div className="cov-grid">
              {AREAS_LIST.map(area => {
                const on = coverage[br.id]?.[area.id] || false;
                const canEdit = user.isHOD || user.branchId === br.id;
                return (
                  <div key={area.id} className={`cov-item ${on ? 'on' : 'off'}`} onClick={() => canEdit && toggle(br.id, area.id)} style={{ cursor: canEdit ? 'pointer' : 'default' }}>
                    <div className="cov-ico">{on ? '✓' : '–'}</div>
                    <div>
                      <div className="cov-name">{area.name}</div>
                      <div style={{ fontSize: 8.5, marginTop: 1, color: on ? '#166534' : 'var(--t3)' }}>{on ? 'Active' : 'Not offered'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
