import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(url, key);
}

// Auto-create storage bucket if missing
async function ensureBucket(sb) {
  try {
    const { data: buckets } = await sb.storage.listBuckets();
    const exists = buckets?.some(b => b.name === 'documents');
    if (!exists) {
      await sb.storage.createBucket('documents', { public: true });
    }
  } catch { /* ignore — bucket may already exist */ }
}

// GET — fetch all documents from DB
export async function GET() {
  const sb = getSb();
  const { data, error } = await sb.from('documents').select('*').order('date', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req) {
  try {
    const sb = getSb();

    // Ensure bucket exists before upload
    await ensureBucket(sb);

    const formData = await req.formData();
    const file = formData.get('file');
    const name = formData.get('name') || file?.name;
    const branchId = formData.get('branchId') || 'all';
    const category = formData.get('category') || 'Document';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = file.name.split('.').pop();
    const path = `documents/${Date.now()}-${name.replace(/[^a-z0-9.]/gi, '_')}.${ext}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { error: uploadError } = await sb.storage
      .from('documents')
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = sb.storage.from('documents').getPublicUrl(path);

    const sizeKB = Math.round(file.size / 1024);
    const sizeStr = sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

    const docRecord = {
      name,
      category,
      branch_id: branchId,
      date: new Date().toISOString().split('T')[0],
      size: sizeStr,
      icon: getIcon(category),
      file_url: publicUrl,
      storage_path: path,
    };

    const { data, error: dbError } = await sb.from('documents').insert(docRecord).select().single();
    if (dbError) throw dbError;

    // Return in the shape the frontend expects
    return NextResponse.json({
      document: {
        ...data,
        fileUrl: data.file_url,
        branchId: data.branch_id,
        storagePath: data.storage_path,
      }
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const sb = getSb();
    const { id, storagePath } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    // Delete from storage if path provided
    if (storagePath) {
      await sb.storage.from('documents').remove([storagePath]);
    }

    const { error } = await sb.from('documents').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function getIcon(cat) {
  const icons = { Policy: '📋', Protocol: '📄', SOP: '📋', Form: '📝', Checklist: '✅', Guideline: '📘', Competency: '🎯' };
  return icons[cat] || '📄';
}
