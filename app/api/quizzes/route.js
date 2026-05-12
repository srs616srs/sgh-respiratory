import { createClient } from '@supabase/supabase-js';

function getDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

// GET — fetch quizzes for a branch (includes submissions count)
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get('branch_id');
  const sb = getDb();
  let q = sb.from('quizzes').select('*').eq('active', true).order('created_at', { ascending: false });
  if (branchId && branchId !== 'all') {
    q = sb.from('quizzes').select('*')
      .eq('active', true)
      .or(`branch_id.eq.all,branch_id.eq.${branchId}`)
      .order('created_at', { ascending: false });
  }
  const { data, error } = await q;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data || []);
}

// POST — create a new quiz
export async function POST(req) {
  const body = await req.json();
  const { title, description, branch_id, created_by, created_by_name, questions } = body;
  if (!title) return Response.json({ error: 'Quiz title is required.' }, { status: 400 });
  if (!questions || questions.length === 0) return Response.json({ error: 'At least one question is required.' }, { status: 400 });
  const { data, error } = await getDb().from('quizzes').insert({
    title, description: description || '',
    branch_id: branch_id || 'all',
    created_by: created_by || null,
    created_by_name: created_by_name || '',
    questions,
    active: true,
  }).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

// DELETE — deactivate a quiz
export async function DELETE(req) {
  const { id } = await req.json();
  const { error } = await getDb().from('quizzes').update({ active: false }).eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
