import type { BbcFixturesResponse } from '@/lib/bbc-scores/types';

const BBC_FIXTURES_BASE =
  'https://web-cdn.api.bbci.co.uk/wc-poll-data/container/sport-data-scores-fixtures';

const BBC_URN =
  'urn%3Abbc%3Asportsdata%3Afootball%3Atournament-collection%3Acollated';

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function dateRange(days: number, endDate = new Date()): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(endDate);
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(formatDate(d));
  }
  return dates;
}

export async function fetchBbcFixturesForDate(
  isoDate: string,
): Promise<BbcFixturesResponse> {
  const params = new URLSearchParams({
    selectedEndDate: isoDate,
    selectedStartDate: isoDate,
    todayDate: isoDate,
    urn: decodeURIComponent(BBC_URN),
  });

  const url = `${BBC_FIXTURES_BASE}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`BBC API error for ${isoDate}: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as BbcFixturesResponse;
}

export async function fetchBbcFixtures(
  startDate: string,
  endDate: string,
): Promise<BbcFixturesResponse> {
  if (startDate === endDate) {
    return fetchBbcFixturesForDate(startDate);
  }

  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const merged: BbcFixturesResponse = { eventGroups: [] };
  const eventIds = new Set<string>();

  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const day = formatDate(d);
    const data = await fetchBbcFixturesForDate(day);
    for (const group of data.eventGroups) {
      let targetGroup = merged.eventGroups.find(
        (g) => g.displayLabel === group.displayLabel,
      );
      if (!targetGroup) {
        targetGroup = { displayLabel: group.displayLabel, secondaryGroups: [] };
        merged.eventGroups.push(targetGroup);
      }
      for (const sg of group.secondaryGroups ?? []) {
        let targetSg = targetGroup.secondaryGroups?.find(
          (s) => s.displayLabel === sg.displayLabel,
        );
        if (!targetSg) {
          targetSg = { displayLabel: sg.displayLabel, events: [] };
          targetGroup.secondaryGroups = targetGroup.secondaryGroups ?? [];
          targetGroup.secondaryGroups.push(targetSg);
        }
        for (const event of sg.events ?? []) {
          const id = `${event.startDateTime}:${event.home.fullName}:${event.away.fullName}`;
          if (!eventIds.has(id)) {
            eventIds.add(id);
            targetSg.events = targetSg.events ?? [];
            targetSg.events.push(event);
          }
        }
      }
    }
  }

  return merged;
}
