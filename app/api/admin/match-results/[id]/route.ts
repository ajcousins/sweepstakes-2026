import { jsonError, jsonOk } from '@/lib/api';
import { requireAdmin } from '@/lib/admin';
import { enrichMatchResult, validateMatchResultInput } from '@/lib/match-results';
import { createAdminClient } from '@/lib/supabase/admin';
import type { GameResult } from '@/lib/db/types';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return jsonError(auth.message, auth.status);
  }

  const { id } = await params;
  const body = await request.json();
  const validated = validateMatchResultInput(body);
  if (!validated.ok) {
    return jsonError(validated.error, 400);
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('game_results')
    .update(validated.data)
    .eq('id_result', id)
    .select('*')
    .single();

  if (error) {
    return jsonError('Could not update match result', 500);
  }

  if (!data) {
    return jsonError('Match not found', 404);
  }

  return jsonOk({
    result: enrichMatchResult(data as GameResult),
    warning: validated.warning,
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return jsonError(auth.message, auth.status);
  }

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from('game_results').delete().eq('id_result', id);

  if (error) {
    return jsonError('Could not delete match result', 500);
  }

  return jsonOk({ deleted: true });
}
