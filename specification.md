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

We'll use a Supabase database to store player data and game results. Our application can then derive points allocated to team and players. We can then show a leaderboard summarising total points for every player.

World Cup teams will NOT have their own database table; they will be hardcoded on the server in an object.

```js
export const TEAMS = {
  // GROUP A
  GER: { code: 'GER', name: 'Germany', flag: ':de:' }, // flag = emoji
  SCO: { code: 'SCO', name: 'Scotland', flag: ':flag-scotland:' },
  HUN: { code: 'HUN', name: 'Hungary', flag: ':flag-hu:' },
  SUI: { code: 'SUI', name: 'Switzerland', flag: ':flag-ch:' },
  // ... etc
}
```

Database fields named `*_team_id` store keys from `TEAMS` (e.g. `GER`), not numeric foreign keys.


## Player setup

Because this is an internal / private application, we need to limit the number of players somehow.

We can generate unique tokens which I can then dump in a company chat. People can take the tokens which they use when they visit the application. They input a token, their username (must be unique) and a password (which we'll hash in the database). We can use the tokens to key the players in the database. This token is also stored in their local storage so that they don't need to log in again.

If someone else uses a token that is taken, then they will be prompted for the password associated with that token to be able to access the application.

A server-side mint script generates unique tokens with pre-assigned team pairs and writes uninitialised rows to the database (see Game updates).

The player, once they have set up their user and have access to the application, will see the pair of teams they have been assigned. The pair of teams will be a different combination to any other player's pair.

To overcome the issue of pair assignment concurrency (if two people finish setting up at the same time) we should pre-assign pairs to tokens at mint time so there's no race condition. When the user registers, the UI will make it seem like the teams are assigned in real-time (some kind of animation that shuffles through country/team flags).



## Auth model

- Token: Opaque random string. 10 character length. Excluding ambiguous characters.
- Session can be local storage only. I'm ok with the token staying in local storage indefinitely.
- For forgotten passwords, the player will need to let me know their username. I will then delete their password hash from the database manually. When the player accesses the application again they will be prompted to enter a password, as if it's the first time accessing the application. Once their password is reset, they regain access to their user (same token, same teams, same username).
- Token leak. I'm ok with tokens leaking from the chat. I will need a way (from the admin UI) to create new tokens (writing them to the DB), retrieve unused tokens, and delete unused tokens.


## Game updates

We will have a separate FE path which is accessible by an admin (assigned to the database manually). From here, they can input match results. This means there will need to be a separate table for results: date (yyyy-mm-dd, for easy sorting) home_team_id, away_team_id, scoreline, result (home_win | away_win | draw).

Scoreline is final match score (including ET).

| Situation                 | Result               | Notes                         |
| ------------------------- | -------------------- | ----------------------------- |
| Group stage 1–1           | draw                 | Both teams +1 in points       |
| Knockout, winner on pens  | home_win or away_win | Winner +3, loser +0; not draw |
| Knockout, winner in ET/90 | home_win / away_win  | As normal                     |

Admin will be identified by is_admin on the player row. I'll assign this manually to the database.

Admin will have all regular player abilities (uses a token, has a pair of teams and appears on leaderboard).

That mint script can be run with a specified number of tokens to write to the database. Tokens land as uninitialised players (they won't appear in the leaderboard table). An uninitialised row ought to be just { token, team_a_id, team_b_id }. When generating tokens, we'll need to pull all initialised and uninitialised players to ensure no duplicate pairs.


## User journey

- Admin runs token script → posts tokens → colleague opens app → enters token/name/password → sees their teams + leaderboard → admin updates scores after each matchday.


## Leaderboard

- Ties: We'll need to calculate goal difference for each team. We'll use the combined goal difference of the player's two teams to settle ties. If players are still tied after points and goal difference, they will have the same rank (this shouldn't be a problem later on in the tournament as more and more teams are knocked out).

- Goal difference: Per team: goals scored minus goals conceded across all recorded matches; penalty shootout goals don’t count toward GD.

- The leaderboard should show all information: username, team pairs (as flags), points, goal difference.

- The leaderboard should only show initialised players.

