import { createClient } from '@supabase/supabase-js';
import { supabaseNodeOptions } from '@/lib/supabase/node-options';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function createAdminClient() {
  return createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    supabaseNodeOptions,
  );
}
