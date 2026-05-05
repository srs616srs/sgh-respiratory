'use client';
import { useState, useEffect } from 'react';
import {
  BRANCHES, getBranch, certStatus, daysUntil,
  INIT_CERTS, INIT_DOCS, INIT_COMP, INIT_COURSES, INIT_MEETINGS,
  INIT_STAFF_META, INIT_VACATIONS, INIT_FOLDERS,
  INIT_COVERAGE, INIT_WORKLOAD, INIT_LOGISTICS,
  INIT_SCHEDULES, INIT_TRAINING_REQUESTS, INIT_DOC_ACKS, INIT_LOGISTICS_TYPES,
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
  // New state
  const [staff, setStaff] = useState([]);
  const [schedules, setSchedules] = useState(INIT_SCHEDULES);
  const [trainingRequests, setTrainingRequests] = useState(INIT_TRAINING_REQUESTS);
  const [docAcks, setDocAcks] = useState(INIT_DOC_ACKS);
  const [logisticsTypes, setLogisticsTypes] = useState(INIT_LOGISTICS_TYPES);
  // UI state
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [forceChangePwd, setForceChangePwd] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 1800);
    return () => clearTimeout(t);
  }, []);

  // Load staff from DB after login
  const loadStaff = async () => {
    try {
      const r = await fetch('/api/admin/users');
      if (r.ok) {
        const all = await r.json();
        // Map DB users to staff format
        const mapped = all.filter(u => u.active).map(u => ({
          id: u.id,
          name: u.full_name,
          email: u.email,
          role: u.role === 'admin' ? 'Network Director' : u.role === 'hod' ? 'Head of Department' : 'RT Staff',
          branchId: u.branch_id,
          isHOD: u.role === 'admin' || u.role === 'hod',
          isAdmin: u.role === 'admin',
          avatar: u.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        }));
        setStaff(mapped);
      }
    } catch { /* ignore */ }
  };

  const login = (u) => {
    setUser(u);
    setSelBr(u.isHOD ? 'all' : u.branchId);
    loadStaff();
    if (u.forcePasswordChange) {
      setForceChangePwd(true);
      setShowChangePwd(true);
    }
  };

  const logout = () => {
    setUser(null);
    setView('dashboard');
    setSelBr('all');
    setStaff([]);
    setShowChangePwd(false);
    setForceChangePwd(false);
  };

  const expiring = certs.filter(c => {
    const s = staff.find(st => st.id === c.staffId);
    return (selBr === 'all' || s?.branchId === selBr) && certStatus(c.expiryDate) !== 'valid';
  });
  const dueCnt = compRecs.filter(r => {
    const s = staff.find(st => st.id === r.staffId);
    return (selBr === 'all' || s?.branchId === selBr) && r.status === 'due';
  }).length;
  const expContracts = staffMeta.filter(m => {
    const s = staff.find(st => st.id === m.staffId);
    return (selBr === 'all' || s?.branchId === selBr) && daysUntil(m.contractEnd) <= 90 && daysUntil(m.contractEnd) > 0;
  });

  // Pending training requests for HOD
  const pendingRequests = trainingRequests.filter(r =>
    r.status === 'pending' && (user?.isAdmin || r.branchId === user?.branchId)
  );

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
    { id: 'training',      ico: '🎓', label: 'Training', badge: user.isHOD && pendingRequests.length ? pendingRequests.length : null },
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
    logistics, setLogistics,
    staff, setStaff,
    schedules, setSchedules,
    trainingRequests, setTrainingRequests,
    docAcks, setDocAcks,
    logisticsTypes, setLogisticsTypes,
    user, selBr, activeBranch,
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <button className="logout-btn" title="Change Password" onClick={() => { setForceChangePwd(false); setShowChangePwd(true); }} style={{ fontSize: 11 }}>🔑</button>
            <button className="logout-btn" onClick={logout} title="Sign out">⏻</button>
          </div>
        </div>
      </aside>

      <main className="main">
        {view === 'dashboard'    && <Dashboard    {...sh} setView={setView} setSelBr={setSelBr} expiring={expiring} expContracts={expContracts} />}
        {view === 'documents'    && <Documents    {...sh} />}
        {view === 'certificates' && <Certificates {...sh} />}
        {view === 'competencies' && <Competencies {...sh} />}
        {view === 'training'     && <Training     {...sh} pendingRequests={pendingRequests} />}
        {view === 'meetings'     && <Meetings     {...sh} />}
        {view === 'staffmgmt'    && <StaffManagement {...sh} />}
        {view === 'coverage'     && <AreasCoverage   {...sh} />}
        {view === 'workload'     && <WorkloadMgmt    {...sh} />}
        {view === 'logistics'    && <LogisticsMgmt   {...sh} />}
        {view === 'admin'        && <AdminPanel user={user} onStaffChange={loadStaff} />}
      </main>

      {showChangePwd && (
        <ChangePasswordModal
          user={user}
          forced={forceChangePwd}
          onClose={() => { if (!forceChangePwd) setShowChangePwd(false); }}
          onSuccess={() => {
            setShowChangePwd(false);
            setForceChangePwd(false);
            setUser(u => ({ ...u, forcePasswordChange: false }));
          }}
        />
      )}
    </div>
  );
}

function ChangePasswordModal({ user, forced, onClose, onSuccess }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const save = async () => {
    if (!next || !confirm) { setErr('All fields are required.'); return; }
    if (next.length < 6) { setErr('New password must be at least 6 characters.'); return; }
    if (next !== confirm) { setErr('Passwords do not match.'); return; }
    if (!forced && !current) { setErr('Please enter your current password.'); return; }
    setSaving(true);
    setErr('');
    try {
      const r = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, currentPassword: forced ? undefined : current, newPassword: next }),
      });
      const result = await r.json();
      if (!r.ok) { setErr(result.error || 'Failed to change password.'); setSaving(false); return; }
      onSuccess();
    } catch {
      setErr('Server error. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--sur)', borderRadius: 14, padding: 28, width: 420, maxWidth: '92vw', border: '1px solid var(--bd)', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
        <div style={{ font: '700 16px var(--sora)', color: 'var(--t)', marginBottom: 6 }}>🔑 Change Password</div>
        {forced && (
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 11, color: '#92400e' }}>
            ⚠️ You must set a new password before continuing. Default passwords are not allowed.
          </div>
        )}
        {!forced && (
          <div className="ig" style={{ marginBottom: 10 }}>
            <label className="inplbl">Current Password</label>
            <input className="inpf" type="password" value={current} placeholder="••••••••"
              onChange={e => { setCurrent(e.target.value); setErr(''); }} />
          </div>
        )}
        <div className="ig" style={{ marginBottom: 10 }}>
          <label className="inplbl">New Password</label>
          <input className="inpf" type="password" value={next} placeholder="Min. 6 characters"
            onChange={e => { setNext(e.target.value); setErr(''); }} />
        </div>
        <div className="ig" style={{ marginBottom: 14 }}>
          <label className="inplbl">Confirm New Password</label>
          <input className="inpf" type="password" value={confirm} placeholder="Re-enter new password"
            onChange={e => { setConfirm(e.target.value); setErr(''); }} />
        </div>
        {err && <div className="err" style={{ marginBottom: 12 }}>⚠ {err}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {!forced && (
            <button className="btn" onClick={onClose}
              style={{ background: 'var(--sur2)', color: 'var(--t2)' }}>Cancel</button>
          )}
          <button className="btn" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
