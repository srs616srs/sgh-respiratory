'use client';
import { BRANCHES, staffOf, getBranch, getStaff, certStatus, daysUntil } from '../lib/data';
import { BranchTag } from './App';

export default function Dashboard({ certs, compRecs, courses, meetings, staffMeta, user, selBr, activeBranch, expiring, expContracts, setView, setSelBr }) {
  const sl = staffOf(selBr);
  const brExp  = (bid) => certs.filter(c => getStaff(c.staffId)?.branchId === bid && certStatus(c.expiryDate) !== 'valid').length;
  const brDue  = (bid) => compRecs.filter(r => getStaff(r.staffId)?.branchId === bid && r.status === 'due').length;
  const brPct  = (bid) => {
    const sl2 = staffOf(bid); if (!sl2.length) return 0;
    const tot = courses.reduce((a, c) => a + c.attendance.filter(id => getStaff(id)?.branchId === bid).length, 0);
    return Math.round(tot / (courses.length * sl2.length) * 100);
  };
  const expiredL = certs.filter(c => (selBr === 'all' || getStaff(c.staffId)?.branchId === selBr) && certStatus(c.expiryDate) === 'expired');
  const expSoonL = certs.filter(c => (selBr === 'all' || getStaff(c.staffId)?.branchId === selBr) && certStatus(c.expiryDate) === 'expiring');
  const dueCnt = compRecs.filter(r => (selBr === 'all' || getStaff(r.staffId)?.branchId === selBr) && r.status === 'due').length;
  const totAtt = courses.reduce((a, c) => a + c.attendance.filter(id => selBr === 'all' || getStaff(id)?.branchId === selBr).length, 0);
  const attPct = sl.length ? Math.round(totAtt / (courses.length * sl.length) * 100) : 0;

  const alerts = [
    ...expiredL.map(c => ({ t: 'dan',  msg: `${getStaff(c.staffId)?.name} [${getBranch(getStaff(c.staffId)?.branchId)?.name}] — ${c.type} EXPIRED`, sub: `Expired: ${c.expiryDate}` })),
    ...expSoonL.map(c => ({ t: 'warn', msg: `${getStaff(c.staffId)?.name} [${getBranch(getStaff(c.staffId)?.branchId)?.name}] — ${c.type} expiring in ${daysUntil(c.expiryDate)}d`, sub: `Due: ${c.expiryDate}` })),
    ...expContracts.map(m => ({ t: 'info', msg: `${getStaff(m.staffId)?.name} — Contract expiring in ${daysUntil(m.contractEnd)}d`, sub: `Ends: ${m.contractEnd}` })),
    ...(dueCnt > 0 ? [{ t: 'warn', msg: `${dueCnt} competency assessments overdue`, sub: selBr === 'all' ? 'Across all 8 branches' : 'This branch' }] : []),
  ];
  const visMtg = meetings.filter(m => selBr === 'all' || m.branchId === 'all' || m.branchId === selBr);

  return (
    <>
      <div className="ph">
        <div className="ph-row">
          <div>
            <div className="pt">Good {getGreeting()}, {user.name.split(' ')[0]} 👋</div>
            <div className="ps">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
          <BranchTag br={selBr === 'all' ? { full: 'All 8 Branches', color: '#0096b4' } : activeBranch} />
        </div>
      </div>
      <div className="cnt">
        {selBr === 'all' && (
          <>
            <div style={{ font: '700 9.5px var(--sora)', color: 'var(--t3)', marginBottom: 7, letterSpacing: '.08em' }}>NETWORK OVERVIEW — 8 BRANCHES</div>
            <div className="ng">
              {BRANCHES.map(br => (
                <div key={br.id} className="nc" onClick={() => setSelBr(br.id)}>
                  <div className="nc-bar" style={{ background: br.color }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="nc-name">{br.name}{br.isHQ && <span style={{ fontSize: 7, background: br.color + '22', color: br.color, padding: '1px 4px', borderRadius: 3, marginLeft: 4, fontWeight: 700 }}>HQ</span>}</div>
                      <div className="nc-city">{br.city}</div>
                    </div>
                    <div style={{ fontSize: 8.5, color: 'var(--t3)', background: 'var(--sur2)', padding: '2px 5px', borderRadius: 4, fontWeight: 600, border: '1px solid var(--bd)' }}>{br.short}</div>
                  </div>
                  <div className="nc-grid">
                    <div className="nc-s"><div className="nc-v">{staffOf(br.id).length}</div><div className="nc-l">Staff</div></div>
                    <div className="nc-s"><div className="nc-v" style={{ color: brExp(br.id) > 0 ? 'var(--dan)' : 'var(--a2)' }}>{brExp(br.id)}</div><div className="nc-l">Cert alerts</div></div>
                    <div className="nc-s"><div className="nc-v" style={{ color: brDue(br.id) > 0 ? 'var(--warn)' : 'var(--a2)' }}>{brDue(br.id)}</div><div className="nc-l">Due comps</div></div>
                    <div className="nc-s"><div className="nc-v">{brPct(br.id)}%</div><div className="nc-l">Training</div></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="sg">
          <div className="sc bl"><div className="sc-ico">👥</div><div className="sc-val">{sl.length}</div><div className="sc-lbl">Active Staff</div></div>
          <div className="sc dn"><div className="sc-ico">⚠️</div><div className="sc-val">{expiredL.length + expSoonL.length}</div><div className="sc-lbl">Cert Alerts</div></div>
          <div className="sc wn"><div className="sc-ico">📋</div><div className="sc-val">{dueCnt}</div><div className="sc-lbl">Due Comps</div></div>
          <div className="sc gr"><div className="sc-ico">🎓</div><div className="sc-val">{attPct}%</div><div className="sc-lbl">Training</div></div>
        </div>

        <div className="sec2">
          <div className="card">
            <div className="stitle">🔔 Alerts <span className="scnt">{alerts.length}</span></div>
            {alerts.length === 0
              ? <div className="es"><div className="es-ico">✅</div>All clear</div>
              : alerts.slice(0, 7).map((a, i) => (
                <div key={i} className="ali">
                  <div className={`aldo ${a.t}`} />
                  <div><div className="alt">{a.msg}</div><div className="als">{a.sub}</div></div>
                </div>
              ))}
          </div>
          <div className="card">
            <div className="stitle">📅 Recent Meetings <span className="scnt">{visMtg.length}</span></div>
            {visMtg.slice(0, 5).map(m => (
              <div key={m.id} className="ali">
                <div className="aldo ok" />
                <div><div className="alt">{m.title}</div><div className="als">{m.date} · {m.attendees.length} attendees · {m.signatures.length} signed</div></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginTop: 11 }}>
          <div className="stitle">🎓 Training Overview</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
            {courses.filter(c => selBr === 'all' || c.branchId === 'all' || c.branchId === selBr).map(c => {
              const att = c.attendance.filter(id => selBr === 'all' || getStaff(id)?.branchId === selBr).length;
              const tot = sl.length || 1;
              const pct = Math.round(att / tot * 100);
              return (
                <div key={c.id} style={{ background: 'var(--sur2)', borderRadius: 8, padding: 9, border: '1px solid var(--bd)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 10.5, color: 'var(--t)', fontWeight: 500 }}>{c.thumb} {c.name}</span>
                    <span style={{ fontSize: 9.5, color: 'var(--t3)' }}>{att}/{tot}</span>
                  </div>
                  <div className="pb"><div className="pf" style={{ width: `${pct}%` }} /></div>
                  <div style={{ fontSize: 9, color: 'var(--t3)' }}>{pct}% attended</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
