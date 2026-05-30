import { createAdminClient } from '@/lib/supabase/admin';
import { getPlayerSession } from '@/lib/session';

export type PlayerProfile = {
  team_a: string;
  team_b: string;
  goodluck_message: string | null;
};

/** Loads the logged-in player's teams for the current league session. */
export async function getPlayerProfile(
  idLeague: string,
): Promise<PlayerProfile | null> {
  const playerSession = await getPlayerSession();
  if (!playerSession || playerSession.id_league !== idLeague) {
    return null;
  }

  const supabase = createAdminClient();
  const [{ data: player }, { data: league }] = await Promise.all([
    supabase
      .from('player')
      .select('team_a, team_b')
      .eq('id_player', playerSession.id_player)
      .eq('id_league', idLeague)
      .maybeSingle(),
    supabase
      .from('league_info')
      .select('goodluck_message')
      .eq('id_league', idLeague)
      .maybeSingle(),
  ]);

  if (!player) {
    return null;
  }

  return {
    team_a: player.team_a,
    team_b: player.team_b,
    goodluck_message: league?.goodluck_message ?? null,
  };
}
