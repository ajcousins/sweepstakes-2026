import { createAdminClient } from '@/lib/supabase/admin';
import { hashPassword } from '@/lib/password';
import {
  countsFromPlayers,
  normalisePair,
  pickBalancedPair,
} from '@/lib/pairs';

const MAX_REGISTER_ATTEMPTS = 8;

export type RegisterResult =
  | {
      ok: true;
      id_player: string;
      team_a: string;
      team_b: string;
      goodluck_message: string | null;
    }
  | { ok: false; error: string };

export async function registerPlayer(
  idLeague: string,
  playerName: string,
  plainPassword: string,
): Promise<RegisterResult> {
  const supabase = createAdminClient();
  const trimmed = playerName.trim();

  if (trimmed.length < 2) {
    return { ok: false, error: 'Player name must be at least 2 characters' };
  }
  if (plainPassword.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters' };
  }

  const { data: league, error: leagueErr } = await supabase
    .from('league_info')
    .select('is_locked, goodluck_message')
    .eq('id_league', idLeague)
    .single();

  if (leagueErr || !league) {
    return { ok: false, error: 'League not found' };
  }
  if (league.is_locked) {
    return { ok: false, error: 'This league is not accepting new players' };
  }

  const password_hash = await hashPassword(plainPassword);

  for (let attempt = 0; attempt < MAX_REGISTER_ATTEMPTS; attempt++) {
    const { data: existingPlayers, error: listErr } = await supabase
      .from('player')
      .select('team_a, team_b, normalised_pair')
      .eq('id_league', idLeague);

    if (listErr) {
      return { ok: false, error: 'Could not load league players' };
    }

    const usedPairs = new Set(
      (existingPlayers ?? []).map((p) => p.normalised_pair),
    );
    const counts = countsFromPlayers(existingPlayers ?? []);
    const choice = pickBalancedPair(usedPairs, counts);

    if (!choice) {
      return { ok: false, error: 'No team pairs remaining in this league' };
    }

    const { data: inserted, error: insertErr } = await supabase
      .from('player')
      .insert({
        id_league: idLeague,
        player_name: trimmed,
        password_hash,
        team_a: choice.team_a,
        team_b: choice.team_b,
      })
      .select('id_player, team_a, team_b')
      .single();

    if (insertErr) {
      if (insertErr.code === '23505') {
        if (insertErr.message.includes('player_name')) {
          return { ok: false, error: 'That player name is already taken' };
        }
        continue;
      }
      return { ok: false, error: 'Registration failed' };
    }

    return {
      ok: true,
      id_player: inserted.id_player,
      team_a: inserted.team_a,
      team_b: inserted.team_b,
      goodluck_message: league.goodluck_message,
    };
  }

  return { ok: false, error: 'Registration failed after retries' };
}

export { normalisePair };
