# Sweepstakes 2026


## Intro

This is an internal sweepstakes application for the 2026 FIFA World Cup.

Players will be given two teams from the World Cup. This pair of teams will be unique to them (no other player will have this pair).
There are 48 teams in the World Cup; 2 teams for each player means 1128 unique combinations (the two teams in one player's pair are distinct). The order of teams in a pair does not matter: A,B = B,A

Working out for n teams: ((n - 1) * n) / 2

```
  A  B  C  D  E
A    .  .  .  .
B       .  .  . 
C          .  .
D             .
E
```

So in theory we could have up to 1128 players.

How well a player does will depend on how well their teams perform in the tournament.

3 points for a win.
1 point for a draw (applies at group stage only).
0 points for a loss.

If a game goes to penalties, then the team that wins the shootout / qualifies for the next round gets 3 points. The loser gets 0 points.

A player's score is the sum of both of their teams.


## Data

We'll use a Supabase database to store league data, player data and game results. Our application can then derive points allocated to team and players. We can then show a leaderboard summarising total points for every player.

World Cup teams will NOT have their own database table; they will be hardcoded on the server in `lib/teams.ts` (48 teams; keys are codes e.g. `GER`, `BRA`).

Database fields named `team_a` / `team_b` / `home_team` / `away_team` store keys from `TEAMS` (e.g. `GER`), not numeric foreign keys.

### Tables

Supabase table names: `league_info`, `player`, `game_results`. Server-only access via `SUPABASE_SERVICE_ROLE_KEY` (RLS enabled, no client policies).

```
----league_info----
id_league (primary key)
welcome_message: text
goodluck_message: text
info_message: text
league_name: text (unique globally)
password_hash: text
is_locked: boolean (when true, new player registration is blocked; anyone with the league name and password can still view the league table)

----player----
id_player (primary key)
id_league (foreign key → league_info)
player_name: text (unique per league)
password_hash: text
team_a: text (eg. 'GER')
team_b: text (eg. 'BRA')
normalised_pair: text (eg. 'BRA_GER' — min(team_a, team_b) + '_' + max(team_a, team_b) by team code)
is_admin: boolean
created_at

----game_results----
id_result
kick_off: datetime (kick off datetime BST)
stage: text (eg. 'Group B' | 'Semi Final')
home_team: text (eg. GER)
away_team: text (eg. SCO)
home_score: number
away_score: number
went_to_extra_time: boolean
home_penalties_score: number | null
away_penalties_score: number | null
```

- *Game results* are global across all leagues (same World Cup, same teams, league agnostic).


## Player setup

Because this is an internal / private application, we need to limit the number of players somehow.

To set up, I should be able to use a script that I can run locally, which sets up the league. From here I can supply data like the league name, password and text content specific to the league (welcome_message, goodluck_message, info_message) in a json file. This also means more than one league can be set up (for smaller non-work leagues and testing).

I can share the league name and password in a company chat. People can use them to access the application. They will be able to see the league table from here. Anyone with the league name and password will be able to view the table.

If users want to participate, they can register their player name and password, after which they will be assigned two different teams from the World Cup. This combination of two teams should be unique to the league. Their `id_player` is stored in local storage, which ensures they don't need to log in again.

### Team assignment (balanced spread)

Team assignment should spread teams evenly across players. Each team code’s **usage count** is how many times it appears on `team_a` / `team_b` for players in that league. Let **M** = the maximum usage count across all teams (0 if the league has no players yet).

Perfect balance (e.g. each of 48 teams exactly once when there are 24 players, or exactly twice when there are 48) only happens when final player count **N** makes `2N / 48` an integer (i.e. **N** is a multiple of 24). We do **not** require that; player count is not guaranteed to be a multiple of 24.

Instead, on register use a **max-count** rule: do not increase **M** until it is impossible to assign an unused pair without doing so.

1. Build the set of **unused** pairs: valid `(team_a, team_b)` from `TEAMS` with `team_a ≠ team_b`, normalised as `min + '_' + max`, excluding pairs already used in this `id_league`.
2. If the league has **no players yet**, pick any unused pair.
3. Else if any unused pair `(a, b)` has `count[a] < M` and `count[b] < M`, pick among those (tie-break: lowest `count[a] + count[b]`, then at random).
4. Else no unused pair keeps everyone below **M** — pick an unused pair that minimises `max(count[a] + 1, count[b] + 1)` after assignment; tie-break: lowest `count[a] + count[b]`, then at random.
5. Insert `team_a`, `team_b` in a transaction (`normalised_pair` is generated). On unique `normalised_pair` conflict, recompute counts and retry from step 1.

If there are no unused pairs left, registration fails (league has used all available pair slots for that size).

**Concurrency:** `normalised_pair` is unique per `id_league`. If two players register at once, the transaction + retry on conflict still applies.

Forgotten passwords shouldn't be an issue as users are not able to do anything once they're logged in- their team pair will have already been assigned. Anyone with the league name and password will already be able to view the table. Being logged in will show them their entry in the table highlighted.

To prevent abuse (if the league password is leaked), I should be able to lock the league from accepting any more players. I can do this manually in the database by setting `is_locked: true` (registration blocked; viewing the table with the league password still works).


## Game updates

We will have a separate FE path which is accessible by an admin (assigned to the database manually). From here, they can input match results.

Scoreline is final match score (including ET).

### Points derivation

The `stage` field is for display only (e.g. 'Group B', 'Semi Final'). Points are derived from scores and penalty fields, in this order:

1. If `home_penalties_score` and `away_penalties_score` are set: the side with the higher penalty score gets 3 points, the other gets 0. Regulation/ET goals in `home_score`/`away_score` still count toward GD; penalty shootout goals do not.
2. Else if `home_score > away_score`: home 3, away 0.
3. Else if `away_score > home_score`: away 3, home 0.
4. Else (`home_score === away_score` and no penalty fields): draw — both teams get 1 point.

| Situation                 | Maps to |
| ------------------------- | ------- |
| Group stage 1–1           | Rule 4 (draw) |
| Knockout, winner on pens  | Rule 1 (level scores + penalty fields) |
| Knockout, winner in ET/90 | Rule 2 or 3 (decisive scoreline) |

### Admin validation

When saving a match result, show a warning (do not block save) if scores are level, penalty fields are empty, and `stage` looks like a knockout round — e.g. `stage` contains 'Final', 'Semi', 'Quarter', 'Round of', or 'Last 16', or does not contain 'Group'.

Admin will be identified by is_admin on the player row. I'll assign this manually to the database.

Admin will have all regular player abilities (has a pair of teams and appears on leaderboard) as well as their ability to view the match result page and input scores.


## User journey

**Not logged into league + Not logged in as player**
- User (not logged in) visits site...
- sees league name and password inputs (rate limit incorrect tries by IP to stop brute force attacks)...
- enters valid league name and correct password...
- sees league table and log in/register links in nav bar (We store the id_league in their local storage so register/login knows which league- and prevents them from having to input league and password on every visit).

**Logged into league + Not logged in as player**
- Given a user can see the league table page (they have entered the league)...
- they click on the log in/register link...
- they are directed to the login page where they see inputs for player name, password and a link to register
- they click register...
- they are directed to the registration page where they see inputs for player name, password and confirm password...
- they provide valid player name and password...
- they then see the two World Cup teams they have been assigned, a goodluck message and a link back to the league table page (We store their id_player in local storage as an opaque UUID)


**Logged into league + Logged in as player**
- A user visits the site after previously logging into the league and registering as a player...
- They see the league table (the application remembers them due to id_league and id_player in local storage)

## Leaderboard

- Ties: We'll need to calculate goal difference for each team. We'll use the combined goal difference of the player's two teams to settle ties. If players are still tied after points and goal difference, they will have the same rank (this shouldn't be a problem later on in the tournament as more and more teams are knocked out).

- Goal difference: Per team: goals scored minus goals conceded across all recorded matches; penalty shootout goals don’t count toward GD.

- The leaderboard should show all information: player, team pairs (as flags), points, goal difference.

- Leaderboard lists all players for the current id_league, ranked by points then combined GD.


## Next steps

Progress tracker for implementation. Update **done?** as work completes.
- ✅ = "done"
- 🟡 = "in progress/partial"
- 🔴 = "not done"

| done? | Step | Notes |
| ----- | ---- | ----- |
| ✅ | Product spec | This document |
| ✅ | Supabase schema | Tables `league_info`, `player`, `game_results` |
| ✅ | DB constraints | `player_name` + `normalised_pair` unique per `id_league`; generated `normalised_pair`; `team_a_team_b_different`; FK; `league_name` unique |
| ✅ | DB defaults | `is_locked` default `false`; `created_at` default `now()` |
| ✅ | DB security | RLS enabled, no policies; `anon`/`authenticated` revoked; server uses service role only |
| ✅ | SQL scripts in repo | `supabase/scripts/` — dump, rename/fix, RLS lockdown |
| ✅ | `TEAMS` constant | `lib/teams.ts` — 48 teams |
| 🔴 | Server Supabase client | `createClient` with service role; never expose key to browser |
| 🔴 | Env setup | `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| 🔴 | Points + GD library | Implement rules in § Points derivation / Leaderboard from `game_results` |
| 🔴 | League setup script | Local script + JSON → insert into `league_info` (hash league password) |
| 🔴 | API: league login | Verify name/password; rate limit; set league session (`id_league`) |
| 🔴 | Balanced pair assignment | `lib/` helper implementing § Team assignment (max-count rule) |
| 🔴 | API: player register | Respect `is_locked`; balanced pair + retry on conflict; hash password |
| 🔴 | API: player login | Verify `player_name` + password; set player session (`id_player`) |
| 🔴 | API: leaderboard | Per `id_league`: players, flags, points, combined GD, ranks/ties |
| 🔴 | UI: league gate | League name + password form; store `id_league` (see session note below) |
| 🔴 | UI: league table | Leaderboard + nav (login/register); highlight row when player session present |
| 🔴 | UI: player register/login | Name, password, confirm; post-register team reveal + `goodluck_message` |
| 🔴 | UI: team reveal animation | Shuffle flags on register (pairs already assigned in DB) |
| 🔴 | Admin: match results page | CRUD `game_results`; knockout level-score warning per § Admin validation |
| 🔴 | Admin guard | Server checks `is_admin` on player row for admin routes |
| 🔴 | Session hardening (recommended) | Prefer signed httpOnly cookies over raw `localStorage` IDs for server trust |
| 🔴 | Optional DB index | `game_results(kick_off)` for matchday ordering |
| 🔴 | Deploy + smoke test | Vercel/hosting; end-to-end user journey § User journey |