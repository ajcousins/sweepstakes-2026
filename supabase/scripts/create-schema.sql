-- Create sweepstakes tables on a fresh Supabase project (test/staging).
-- Generated from supabase/scripts/sweepstakes_dump.csv (production dump).
-- Source of truth: production dump — not specification.md.
--
-- Run order:
--   1. This file (creates tables, constraints, indexes)
--   2. enable-rls-server-only.sql (RLS + revoke anon/authenticated)
--
-- Do NOT run fix-schema-rls-and-rename.sql on a new project.

begin;

-- -----------------------------------------------------------------------------
-- league_info (no dependencies)
-- -----------------------------------------------------------------------------
create table public.league_info (
  id_league uuid not null default gen_random_uuid(),
  welcome_message text,
  goodluck_message text,
  info_message text,
  league_name text not null,
  password_hash text not null,
  is_locked boolean not null default false,
  title text,
  constraint league_info_pkey primary key (id_league),
  constraint league_info_league_name_key unique (league_name)
);

-- -----------------------------------------------------------------------------
-- player (depends on league_info)
-- -----------------------------------------------------------------------------
create table public.player (
  id_player uuid not null default gen_random_uuid(),
  id_league uuid not null,
  player_name text not null,
  password_hash text not null,
  team_a text not null,
  team_b text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  normalised_pair text generated always as (
    (least(team_a, team_b) || '_'::text) || greatest(team_a, team_b)
  ) stored,
  constraint player_pkey primary key (id_player),
  constraint player_id_league_fkey
    foreign key (id_league) references public.league_info (id_league),
  constraint player_name_unique_per_league
    unique (id_league, player_name),
  constraint player_pair_unique_per_league
    unique (id_league, normalised_pair)
);

-- team_a_team_b_different exists on production (see sweepstakes_dump.csv) but the
-- CSV export had no definition. Re-run dump-schema.sql on production and add the
-- exact CHECK from the constraint row, e.g.:
--   alter table public.player add constraint team_a_team_b_different check (...);

-- -----------------------------------------------------------------------------
-- game_results (no FK dependencies)
-- -----------------------------------------------------------------------------
create table public.game_results (
  id_result uuid not null default gen_random_uuid(),
  kick_off timestamptz not null default now(),
  stage text,
  home_team text not null,
  away_team text not null,
  home_score numeric not null,
  away_score numeric not null,
  went_to_extra_time boolean not null default false,
  home_penalties_score numeric,
  away_penalties_score numeric,
  constraint game_results_pkey primary key (id_result)
);

commit;
