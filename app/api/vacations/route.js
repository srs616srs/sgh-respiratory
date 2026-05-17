import { createClient } from '@supabase/supabase-js';

function getDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

// GET — fetch vacation requests (by branch or all)
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get('branch_id');
  const userId = searchParams.get('user_id');
  const sb = getDb();

  let q = sb.from('vacation_requests').select('*').order('start_date', { ascending: true });
  if (userId) q = q.eq('user_id', userId);
  else if (branchId && branchId !== 'all') q = q.eq('branch_id', branchId);

  const { data, error } = await q;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data || []);
}

// POST — create a vacation request
export async function POST(req) {
  const { user_id, user_name, branch_id, start_date, end_date, notes } = await req.json();
  if (!user_id || !start_date || !end_date) {
    return Response.json({ error: 'user_id, start_date, end_date required.' }, { status: 400 });
  }
  const { data, error } = await getDb().from('vacation_requests').insert({
    user_id, user_name, branch_id, start_date, end_date,
    notes: notes || '', status: 'pending',
  }).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

// PUT — approve or reject a request (HOD/admin only)
export async function PUT(req) {
  const { id, status, reviewed_by } = await req.json();
  if (!id || !status) return Response.json({ error: 'id and status required.' }, { status: 400 });
  const { data, error } = await getDb().from('vacation_requests')
    .update({ status, reviewed_by, reviewed_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

// DELETE — cancel/delete a request
export async function DELETE(req) {
  const { id } = await req.json();
  const { error } = await getDb().from('vacation_requests').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
