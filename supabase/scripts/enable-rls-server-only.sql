-- Server-only database access for Next.js (service_role).
--
-- How this works:
-- - service_role (SUPABASE_SERVICE_ROLE_KEY on the server) bypasses RLS in Supabase.
-- - anon / authenticated (public anon key in the browser) are denied:
--     1. RLS enabled with no permissive policies → default deny
--     2. Table privileges revoked from anon / authenticated
--
-- Do NOT expose SUPABASE_SERVICE_ROLE_KEY to the client (no NEXT_PUBLIC_ prefix).
-- Use Route Handlers / Server Actions with createClient(url, serviceRoleKey).

begin;

-- -----------------------------------------------------------------------------
-- 1. Enable RLS (no policies = anon/authenticated cannot read or write rows)
-- -----------------------------------------------------------------------------
alter table public.league_info enable row level security;
alter table public.player enable row level security;
alter table public.game_results enable row level security;

-- -----------------------------------------------------------------------------
-- 2. Revoke direct API access for browser roles (belt-and-braces)
-- -----------------------------------------------------------------------------
revoke all on table public.league_info from anon, authenticated;
revoke all on table public.player from anon, authenticated;
revoke all on table public.game_results from anon, authenticated;

-- Keep schema usage so Supabase internals don't break; table access is still blocked.
grant usage on schema public to anon, authenticated;

commit;

-- -----------------------------------------------------------------------------
-- Verify (run separately)
-- -----------------------------------------------------------------------------
-- Dashboard: each table should show RLS enabled, no policies, "unrestricted" gone.
--
-- As a quick check, try from SQL editor using a role simulation is awkward;
-- instead test from the app: client with anon key should fail; server with
-- service_role should succeed.
