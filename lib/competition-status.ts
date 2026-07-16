import { createAdminClient } from '@/lib/supabase/admin';
import type { GameResult } from '@/lib/db/types';
import { winningTeamFromResults } from '@/lib/scoring';

/** True when a decisive Final result exists (competition finished). */
export async function isCompetitionFinished(): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('game_results').select('*');
  if (error) {
    throw new Error('Could not load match results');
  }
  return winningTeamFromResults((data ?? []) as GameResult[]) != null;
}
