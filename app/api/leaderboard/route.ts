import { jsonError, jsonOk } from '@/lib/api';
import { fetchLeaderboard } from '@/lib/leaderboard-service';
import { getLeagueSession, getPlayerSession } from '@/lib/session';

export async function GET() {
  try {
    const idLeague = await getLeagueSession();
    if (!idLeague) {
      return jsonError('Enter the sweepstakes first', 401);
    }

    const playerSession = await getPlayerSession();
    const { rows, welcome_message, info_message, winningTeam } =
      await fetchLeaderboard(idLeague);

    const highlight_player_id =
      playerSession?.id_league === idLeague ? playerSession.id_player : null;

    return jsonOk({
      rows,
      welcome_message,
      info_message,
      highlight_player_id,
      winningTeam,
    });
  } catch (e) {
    console.error(e);
    return jsonError('Could not load leaderboard', 500);
  }
}
