# Sweepstakes 2026

Internal 2026 FIFA World Cup sweepstakes. See [specification.md](./specification.md) for product rules.

## Setup

1. Copy `.env.example` to `.env.local` and fill in Supabase values plus a `SESSION_SECRET` (32+ characters).

2. Create a league:

```bash
pnpm setup-league scripts/example-league.json
```

3. Run the app:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), enter the league name and password, then register or log in as a player.

## Scripts

| Command | Description |
| ------- | ----------- |
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm setup-league <json>` | Insert a league into Supabase |
| `pnpm test:pairs` | Unit tests for balanced pair selection |

## New tournament checklist

Use this when spinning up a league for the next World Cup / tournament:

1. **Prepare the database**
   - Create a fresh Supabase project (recommended for a new tournament so old `game_results` don’t carry over).
   - Run `supabase/scripts/create-schema.sql`, then `supabase/scripts/enable-rls-server-only.sql`.
   - Or, on an existing project, clear `game_results` (and usually `player` / `league_info`) — results are shared globally across all leagues.

2. **Configure env vars**
   - Copy `.env.example` → `.env.local` (and set the same values in your host, e.g. Vercel).
   - Fill in Supabase URL + service role key, `SESSION_SECRET`, and `CRON_SECRET`.

3. **Update competing teams**
   - Rewrite the list in `lib/teams.ts` (codes, names, flags, pots; optional `bbcName` when BBC’s label differs).
   - Update stages in `lib/match-stages.ts` if the group/knockout structure changed.
   - If it isn’t the World Cup, also update the BBC label/parser in `lib/bbc-scores/parse.ts` (and fetch URL if needed).
   - Sanity-check with `pnpm test:pairs` and `pnpm test:bbc-scores`.

4. **Create the league**
   - Copy `scripts/example-league.json`, edit name/password/messages, then:
     ```bash
     pnpm setup-league scripts/your-league.json
     ```
   - Share the league name + password with players.

5. **Promote an admin**
   - Register yourself in the app, then set `is_admin = true` on your `player` row in Supabase.
   - Optionally lock registration later with `is_locked = true` on `league_info`.

6. **Set up score sync / cron**
   - Deploy the app with env vars set.
   - Point an external cron (e.g. [cron-job.org](https://cron-job.org)) at:
     `POST https://<your-domain>/api/cron/update-scores`
     with header `Authorization: Bearer <CRON_SECRET>` (every ~5 minutes during the tournament).
   - Admins can also trigger sync from `/admin/update-scores`, or run `pnpm update-scores` locally.
   - See [score-updater-spec.md](./score-updater-spec.md) for details.

7. **Smoke test**
   - League login → register → leaderboard → admin match entry / score update.

## Architecture

- **Database:** Supabase (`league_info`, `player`, `game_results`). Server-only access via service role; RLS enabled with no client policies.
- **Auth:** League and player sessions use httpOnly JWT cookies; `localStorage` mirrors `id_league` / `id_player` for client navigation.
- **Scoring:** Derived in `lib/scoring.ts` from global `game_results`.


## AC Notes 2026
- The player table in Supabase currently has the columns: team_a, team_b and normalised_pair. team_a and team_b columns are likely redundant as this data is already saved in normalised_pair as a string. Consider updating the table schmea and factoring the code? 
- This approach could also allow leagues to specify the number of teams each player holds- but this next step would involve more work.
