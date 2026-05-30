import { createAdminClient } from '@/lib/supabase/admin';
import type { GameResult } from '@/lib/db/types';
import { enrichMatchResult, type MatchResultRow } from '@/lib/match-results';

export async function fetchMatchResults(): Promise<MatchResultRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('game_results')
    .select('*')
    .order('kick_off', { ascending: false });

  if (error) {
    throw new Error('Could not load match results');
  }

  return (data ?? []).map((row) => enrichMatchResult(row as GameResult));
}
