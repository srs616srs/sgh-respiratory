import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return Response.json({ error: 'Auth service not configured' }, { status: 503 });
    }

    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const input = username?.trim() || '';

    // Try by SGH ID first, then by email
    let data = null;
    const isEmail = input.includes('@');

    if (isEmail) {
      const res = await sb.from('app_users').select('*').eq('email', input.toLowerCase()).eq('active', true).single();
      data = res.data;
    } else {
      const res = await sb.from('app_users').select('*').eq('sgh_id', input).eq('active', true).single();
      data = res.data;
    }

    if (!data) {
      return Response.json({ error: 'No active account found. Check your SGH ID or email.' }, { status: 401 });
    }

    if (data.password_hash !== password) {
      return Response.json({ error: 'Incorrect password.' }, { status: 401 });
    }

    const initials = data.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return Response.json({
      id: data.id,
      name: data.full_name,
      email: data.email || '',
      sghId: data.sgh_id || '',
      role: data.role === 'admin' ? 'Network Director' : data.role === 'hod' ? 'Head of Department' : 'RT Staff',
      branchId: data.branch_id,
      isHOD: data.role === 'admin' || data.role === 'hod',
      isAdmin: data.role === 'admin',
      avatar: initials,
      forcePasswordChange: data.force_password_change || false,
    });
  } catch (e) {
    return Response.json({ error: 'Server error: ' + e.message }, { status: 500 });
  }
}
