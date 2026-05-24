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

## Architecture

- **Database:** Supabase (`league_info`, `player`, `game_results`). Server-only access via service role; RLS enabled with no client policies.
- **Auth:** League and player sessions use httpOnly JWT cookies; `localStorage` mirrors `id_league` / `id_player` for client navigation.
- **Scoring:** Derived in `lib/scoring.ts` from global `game_results`.
