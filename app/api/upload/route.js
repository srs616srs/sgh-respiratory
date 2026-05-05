import { createClient } from '@supabase/supabase-js';

function getDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    const folder = form.get('folder') || 'general';

    if (!file) return Response.json({ error: 'No file provided.' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${folder}/${Date.now()}_${safeName}`;

    const { error } = await getDb()
      .storage
      .from('documents')
      .upload(fileName, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (error) return Response.json({ error: error.message }, { status: 500 });

    const { data: urlData } = getDb().storage.from('documents').getPublicUrl(fileName);
    return Response.json({ url: urlData.publicUrl, path: fileName, name: file.name });
  } catch (e) {
    return Response.json({ error: 'Upload failed: ' + e.message }, { status: 500 });
  }
}
