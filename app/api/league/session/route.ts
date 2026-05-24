import { jsonError, jsonOk } from '@/lib/api';
import { getLeagueSession } from '@/lib/session';

export async function GET() {
  const idLeague = await getLeagueSession();
  if (!idLeague) {
    return jsonError('Not in a league', 401);
  }
  return jsonOk({ id_league: idLeague });
}
