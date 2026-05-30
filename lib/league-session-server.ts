import { createAdminClient } from '@/lib/supabase/admin';
import { getLeagueSession } from '@/lib/session';

export type LeagueSessionInfo = {
  inLeague: boolean;
  title: string | null;
};

/** League title from the httpOnly session cookie (server-only). */
export async function getLeagueSessionTitle(): Promise<LeagueSessionInfo> {
  const idLeague = await getLeagueSession();
  if (!idLeague) {
    return { inLeague: false, title: null };
  }

  const supabase = createAdminClient();
  const { data: league, error } = await supabase
    .from('league_info')
    .select('title, league_name')
    .eq('id_league', idLeague)
    .maybeSingle();

  if (error || !league) {
    return { inLeague: false, title: null };
  }

  const title = league.title?.trim() || league.league_name;
  return { inLeague: true, title };
}
