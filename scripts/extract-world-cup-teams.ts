/**
 * Extract team fullName values from FIFA World Cup fixtures in BBC data.
 *
 * Usage:
 *   pnpm tsx scripts/extract-world-cup-teams.ts
 *   pnpm tsx scripts/extract-world-cup-teams.ts path/to/bbc-fixtures.json
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type Team = {
  fullName: string;
};

type Event = {
  home: Team;
  away: Team;
};

type SecondaryGroup = {
  events?: Event[];
};

type EventGroup = {
  displayLabel: string;
  secondaryGroups?: SecondaryGroup[];
};

type FixturesData = {
  eventGroups: EventGroup[];
};

function main() {
  const file =
    process.argv[2] ?? resolve(process.cwd(), 'data/bbc-fixtures.json');
  const data = JSON.parse(readFileSync(resolve(file), 'utf8')) as FixturesData;

  const worldCup = data.eventGroups.find(
    (group) => group.displayLabel === 'FIFA World Cup',
  );
  if (!worldCup) {
    console.error('No "FIFA World Cup" event group found');
    process.exit(1);
  }

  const teamNames = new Set<string>();

  for (const secondaryGroup of worldCup.secondaryGroups ?? []) {
    for (const event of secondaryGroup.events ?? []) {
      teamNames.add(event.home.fullName);
      teamNames.add(event.away.fullName);
    }
  }

  const sorted = [...teamNames].sort((a, b) => a.localeCompare(b));
  for (const name of sorted) {
    console.log(name);
  }
}

main();
