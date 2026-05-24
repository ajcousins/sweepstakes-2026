import { jsonError, jsonOk } from '@/lib/api';
import { createAdminClient } from '@/lib/supabase/admin';
import { getLeagueSession } from '@/lib/session';

export async function GET() {
  const idLeague = await getLeagueSession();
  if (!idLeague) {
    return jsonError('Not in a league', 401);
  }

  const supabase = createAdminClient();
  const { data: league, error } = await supabase
    .from('league_info')
    .select('title, league_name')
    .eq('id_league', idLeague)
    .maybeSingle();

  if (error || !league) {
    return jsonError('Could not load league', 500);
  }

  const title = league.title?.trim() || league.league_name;

  return jsonOk({ id_league: idLeague, title });
}
