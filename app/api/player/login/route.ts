import { createAdminClient } from '@/lib/supabase/admin';
import { jsonError, jsonOk } from '@/lib/api';
import { verifyPassword } from '@/lib/password';
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
    };

    const player_name = body.player_name?.trim();
    const password = body.password ?? '';

    if (!player_name || !password) {
      return jsonError('Player name and password are required', 400);
    }

    const supabase = createAdminClient();
    const { data: player, error } = await supabase
      .from('player')
      .select('id_player, id_league, password_hash')
      .eq('id_league', idLeague)
      .eq('player_name', player_name)
      .maybeSingle();

    if (error) {
      return jsonError('Login failed', 500);
    }

    if (!player) {
      return jsonError('Invalid player name or password', 401);
    }

    const valid = await verifyPassword(password, player.password_hash);
    if (!valid) {
      return jsonError('Invalid player name or password', 401);
    }

    await setPlayerSession(player.id_player, player.id_league);

    return jsonOk({ id_player: player.id_player });
  } catch (e) {
    console.error(e);
    return jsonError('Login failed', 500);
  }
}
