/**
 * Fetch BBC World Cup scores and insert new completed matches into game_results.
 *
 * Usage:
 *   pnpm update-scores
 *   pnpm update-scores --dry-run
 *   pnpm update-scores --fixtures data/bbc-sample-completed.json --dry-run
 *   pnpm update-scores --days 3 --dry-run
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 * (unless --dry-run with --fixtures).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { BbcFixturesResponse } from '@/lib/bbc-scores/types';
import { printSummary, syncScores } from '@/lib/score-updater/sync';

type CliOptions = {
  dryRun: boolean;
  fixtures?: string;
  date?: string;
  days: number;
};

function loadEnvFile() {
  try {
    const path = resolve(process.cwd(), '.env.local');
    const content = readFileSync(path, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local optional if vars already exported
  }
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { dryRun: false, days: 2 };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--fixtures') {
      options.fixtures = argv[++i];
      if (!options.fixtures) {
        console.error('--fixtures requires a file path');
        process.exit(1);
      }
    } else if (arg === '--date') {
      options.date = argv[++i];
      if (!options.date || !/^\d{4}-\d{2}-\d{2}$/.test(options.date)) {
        console.error('--date requires YYYY-MM-DD');
        process.exit(1);
      }
    } else if (arg === '--days') {
      const n = Number(argv[++i]);
      if (!Number.isInteger(n) || n < 1) {
        console.error('--days requires a positive integer');
        process.exit(1);
      }
      options.days = n;
    } else {
      console.error(`Unknown argument: ${arg}`);
      process.exit(1);
    }
  }

  return options;
}

function loadFixtures(path: string): BbcFixturesResponse {
  const content = readFileSync(resolve(path), 'utf8');
  return JSON.parse(content) as BbcFixturesResponse;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!options.dryRun || !options.fixtures) {
    loadEnvFile();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
      process.exit(1);
    }
  }

  let fixtures: BbcFixturesResponse | undefined;
  if (options.fixtures) {
    fixtures = loadFixtures(options.fixtures);
  }

  const endDate = options.date ? new Date(`${options.date}T12:00:00Z`) : undefined;
  const days = options.date ? 1 : options.days;

  try {
    const summary = await syncScores({
      dryRun: options.dryRun,
      fixtures,
      days,
      endDate,
    });
    printSummary(summary);

    if (summary.validationErrors.length > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
