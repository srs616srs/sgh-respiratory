'use client';
import { useState, useEffect, useRef } from 'react';
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
import VacationPlanner from './VacationPlanner';

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
  const [quizzes, setQuizzes] = useState([]);
  const [vacationRequests, setVacationRequests] = useState([]);
  // UI state
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [forceChangePwd, setForceChangePwd] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [forceEmail, setForceEmail] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 1800);
    return () => clearTimeout(t);
  }, []);

  // Current month key e.g. "2026-05"
  const monthYear = new Date().toISOString().slice(0, 7);

  // Load schedule for a branch from DB
  const loadSchedule = async (branchId) => {
    try {
      const r = await fetch(`/api/schedules?branch_id=${branchId}&month_year=${monthYear}`);
      if (r.ok) {
        const data = await r.json();
        if (data && Object.keys(data).length > 0) {
          setSchedules(p => ({ ...p, [branchId]: data }));
        }
      }
    } catch { /* ignore */ }
  };

  // Save schedule for a branch to DB
  const saveSchedule = async (branchId, data) => {
    try {
      await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch_id: branchId, month_year: monthYear, data }),
      });
    } catch { /* ignore */ }
  };

  // Load courses from DB
  const loadCourses = async () => {
    try {
      const r = await fetch('/api/courses');
      if (r.ok) setCourses(await r.json());
    } catch { /* ignore */ }
  };

  // Load quizzes from DB
  const loadQuizzes = async () => {
    try {
      const r = await fetch('/api/quizzes');
      if (r.ok) setQuizzes(await r.json());
    } catch { /* ignore */ }
  };

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
          sghId: u.sgh_id,
          role: u.role === 'admin' ? 'Network Director' : u.role === 'hod' ? 'Head of Department' : 'RT Staff',
          branchId: u.branch_id,
          isHOD: u.role === 'admin' || u.role === 'hod',
          isAdmin: u.role === 'admin',
          avatar: u.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
          mohLicenseUrl: u.moh_license_url || null,
          mohLicenseExpiry: u.moh_license_expiry || null,
        }));
        setStaff(mapped);
      }
    } catch { /* ignore */ }
  };

  const login = (u) => {
    setUser(u);
    setSelBr(u.isHOD ? 'all' : u.branchId);
    loadStaff();
    loadCourses();
    loadQuizzes();
    // Load schedules — all branches for admin, own branch for HOD/staff
    const { BRANCHES: BR } = require('../lib/data');
    const branchesToLoad = u.isAdmin ? BR.map(b => b.id) : [u.branchId];
    branchesToLoad.forEach(bid => loadSchedule(bid));
    // Staff first-login: force password change, then force email entry
    if (u.forcePasswordChange) {
      setForceChangePwd(true);
      setShowChangePwd(true);
      // After password, email will be forced (handled in onSuccess)
      if (!u.isHOD && !u.email) setForceEmail(true);
    } else if (!u.isHOD && !u.email) {
      // Staff with no email — force email entry
      setForceEmail(true);
      setShowProfile(true);
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

  // Pending vacation requests for HOD
  const pendingVacations = vacationRequests.filter(r =>
    r.status === 'pending' && (user?.isAdmin || r.branch_id === user?.branchId)
  );

  // MOH license expiry alerts (within 90 days)
  const mohAlerts = staff.filter(s => {
    if (!s.mohLicenseExpiry) return false;
    if (selBr !== 'all' && s.branchId !== selBr) return false;
    const days = Math.ceil((new Date(s.mohLicenseExpiry) - new Date()) / 86400000);
    return days <= 90;
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
    { id: 'certificates',  ico: '🛡️', label: 'Certificates', badge: (expiring.length + mohAlerts.length) || null },
    { id: 'competencies',  ico: '✓',  label: 'Competencies', badge: dueCnt || null },
    { id: 'training',      ico: '🎓', label: 'Training', badge: user.isHOD && pendingRequests.length ? pendingRequests.length : null },
    { id: 'meetings',      ico: '💬', label: 'Meetings' },
    { id: 'vacations',     ico: '🏖️', label: 'Vacation Planner', badge: user.isHOD && pendingVacations.length ? pendingVacations.length : null },
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
    schedules, setSchedules, saveSchedule, monthYear,
    trainingRequests, setTrainingRequests,
    docAcks, setDocAcks,
    logisticsTypes, setLogisticsTypes,
    quizzes, setQuizzes, loadQuizzes,
    loadCourses, mohAlerts,
    vacationRequests, setVacationRequests,
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
            <button className="logout-btn" title="My Profile" onClick={() => setShowProfile(true)}
              style={{ fontSize: 10, padding: '3px 6px', display: 'flex', alignItems: 'center', gap: 3 }}>
              👤 <span style={{ fontSize: 9 }}>Profile</span>
            </button>
            <button className="logout-btn" title="Change Password" onClick={() => { setForceChangePwd(false); setShowChangePwd(true); }}
              style={{ fontSize: 10, padding: '3px 6px', display: 'flex', alignItems: 'center', gap: 3 }}>
              🔑 <span style={{ fontSize: 9 }}>Password</span>
            </button>
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
        {view === 'vacations'    && <VacationPlanner {...sh} />}
        {view === 'staffmgmt'    && <StaffManagement {...sh} />}
        {view === 'coverage'     && <AreasCoverage   {...sh} />}
        {view === 'workload'     && <WorkloadMgmt    {...sh} />}
        {view === 'logistics'    && <LogisticsMgmt   {...sh} />}
        {view === 'admin'        && <AdminPanel user={user} onStaffChange={loadStaff} />}
      </main>

      {showProfile && (
        <ProfileModal
          user={user}
          forced={forceEmail}
          onClose={() => { if (!forceEmail) setShowProfile(false); }}
          onSave={(updated) => {
            setUser(u => ({ ...u, ...updated }));
            setShowProfile(false);
            setForceEmail(false);
            loadStaff(); // refresh MOH data in staff list
          }}
        />
      )}

      {showChangePwd && (
        <ChangePasswordModal
          user={user}
          forced={forceChangePwd}
          onClose={() => { if (!forceChangePwd) setShowChangePwd(false); }}
          onSuccess={() => {
            setShowChangePwd(false);
            setForceChangePwd(false);
            setUser(u => ({ ...u, forcePasswordChange: false }));
            // Staff with no email — prompt email right after password change
            if (forceEmail) setShowProfile(true);
          }}
        />
      )}
    </div>
  );
}

function ProfileModal({ user, forced, onClose, onSave }) {
  const [email, setEmail] = useState(user.email || '');
  const [mohFile, setMohFile] = useState(null);
  const [mohExpiry, setMohExpiry] = useState(user.mohLicenseExpiry || '');
  const [mohUrl, setMohUrl] = useState(user.mohLicenseUrl || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef();

  const uploadMoh = async (file) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'moh-licenses');
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const json = await res.json();
      if (json.url) { setMohUrl(json.url); setMsg('✓ MOH license uploaded.'); }
      else setMsg('Upload failed. Try again.');
    } catch { setMsg('Upload error. Try again.'); }
    setUploading(false);
  };

  const save = async () => {
    if (forced && !email.trim()) { setMsg('Email is required. Please enter your SGH email address.'); return; }
    if (email && !email.includes('@')) { setMsg('Please enter a valid email address.'); return; }
    setSaving(true);
    setMsg('');
    try {
      const r = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          email: email.trim() || null,
          moh_license_url: mohUrl || null,
          moh_license_expiry: mohExpiry || null,
        }),
      });
      const result = await r.json();
      if (!r.ok) { setMsg(result.error || 'Failed to save.'); setSaving(false); return; }
      onSave({ email: result.email, mohLicenseUrl: result.moh_license_url, mohLicenseExpiry: result.moh_license_expiry });
    } catch {
      setMsg('Server error. Try again.');
      setSaving(false);
    }
  };

  const mohDays = mohExpiry ? Math.ceil((new Date(mohExpiry) - new Date()) / 86400000) : null;
  const mohStatus = mohDays === null ? null : mohDays < 0 ? 'expired' : mohDays <= 90 ? 'expiring' : 'valid';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--sur)', borderRadius: 14, padding: 28, width: 460, maxWidth: '92vw', border: '1px solid var(--bd)', boxShadow: '0 20px 60px rgba(0,0,0,.3)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ font: '700 16px var(--sora)', color: 'var(--t)', marginBottom: 6 }}>👤 My Profile</div>
        {forced && (
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 11, color: '#92400e' }}>
            📧 Please enter your SGH email address to complete your account setup.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16, background: 'var(--sur2)', borderRadius: 9, padding: '12px 14px' }}>
          <div>
            <div style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 600, marginBottom: 3 }}>FULL NAME</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t)' }}>{user.name}</div>
          </div>
          {user.sghId && (
            <div>
              <div style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 600, marginBottom: 3 }}>SGH ID</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--a)', fontFamily: 'monospace' }}>{user.sghId}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 600, marginBottom: 3 }}>ROLE</div>
            <div style={{ fontSize: 11, color: 'var(--t2)' }}>{user.role}</div>
          </div>
        </div>

        <div className="ig" style={{ marginBottom: 14 }}>
          <label className="inplbl">Email Address {forced ? <span style={{ color: 'var(--dan)' }}>*</span> : <span style={{ color: 'var(--t3)', fontSize: 9 }}>(optional)</span>}</label>
          <input className="inpf" type="email" value={email} placeholder="name@sghgroup.net"
            onChange={e => { setEmail(e.target.value); setMsg(''); }} />
        </div>

        {/* MOH License Section */}
        <div style={{ borderTop: '1px solid var(--bd)', paddingTop: 14, marginBottom: 14 }}>
          <div style={{ font: '600 11px var(--sora)', color: 'var(--t)', marginBottom: 10 }}>🏥 MOH License</div>

          {/* Current license status */}
          {mohUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, background: 'var(--sur2)', borderRadius: 8, padding: '8px 12px' }}>
              <span style={{ fontSize: 14 }}>📄</span>
              <div style={{ flex: 1 }}>
                <a href={mohUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--a)', fontWeight: 600, textDecoration: 'none' }}>View Current License ↗</a>
                {mohStatus && (
                  <div style={{ fontSize: 10, marginTop: 2,
                    color: mohStatus === 'expired' ? '#991b1b' : mohStatus === 'expiring' ? '#b45309' : '#166534' }}>
                    {mohStatus === 'expired' ? `⚠ Expired ${Math.abs(mohDays)} days ago`
                      : mohStatus === 'expiring' ? `⚠ Expires in ${mohDays} days`
                      : `✓ Valid · ${mohDays} days remaining`}
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div className="ig" style={{ marginBottom: 0 }}>
              <label className="inplbl">Upload License PDF</label>
              <input type="file" accept=".pdf" ref={fileRef} style={{ display: 'none' }}
                onChange={e => { if (e.target.files[0]) { setMohFile(e.target.files[0]); uploadMoh(e.target.files[0]); } }} />
              <button className="btn" style={{ width: '100%', justifyContent: 'center', fontSize: 11 }}
                onClick={() => fileRef?.current?.click()} disabled={uploading}>
                {uploading ? '⏳ Uploading…' : mohFile ? `📄 ${mohFile.name.slice(0, 18)}…` : '📎 Choose PDF'}
              </button>
            </div>
            <div className="ig" style={{ marginBottom: 0 }}>
              <label className="inplbl">Expiry Date</label>
              <input className="inpf" type="date" value={mohExpiry}
                onChange={e => { setMohExpiry(e.target.value); setMsg(''); }} />
            </div>
          </div>
        </div>

        {msg && (
          <div style={{ marginBottom: 12, fontSize: 11, padding: '8px 12px', borderRadius: 7,
            background: msg.startsWith('✓') ? '#dcfce7' : '#fee2e2',
            color: msg.startsWith('✓') ? '#166534' : '#991b1b' }}>
            {msg}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {!forced && <button className="btn" onClick={onClose} style={{ background: 'var(--sur2)', color: 'var(--t2)' }}>Cancel</button>}
          <button className="btn" onClick={save} disabled={saving || uploading}>{saving ? 'Saving...' : forced ? 'Save & Continue' : 'Save Profile'}</button>
        </div>
      </div>
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
