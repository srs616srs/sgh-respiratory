'use client';
import { BRANCHES, AREAS_LIST, getStaff } from '../lib/data';
import { BranchTag } from './App';

export default function WorkloadMgmt({ workload, setWorkload, coverage, staffMeta, user, selBr, activeBranch }) {
  const updateVent = (bid, areaId, val) => {
    const v = Math.max(0, parseInt(val) || 0);
    setWorkload(p => ({ ...p, [bid]: { ...p[bid], [areaId]: { ...p[bid]?.[areaId], vent: v } } }));
  };
  const updateBeds = (bid, areaId, val) => {
    if (!user.isHOD) return;
    const v = Math.max(0, parseInt(val) || 0);
    setWorkload(p => ({ ...p, [bid]: { ...p[bid], [areaId]: { ...p[bid]?.[areaId], beds: v } } }));
  };

  const branches = selBr === 'all' ? BRANCHES : [BRANCHES.find(b => b.id === selBr)].filter(Boolean);
  const CC_AREAS = ['aicu', 'picu', 'nicu', 'imicu'];

  const getRatio = (bid) => {
    const activeStaff = staffMeta.filter(m => getStaff(m.staffId)?.branchId === bid && m.onDuty).length;
    const totalBeds = CC_AREAS.reduce((sum, a) => {
      const w = workload[bid]?.[a];
      return sum + (coverage[bid]?.[a] && w ? w.beds : 0);
    }, 0);
    if (!totalBeds) return null;
    const ratio = totalBeds / Math.max(1, activeStaff);
    return { ratio: ratio.toFixed(1), ok: ratio <= 6, warn: ratio <= 10, activeStaff, totalBeds };
  };

  return (
    <>
      <div className="ph">
        <div className="ph-row">
          <div><div className="pt">Workload Management</div><div className="ps">Critical care beds · ventilated patients · RT:bed ratio</div></div>
          <BranchTag br={selBr === 'all' ? { full: 'All Branches', color: '#0096b4' } : activeBranch} />
        </div>
      </div>
      <div className="cnt">
        {branches.map(br => {
          const ratioData = getRatio(br.id);
          const activeCovArea = AREAS_LIST.filter(a => coverage[br.id]?.[a.id] && ['aicu', 'picu', 'nicu', 'imicu', 'generalWards'].includes(a.id));
          const totalVent = activeCovArea.reduce((s, a) => s + (workload[br.id]?.[a.id]?.vent || 0), 0);
          const totalBeds = activeCovArea.reduce((s, a) => s + (workload[br.id]?.[a.id]?.beds || 0), 0);
          return (
            <div key={br.id} className="card" style={{ marginBottom: 12 }}>
              <div className="stitle">
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: br.color, display: 'inline-block' }} />
                {br.full}
                {ratioData && (
                  <span className={`ratio-badge ${ratioData.ratio <= 6 ? 'ratio-ok' : ratioData.ratio <= 10 ? 'ratio-warn' : 'ratio-bad'}`} style={{ marginLeft: 8 }}>
                    RT:Bed = 1:{ratioData.ratio} ({ratioData.activeStaff} RTs on duty)
                  </span>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 7, marginBottom: 10 }}>
                <div style={{ background: 'var(--sur2)', borderRadius: 8, padding: '8px 12px', border: '1px solid var(--bd)', textAlign: 'center' }}>
                  <div style={{ font: '700 22px var(--sora)', color: 'var(--t)' }}>{totalBeds}</div>
                  <div style={{ fontSize: 9.5, color: 'var(--t2)' }}>Total Active Beds</div>
                </div>
                <div style={{ background: '#fee2e2', borderRadius: 8, padding: '8px 12px', border: '1px solid #fecaca', textAlign: 'center' }}>
                  <div style={{ font: '700 22px var(--sora)', color: '#991b1b' }}>{totalVent}</div>
                  <div style={{ fontSize: 9.5, color: '#dc2626' }}>Ventilated Patients</div>
                </div>
              </div>
              <div className="wl-table">
                <table>
                  <thead><tr><th>Area</th><th>Total Beds</th><th>Ventilated Pts</th><th>Available Beds</th><th>Occupancy</th></tr></thead>
                  <tbody>
                    {activeCovArea.map(area => {
                      const w = workload[br.id]?.[area.id] || { beds: 0, vent: 0 };
                      const avail = w.beds - w.vent;
                      const occ = w.beds ? Math.round(w.vent / w.beds * 100) : 0;
                      return (
                        <tr key={area.id}>
                          <td style={{ color: 'var(--t)', fontWeight: 500 }}>{area.icon} {area.name}</td>
                          <td><input className="num-inp" type="number" value={w.beds} onChange={e => updateBeds(br.id, area.id, e.target.value)} readOnly={!user.isHOD} style={{ opacity: user.isHOD ? 1 : .8 }} /></td>
                          <td><input className="num-inp" type="number" value={w.vent} onChange={e => updateVent(br.id, area.id, e.target.value)} /></td>
                          <td style={{ fontWeight: 600, color: avail < 2 ? 'var(--dan)' : 'var(--a2)' }}>{avail}</td>
                          <td><span className={`ratio-badge ${occ < 70 ? 'ratio-ok' : occ < 90 ? 'ratio-warn' : 'ratio-bad'}`}>{occ}%</span></td>
                        </tr>
                      );
                    })}
                    {activeCovArea.length === 0 && (
                      <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--t3)', fontSize: 10.5 }}>No active areas — configure in Areas of Coverage</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
