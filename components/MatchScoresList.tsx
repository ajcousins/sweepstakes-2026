'use client';

import { useState } from 'react';
import { TeamFlag } from '@/components/TeamFlag';
import { formatKickOffDisplay, type MatchResultRow } from '@/lib/match-results';

const RECENT_MATCH_LIMIT = 3;

type Props = {
  results: MatchResultRow[];
};

function scoreSuffix(row: MatchResultRow) {
  return row.went_to_extra_time ? ' · ET' : '';
}

function penaltiesResult(row: MatchResultRow) {
  const { home_penalties_score, away_penalties_score } = row;
  if (home_penalties_score == null || away_penalties_score == null) {
    return null;
  }

  if (home_penalties_score > away_penalties_score) {
    return {
      winnerName: row.home_team_name,
      winnerScore: home_penalties_score,
      loserScore: away_penalties_score,
    };
  }

  if (away_penalties_score > home_penalties_score) {
    return {
      winnerName: row.away_team_name,
      winnerScore: away_penalties_score,
      loserScore: home_penalties_score,
    };
  }

  return null;
}

function MatchScoreItem({ row }: { row: MatchResultRow }) {
  const pens = penaltiesResult(row);
  return (
    <li className="border border-zinc-200 px-3 py-4 sm:px-4">
      <p className="mb-3 text-xs text-zinc-500 sm:text-sm">
        {row.stage ?? 'Match'}
        {' · '}
        {formatKickOffDisplay(row.kick_off)}
        {scoreSuffix(row)}
      </p>
      <div>
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
        {pens && (
          <p className="mt-2 text-center text-xs text-zinc-600 sm:text-sm">
            <strong>{pens.winnerName}</strong> win {pens.winnerScore}-{pens.loserScore}{' '}
            on pens
          </p>
        )}
      </div>
    </li>
  );
}

export function MatchScoresList({ results }: Props) {
  const [showAll, setShowAll] = useState(false);

  if (results.length === 0) {
    return (
      <p className="border border-dashed border-zinc-300 px-4 py-8 text-center text-zinc-500">
        No matches played yet.
      </p>
    );
  }

  const canExpand = results.length > RECENT_MATCH_LIMIT;
  const visibleResults =
    showAll || !canExpand ? results : results.slice(0, RECENT_MATCH_LIMIT);

  return (
    <div>
      <ul className="flex flex-col gap-3">
        {visibleResults.map((row) => (
          <MatchScoreItem key={row.id_result} row={row} />
        ))}
      </ul>
      {canExpand && (
        <button
          type="button"
          className="cursor-pointer mt-3 font-normal border-b border-current text-sm"
          onClick={() => setShowAll((prev) => !prev)}
        >
          {showAll ? 'Show less' : 'Show all matches'}
        </button>
      )}
    </div>
  );
}
