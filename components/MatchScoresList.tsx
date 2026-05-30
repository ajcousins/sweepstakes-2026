'use client';

import { TeamFlag } from '@/components/TeamFlag';
import type { MatchResultRow } from '@/lib/match-results';

type Props = {
  results: MatchResultRow[];
};

function formatKickOff(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function scoreSuffix(row: MatchResultRow) {
  const parts: string[] = [];
  if (row.went_to_extra_time) parts.push('ET');
  if (row.home_penalties_score != null && row.away_penalties_score != null) {
    parts.push(`Pens ${row.home_penalties_score}-${row.away_penalties_score}`);
  }
  return parts.length > 0 ? ` · ${parts.join(' · ')}` : '';
}

export function MatchScoresList({ results }: Props) {
  if (results.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-zinc-500">
        No matches played yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {results.map((row) => (
        <li
          key={row.id_result}
          className="border border-zinc-200 px-3 py-4 sm:px-4"
        >
          <p className="mb-3 text-xs text-zinc-500 sm:text-sm">
            {row.stage ?? 'Match'}
            {' · '}
            {formatKickOff(row.kick_off)}
            {scoreSuffix(row)}
          </p>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
            <div className="flex min-w-0 items-center justify-end gap-2">
              <span className="truncate text-right text-xs font-medium sm:text-sm">
                {row.home_team_name}
              </span>
              <TeamFlag teamCode={row.home_team} size="sm" />
            </div>
            <p className="px-1 text-center text-lg font-semibold tabular-nums sm:text-xl">
              {row.home_score} – {row.away_score}
            </p>
            <div className="flex min-w-0 items-center gap-2">
              <TeamFlag teamCode={row.away_team} size="sm" />
              <span className="truncate text-xs font-medium sm:text-sm">
                {row.away_team_name}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
