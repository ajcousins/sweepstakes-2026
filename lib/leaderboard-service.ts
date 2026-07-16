import { createAdminClient } from '@/lib/supabase/admin';
import type { GameResult, Player } from '@/lib/db/types';
import {
  accumulateTeamStats,
  emptyTeamStats,
  playerGoalDifference,
  playerPoints,
  rankLeaderboard,
  winningTeamFromResults,
  type LeaderboardRow,
} from '@/lib/scoring';
import { allTeamCodes } from '@/lib/pairs';
import { TEAMS } from '@/lib/teams';

export type LeaderboardEntry = LeaderboardRow & {
  team_a: string;
  team_b: string;
  team_a_flag: string;
  team_b_flag: string;
  team_a_name: string;
  team_b_name: string;
};

export async function fetchLeaderboard(idLeague: string): Promise<{
  rows: LeaderboardEntry[];
  welcome_message: string | null;
  info_message: string | null;
  winningTeam: string | null;
}> {
  const supabase = createAdminClient();

  const [{ data: league }, { data: players }, { data: results }] = await Promise.all([
    supabase
      .from('league_info')
      .select('welcome_message, info_message')
      .eq('id_league', idLeague)
      .single(),
    supabase
      .from('player')
      .select('id_player, player_name, team_a, team_b')
      .eq('id_league', idLeague)
      .order('player_name'),
    supabase.from('game_results').select('*'),
  ]);

  if (!league) {
    throw new Error('League not found');
  }

  const gameResults = (results ?? []) as GameResult[];

  const teamStats = accumulateTeamStats(
    emptyTeamStats(allTeamCodes()),
    gameResults,
  );

  const baseRows = ((players ?? []) as Player[]).map((p) => ({
    id_player: p.id_player,
    player_name: p.player_name,
    team_a: p.team_a,
    team_b: p.team_b,
    points: playerPoints(teamStats, p.team_a, p.team_b),
    goal_difference: playerGoalDifference(teamStats, p.team_a, p.team_b),
  }));

  const ranked = rankLeaderboard(baseRows);

  const rows: LeaderboardEntry[] = ranked.map((r) => {
    const ta = TEAMS[r.team_a as keyof typeof TEAMS];
    const tb = TEAMS[r.team_b as keyof typeof TEAMS];
    return {
      ...r,
      team_a: r.team_a,
      team_b: r.team_b,
      team_a_flag: ta?.flag ?? '',
      team_b_flag: tb?.flag ?? '',
      team_a_name: ta?.teamName ?? r.team_a,
      team_b_name: tb?.teamName ?? r.team_b,
    };
  });

  return {
    rows,
    welcome_message: league.welcome_message,
    info_message: league.info_message,
    winningTeam: winningTeamFromResults(gameResults),
  };
}
