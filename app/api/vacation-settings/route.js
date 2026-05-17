import { createClient } from '@supabase/supabase-js';

function getDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

// GET — fetch settings for a branch
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get('branch_id');
  if (!branchId) return Response.json({ error: 'branch_id required.' }, { status: 400 });
  const { data } = await getDb().from('vacation_settings').select('*').eq('branch_id', branchId).single();
  return Response.json(data || { branch_id: branchId, max_overlap: 2 });
}

// POST — upsert settings for a branch
export async function POST(req) {
  const { branch_id, max_overlap } = await req.json();
  if (!branch_id) return Response.json({ error: 'branch_id required.' }, { status: 400 });
  const { data, error } = await getDb().from('vacation_settings')
    .upsert({ branch_id, max_overlap: parseInt(max_overlap) || 2, updated_at: new Date().toISOString() },
      { onConflict: 'branch_id' })
    .select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
