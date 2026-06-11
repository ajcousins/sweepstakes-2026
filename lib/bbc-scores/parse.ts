import type { BbcEvent, BbcFixturesResponse } from '@/lib/bbc-scores/types';
import type { MatchResultInput } from '@/lib/match-results';
import { teamCodeFromBbcName } from '@/lib/teams';

const WORLD_CUP_LABEL = 'FIFA World Cup';

export type ParsedMatch =
  | { ok: true; data: MatchResultInput }
  | { ok: false; reason: string; homeName: string; awayName: string };

function parseScore(value: string | undefined): number | null {
  if (value === undefined || value === '') return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) return null;
  return n;
}

function stageFromEvent(event: BbcEvent): string | null {
  const roundName = event.round?.name?.trim();
  if (roundName?.startsWith('Group ')) {
    return roundName;
  }
  const stageName = event.stage?.name?.trim();
  if (stageName) return stageName;
  return roundName ?? null;
}

function wentToExtraTime(event: BbcEvent): boolean {
  const homeRs = event.home.runningScores;
  const awayRs = event.away.runningScores;
  if (!homeRs?.extratime && !awayRs?.extratime) return false;
  const homeFt = homeRs?.fulltime ?? homeRs?.halftime;
  const awayFt = awayRs?.fulltime ?? awayRs?.halftime;
  const homeEt = homeRs?.extratime;
  const awayEt = awayRs?.extratime;
  if (homeEt !== undefined && homeFt !== undefined && homeEt !== homeFt) return true;
  if (awayEt !== undefined && awayFt !== undefined && awayEt !== awayFt) return true;
  return homeRs?.extratime !== undefined || awayRs?.extratime !== undefined;
}

export function parseCompletedEvent(event: BbcEvent): ParsedMatch {
  const homeName = event.home.fullName;
  const awayName = event.away.fullName;

  if (event.status !== 'PostEvent') {
    return { ok: false, reason: 'not completed', homeName, awayName };
  }

  const home_team = teamCodeFromBbcName(homeName);
  const away_team = teamCodeFromBbcName(awayName);
  if (!home_team) {
    return { ok: false, reason: `unmapped home team: ${homeName}`, homeName, awayName };
  }
  if (!away_team) {
    return { ok: false, reason: `unmapped away team: ${awayName}`, homeName, awayName };
  }

  const home_score = parseScore(event.home.score);
  const away_score = parseScore(event.away.score);
  if (home_score === null || away_score === null) {
    return {
      ok: false,
      reason: 'missing or invalid scores',
      homeName,
      awayName,
    };
  }

  const isPens = event.periodLabel?.value === 'PENS';
  let home_penalties_score: number | null = null;
  let away_penalties_score: number | null = null;

  if (isPens) {
    home_penalties_score = parseScore(event.home.runningScores?.penaltyShootout);
    away_penalties_score = parseScore(event.away.runningScores?.penaltyShootout);
    if (home_penalties_score === null || away_penalties_score === null) {
      return {
        ok: false,
        reason: 'penalty shootout scores missing',
        homeName,
        awayName,
      };
    }
  }

  return {
    ok: true,
    data: {
      kick_off: new Date(event.startDateTime).toISOString(),
      stage: stageFromEvent(event),
      home_team,
      away_team,
      home_score,
      away_score,
      went_to_extra_time: wentToExtraTime(event),
      home_penalties_score,
      away_penalties_score,
    },
  };
}

export function extractWorldCupEvents(data: BbcFixturesResponse): BbcEvent[] {
  const worldCup = data.eventGroups.find(
    (group) => group.displayLabel === WORLD_CUP_LABEL,
  );
  if (!worldCup) return [];

  const events: BbcEvent[] = [];
  for (const sg of worldCup.secondaryGroups ?? []) {
    for (const event of sg.events ?? []) {
      events.push(event);
    }
  }
  return events;
}

export function parseCompletedWorldCupMatches(
  data: BbcFixturesResponse,
): ParsedMatch[] {
  return extractWorldCupEvents(data).map(parseCompletedEvent);
}
