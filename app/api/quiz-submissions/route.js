import { createClient } from '@supabase/supabase-js';

function getDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

// GET — fetch all submissions for a quiz (HOD/admin view)
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const quizId = searchParams.get('quiz_id');
  if (!quizId) return Response.json({ error: 'quiz_id required.' }, { status: 400 });
  const { data, error } = await getDb()
    .from('quiz_submissions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('submitted_at', { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data || []);
}

// POST — submit quiz answers (auto-graded)
export async function POST(req) {
  const body = await req.json();
  const { quiz_id, user_id, user_name, branch_id, answers } = body;
  if (!quiz_id || !user_id) return Response.json({ error: 'quiz_id and user_id required.' }, { status: 400 });

  const sb = getDb();

  // Fetch quiz questions to grade
  const { data: quiz, error: qErr } = await sb.from('quizzes').select('questions').eq('id', quiz_id).single();
  if (qErr || !quiz) return Response.json({ error: 'Quiz not found.' }, { status: 404 });

  const questions = quiz.questions;
  let score = 0;
  const total = questions.length;
  answers.forEach((ans, i) => {
    if (questions[i] && ans === questions[i].correct) score++;
  });

  // Upsert submission (one per user per quiz)
  const { data, error } = await sb.from('quiz_submissions').upsert({
    quiz_id, user_id, user_name, branch_id, answers, score, total,
    submitted_at: new Date().toISOString(),
  }, { onConflict: 'quiz_id,user_id' }).select().single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ...data, score, total });
}
