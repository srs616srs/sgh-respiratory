import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : null;

export const isSupabaseConfigured = () => !!(url && key);

// Generic helpers
export async function sbFetch(table, filter = {}) {
  if (!supabase) return null;
  let q = supabase.from(table).select('*');
  Object.entries(filter).forEach(([k, v]) => { q = q.eq(k, v); });
  const { data, error } = await q;
  if (error) { console.error(`sbFetch ${table}:`, error); return null; }
  return data;
}

export async function sbUpsert(table, rows) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).upsert(rows).select();
  if (error) { console.error(`sbUpsert ${table}:`, error); return null; }
  return data;
}

export async function sbDelete(table, id) {
  if (!supabase) return;
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) console.error(`sbDelete ${table}:`, error);
}

export async function uploadFile(bucket, path, file) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}
