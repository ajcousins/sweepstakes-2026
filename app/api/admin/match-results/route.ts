import { jsonError, jsonOk } from '@/lib/api';
import { requireAdmin } from '@/lib/admin';
import { enrichMatchResult, validateMatchResultInput } from '@/lib/match-results';
import { createAdminClient } from '@/lib/supabase/admin';
import type { GameResult } from '@/lib/db/types';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return jsonError(auth.message, auth.status);
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('game_results')
    .select('*')
    .order('kick_off', { ascending: false });

  if (error) {
    return jsonError('Could not load match results', 500);
  }

  const results = (data ?? []).map((row) => enrichMatchResult(row as GameResult));
  return jsonOk({ results });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return jsonError(auth.message, auth.status);
  }

  const body = await request.json();
  const validated = validateMatchResultInput(body);
  if (!validated.ok) {
    return jsonError(validated.error, 400);
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('game_results')
    .insert(validated.data)
    .select('*')
    .single();

  if (error) {
    return jsonError('Could not save match result', 500);
  }

  return jsonOk({
    result: enrichMatchResult(data as GameResult),
    warning: validated.warning,
  });
}
