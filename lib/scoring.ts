import type { GameResult } from '@/lib/db/types';

export type MatchPoints = { home: number; away: number };

export function pointsForMatch(row: GameResult): MatchPoints {
  const homePens = row.home_penalties_score;
  const awayPens = row.away_penalties_score;
  if (homePens != null && awayPens != null) {
    if (homePens > awayPens) return { home: 3, away: 0 };
    if (awayPens > homePens) return { home: 0, away: 3 };
    return { home: 0, away: 0 };
  }
  if (row.home_score > row.away_score) return { home: 3, away: 0 };
  if (row.away_score > row.home_score) return { home: 0, away: 3 };
  return { home: 1, away: 1 };
}

export type TeamStats = Record<string, { points: number; gf: number; ga: number }>;

export function emptyTeamStats(teamCodes: string[]): TeamStats {
  const stats: TeamStats = {};
  for (const code of teamCodes) {
    stats[code] = { points: 0, gf: 0, ga: 0 };
  }
  return stats;
}

export function accumulateTeamStats(
  stats: TeamStats,
  results: GameResult[],
): TeamStats {
  const next = { ...stats };
  for (const code of Object.keys(next)) {
    next[code] = { ...next[code]! };
  }

  for (const row of results) {
    const { home, away } = pointsForMatch(row);
    const h = row.home_team;
    const a = row.away_team;
    if (!next[h] || !next[a]) continue;

    next[h].points += home;
    next[a].points += away;
    next[h].gf += Number(row.home_score);
    next[h].ga += Number(row.away_score);
    next[a].gf += Number(row.away_score);
    next[a].ga += Number(row.home_score);
  }

  return next;
}

export function teamGoalDifference(stats: TeamStats, code: string): number {
  const s = stats[code];
  if (!s) return 0;
  return s.gf - s.ga;
}

export function playerPoints(stats: TeamStats, teamA: string, teamB: string): number {
  return (stats[teamA]?.points ?? 0) + (stats[teamB]?.points ?? 0);
}

export function playerGoalDifference(
  stats: TeamStats,
  teamA: string,
  teamB: string,
): number {
  return teamGoalDifference(stats, teamA) + teamGoalDifference(stats, teamB);
}

export type LeaderboardRow = {
  id_player: string;
  player_name: string;
  team_a: string;
  team_b: string;
  points: number;
  goal_difference: number;
  rank: number;
};

export function rankLeaderboard(
  rows: Array<Omit<LeaderboardRow, 'rank'>>,
): LeaderboardRow[] {
  const sorted = [...rows].sort(
    (a, b) =>
      b.points - a.points ||
      b.goal_difference - a.goal_difference ||
      a.player_name.localeCompare(b.player_name),
  );

  const ranked: LeaderboardRow[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const row = sorted[i]!;
    const prev = ranked[i - 1];
    const rank =
      prev &&
      prev.points === row.points &&
      prev.goal_difference === row.goal_difference
        ? prev.rank
        : i + 1;
    ranked.push({ ...row, rank });
  }
  return ranked;
}

/** Admin UI: warn on knockout-looking stage with level score and no pens. */
export function knockoutScoreWarning(stage: string | null): boolean {
  if (!stage) return false;
  const s = stage.toLowerCase();
  if (s.includes('group')) return false;
  const knockoutHints = ['final', 'semi', 'quarter', 'round of', 'last 16'];
  return knockoutHints.some((h) => s.includes(h)) || !s.includes('group');
}
