import { createClient } from '@supabase/supabase-js';

function getDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

export async function POST(req) {
  try {
    const { id, currentPassword, newPassword } = await req.json();
    if (!id || !newPassword) return Response.json({ error: 'Missing required fields.' }, { status: 400 });
    if (newPassword.length < 6) return Response.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });

    const db = getDb();

    // Verify current password if provided (skip for force-change flow)
    if (currentPassword !== undefined) {
      const { data } = await db.from('app_users').select('password_hash').eq('id', id).single();
      if (!data || data.password_hash !== currentPassword) {
        return Response.json({ error: 'Current password is incorrect.' }, { status: 401 });
      }
    }

    const { error } = await db
      .from('app_users')
      .update({ password_hash: newPassword, force_password_change: false })
      .eq('id', id);

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: 'Server error: ' + e.message }, { status: 500 });
  }
}
