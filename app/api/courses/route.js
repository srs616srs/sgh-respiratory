import { createClient } from '@supabase/supabase-js';

function getDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

// GET — fetch all courses (optionally filter by branch)
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get('branch_id');
  const sb = getDb();
  let q = sb.from('courses').select('*').order('created_at', { ascending: false });
  // Return all-branch courses + this branch's courses
  if (branchId && branchId !== 'all') {
    q = sb.from('courses').select('*')
      .or(`branch_id.eq.all,branch_id.eq.${branchId}`)
      .order('created_at', { ascending: false });
  }
  const { data, error } = await q;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data || []);
}

// POST — create a new course
export async function POST(req) {
  const body = await req.json();
  const { name, instructor, duration, modules, branch_id, thumb, file_url, file_name } = body;
  if (!name) return Response.json({ error: 'Course name is required.' }, { status: 400 });
  const { data, error } = await getDb().from('courses').insert({
    name, instructor, duration,
    modules: parseInt(modules) || 1,
    branch_id: branch_id || 'all',
    thumb: thumb || '🎓',
    file_url: file_url || null,
    file_name: file_name || null,
    attendance: [],
  }).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

// PUT — update attendance list for a course
export async function PUT(req) {
  const { id, attendance } = await req.json();
  if (!id) return Response.json({ error: 'Course ID required.' }, { status: 400 });
  const { data, error } = await getDb().from('courses')
    .update({ attendance })
    .eq('id', id)
    .select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

// DELETE — remove a course
export async function DELETE(req) {
  const { id } = await req.json();
  const { error } = await getDb().from('courses').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
