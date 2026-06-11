import type { GameResult } from '@/lib/db/types';
import { knockoutScoreWarning } from '@/lib/scoring';
import { TEAMS } from '@/lib/teams';

export type MatchResultInput = {
  kick_off: string;
  stage: string | null;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  went_to_extra_time: boolean;
  home_penalties_score: number | null;
  away_penalties_score: number | null;
};

export type MatchResultValidation =
  | { ok: true; data: MatchResultInput; warning: string | null }
  | { ok: false; error: string };

function isTeamCode(code: string): code is keyof typeof TEAMS {
  return code in TEAMS;
}

function parseOptionalPenalty(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) return null;
  return n;
}

export function validateMatchResultInput(body: unknown): MatchResultValidation {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body' };
  }

  const b = body as Record<string, unknown>;

  const kick_off = typeof b.kick_off === 'string' ? b.kick_off.trim() : '';
  if (!kick_off || Number.isNaN(Date.parse(kick_off))) {
    return { ok: false, error: 'Valid kick-off date/time is required' };
  }

  const stage =
    typeof b.stage === 'string' && b.stage.trim() ? b.stage.trim() : null;

  const home_team = typeof b.home_team === 'string' ? b.home_team.trim() : '';
  const away_team = typeof b.away_team === 'string' ? b.away_team.trim() : '';

  if (!isTeamCode(home_team) || !isTeamCode(away_team)) {
    return { ok: false, error: 'Select valid home and away teams' };
  }
  if (home_team === away_team) {
    return { ok: false, error: 'Home and away teams must be different' };
  }

  const home_score = Number(b.home_score);
  const away_score = Number(b.away_score);
  if (
    !Number.isInteger(home_score) ||
    !Number.isInteger(away_score) ||
    home_score < 0 ||
    away_score < 0
  ) {
    return { ok: false, error: 'Scores must be whole numbers ≥ 0' };
  }

  const went_to_extra_time = Boolean(b.went_to_extra_time);

  const home_penalties_score = parseOptionalPenalty(b.home_penalties_score);
  const away_penalties_score = parseOptionalPenalty(b.away_penalties_score);

  if (
    (b.home_penalties_score != null && b.home_penalties_score !== '' && home_penalties_score === null) ||
    (b.away_penalties_score != null && b.away_penalties_score !== '' && away_penalties_score === null)
  ) {
    return { ok: false, error: 'Penalty scores must be whole numbers ≥ 0 or empty' };
  }

  const hasHomePen = home_penalties_score !== null;
  const hasAwayPen = away_penalties_score !== null;
  if (hasHomePen !== hasAwayPen) {
    return { ok: false, error: 'Enter both penalty scores or leave both empty' };
  }

  const data: MatchResultInput = {
    kick_off: new Date(kick_off).toISOString(),
    stage,
    home_team,
    away_team,
    home_score,
    away_score,
    went_to_extra_time,
    home_penalties_score,
    away_penalties_score,
  };

  let warning: string | null = null;
  if (
    knockoutScoreWarning(stage) &&
    home_score === away_score &&
    home_penalties_score === null &&
    away_penalties_score === null
  ) {
    warning =
      'Scores are level with no penalty shootout on what looks like a knockout match. Confirm this is correct (group-stage draws are fine).';
  }

  return { ok: true, data, warning };
}

export type MatchResultRow = GameResult & {
  home_team_name: string;
  away_team_name: string;
};

export function enrichMatchResult(row: GameResult): MatchResultRow {
  const home = TEAMS[row.home_team as keyof typeof TEAMS];
  const away = TEAMS[row.away_team as keyof typeof TEAMS];
  return {
    ...row,
    home_team_name: home?.teamName ?? row.home_team,
    away_team_name: away?.teamName ?? row.away_team,
  };
}

const KICK_OFF_DISPLAY_LOCALE = 'en-GB';
const KICK_OFF_DISPLAY_TIME_ZONE = 'Europe/London';

/** Format ISO kick_off for display in UK time (BST/GMT; fixed for SSR hydration). */
export function formatKickOffDisplay(iso: string): string {
  return new Date(iso).toLocaleString(KICK_OFF_DISPLAY_LOCALE, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: KICK_OFF_DISPLAY_TIME_ZONE,
  });
}

/** Format ISO kick_off for datetime-local input (local timezone). */
export function kickOffToDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
