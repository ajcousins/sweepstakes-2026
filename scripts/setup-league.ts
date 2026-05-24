/**
 * Create a league from a JSON file.
 *
 * Usage:
 *   pnpm setup-league scripts/example-league.json
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 * (loaded via dotenv if present).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { supabaseNodeOptions } from '../lib/supabase/node-options';

type LeagueInput = {
  league_name: string;
  password: string;
  title?: string;
  welcome_message?: string;
  goodluck_message?: string;
  info_message?: string;
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

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: pnpm setup-league <path-to-json>');
    process.exit(1);
  }

  loadEnvFile();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const input = JSON.parse(readFileSync(resolve(file), 'utf8')) as LeagueInput;
  if (!input.league_name?.trim() || !input.password) {
    console.error('JSON must include league_name and password');
    process.exit(1);
  }

  const password_hash = await bcrypt.hash(input.password, 12);
  const supabase = createClient(url, key, supabaseNodeOptions);

  const { data, error } = await supabase
    .from('league_info')
    .insert({
      league_name: input.league_name.trim(),
      title: input.title?.trim() ?? null,
      password_hash,
      welcome_message: input.welcome_message ?? null,
      goodluck_message: input.goodluck_message ?? null,
      info_message: input.info_message ?? null,
      is_locked: false,
    })
    .select('id_league, league_name, title')
    .single();

  if (error) {
    console.error('Insert failed:', error.message);
    process.exit(1);
  }

  console.log('League created:');
  console.log('  id_league:', data.id_league);
  console.log('  league_name:', data.league_name);
  console.log('  title:', data.title ?? '(none)');
}

main();
