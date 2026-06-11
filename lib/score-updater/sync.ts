import type { BbcFixturesResponse } from '@/lib/bbc-scores/types';
import { fetchBbcFixtures, dateRange } from '@/lib/bbc-scores/fetch';
import { parseCompletedWorldCupMatches } from '@/lib/bbc-scores/parse';
import { validateMatchResultInput } from '@/lib/match-results';
import { createAdminClient } from '@/lib/supabase/admin';

export type SyncOptions = {
  dryRun?: boolean;
  fixtures?: BbcFixturesResponse;
  days?: number;
  endDate?: Date;
};

export type SyncSummary = {
  fetchedEvents: number;
  completed: number;
  skippedExisting: number;
  inserted: number;
  skippedNotCompleted: number;
  unmappedTeams: string[];
  validationErrors: string[];
  dryRun: boolean;
};

function pairKey(home: string, away: string): string {
  return `${home}_${away}`;
}

async function loadExistingPairs(): Promise<Set<string>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('game_results')
    .select('home_team, away_team');

  if (error) {
    throw new Error(`Could not load game_results: ${error.message}`);
  }

  const pairs = new Set<string>();
  for (const row of data ?? []) {
    pairs.add(pairKey(row.home_team, row.away_team));
  }
  return pairs;
}

async function insertResult(
  data: ReturnType<typeof validateMatchResultInput> & { ok: true },
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('game_results').insert(data.data);
  if (error) {
    throw new Error(`Insert failed for ${data.data.home_team} vs ${data.data.away_team}: ${error.message}`);
  }
}

export async function syncScores(options: SyncOptions = {}): Promise<SyncSummary> {
  const dryRun = options.dryRun ?? false;
  const days = options.days ?? 2;

  let fixtures: BbcFixturesResponse;
  if (options.fixtures) {
    fixtures = options.fixtures;
  } else {
    const dates = dateRange(days, options.endDate);
    fixtures = await fetchBbcFixtures(dates[0], dates[dates.length - 1]);
  }

  const parsed = parseCompletedWorldCupMatches(fixtures);
  const fetchedEvents = parsed.length;

  const summary: SyncSummary = {
    fetchedEvents,
    completed: 0,
    skippedExisting: 0,
    inserted: 0,
    skippedNotCompleted: 0,
    unmappedTeams: [],
    validationErrors: [],
    dryRun,
  };

  const checkExisting = !dryRun || !options.fixtures;
  const existingPairs = checkExisting ? await loadExistingPairs() : new Set<string>();

  for (const result of parsed) {
    if (!result.ok) {
      if (result.reason === 'not completed') {
        summary.skippedNotCompleted++;
      } else if (result.reason.startsWith('unmapped')) {
        summary.unmappedTeams.push(result.reason);
      }
      continue;
    }

    summary.completed++;

    const key = pairKey(result.data.home_team, result.data.away_team);
    if (existingPairs.has(key)) {
      summary.skippedExisting++;
      continue;
    }

    const validated = validateMatchResultInput(result.data);
    if (!validated.ok) {
      summary.validationErrors.push(
        `${result.data.home_team} vs ${result.data.away_team}: ${validated.error}`,
      );
      continue;
    }

    if (dryRun) {
      summary.inserted++;
      console.log(
        `[dry-run] would insert: ${validated.data.home_team} ${validated.data.home_score}-${validated.data.away_score} ${validated.data.away_team} (${validated.data.stage ?? 'no stage'})`,
      );
      continue;
    }

    await insertResult(validated);
    existingPairs.add(key);
    summary.inserted++;
    console.log(
      `inserted: ${validated.data.home_team} ${validated.data.home_score}-${validated.data.away_score} ${validated.data.away_team}`,
    );
  }

  return summary;
}

export function printSummary(summary: SyncSummary): void {
  console.log('--- score updater summary ---');
  console.log(`events parsed:      ${summary.fetchedEvents}`);
  console.log(`completed (WC):     ${summary.completed}`);
  console.log(`skipped (existing): ${summary.skippedExisting}`);
  console.log(`inserted:           ${summary.inserted}${summary.dryRun ? ' (dry-run)' : ''}`);
  console.log(`skipped (pending):  ${summary.skippedNotCompleted}`);
  if (summary.unmappedTeams.length > 0) {
    console.log(`unmapped teams:     ${summary.unmappedTeams.length}`);
    for (const msg of summary.unmappedTeams) {
      console.log(`  - ${msg}`);
    }
  }
  if (summary.validationErrors.length > 0) {
    console.log(`validation errors:  ${summary.validationErrors.length}`);
    for (const msg of summary.validationErrors) {
      console.log(`  - ${msg}`);
    }
  }
}
