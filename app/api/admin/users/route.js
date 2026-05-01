import { createClient } from '@supabase/supabase-js';

function getDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

export async function GET() {
  const { data, error } = await getDb()
    .from('app_users')
    .select('id,email,full_name,role,branch_id,active,created_at')
    .order('created_at');
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req) {
  const body = await req.json();
  if (!body.full_name || !body.email || !body.password) {
    return Response.json({ error: 'Name, email and password are required.' }, { status: 400 });
  }
  const { data, error } = await getDb()
    .from('app_users')
    .insert({
      email: body.email.toLowerCase().trim(),
      password_hash: body.password,
      full_name: body.full_name.trim(),
      role: body.role || 'staff',
      branch_id: body.branch_id || 'all',
      active: true,
    })
    .select('id,email,full_name,role,branch_id,active,created_at');
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data[0]);
}

export async function PUT(req) {
  const { id, password, ...rest } = await req.json();
  if (!id) return Response.json({ error: 'ID required.' }, { status: 400 });
  const updates = { ...rest };
  if (password) updates.password_hash = password;
  const { data, error } = await getDb()
    .from('app_users')
    .update(updates)
    .eq('id', id)
    .select('id,email,full_name,role,branch_id,active,created_at');
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data[0]);
}

export async function DELETE(req) {
  const { id } = await req.json();
  if (!id) return Response.json({ error: 'ID required.' }, { status: 400 });
  const { error } = await getDb().from('app_users').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
