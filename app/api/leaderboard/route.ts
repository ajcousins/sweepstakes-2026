import { jsonError, jsonOk } from '@/lib/api';
import { getPlayerIsAdmin } from '@/lib/admin';
import { fetchLeaderboard } from '@/lib/leaderboard-service';
import { getLeagueSession, getPlayerSession } from '@/lib/session';

export async function GET() {
  try {
    const idLeague = await getLeagueSession();
    if (!idLeague) {
      return jsonError('Enter the league first', 401);
    }

    const playerSession = await getPlayerSession();
    const { rows, welcome_message, info_message } =
      await fetchLeaderboard(idLeague);

    const highlight_player_id =
      playerSession?.id_league === idLeague ? playerSession.id_player : null;

    const is_admin =
      highlight_player_id != null
        ? await getPlayerIsAdmin(highlight_player_id, idLeague)
        : false;

    return jsonOk({
      rows,
      welcome_message,
      info_message,
      highlight_player_id,
      is_admin,
    });
  } catch (e) {
    console.error(e);
    return jsonError('Could not load leaderboard', 500);
  }
}
