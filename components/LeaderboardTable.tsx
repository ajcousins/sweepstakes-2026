'use client';

import { TeamFlag } from '@/components/TeamFlag';

export type LeaderboardRowView = {
  id_player: string;
  player_name: string;
  team_a: string;
  team_b: string;
  team_a_flag: string;
  team_b_flag: string;
  team_a_name: string;
  team_b_name: string;
  points: number;
  goal_difference: number;
  rank: number;
};

type Props = {
  rows: LeaderboardRowView[];
  highlightPlayerId: string | null;
};

const thClass = 'px-2 py-2 font-medium sm:px-4 sm:py-3';
const tdClass = 'px-2 py-2 sm:px-4 sm:py-3';

export function LeaderboardTable({ rows, highlightPlayerId }: Props) {
  if (rows.length === 0) {
    return (
      <p className="border border-dashed border-zinc-300 px-4 py-8 text-center text-zinc-500">
        No players registered yet. Be the first to register.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-zinc-200">
      <table className="w-full table-fixed text-left text-sm">
        <colgroup>
          <col className="w-6" />
          <col className="w-20" />
          <col className="w-10 md:w-30" />
          <col className="w-10 md:w-12" />
          <col className="w-10 md:w-12" />
        </colgroup>
        <thead className="bg-zinc-100 text-zinc-600">
          <tr>
            <th className={thClass}>#</th>
            <th className={thClass}>Player</th>
            <th className={thClass}>Teams</th>
            <th className={`${thClass} text-right`}>Pts</th>
            <th className={`${thClass} text-right`}>GD</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const highlighted = row.id_player === highlightPlayerId;
            return (
              <tr
                key={row.id_player}
                className={
                  highlighted ? 'bg-primary-subtle' : 'border-t border-zinc-100'
                }
              >
                <td className={`${tdClass} tabular-nums`}>{row.rank}</td>
                <td className={`${tdClass} font-medium wrap-break-words`}>
                  {row.player_name}
                </td>
                <td className={tdClass}>
                  <span className="flex items-center gap-2 sm:gap-3">
                    <TeamFlag teamCode={row.team_a} showName size="sm" />
                    <TeamFlag teamCode={row.team_b} showName size="sm" />
                  </span>
                </td>
                <td className={`${tdClass} text-right tabular-nums font-semibold`}>
                  {row.points}
                </td>
                <td className={`${tdClass} text-right tabular-nums`}>
                  {row.goal_difference > 0 ? '+' : ''}
                  {row.goal_difference}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
