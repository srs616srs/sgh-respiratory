import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return Response.json({ error: 'Auth service not configured' }, { status: 503 });
    }

    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { data, error } = await sb
      .from('app_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('active', true)
      .single();

    if (error || !data) {
      return Response.json({ error: 'No active account found for this email.' }, { status: 401 });
    }

    if (data.password_hash !== password) {
      return Response.json({ error: 'Incorrect password.' }, { status: 401 });
    }

    const initials = data.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return Response.json({
      id: data.id,
      name: data.full_name,
      email: data.email,
      role: data.role === 'admin' ? 'Network Director' : data.role === 'hod' ? 'Head of Department' : 'RT Staff',
      branchId: data.branch_id,
      isHOD: data.role === 'admin' || data.role === 'hod',
      isAdmin: data.role === 'admin',
      avatar: initials,
    });
  } catch (e) {
    return Response.json({ error: 'Server error: ' + e.message }, { status: 500 });
  }
}
