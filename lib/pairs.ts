import { TEAMS } from '@/lib/teams';

export type TeamCode = keyof typeof TEAMS;

export function normalisePair(a: string, b: string): string {
  return a < b ? `${a}_${b}` : `${b}_${a}`;
}

export function allTeamCodes(): TeamCode[] {
  return Object.keys(TEAMS) as TeamCode[];
}

export function buildAllPairs(): Array<{ team_a: TeamCode; team_b: TeamCode }> {
  const codes = allTeamCodes();
  const pairs: Array<{ team_a: TeamCode; team_b: TeamCode }> = [];
  for (let i = 0; i < codes.length; i++) {
    for (let j = i + 1; j < codes.length; j++) {
      pairs.push({ team_a: codes[i], team_b: codes[j] });
    }
  }
  return pairs;
}

export type TeamCounts = Record<string, number>;

export function countsFromPlayers(
  players: Array<{ team_a: string; team_b: string }>,
): TeamCounts {
  const counts: TeamCounts = {};
  for (const code of allTeamCodes()) {
    counts[code] = 0;
  }
  for (const p of players) {
    counts[p.team_a] = (counts[p.team_a] ?? 0) + 1;
    counts[p.team_b] = (counts[p.team_b] ?? 0) + 1;
  }
  return counts;
}

function maxCount(counts: TeamCounts): number {
  return Math.max(0, ...Object.values(counts));
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

export type PairChoice = { team_a: TeamCode; team_b: TeamCode };

/**
 * Max-count balanced pair selection per specification.
 */
export function pickBalancedPair(
  usedPairs: Set<string>,
  counts: TeamCounts,
): PairChoice | null {
  const unused = buildAllPairs().filter(
    (p) => !usedPairs.has(normalisePair(p.team_a, p.team_b)),
  );
  if (unused.length === 0) return null;

  const totalPlayers = Object.values(counts).reduce((s, n) => s + n, 0) / 2;
  if (totalPlayers === 0) {
    const p = pickRandom(unused);
    return p;
  }

  const M = maxCount(counts);

  const belowMax = unused.filter((p) => counts[p.team_a]! < M && counts[p.team_b]! < M);
  const pool = belowMax.length > 0 ? belowMax : unused;

  const scored = pool.map((p) => {
    const na = counts[p.team_a]! + 1;
    const nb = counts[p.team_b]! + 1;
    return {
      pair: p,
      newMax: Math.max(na, nb),
      sum: counts[p.team_a]! + counts[p.team_b]!,
    };
  });

  scored.sort((a, b) => a.newMax - b.newMax || a.sum - b.sum);
  const bestNewMax = scored[0]!.newMax;
  const bestSum = scored[0]!.sum;
  const ties = scored.filter((s) => s.newMax === bestNewMax && s.sum === bestSum);
  return pickRandom(ties).pair;
}
