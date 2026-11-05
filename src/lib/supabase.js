import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const hasBackend = Boolean(url && key);
export const supabase = hasBackend ? createClient(url,key) : null;
