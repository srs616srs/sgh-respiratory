'use client';
import { useState, useEffect } from 'react';
import { BRANCHES } from '../lib/data';

const ROLES = [
  { value: 'admin', label: 'Network Director (Full Access)' },
  { value: 'hod', label: 'Head of Department (Branch Access)' },
  { value: 'staff', label: 'RT Staff (Limited Access)' },
];

const BRANCH_OPTIONS = [
  { id: 'all', name: 'All Branches (Network Level)' },
  ...BRANCHES.map(b => ({ id: b.id, name: b.full })),
];

const EMPTY = { full_name: '', email: '', password: '', role: 'staff', branch_id: 'jeddah', active: true };

export default function AdminPanel({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    const r = await fetch('/api/admin/users');
    if (r.ok) setUsers(await r.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(EMPTY); setErr(''); setModal('add'); };
  const openEdit = (u) => { setForm({ ...u, password: '' }); setErr(''); setModal(u); };

  const save = async () => {
    if (!form.full_name || !form.email) { setErr('Name and email are required.'); return; }
    if (modal === 'add' && !form.password) { setErr('Password is required for new users.'); return; }
    setSaving(true);
    setErr('');
    const method = modal === 'add' ? 'POST' : 'PUT';
    const body = modal === 'add' ? form : { id: modal.id, ...form };
    const r = await fetch('/api/admin/users', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const result = await r.json();
    if (!r.ok) { setErr(result.error || 'Failed to save.'); setSaving(false); return; }
    await load();
    setModal(null);
    setSaving(false);
  };

  const del = async (id, name) => {
    if (!confirm(`Remove user "${name}"? This cannot be undone.`)) return;
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await load();
  };

  const roleLabel = (r) => ROLES.find(x => x.value === r)?.label?.split(' (')[0] || r;
  const branchLabel = (id) => BRANCH_OPTIONS.find(b => b.id === id)?.name?.replace(' (Network Level)', '') || id;

  return (
    <>
      <div className="ph">
        <div className="ph-row">
          <div>
            <div className="pt">Admin Panel</div>
            <div className="ps">User accounts · access control · login credentials</div>
          </div>
          <button className="btn" onClick={openAdd}>+ Add User</button>
        </div>
      </div>

      <div className="cnt">
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
            {['admin', 'hod', 'staff'].map(r => (
              <div key={r} style={{ background: 'var(--sur2)', borderRadius: 8, padding: '10px 14px', border: '1px solid var(--bd)', textAlign: 'center' }}>
                <div style={{ font: '700 22px var(--sora)', color: 'var(--t)' }}>
                  {users.filter(u => u.role === r && u.active).length}
                </div>
                <div style={{ fontSize: 9.5, color: 'var(--t2)', marginTop: 2 }}>{roleLabel(r)}s</div>
              </div>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--t3)', padding: 40 }}>Loading users...</div>
          ) : (
            <div className="wl-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Branch</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600, color: 'var(--t)' }}>{u.full_name}</td>
                      <td style={{ color: 'var(--t2)', fontSize: 10.5 }}>{u.email}</td>
                      <td>
                        <span className={`ratio-badge ${u.role === 'admin' ? 'ratio-bad' : u.role === 'hod' ? 'ratio-warn' : 'ratio-ok'}`}>
                          {roleLabel(u.role)}
                        </span>
                      </td>
                      <td style={{ fontSize: 10.5, color: 'var(--t2)' }}>{branchLabel(u.branch_id)}</td>
                      <td>
                        <span className={`ratio-badge ${u.active ? 'ratio-ok' : 'ratio-bad'}`}>
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn" onClick={() => openEdit(u)}
                            style={{ fontSize: 10, padding: '3px 10px' }}>Edit</button>
                          {u.id !== user.id && (
                            <button onClick={() => del(u.id, u.full_name)}
                              style={{ fontSize: 10, padding: '3px 10px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--sora)' }}>
                              Remove
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: 'var(--t3)', fontSize: 10.5 }}>
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
          <div style={{ font: '600 11px var(--sora)', color: '#92400e', marginBottom: 6 }}>Access Level Guide</div>
          <div style={{ fontSize: 10.5, color: '#78350f', lineHeight: 1.7 }}>
            <strong>Network Director</strong> — Full access to all branches, all data, admin panel<br />
            <strong>Head of Department</strong> — Full access to their assigned branch, can edit beds/workload<br />
            <strong>RT Staff</strong> — View access to their branch, can update ventilator counts only
          </div>
        </div>
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--sur)', borderRadius: 14, padding: 24, width: 440, maxWidth: '92vw', border: '1px solid var(--bd)', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
            <div style={{ font: '700 15px var(--sora)', color: 'var(--t)', marginBottom: 18 }}>
              {modal === 'add' ? '+ Add New User' : `Edit: ${modal.full_name}`}
            </div>

            <div className="ig" style={{ marginBottom: 10 }}>
              <label className="inplbl">Full Name</label>
              <input className="inpf" type="text" value={form.full_name} placeholder="Ahmad Al-Zahrani"
                onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
            </div>

            <div className="ig" style={{ marginBottom: 10 }}>
              <label className="inplbl">Email Address</label>
              <input className="inpf" type="email" value={form.email} placeholder="name@sghgroup.net"
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>

            <div className="ig" style={{ marginBottom: 10 }}>
              <label className="inplbl">
                {modal === 'add' ? 'Password' : 'New Password (leave blank to keep current)'}
              </label>
              <input className="inpf" type="password" value={form.password} placeholder="••••••••"
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
            </div>

            <div className="ig" style={{ marginBottom: 10 }}>
              <label className="inplbl">Role & Access Level</label>
              <select className="inpf" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            <div className="ig" style={{ marginBottom: 14 }}>
              <label className="inplbl">Branch Assignment</label>
              <select className="inpf" value={form.branch_id} onChange={e => setForm(p => ({ ...p, branch_id: e.target.value }))}>
                {BRANCH_OPTIONS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            {modal !== 'add' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <input type="checkbox" id="active-chk" checked={!!form.active}
                  onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} />
                <label htmlFor="active-chk" style={{ fontSize: 11, color: 'var(--t2)', cursor: 'pointer' }}>
                  Account active — uncheck to disable this user's login
                </label>
              </div>
            )}

            {err && <div className="err" style={{ marginBottom: 12 }}>⚠ {err}</div>}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setModal(null)}
                style={{ background: 'var(--sur2)', color: 'var(--t2)' }}>Cancel</button>
              <button className="btn" onClick={save} disabled={saving}>
                {saving ? 'Saving...' : modal === 'add' ? 'Create User' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
