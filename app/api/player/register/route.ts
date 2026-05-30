import { jsonError, jsonOk } from '@/lib/api';
import { registerPlayer } from '@/lib/register-player';
import { getLeagueSession, setPlayerSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const idLeague = await getLeagueSession();
    if (!idLeague) {
      return jsonError('Enter the sweepstakes first', 401);
    }

    const body = (await request.json()) as {
      player_name?: string;
      password?: string;
      confirm_password?: string;
    };

    const player_name = body.player_name?.trim() ?? '';
    const password = body.password ?? '';
    const confirm_password = body.confirm_password ?? '';

    if (password !== confirm_password) {
      return jsonError('Passwords do not match', 400);
    }

    const result = await registerPlayer(idLeague, player_name, password);
    if (!result.ok) {
      return jsonError(result.error, 400);
    }

    await setPlayerSession(result.id_player, idLeague);

    return jsonOk({
      id_player: result.id_player,
      team_a: result.team_a,
      team_b: result.team_b,
      goodluck_message: result.goodluck_message,
    });
  } catch (e) {
    console.error(e);
    return jsonError('Registration failed', 500);
  }
}
