import { createAdminClient } from '@/lib/supabase/admin';
import { jsonError, jsonOk } from '@/lib/api';
import { verifyPassword } from '@/lib/password';
import { checkRateLimit, clientIp } from '@/lib/rate-limit';
import { setLeagueSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const limit = checkRateLimit(`league-login:${ip}`);
    if (!limit.allowed) {
      return jsonError('Too many attempts. Try again later.', 429);
    }

    const body = (await request.json()) as {
      league_name?: string;
      password?: string;
    };

    const league_name = body.league_name?.trim();
    const password = body.password ?? '';

    if (!league_name || !password) {
      return jsonError('League name and password are required', 400);
    }

    const supabase = createAdminClient();
    const { data: league, error } = await supabase
      .from('league_info')
      .select('id_league, password_hash, welcome_message')
      .eq('league_name', league_name)
      .maybeSingle();

    if (error) {
      return jsonError('Login failed', 500);
    }

    if (!league) {
      return jsonError('Invalid league name or password', 401);
    }

    const valid = await verifyPassword(password, league.password_hash);
    if (!valid) {
      return jsonError('Invalid league name or password', 401);
    }

    await setLeagueSession(league.id_league);

    return jsonOk({
      id_league: league.id_league,
      welcome_message: league.welcome_message,
    });
  } catch (e) {
    console.error(e);
    return jsonError('Login failed', 500);
  }
}
