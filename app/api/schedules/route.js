import { createClient } from '@supabase/supabase-js';

function getDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

// GET /api/schedules?branch_id=jeddah&month_year=2026-05
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const branch_id = searchParams.get('branch_id');
  const month_year = searchParams.get('month_year');

  if (!branch_id || !month_year) {
    return Response.json({ error: 'branch_id and month_year required.' }, { status: 400 });
  }

  const { data, error } = await getDb()
    .from('schedules')
    .select('data')
    .eq('branch_id', branch_id)
    .eq('month_year', month_year)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data?.data || {});
}

// POST /api/schedules  — upsert
export async function POST(req) {
  const { branch_id, month_year, data } = await req.json();
  if (!branch_id || !month_year || !data) {
    return Response.json({ error: 'branch_id, month_year and data required.' }, { status: 400 });
  }

  const { error } = await getDb()
    .from('schedules')
    .upsert(
      { branch_id, month_year, data, updated_at: new Date().toISOString() },
      { onConflict: 'branch_id,month_year' }
    );

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
