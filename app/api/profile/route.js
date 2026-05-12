import { createClient } from '@supabase/supabase-js';

function getDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

// GET — fetch profile including MOH license data
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'ID required.' }, { status: 400 });
  const { data, error } = await getDb()
    .from('app_users')
    .select('id,email,sgh_id,full_name,role,branch_id,moh_license_url,moh_license_expiry')
    .eq('id', id)
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

// PUT — update own profile (email, MOH license)
export async function PUT(req) {
  const body = await req.json();
  const { id, email, moh_license_url, moh_license_expiry } = body;
  if (!id) return Response.json({ error: 'ID required.' }, { status: 400 });

  const updates = {};
  if (email !== undefined) updates.email = email ? email.toLowerCase().trim() : null;
  if (moh_license_url !== undefined) updates.moh_license_url = moh_license_url || null;
  if (moh_license_expiry !== undefined) updates.moh_license_expiry = moh_license_expiry || null;

  const { data, error } = await getDb()
    .from('app_users')
    .update(updates)
    .eq('id', id)
    .select('id,email,sgh_id,full_name,role,branch_id,moh_license_url,moh_license_expiry')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
