import type { SupabaseClientOptions } from '@supabase/supabase-js';
import ws from 'ws';

/** Supabase client options for Node.js < 22 (no native WebSocket). */
export const supabaseNodeOptions: SupabaseClientOptions<'public'> = {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: {
    // `ws` types differ slightly from browser WebSocket; runtime is correct.
    transport: ws as unknown as typeof WebSocket,
  },
};
