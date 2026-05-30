import { jsonError, jsonOk } from '@/lib/api';
import { fetchMatchResults } from '@/lib/match-results-service';
import { getLeagueSession } from '@/lib/session';

export async function GET() {
  try {
    const idLeague = await getLeagueSession();
    if (!idLeague) {
      return jsonError('Enter the league first', 401);
    }

    const results = await fetchMatchResults();
    return jsonOk({ results });
  } catch (e) {
    console.error(e);
    return jsonError('Could not load match results', 500);
  }
}
