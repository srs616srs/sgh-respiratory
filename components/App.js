'use client';
import { useState, useEffect } from 'react';
import {
  BRANCHES, STAFF, staffOf, getBranch, certStatus, daysUntil,
  INIT_CERTS, INIT_DOCS, INIT_COMP, INIT_COURSES, INIT_MEETINGS,
  INIT_STAFF_META, INIT_VACATIONS, INIT_FOLDERS,
  INIT_COVERAGE, INIT_WORKLOAD, INIT_LOGISTICS,
} from '../lib/data';
import Login from './Login';
import Dashboard from './Dashboard';
import Documents from './Documents';
import Certificates from './Certificates';
import Competencies from './Competencies';
import Training from './Training';
import Meetings from './Meetings';
import StaffManagement from './StaffManagement';
import AreasCoverage from './AreasCoverage';
import WorkloadMgmt from './WorkloadMgmt';
import LogisticsMgmt from './LogisticsMgmt';
import AdminPanel from './AdminPanel';

function BranchTag({ br }) {
  if (!br) return null;
  return (
    <span className="btag" style={{ color: br.color, borderColor: br.color + '55', background: br.color + '15' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: br.color, display: 'inline-block' }} />
      {br.full || br.name}
    </span>
  );
}

export { BranchTag };

export default function App() {
  const [splash, setSplash] = useState(true);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [selBr, setSelBr] = useState('all');

  // Core state
  const [certs, setCerts] = useState(INIT_CERTS);
  const [docs, setDocs] = useState(INIT_DOCS);
  const [compRecs, setCompRecs] = useState(INIT_COMP);
  const [courses, setCourses] = useState(INIT_COURSES);
  const [meetings, setMeetings] = useState(INIT_MEETINGS);
  // Admin state
  const [staffMeta, setStaffMeta] = useState(INIT_STAFF_META);
  const [vacations, setVacations] = useState(INIT_VACATIONS);
  const [folders, setFolders] = useState(INIT_FOLDERS);
  const [coverage, setCoverage] = useState(INIT_COVERAGE);
  const [workload, setWorkload] = useState(INIT_WORKLOAD);
  const [logistics, setLogistics] = useState(INIT_LOGISTICS);

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 1800);
    return () => clearTimeout(t);
  }, []);

  const login = (u) => { setUser(u); setSelBr(u.isHOD ? 'all' : u.branchId); };
  const logout = () => { setUser(null); setView('dashboard'); setSelBr('all'); };

  const expiring = certs.filter(c => {
    const s = STAFF.find(st => st.id === c.staffId);
    return (selBr === 'all' || s?.branchId === selBr) && certStatus(c.expiryDate) !== 'valid';
  });
  const dueCnt = compRecs.filter(r => {
    const s = STAFF.find(st => st.id === r.staffId);
    return (selBr === 'all' || s?.branchId === selBr) && r.status === 'due';
  }).length;
  const expContracts = staffMeta.filter(m => {
    const s = STAFF.find(st => st.id === m.staffId);
    return (selBr === 'all' || s?.branchId === selBr) && daysUntil(m.contractEnd) <= 90 && daysUntil(m.contractEnd) > 0;
  });

  if (splash) {
    return (
      <div id="splash">
        <div className="sp-ico">🫁</div>
        <div className="sp-brand">SGH RESPIRATORY SERVICES</div>
        <div className="sp-sub">NETWORK MANAGEMENT SYSTEM · MEAHCO · 8 BRANCHES</div>
        <div className="sp-bar"><div className="sp-fill" /></div>
      </div>
    );
  }

  if (!user) return <Login onLogin={login} />;

  const activeBranch = BRANCHES.find(b => b.id === selBr);

  const cbahiNav = [
    { id: 'dashboard',     ico: '⊞', label: 'Dashboard' },
    { id: 'documents',     ico: '📁', label: 'Documents & Forms' },
    { id: 'certificates',  ico: '🛡️', label: 'Certificates', badge: expiring.length || null },
    { id: 'competencies',  ico: '✓',  label: 'Competencies', badge: dueCnt || null },
    { id: 'training',      ico: '🎓', label: 'Training' },
    { id: 'meetings',      ico: '💬', label: 'Meetings' },
  ];
  const adminNav = [
    { id: 'staffmgmt', ico: '👥', label: 'Staff Management', badge: expContracts.length || null },
    { id: 'coverage',  ico: '🏥', label: 'Areas of Coverage' },
    { id: 'workload',  ico: '📊', label: 'Workload Management' },
    { id: 'logistics', ico: '🔧', label: 'Logistics' },
    ...(user.isHOD ? [{ id: 'admin', ico: '⚙️', label: user.isAdmin ? 'Admin Panel' : 'Staff Management' }] : []),
  ];

  const sh = {
    certs, setCerts, docs, setDocs, compRecs, setCompRecs, courses, setCourses,
    meetings, setMeetings, staffMeta, setStaffMeta, vacations, setVacations,
    folders, setFolders, coverage, setCoverage, workload, setWorkload,
    logistics, setLogistics, user, selBr, activeBranch,
  };

  return (
    <div className="app">
      <aside className="sb">
        <div className="sb-logo">
          <div className="sb-brand">SGH · RESPIRATORY</div>
          <div className="sb-sub">NETWORK MANAGEMENT SYSTEM</div>
        </div>

        <div className="bs-wrap">
          <div className="bs-lbl">Branch</div>
          {user.isHOD && (
            <div className={`bs-all ${selBr === 'all' ? 'act' : ''}`} onClick={() => setSelBr('all')}>
              <div className="bs-dot" />
              <span style={{ fontSize: 11 }}>All Branches</span>
            </div>
          )}
          {BRANCHES.map(br => (user.isHOD || user.branchId === br.id) && (
            <div key={br.id} className={`br-item ${selBr === br.id ? 'act' : ''}`} onClick={() => setSelBr(br.id)}>
              <div className="br-dot" style={{ background: br.color }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10.5, fontWeight: selBr === br.id ? 600 : 400 }}>{br.name}</div>
                <div className="br-city">{br.city}</div>
              </div>
              {br.isHQ && <span className="br-hq">HQ</span>}
            </div>
          ))}
        </div>

        <nav className="sb-nav">
          <div className="nav-cat"><span>CBAHI Modules</span><div className="nav-cat-line" /></div>
          {cbahiNav.map(n => (
            <div key={n.id} className={`ni ${view === n.id ? 'act' : ''}`} onClick={() => setView(n.id)}>
              <span className="ni-ico">{n.ico}</span><span>{n.label}</span>
              {n.badge ? <span className="nbadge">{n.badge}</span> : null}
            </div>
          ))}
          <div className="nav-cat" style={{ marginTop: 4 }}><span>Administrative</span><div className="nav-cat-line" /></div>
          {adminNav.map(n => (
            <div key={n.id} className={`ni adm ${view === n.id ? 'act' : ''}`} onClick={() => setView(n.id)}>
              <span className="ni-ico">{n.ico}</span><span>{n.label}</span>
              {n.badge ? <span className="nbadge">{n.badge}</span> : null}
            </div>
          ))}
        </nav>

        <div className="sb-user">
          <div className="u-av">{user.avatar}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="u-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
            <div className="u-role">{user.role}</div>
          </div>
          <button className="logout-btn" onClick={logout} title="Sign out">⏻</button>
        </div>
      </aside>

      <main className="main">
        {view === 'dashboard'    && <Dashboard    {...sh} setView={setView} setSelBr={setSelBr} expiring={expiring} expContracts={expContracts} />}
        {view === 'documents'    && <Documents    {...sh} />}
        {view === 'certificates' && <Certificates {...sh} />}
        {view === 'competencies' && <Competencies {...sh} />}
        {view === 'training'     && <Training     {...sh} />}
        {view === 'meetings'     && <Meetings     {...sh} />}
        {view === 'staffmgmt'    && <StaffManagement {...sh} />}
        {view === 'coverage'     && <AreasCoverage   {...sh} />}
        {view === 'workload'     && <WorkloadMgmt    {...sh} />}
        {view === 'logistics'    && <LogisticsMgmt   {...sh} />}
        {view === 'admin'        && <AdminPanel user={user} />}
      </main>
    </div>
  );
}
