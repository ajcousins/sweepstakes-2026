import { createAdminClient } from '@/lib/supabase/admin';
import { getLeagueSession, getPlayerSession } from '@/lib/session';

export type AdminContext = {
  id_player: string;
  id_league: string;
  player_name: string;
};

/** Requires league + player session and `is_admin` on the player row. */
export async function requireAdmin(): Promise<
  { ok: true; admin: AdminContext } | { ok: false; status: number; message: string }
> {
  const idLeague = await getLeagueSession();
  if (!idLeague) {
    return { ok: false, status: 401, message: 'Enter the sweepstakes first' };
  }

  const playerSession = await getPlayerSession();
  if (!playerSession || playerSession.id_league !== idLeague) {
    return { ok: false, status: 401, message: 'Log in as a player to access admin' };
  }

  const supabase = createAdminClient();
  const { data: player, error } = await supabase
    .from('player')
    .select('id_player, id_league, player_name, is_admin')
    .eq('id_player', playerSession.id_player)
    .eq('id_league', idLeague)
    .maybeSingle();

  if (error || !player) {
    return { ok: false, status: 500, message: 'Could not verify admin access' };
  }

  if (!player.is_admin) {
    return { ok: false, status: 403, message: 'Admin access required' };
  }

  return {
    ok: true,
    admin: {
      id_player: player.id_player,
      id_league: player.id_league,
      player_name: player.player_name,
    },
  };
}

export async function getPlayerIsAdmin(
  idPlayer: string,
  idLeague: string,
): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('player')
    .select('is_admin')
    .eq('id_player', idPlayer)
    .eq('id_league', idLeague)
    .maybeSingle();
  return data?.is_admin ?? false;
}
