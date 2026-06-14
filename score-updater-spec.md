# Score Updater Service for Sweepstakes 2026


## Intro
This is a script that fetches completed FIFA 2026 World Cup matches from BBC Sport and inserts new scores into Supabase.

It will take relevant scores from matches and update the Supabase table for the Sweepstakes app.

Only **new** completed matches are inserted. Rows already in `game_results` (including manual admin entries) are left unchanged.

## Running locally

```bash
pnpm update-scores --dry-run --fixtures data/bbc-sample-completed.json
pnpm update-scores --dry-run
pnpm update-scores
```

Flags:

- `--dry-run` — log what would be inserted; no Supabase writes
- `--fixtures <path>` — use local BBC JSON instead of the live API
- `--date YYYY-MM-DD` — fetch a single date (live API)
- `--days N` — look back N days including today (default `2`)

Requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (unless `--dry-run --fixtures`).

## Admin page

Admins can trigger a score sync from the app at **`/admin/update-scores`**.

- Requires league login, player login, and `is_admin` on the player row (same as `/admin/matches`).
- Click **Update scores** to fetch BBC data and insert new completed matches.
- The page shows the same log output as the CLI (per-match inserts + summary).

## GitHub Actions

Workflow: [`.github/workflows/update-scores.yml`](.github/workflows/update-scores.yml)

- Runs **every hour** at **:13 UTC** on the default branch (`13 * * * *`)
- Can also be triggered manually: Actions → **Update scores** → **Run workflow**
- Repo credentials (Settings → Secrets and variables → Actions):
  - `NEXT_PUBLIC_SUPABASE_URL` — **Repository secret** or **Repository variable** (public URL)
  - `SUPABASE_SERVICE_ROLE_KEY` — **Repository secret** only (never a variable)

Use **Repository secrets** (or variables for the URL), not **Environment secrets**. This workflow does not set a GitHub `environment`, so environment-scoped secrets are not available.

If the repo is in an organisation, you may need to **authorize** secrets for Actions (SSO / repository access policy).

Scheduled runs only execute on the repository default branch (e.g. `main`).

## Apendix

### Example response from pubic source API
```js
// https://web-cdn.api.bbci.co.uk/wc-poll-data/container/sport-data-scores-fixtures?selectedEndDate=2026-06-12&selectedStartDate=2026-06-12&todayDate=2026-06-12&urn=urn%3Abbc%3Asportsdata%3Afootball%3Atournament-collection%3Acollated

{
  "eventGroups": [
    {
      "displayLabel": "FIFA World Cup",
      "displayLabelOnwardJourneyPath": "/sport/football/world-cup/table",
      "secondaryGroups": [
        {
          "displayLabel": "Group A",
          "events": [
            {
              "home": {
                "id": "1yghbv1c71b37eenutbwnvvq",
                "fullName": "South Korea",
                "shortName": "South Korea",
                "urn": "urn:bbc:sportsdata:football:team:south-korea",
                "actions": []
              },
              "away": {
                "id": "70tnqyqn871jwlk26gtjw7knm",
                "fullName": "Czech Republic",
                "shortName": "Czech Republic",
                "urn": "urn:bbc:sportsdata:football:team:czech-republic",
                "actions": []
              },
              "id": "s-9hjlhmip7tn4qgpwr47txpafo",
              "urn": "urn:bbc:sportsdata:football:event:s-9hjlhmip7tn4qgpwr47txpafo",
              "eventGroupingLabel": "World - FIFA World Cup - Group Stage - Group A",
              "startDateTime": "2026-06-12T02:00:00Z",
              "tournamentId": "70excpe1synn9kadnbppahdn7",
              "date": {
                "iso": "2026-06-12T02:00:00Z",
                "time": "03:00",
                "shortDate": "Fri 12 Jun",
                "longDate": "Friday 12th June 2026",
                "dayOfWeek": "Fri",
                "day": "12",
                "month": "June",
                "shortMonth": "Jun",
                "year": "2026",
                "isoDate": "2026-06-12"
              },
              "periodLabel": {
                "value": "Scheduled",
                "accessible": "Scheduled"
              },
              "time": {
                "accessibleTime": "03:00",
                "displayTimeUK": "03:00",
                "timeCertainty": true
              },
              "status": "PreEvent",
              "statusComment": {
                "value": "Scheduled",
                "accessible": "Scheduled"
              },
              "participants": [
                {
                  "id": "1yghbv1c71b37eenutbwnvvq",
                  "urn": "urn:bbc:sportsdata:football:team:south-korea",
                  "name": {
                    "fullName": "South Korea",
                    "shortName": "South Korea"
                  },
                  "alignment": "home"
                },
                {
                  "id": "70tnqyqn871jwlk26gtjw7knm",
                  "urn": "urn:bbc:sportsdata:football:team:czech-republic",
                  "name": {
                    "fullName": "Czech Republic",
                    "shortName": "Czech Republic"
                  },
                  "alignment": "away"
                }
              ],
              "headToHeadDetailLabel": "World - FIFA World Cup - Group Stage - Group A",
              "tournament": {
                "id": "70excpe1synn9kadnbppahdn7",
                "name": "FIFA World Cup",
                "disambiguatedName": "FIFA World Cup",
                "urn": "urn:bbc:sportsdata:football:tournament:world-cup",
                "thingsGuid": "de6a07ff-47ff-4551-9b71-7494a71aceac"
              },
              "stage": {
                "id": "87i5eesbymvgzmz5d0y4a855g",
                "name": "Group Stage",
                "urn": ""
              },
              "round": {
                "id": "87loxnvgbo667kpp36890i9sk",
                "name": "Group A",
                "urn": ""
              },
              "tipoTopicId": "ckg0vvrg70vt",
              "onwardJourneyLink": "/sport/football/live/ckg0vvrg70vt",
              "accessibleEventSummary": "South Korea versus Czech Republic kick off 03:00",
              "hasStandings": true
            }
          ]
        },
        {
          "displayLabel": "Group B",
          "events": [
            {
              "home": {
                "id": "eg7vduna0h3vis1wd47s41za7",
                "fullName": "Canada",
                "shortName": "Canada",
                "urn": "urn:bbc:sportsdata:football:team:canada",
                "actions": []
              },
              "away": {
                "id": "o5iztj2zl6b0v6ed9q5m7p1k",
                "fullName": "Bosnia-Herzegovina",
                "shortName": "Bosnia",
                "urn": "urn:bbc:sportsdata:football:team:bosnia-herzegovina",
                "actions": []
              },
              "id": "s-y1ow9ht5baxn64i01hq9moes",
              "urn": "urn:bbc:sportsdata:football:event:s-y1ow9ht5baxn64i01hq9moes",
              "eventGroupingLabel": "World - FIFA World Cup - Group Stage - Group B",
              "startDateTime": "2026-06-12T19:00:00Z",
              "tournamentId": "70excpe1synn9kadnbppahdn7",
              "date": {
                "iso": "2026-06-12T19:00:00Z",
                "time": "20:00",
                "shortDate": "Fri 12 Jun",
                "longDate": "Friday 12th June 2026",
                "dayOfWeek": "Fri",
                "day": "12",
                "month": "June",
                "shortMonth": "Jun",
                "year": "2026",
                "isoDate": "2026-06-12"
              },
              "periodLabel": {
                "value": "Scheduled",
                "accessible": "Scheduled"
              },
              "time": {
                "accessibleTime": "20:00",
                "displayTimeUK": "20:00",
                "timeCertainty": true
              },
              "status": "PreEvent",
              "statusComment": {
                "value": "Scheduled",
                "accessible": "Scheduled"
              },
              "participants": [
                {
                  "id": "eg7vduna0h3vis1wd47s41za7",
                  "urn": "urn:bbc:sportsdata:football:team:canada",
                  "name": {
                    "fullName": "Canada",
                    "shortName": "Canada"
                  },
                  "alignment": "home"
                },
                {
                  "id": "o5iztj2zl6b0v6ed9q5m7p1k",
                  "urn": "urn:bbc:sportsdata:football:team:bosnia-herzegovina",
                  "name": {
                    "fullName": "Bosnia-Herzegovina",
                    "shortName": "Bosnia"
                  },
                  "alignment": "away"
                }
              ],
              "headToHeadDetailLabel": "World - FIFA World Cup - Group Stage - Group B",
              "tournament": {
                "id": "70excpe1synn9kadnbppahdn7",
                "name": "FIFA World Cup",
                "disambiguatedName": "FIFA World Cup",
                "urn": "urn:bbc:sportsdata:football:tournament:world-cup",
                "thingsGuid": "de6a07ff-47ff-4551-9b71-7494a71aceac"
              },
              "stage": {
                "id": "87i5eesbymvgzmz5d0y4a855g",
                "name": "Group Stage",
                "urn": ""
              },
              "round": {
                "id": "87mssi90kfbu5uxsmbcqw23h0",
                "name": "Group B",
                "urn": ""
              },
              "tipoTopicId": "c1dy55edn2yt",
              "accessibleEventSummary": "Canada versus Bosnia-Herzegovina kick off 20:00",
              "hasStandings": true
            }
          ]
        }
      ]
    },
    {
      "displayLabel": "Irish Premier Division",
      "displayLabelOnwardJourneyPath": "/sport/football/league-of-ireland-premier/table",
      "secondaryGroups": [
        {
          "displayLabel": null,
          "events": [
            {
              "home": {
                "id": "90mig1t9vpe2a8ckksz0oo29g",
                "fullName": "Derry City",
                "shortName": "Derry",
                "actions": []
              },
              "away": {
                "id": "7qeeszxk0dy7hdvml7julotl",
                "fullName": "Bohemians",
                "shortName": "Bohemians",
                "actions": []
              },
              "id": "s-elzn2crv4m4p78gjvaawouz9w",
              "urn": "urn:bbc:sportsdata:football:event:s-elzn2crv4m4p78gjvaawouz9w",
              "eventGroupingLabel": "Republic of Ireland - Irish Premier Division",
              "startDateTime": "2026-06-12T18:45:00Z",
              "tournamentId": "4mbfidy8zum5u0aqjqo0vuqs2",
              "date": {
                "iso": "2026-06-12T18:45:00Z",
                "time": "19:45",
                "shortDate": "Fri 12 Jun",
                "longDate": "Friday 12th June 2026",
                "dayOfWeek": "Fri",
                "day": "12",
                "month": "June",
                "shortMonth": "Jun",
                "year": "2026",
                "isoDate": "2026-06-12"
              },
              "periodLabel": {
                "value": "Scheduled",
                "accessible": "Scheduled"
              },
              "time": {
                "accessibleTime": "19:45",
                "displayTimeUK": "19:45",
                "timeCertainty": true
              },
              "status": "PreEvent",
              "statusComment": {
                "value": "Scheduled",
                "accessible": "Scheduled"
              },
              "participants": [
                {
                  "id": "90mig1t9vpe2a8ckksz0oo29g",
                  "name": {
                    "fullName": "Derry City",
                    "shortName": "Derry"
                  },
                  "alignment": "home"
                },
                {
                  "id": "7qeeszxk0dy7hdvml7julotl",
                  "name": {
                    "fullName": "Bohemians",
                    "shortName": "Bohemians"
                  },
                  "alignment": "away"
                }
              ],
              "headToHeadDetailLabel": "Republic of Ireland - Irish Premier Division",
              "tournament": {
                "id": "4mbfidy8zum5u0aqjqo0vuqs2",
                "name": "Irish Premier Division",
                "disambiguatedName": "Irish Premier Division",
                "urn": "urn:bbc:sportsdata:football:tournament:league-of-ireland-premier",
                "thingsGuid": "7dd1ef4f-d66b-4987-8638-312dc3db2058"
              },
              "tipoTopicId": "cdjkee9jlvyt",
              "onwardJourneyLink": "/sport/football/live/cdjkee9jlvyt",
              "accessibleEventSummary": "Derry City versus Bohemians kick off 19:45",
              "hasStandings": true
            },
            {
              "home": {
                "id": "alcqlgraa5a5t57uee3wgy2kd",
                "fullName": "Galway United",
                "shortName": "Galway Utd",
                "actions": []
              },
              "away": {
                "id": "436hohrrikc4zq7qgoquszrfq",
                "fullName": "Dundalk",
                "shortName": "Dundalk",
                "actions": []
              },
              "id": "s-emjsynt60ikjowi3oub8hrrpw",
              "urn": "urn:bbc:sportsdata:football:event:s-emjsynt60ikjowi3oub8hrrpw",
              "eventGroupingLabel": "Republic of Ireland - Irish Premier Division",
              "startDateTime": "2026-06-12T18:45:00Z",
              "tournamentId": "4mbfidy8zum5u0aqjqo0vuqs2",
              "date": {
                "iso": "2026-06-12T18:45:00Z",
                "time": "19:45",
                "shortDate": "Fri 12 Jun",
                "longDate": "Friday 12th June 2026",
                "dayOfWeek": "Fri",
                "day": "12",
                "month": "June",
                "shortMonth": "Jun",
                "year": "2026",
                "isoDate": "2026-06-12"
              },
              "periodLabel": {
                "value": "Scheduled",
                "accessible": "Scheduled"
              },
              "time": {
                "accessibleTime": "19:45",
                "displayTimeUK": "19:45",
                "timeCertainty": true
              },
              "status": "PreEvent",
              "statusComment": {
                "value": "Scheduled",
                "accessible": "Scheduled"
              },
              "participants": [
                {
                  "id": "alcqlgraa5a5t57uee3wgy2kd",
                  "name": {
                    "fullName": "Galway United",
                    "shortName": "Galway Utd"
                  },
                  "alignment": "home"
                },
                {
                  "id": "436hohrrikc4zq7qgoquszrfq",
                  "name": {
                    "fullName": "Dundalk",
                    "shortName": "Dundalk"
                  },
                  "alignment": "away"
                }
              ],
              "headToHeadDetailLabel": "Republic of Ireland - Irish Premier Division",
              "tournament": {
                "id": "4mbfidy8zum5u0aqjqo0vuqs2",
                "name": "Irish Premier Division",
                "disambiguatedName": "Irish Premier Division",
                "urn": "urn:bbc:sportsdata:football:tournament:league-of-ireland-premier",
                "thingsGuid": "7dd1ef4f-d66b-4987-8638-312dc3db2058"
              },
              "tipoTopicId": "cvg7ll5g53jt",
              "onwardJourneyLink": "/sport/football/live/cvg7ll5g53jt",
              "accessibleEventSummary": "Galway United versus Dundalk kick off 19:45",
              "hasStandings": true
            },
            {
              "home": {
                "id": "1bb2bbjq1gdsq3qqlh3c6rxs7",
                "fullName": "St Patrick's Athletic",
                "shortName": "St Pat's",
                "actions": []
              },
              "away": {
                "id": "fd8o1pvys32969sd8d46sycp",
                "fullName": "Drogheda United",
                "shortName": "Drogheda",
                "actions": []
              },
              "id": "s-ennx54hda8mxp5e5zkcpdp1qs",
              "urn": "urn:bbc:sportsdata:football:event:s-ennx54hda8mxp5e5zkcpdp1qs",
              "eventGroupingLabel": "Republic of Ireland - Irish Premier Division",
              "startDateTime": "2026-06-12T18:45:00Z",
              "tournamentId": "4mbfidy8zum5u0aqjqo0vuqs2",
              "date": {
                "iso": "2026-06-12T18:45:00Z",
                "time": "19:45",
                "shortDate": "Fri 12 Jun",
                "longDate": "Friday 12th June 2026",
                "dayOfWeek": "Fri",
                "day": "12",
                "month": "June",
                "shortMonth": "Jun",
                "year": "2026",
                "isoDate": "2026-06-12"
              },
              "periodLabel": {
                "value": "Scheduled",
                "accessible": "Scheduled"
              },
              "time": {
                "accessibleTime": "19:45",
                "displayTimeUK": "19:45",
                "timeCertainty": true
              },
              "status": "PreEvent",
              "statusComment": {
                "value": "Scheduled",
                "accessible": "Scheduled"
              },
              "participants": [
                {
                  "id": "1bb2bbjq1gdsq3qqlh3c6rxs7",
                  "name": {
                    "fullName": "St Patrick's Athletic",
                    "shortName": "St Pat's"
                  },
                  "alignment": "home"
                },
                {
                  "id": "fd8o1pvys32969sd8d46sycp",
                  "name": {
                    "fullName": "Drogheda United",
                    "shortName": "Drogheda"
                  },
                  "alignment": "away"
                }
              ],
              "headToHeadDetailLabel": "Republic of Ireland - Irish Premier Division",
              "tournament": {
                "id": "4mbfidy8zum5u0aqjqo0vuqs2",
                "name": "Irish Premier Division",
                "disambiguatedName": "Irish Premier Division",
                "urn": "urn:bbc:sportsdata:football:tournament:league-of-ireland-premier",
                "thingsGuid": "7dd1ef4f-d66b-4987-8638-312dc3db2058"
              },
              "tipoTopicId": "c23ykkm310et",
              "onwardJourneyLink": "/sport/football/live/c23ykkm310et",
              "accessibleEventSummary": "St Patrick's Athletic versus Drogheda United kick off 19:45",
              "hasStandings": true
            },
            {
              "home": {
                "id": "1du12fqlr6kjdnrkrao4diwt1",
                "fullName": "Waterford",
                "shortName": "Waterford",
                "actions": []
              },
              "away": {
                "id": "aohs75l7e949y8lxxwoa44agb",
                "fullName": "Sligo Rovers",
                "shortName": "Sligo",
                "actions": []
              },
              "id": "s-eo7d7jcwnd1fza83gjk5zrh1w",
              "urn": "urn:bbc:sportsdata:football:event:s-eo7d7jcwnd1fza83gjk5zrh1w",
              "eventGroupingLabel": "Republic of Ireland - Irish Premier Division",
              "startDateTime": "2026-06-12T18:45:00Z",
              "tournamentId": "4mbfidy8zum5u0aqjqo0vuqs2",
              "date": {
                "iso": "2026-06-12T18:45:00Z",
                "time": "19:45",
                "shortDate": "Fri 12 Jun",
                "longDate": "Friday 12th June 2026",
                "dayOfWeek": "Fri",
                "day": "12",
                "month": "June",
                "shortMonth": "Jun",
                "year": "2026",
                "isoDate": "2026-06-12"
              },
              "periodLabel": {
                "value": "Scheduled",
                "accessible": "Scheduled"
              },
              "time": {
                "accessibleTime": "19:45",
                "displayTimeUK": "19:45",
                "timeCertainty": true
              },
              "status": "PreEvent",
              "statusComment": {
                "value": "Scheduled",
                "accessible": "Scheduled"
              },
              "participants": [
                {
                  "id": "1du12fqlr6kjdnrkrao4diwt1",
                  "name": {
                    "fullName": "Waterford",
                    "shortName": "Waterford"
                  },
                  "alignment": "home"
                },
                {
                  "id": "aohs75l7e949y8lxxwoa44agb",
                  "name": {
                    "fullName": "Sligo Rovers",
                    "shortName": "Sligo"
                  },
                  "alignment": "away"
                }
              ],
              "headToHeadDetailLabel": "Republic of Ireland - Irish Premier Division",
              "tournament": {
                "id": "4mbfidy8zum5u0aqjqo0vuqs2",
                "name": "Irish Premier Division",
                "disambiguatedName": "Irish Premier Division",
                "urn": "urn:bbc:sportsdata:football:tournament:league-of-ireland-premier",
                "thingsGuid": "7dd1ef4f-d66b-4987-8638-312dc3db2058"
              },
              "tipoTopicId": "cvgdxxqg4q0t",
              "onwardJourneyLink": "/sport/football/live/cvgdxxqg4q0t",
              "accessibleEventSummary": "Waterford versus Sligo Rovers kick off 19:45",
              "hasStandings": true
            },
            {
              "home": {
                "id": "7e5odtzvbyx4ubpzwyphao0sv",
                "fullName": "Shelbourne",
                "shortName": "Shelbourne",
                "actions": []
              },
              "away": {
                "id": "51xekmm31jztuvdliya7idg5d",
                "fullName": "Shamrock Rovers",
                "shortName": "Shamrock",
                "urn": "urn:bbc:sportsdata:football:team:shamrock-rovers",
                "actions": []
              },
              "id": "s-en4957tfbb8g5jbwxqp7hal1w",
              "urn": "urn:bbc:sportsdata:football:event:s-en4957tfbb8g5jbwxqp7hal1w",
              "eventGroupingLabel": "Republic of Ireland - Irish Premier Division",
              "startDateTime": "2026-06-12T19:00:00Z",
              "tournamentId": "4mbfidy8zum5u0aqjqo0vuqs2",
              "date": {
                "iso": "2026-06-12T19:00:00Z",
                "time": "20:00",
                "shortDate": "Fri 12 Jun",
                "longDate": "Friday 12th June 2026",
                "dayOfWeek": "Fri",
                "day": "12",
                "month": "June",
                "shortMonth": "Jun",
                "year": "2026",
                "isoDate": "2026-06-12"
              },
              "periodLabel": {
                "value": "Scheduled",
                "accessible": "Scheduled"
              },
              "time": {
                "accessibleTime": "20:00",
                "displayTimeUK": "20:00",
                "timeCertainty": true
              },
              "status": "PreEvent",
              "statusComment": {
                "value": "Scheduled",
                "accessible": "Scheduled"
              },
              "participants": [
                {
                  "id": "7e5odtzvbyx4ubpzwyphao0sv",
                  "name": {
                    "fullName": "Shelbourne",
                    "shortName": "Shelbourne"
                  },
                  "alignment": "home"
                },
                {
                  "id": "51xekmm31jztuvdliya7idg5d",
                  "urn": "urn:bbc:sportsdata:football:team:shamrock-rovers",
                  "name": {
                    "fullName": "Shamrock Rovers",
                    "shortName": "Shamrock"
                  },
                  "alignment": "away"
                }
              ],
              "headToHeadDetailLabel": "Republic of Ireland - Irish Premier Division",
              "tournament": {
                "id": "4mbfidy8zum5u0aqjqo0vuqs2",
                "name": "Irish Premier Division",
                "disambiguatedName": "Irish Premier Division",
                "urn": "urn:bbc:sportsdata:football:tournament:league-of-ireland-premier",
                "thingsGuid": "7dd1ef4f-d66b-4987-8638-312dc3db2058"
              },
              "tipoTopicId": "cn0733505z1t",
              "onwardJourneyLink": "/sport/football/live/cn0733505z1t",
              "accessibleEventSummary": "Shelbourne versus Shamrock Rovers kick off 20:00",
              "hasStandings": true
            }
          ]
        }
      ]
    }
  ],
  "sport": "football",
  "selectedStartDate": "2026-06-12",
  "selectedEndDate": "2026-06-12",
  "shouldShowScorersButton": false,
  "urn": "urn:bbc:sportsdata:football:tournament-collection:collated",
  "maximumScoreDigits": 1
}
```


