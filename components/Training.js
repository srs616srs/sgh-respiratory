'use client';
import { useState, useRef } from 'react';
import { getBranch, BRANCHES } from '../lib/data';
import { BranchTag } from './App';

export default function Training({
  courses, setCourses, trainingRequests, setTrainingRequests,
  user, selBr, activeBranch, staff, pendingRequests,
  quizzes, setQuizzes, loadQuizzes, loadCourses,
}) {
  const [tab, setTab] = useState('courses'); // 'courses' | 'quizzes'
  // Course upload
  const [uploadModal, setUploadModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', instructor: user.name, duration: '', modules: 1, branchId: selBr === 'all' ? 'all' : selBr, thumb: '🎓' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  // Training request
  const [requestText, setRequestText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // Quiz creation
  const [quizModal, setQuizModal] = useState(false);
  const [newQuiz, setNewQuiz] = useState({ title: '', description: '', branchId: selBr === 'all' ? 'all' : selBr, questions: [] });
  const [savingQuiz, setSavingQuiz] = useState(false);
  // Quiz taking
  const [activeQuiz, setActiveQuiz] = useState(null); // quiz object
  const [myAnswers, setMyAnswers] = useState([]); // array of selected indices
  const [quizResult, setQuizResult] = useState(null); // { score, total }
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  // Quiz results view
  const [viewResults, setViewResults] = useState(null); // quiz object
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  const sl = staff ? staff.filter(s => (selBr === 'all' || s.branchId === selBr) && !s.isHOD) : [];
  const vis = courses.filter(c => selBr === 'all' || c.branch_id === 'all' || c.branch_id === selBr);
  const visQuizzes = quizzes.filter(q => selBr === 'all' || q.branch_id === 'all' || q.branch_id === selBr);

  // ── Course helpers ──────────────────────────────────────────────
  const addCourse = async () => {
    if (!newCourse.name.trim()) return;
    setUploading(true);
    let file_url = null, file_name = null;
    if (selectedFile) {
      try {
        const form = new FormData();
        form.append('file', selectedFile);
        form.append('folder', 'courses');
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        const json = await res.json();
        if (json.url) { file_url = json.url; file_name = selectedFile.name; }
      } catch { /* ignore */ }
    }
    await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newCourse, branch_id: newCourse.branchId, modules: parseInt(newCourse.modules) || 1, file_url, file_name }),
    });
    await loadCourses();
    setUploadModal(false);
    setUploading(false);
    setSelectedFile(null);
    setNewCourse({ name: '', instructor: user.name, duration: '', modules: 1, branchId: selBr === 'all' ? 'all' : selBr, thumb: '🎓' });
  };

  const toggleAttendance = async (courseId, staffId, currentAttendance) => {
    const updated = currentAttendance.includes(staffId)
      ? currentAttendance.filter(i => i !== staffId)
      : [...currentAttendance, staffId];
    await fetch('/api/courses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: courseId, attendance: updated }),
    });
    setCourses(p => p.map(c => c.id === courseId ? { ...c, attendance: updated } : c));
  };

  // ── Training request ────────────────────────────────────────────
  const submitRequest = () => {
    if (!requestText.trim()) return;
    setSubmitting(true);
    setTrainingRequests(p => [...p, {
      id: Date.now(), staffId: user.id, staffName: user.name,
      branchId: user.branchId, text: requestText, status: 'pending',
      createdAt: new Date().toISOString(),
    }]);
    setRequestText('');
    setSubmitted(true);
    setSubmitting(false);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const markRead = (id) => setTrainingRequests(p => p.map(r => r.id === id ? { ...r, status: 'read' } : r));

  // ── Quiz helpers ────────────────────────────────────────────────
  const addQuestion = () => setNewQuiz(p => ({
    ...p,
    questions: [...p.questions, { q: '', options: ['', '', '', ''], correct: 0 }],
  }));

  const updateQuestion = (qi, field, val) => setNewQuiz(p => ({
    ...p,
    questions: p.questions.map((q, i) => i !== qi ? q : { ...q, [field]: val }),
  }));

  const updateOption = (qi, oi, val) => setNewQuiz(p => ({
    ...p,
    questions: p.questions.map((q, i) => i !== qi ? q : {
      ...q, options: q.options.map((o, j) => j !== oi ? o : val),
    }),
  }));

  const removeQuestion = (qi) => setNewQuiz(p => ({
    ...p, questions: p.questions.filter((_, i) => i !== qi),
  }));

  const saveQuiz = async () => {
    if (!newQuiz.title.trim() || newQuiz.questions.length === 0) return;
    setSavingQuiz(true);
    await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newQuiz.title, description: newQuiz.description,
        branch_id: newQuiz.branchId, created_by: user.id,
        created_by_name: user.name, questions: newQuiz.questions,
      }),
    });
    await loadQuizzes();
    setSavingQuiz(false);
    setQuizModal(false);
    setNewQuiz({ title: '', description: '', branchId: selBr === 'all' ? 'all' : selBr, questions: [] });
  };

  const deleteQuiz = async (id) => {
    if (!confirm('Remove this quiz?')) return;
    await fetch('/api/quizzes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    await loadQuizzes();
  };

  const openQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setMyAnswers(new Array(quiz.questions.length).fill(null));
    setQuizResult(null);
  };

  const submitQuiz = async () => {
    if (myAnswers.some(a => a === null)) { alert('Please answer all questions before submitting.'); return; }
    setSubmittingQuiz(true);
    const r = await fetch('/api/quiz-submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quiz_id: activeQuiz.id, user_id: user.id, user_name: user.name,
        branch_id: user.branchId, answers: myAnswers,
      }),
    });
    const result = await r.json();
    setQuizResult(result);
    setSubmittingQuiz(false);
  };

  const openResults = async (quiz) => {
    setViewResults(quiz);
    setLoadingResults(true);
    const r = await fetch(`/api/quiz-submissions?quiz_id=${quiz.id}`);
    if (r.ok) setResults(await r.json());
    setLoadingResults(false);
  };

  const THUMBS = ['🎓','🫁','💨','🧤','🩸','🌬️','👶','🕌','🏭','🕋','🎯','📋','🏥'];

  return (
    <>
      <div className="ph">
        <div className="ph-row">
          <div><div className="pt">Online Training</div><div className="ps">Course library · quizzes · attendance · training requests</div></div>
          <BranchTag br={selBr === 'all' ? { full: 'All Branches', color: '#0096b4' } : activeBranch} />
        </div>
      </div>
      <div className="cnt">

        {/* HOD: pending requests */}
        {user.isHOD && pendingRequests && pendingRequests.length > 0 && (
          <div className="card" style={{ background: '#fffbeb', border: '1px solid #fde68a', marginBottom: 12 }}>
            <div style={{ font: '600 12px var(--sora)', color: '#92400e', marginBottom: 8 }}>
              📬 Training Requests — {pendingRequests.length} pending
            </div>
            {pendingRequests.map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid #fde68a' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#78350f' }}>{r.staffName}</div>
                  <div style={{ fontSize: 10.5, color: '#92400e', marginTop: 2 }}>{r.text}</div>
                  <div style={{ fontSize: 9.5, color: '#b45309', marginTop: 2 }}>{new Date(r.createdAt).toLocaleDateString('en-GB')}</div>
                </div>
                <button onClick={() => markRead(r.id)}
                  style={{ fontSize: 10, padding: '3px 10px', background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: 5, cursor: 'pointer', fontFamily: 'var(--sora)', whiteSpace: 'nowrap' }}>
                  ✓ Mark Read
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {['courses', 'quizzes'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '6px 18px', borderRadius: 7, border: '1px solid var(--bd)', cursor: 'pointer', fontFamily: 'var(--sora)', fontSize: 11, fontWeight: tab === t ? 700 : 400,
                background: tab === t ? 'var(--a)' : 'var(--sur2)', color: tab === t ? '#fff' : 'var(--t2)' }}>
              {t === 'courses' ? `🎓 Courses (${vis.length})` : `📝 Quizzes (${visQuizzes.length})`}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          {user.isHOD && tab === 'courses' && (
            <button className="btn pri" onClick={() => setUploadModal(true)}>⬆ Upload Course</button>
          )}
          {user.isHOD && tab === 'quizzes' && (
            <button className="btn pri" onClick={() => setQuizModal(true)}>＋ New Quiz</button>
          )}
        </div>

        {/* ── COURSES TAB ── */}
        {tab === 'courses' && (
          <div className="cg">
            {vis.map(c => {
              const att = Array.isArray(c.attendance) ? c.attendance : [];
              const brAtt = att.filter(id => selBr === 'all' || sl.find(s => s.id === id));
              const tot = sl.length || 1;
              const pct = Math.round(brAtt.length / tot * 100);
              const br = c.branch_id !== 'all' ? getBranch(c.branch_id) : null;
              return (
                <div key={c.id} className="cc">
                  <div className="cth">
                    {c.thumb}
                    <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, padding: '2px 6px', borderRadius: 5, background: br ? br.color + '25' : 'rgba(0,150,180,.15)', color: br ? br.color : 'var(--a)', fontWeight: 700, border: `1px solid ${br ? br.color + '44' : 'rgba(0,150,180,.3)'}` }}>
                      {br ? br.name : '🌐 Network'}
                    </span>
                  </div>
                  <div className="cbd">
                    <div className="cname">{c.name}</div>
                    <div className="cmeta">{c.instructor} · {c.duration} · {c.modules} modules</div>
                    <div className="pb"><div className="pf" style={{ width: `${pct}%` }} /></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: 'var(--t3)', marginBottom: 7 }}>
                      <span>{pct}% attended</span><span>{brAtt.length}/{tot}</span>
                    </div>
                    {user.isHOD && (
                      <div className="att-row">
                        {sl.map(s => (
                          <div key={s.id} title={s.name} onClick={() => toggleAttendance(c.id, s.id, att)} style={{ cursor: 'pointer' }}>
                            <div className="av sm" style={{ background: att.includes(s.id) ? 'linear-gradient(135deg,#059669,#0096b4)' : 'var(--sur3)', color: att.includes(s.id) ? '#fff' : 'var(--t3)', border: att.includes(s.id) ? 'none' : '1px solid var(--bd)' }}>{s.avatar}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      {c.file_url
                        ? <a href={c.file_url} target="_blank" rel="noreferrer" className="btn pri sm" style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}>⬇ Download Material</a>
                        : <button className="btn pri sm" style={{ flex: 1 }} disabled>No File Attached</button>}
                    </div>
                  </div>
                </div>
              );
            })}
            {vis.length === 0 && <div className="es"><div className="es-ico">🎓</div>No courses available yet</div>}
          </div>
        )}

        {/* ── QUIZZES TAB ── */}
        {tab === 'quizzes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {visQuizzes.map(quiz => {
              const br = quiz.branch_id !== 'all' ? getBranch(quiz.branch_id) : null;
              return (
                <div key={quiz.id} className="card" style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ fontSize: 28 }}>📝</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <div style={{ font: '600 13px var(--sora)', color: 'var(--t)' }}>{quiz.title}</div>
                        <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 5, background: br ? br.color + '20' : 'rgba(0,150,180,.12)', color: br ? br.color : 'var(--a)', border: `1px solid ${br ? br.color + '40' : 'rgba(0,150,180,.3)'}`, fontWeight: 700 }}>
                          {br ? br.name : '🌐 Network'}
                        </span>
                      </div>
                      {quiz.description && <div style={{ fontSize: 10.5, color: 'var(--t2)', marginBottom: 4 }}>{quiz.description}</div>}
                      <div style={{ fontSize: 10, color: 'var(--t3)' }}>
                        {quiz.questions.length} questions · Posted by {quiz.created_by_name} · {new Date(quiz.created_at).toLocaleDateString('en-GB')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                      {user.isHOD ? (
                        <>
                          <button className="btn sm" onClick={() => openResults(quiz)}
                            style={{ fontSize: 10, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                            📊 Results
                          </button>
                          <button onClick={() => deleteQuiz(quiz.id)}
                            style={{ fontSize: 10, padding: '3px 10px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--sora)' }}>
                            ✕ Remove
                          </button>
                        </>
                      ) : (
                        <button className="btn pri sm" onClick={() => openQuiz(quiz)}>
                          ✏️ Take Quiz
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {visQuizzes.length === 0 && (
              <div className="es"><div className="es-ico">📝</div>No quizzes posted yet</div>
            )}
          </div>
        )}

        {/* Staff: submit training request */}
        {!user.isHOD && (
          <div className="card" style={{ marginTop: 16 }}>
            <div style={{ font: '600 12px var(--sora)', color: 'var(--t)', marginBottom: 6 }}>📩 Request Training</div>
            <div style={{ fontSize: 10.5, color: 'var(--t2)', marginBottom: 10 }}>
              Submit a training request to your Head of Department.
            </div>
            {submitted && (
              <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 7, padding: '8px 12px', marginBottom: 10, fontSize: 11, color: '#166534', fontWeight: 600 }}>
                ✓ Request submitted to your HOD.
              </div>
            )}
            <textarea className="ta" rows={3} value={requestText}
              onChange={e => setRequestText(e.target.value)}
              placeholder="e.g. I'd like training on advanced NIV settings and HFNC weaning protocols…" />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn pri" onClick={submitRequest} disabled={submitting || !requestText.trim()}>
                {submitting ? 'Submitting…' : '📩 Submit Request'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Upload Course Modal ── */}
      {uploadModal && (
        <div className="ov" onClick={() => setUploadModal(false)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="m-title">⬆ Upload New Course</div>
            <div className="m-sub">Add a training course to the library</div>
            <div className="ig">
              <label className="inplbl">Thumbnail Emoji</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                {THUMBS.map(t => <span key={t} style={{ fontSize: 22, cursor: 'pointer', opacity: newCourse.thumb === t ? 1 : .5 }} onClick={() => setNewCourse(p => ({ ...p, thumb: t }))}>{t}</span>)}
              </div>
            </div>
            <div className="ig">
              <label className="inplbl">Course Title</label>
              <input className="inpf" value={newCourse.name} onChange={e => setNewCourse(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Advanced Ventilator Weaning 2026" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="ig">
                <label className="inplbl">Instructor</label>
                <input className="inpf" value={newCourse.instructor} onChange={e => setNewCourse(p => ({ ...p, instructor: e.target.value }))} />
              </div>
              <div className="ig">
                <label className="inplbl">Duration</label>
                <input className="inpf" value={newCourse.duration} onChange={e => setNewCourse(p => ({ ...p, duration: e.target.value }))} placeholder="e.g. 2h 30m" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="ig">
                <label className="inplbl">Modules</label>
                <input className="inpf" type="number" min="1" value={newCourse.modules} onChange={e => setNewCourse(p => ({ ...p, modules: e.target.value }))} />
              </div>
              <div className="ig">
                <label className="inplbl">Scope</label>
                <select className="inpf" value={newCourse.branchId} onChange={e => setNewCourse(p => ({ ...p, branchId: e.target.value }))}>
                  <option value="all">🌐 All Branches</option>
                  {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
            <div className="uz" onClick={() => fileRef.current?.click()} style={{ cursor: 'pointer' }}>
              <input type="file" ref={fileRef} style={{ display: 'none' }} onChange={e => setSelectedFile(e.target.files[0])} accept=".pdf,.mp4,.zip,.pptx,.docx" />
              <div className="uz-ico">🎬</div>
              <div className="uz-t">{selectedFile ? selectedFile.name : 'Click to attach course file (PDF, Video, ZIP)'}</div>
              <div className="uz-s">Optional — staff can download from the course card</div>
            </div>
            <div style={{ display: 'flex', gap: 7, justifyContent: 'flex-end' }}>
              <button className="btn out" onClick={() => setUploadModal(false)}>Cancel</button>
              <button className="btn pri" onClick={addCourse} disabled={uploading}>
                {uploading ? 'Uploading…' : 'Add Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Quiz Modal ── */}
      {quizModal && (
        <div className="ov" onClick={() => setQuizModal(false)}>
          <div className="modal" style={{ maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="m-title">📝 Create New Quiz</div>
            <div className="m-sub">Build an MCQ quiz for staff</div>
            <div className="ig">
              <label className="inplbl">Quiz Title</label>
              <input className="inpf" value={newQuiz.title} onChange={e => setNewQuiz(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Ventilator Basics Assessment 2026" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="ig">
                <label className="inplbl">Description (optional)</label>
                <input className="inpf" value={newQuiz.description} onChange={e => setNewQuiz(p => ({ ...p, description: e.target.value }))} placeholder="Brief description…" />
              </div>
              <div className="ig">
                <label className="inplbl">Scope</label>
                <select className="inpf" value={newQuiz.branchId} onChange={e => setNewQuiz(p => ({ ...p, branchId: e.target.value }))}>
                  <option value="all">🌐 All Branches</option>
                  {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>

            {/* Questions */}
            <div style={{ marginTop: 8, marginBottom: 10 }}>
              <div style={{ font: '600 11px var(--sora)', color: 'var(--t)', marginBottom: 8 }}>Questions ({newQuiz.questions.length})</div>
              {newQuiz.questions.map((q, qi) => (
                <div key={qi} style={{ background: 'var(--sur2)', borderRadius: 9, padding: '12px 14px', marginBottom: 10, border: '1px solid var(--bd)' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--a)', minWidth: 22 }}>Q{qi + 1}</span>
                    <input className="inpf" style={{ flex: 1 }} value={q.q}
                      onChange={e => updateQuestion(qi, 'q', e.target.value)} placeholder={`Question ${qi + 1}…`} />
                    <button onClick={() => removeQuestion(qi)}
                      style={{ fontSize: 10, padding: '3px 8px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 5, cursor: 'pointer', fontFamily: 'var(--sora)' }}>✕</button>
                  </div>
                  <div style={{ paddingLeft: 30 }}>
                    {q.options.map((opt, oi) => (
                      <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <input type="radio" name={`correct-${qi}`} checked={q.correct === oi}
                          onChange={() => updateQuestion(qi, 'correct', oi)}
                          style={{ accentColor: '#059669', cursor: 'pointer' }} />
                        <input className="inpf" style={{ flex: 1 }} value={opt}
                          onChange={e => updateOption(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}…`} />
                        <span style={{ fontSize: 9, color: q.correct === oi ? '#059669' : 'var(--t3)', fontWeight: 700 }}>
                          {q.correct === oi ? '✓ Correct' : ''}
                        </span>
                      </div>
                    ))}
                    <div style={{ fontSize: 9.5, color: 'var(--t3)', marginTop: 2 }}>Select the radio button next to the correct answer</div>
                  </div>
                </div>
              ))}
              <button className="btn out" style={{ width: '100%', justifyContent: 'center' }} onClick={addQuestion}>
                + Add Question
              </button>
            </div>

            <div style={{ display: 'flex', gap: 7, justifyContent: 'flex-end' }}>
              <button className="btn out" onClick={() => setQuizModal(false)}>Cancel</button>
              <button className="btn pri" onClick={saveQuiz} disabled={savingQuiz || !newQuiz.title || newQuiz.questions.length === 0}>
                {savingQuiz ? 'Saving…' : '📝 Publish Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Take Quiz Modal ── */}
      {activeQuiz && (
        <div className="ov" onClick={() => !quizResult && setActiveQuiz(null)}>
          <div className="modal" style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="m-title">📝 {activeQuiz.title}</div>
            {activeQuiz.description && <div className="m-sub">{activeQuiz.description}</div>}

            {!quizResult ? (
              <>
                {activeQuiz.questions.map((q, qi) => (
                  <div key={qi} style={{ marginBottom: 18 }}>
                    <div style={{ font: '600 12px var(--sora)', color: 'var(--t)', marginBottom: 8 }}>
                      <span style={{ color: 'var(--a)' }}>Q{qi + 1}.</span> {q.q}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {q.options.map((opt, oi) => (
                        <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 7, cursor: 'pointer',
                          background: myAnswers[qi] === oi ? 'rgba(0,150,180,.12)' : 'var(--sur2)',
                          border: `1px solid ${myAnswers[qi] === oi ? 'var(--a)' : 'var(--bd)'}` }}>
                          <input type="radio" name={`ans-${qi}`} checked={myAnswers[qi] === oi}
                            onChange={() => setMyAnswers(p => p.map((a, i) => i === qi ? oi : a))}
                            style={{ accentColor: 'var(--a)' }} />
                          <span style={{ fontSize: 11.5 }}>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 7, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--bd)' }}>
                  <button className="btn out" onClick={() => setActiveQuiz(null)}>Cancel</button>
                  <button className="btn pri" onClick={submitQuiz} disabled={submittingQuiz}>
                    {submittingQuiz ? 'Submitting…' : '✅ Submit Answers'}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>
                  {quizResult.score === quizResult.total ? '🏆' : quizResult.score >= quizResult.total / 2 ? '✅' : '📚'}
                </div>
                <div style={{ font: '700 28px var(--sora)', color: 'var(--a)', marginBottom: 4 }}>
                  {quizResult.score} / {quizResult.total}
                </div>
                <div style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 16 }}>
                  {Math.round(quizResult.score / quizResult.total * 100)}% — {quizResult.score === quizResult.total ? 'Perfect Score!' : quizResult.score >= quizResult.total / 2 ? 'Well done!' : 'Keep studying!'}
                </div>
                {/* Show correct answers review */}
                <div style={{ textAlign: 'left', marginBottom: 16 }}>
                  {activeQuiz.questions.map((q, qi) => {
                    const correct = myAnswers[qi] === q.correct;
                    return (
                      <div key={qi} style={{ marginBottom: 10, padding: '10px 12px', borderRadius: 8,
                        background: correct ? '#f0fdf4' : '#fff1f2', border: `1px solid ${correct ? '#86efac' : '#fecaca'}` }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t)', marginBottom: 4 }}>Q{qi + 1}. {q.q}</div>
                        <div style={{ fontSize: 10.5, color: correct ? '#166534' : '#991b1b' }}>
                          {correct ? '✓ Correct' : `✗ You chose: ${q.options[myAnswers[qi]]} · Correct: ${q.options[q.correct]}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button className="btn pri" style={{ width: '100%' }} onClick={() => setActiveQuiz(null)}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Quiz Results Modal (HOD/Admin) ── */}
      {viewResults && (
        <div className="ov" onClick={() => setViewResults(null)}>
          <div className="modal" style={{ maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="m-title">📊 Quiz Results — {viewResults.title}</div>
            <div className="m-sub">{viewResults.questions.length} questions · {results.length} submission{results.length !== 1 ? 's' : ''}</div>
            {loadingResults ? (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--t3)' }}>Loading results…</div>
            ) : results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--t3)' }}>No submissions yet.</div>
            ) : (
              <div className="wl-table">
                <table>
                  <thead>
                    <tr>
                      <th>Staff Member</th>
                      <th>Branch</th>
                      <th style={{ textAlign: 'center' }}>Score</th>
                      <th style={{ textAlign: 'center' }}>%</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(r => {
                      const pct = Math.round(r.score / r.total * 100);
                      const br = getBranch(r.branch_id);
                      return (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 600, color: 'var(--t)' }}>{r.user_name}</td>
                          <td>
                            {br && <span style={{ fontSize: 9.5, padding: '2px 6px', borderRadius: 5, background: br.color + '20', color: br.color, border: `1px solid ${br.color}44`, fontWeight: 700 }}>{br.name}</span>}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ font: '700 13px var(--sora)', color: pct >= 80 ? '#059669' : pct >= 60 ? '#d97706' : '#dc2626' }}>
                              {r.score}/{r.total}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`ratio-badge ${pct >= 80 ? 'ratio-ok' : pct >= 60 ? 'ratio-warn' : 'ratio-bad'}`}>{pct}%</span>
                          </td>
                          <td style={{ fontSize: 10.5, color: 'var(--t2)' }}>{new Date(r.submitted_at).toLocaleDateString('en-GB')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
              <button className="btn" onClick={() => setViewResults(null)} style={{ background: 'var(--sur2)', color: 'var(--t2)' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
