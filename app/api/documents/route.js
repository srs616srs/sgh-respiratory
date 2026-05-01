import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
    }

    const supabase = createClient(url, key);
    const formData = await req.formData();
    const file = formData.get('file');
    const name = formData.get('name') || file.name;
    const branchId = formData.get('branchId') || 'all';
    const category = formData.get('category') || 'Document';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = file.name.split('.').pop();
    const path = `documents/${Date.now()}-${name.replace(/[^a-z0-9.]/gi, '_')}.${ext}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path);

    const sizeKB = Math.round(file.size / 1024);
    const sizeStr = sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

    const docRecord = {
      name,
      category,
      branchId,
      date: new Date().toISOString().split('T')[0],
      size: sizeStr,
      icon: getIcon(category),
      fileUrl: publicUrl,
      storagePath: path,
    };

    const { data, error: dbError } = await supabase.from('documents').insert(docRecord).select().single();
    if (dbError) throw dbError;

    return NextResponse.json({ document: data });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}

function getIcon(cat) {
  const icons = { Policy: '📋', Protocol: '📄', SOP: '📋', Form: '📝', Checklist: '✅', Guideline: '📘' };
  return icons[cat] || '📄';
}
