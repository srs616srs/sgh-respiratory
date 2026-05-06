import { createClient } from '@supabase/supabase-js';

function getDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

// PUT — update own profile (email only for now)
export async function PUT(req) {
  const { id, email } = await req.json();
  if (!id) return Response.json({ error: 'ID required.' }, { status: 400 });

  const updates = {};
  if (email !== undefined) updates.email = email ? email.toLowerCase().trim() : null;

  const { data, error } = await getDb()
    .from('app_users')
    .update(updates)
    .eq('id', id)
    .select('id,email,sgh_id,full_name,role,branch_id,active')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
