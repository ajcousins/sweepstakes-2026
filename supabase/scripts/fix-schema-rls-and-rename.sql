-- Run once in Supabase SQL Editor.
-- 1. Renames tables to snake_case (no quoted identifiers in app code)
-- 2. Sets defaults: league_info.is_locked = false, player.created_at = now()
-- 3. Disables RLS (see note below)
--
-- RLS note: This app uses custom league/player auth (not Supabase Auth), so row
-- policies cannot verify passwords from the DB. Use the service_role key only in
-- Next.js server code (Route Handlers / Server Actions). Do not query these tables
-- from the browser with the anon key. If you later need client-side Supabase access,
-- re-enable RLS and add explicit policies instead of using anon for writes.

begin;

-- -----------------------------------------------------------------------------
-- 1. Rename tables (order: parent league first; FKs follow automatically)
-- -----------------------------------------------------------------------------
alter table if exists public."League Info" rename to league_info;
alter table if exists public."Player" rename to player;
alter table if exists public."Game Results" rename to game_results;

-- -----------------------------------------------------------------------------
-- 2. Rename constraints / indexes (optional cleanup; old names still work)
-- -----------------------------------------------------------------------------
alter index if exists public."League Info_pkey" rename to league_info_pkey;
alter index if exists public."League Info_league_name_key" rename to league_info_league_name_key;
alter index if exists public."Player_pkey" rename to player_pkey;
alter index if exists public."Game Results_pkey" rename to game_results_pkey;

alter table if exists public.player
  rename constraint "Player_id_league_fkey" to player_id_league_fkey;

-- -----------------------------------------------------------------------------
-- 3. Column defaults
-- -----------------------------------------------------------------------------
update public.league_info
set is_locked = false
where is_locked is null;

alter table public.league_info
  alter column is_locked set default false;

update public.player
set created_at = now()
where created_at is null;

alter table public.player
  alter column created_at set default now();

-- -----------------------------------------------------------------------------
-- 4. RLS — disable so service_role / server-side access is not blocked
--    (RLS was enabled with zero policies, which denied all non-bypass access)
-- -----------------------------------------------------------------------------
alter table public.league_info disable row level security;
alter table public.player disable row level security;
alter table public.game_results disable row level security;

commit;

-- -----------------------------------------------------------------------------
-- Verify (optional — run separately after commit)
-- -----------------------------------------------------------------------------
-- select tablename, rowsecurity from pg_tables where schemaname = 'public';
-- select table_name, column_name, column_default
-- from information_schema.columns
-- where table_schema = 'public'
--   and table_name in ('league_info', 'player', 'game_results')
--   and column_name in ('is_locked', 'created_at');
