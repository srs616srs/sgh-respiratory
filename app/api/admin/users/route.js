import { createClient } from '@supabase/supabase-js';

function getDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

export async function GET() {
  const { data, error } = await getDb()
    .from('app_users')
    .select('id,email,sgh_id,full_name,role,branch_id,active,created_at,moh_license_url,moh_license_expiry,is_demo')
    .order('created_at');
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req) {
  const body = await req.json();
  if (!body.full_name) {
    return Response.json({ error: 'Full name is required.' }, { status: 400 });
  }
  // Staff use SGH ID; HOD/admin use email
  if (body.role === 'staff' || body.role === undefined) {
    if (!body.sgh_id) return Response.json({ error: 'SGH ID is required for staff.' }, { status: 400 });
  } else {
    if (!body.email) return Response.json({ error: 'Email is required for HOD/Admin.' }, { status: 400 });
  }

  const { data, error } = await getDb()
    .from('app_users')
    .insert({
      email: body.email ? body.email.toLowerCase().trim() : null,
      sgh_id: body.sgh_id ? body.sgh_id.trim() : null,
      password_hash: '123456',
      full_name: body.full_name.trim(),
      role: body.role || 'staff',
      branch_id: body.branch_id || 'all',
      active: true,
      force_password_change: true,
      is_demo: false,
    })
    .select('id,email,sgh_id,full_name,role,branch_id,active,created_at,moh_license_url,moh_license_expiry');
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data[0]);
}

export async function PUT(req) {
  const { id, password, ...rest } = await req.json();
  if (!id) return Response.json({ error: 'ID required.' }, { status: 400 });
  const updates = { ...rest };
  if (password) updates.password_hash = password;
  if (updates.email) updates.email = updates.email.toLowerCase().trim();
  const { data, error } = await getDb()
    .from('app_users')
    .update(updates)
    .eq('id', id)
    .select('id,email,sgh_id,full_name,role,branch_id,active,created_at,moh_license_url,moh_license_expiry');
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
