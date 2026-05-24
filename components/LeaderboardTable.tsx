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

export function LeaderboardTable({ rows, highlightPlayerId }: Props) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-zinc-500 dark:border-zinc-700">
        No players registered yet. Be the first to register.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Player</th>
            <th className="px-4 py-3 font-medium">Teams</th>
            <th className="px-4 py-3 font-medium text-right">Pts</th>
            <th className="px-4 py-3 font-medium text-right">GD</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const highlighted = row.id_player === highlightPlayerId;
            return (
              <tr
                key={row.id_player}
                className={
                  highlighted
                    ? 'bg-emerald-50 dark:bg-emerald-950/40'
                    : 'border-t border-zinc-100 dark:border-zinc-800'
                }
              >
                <td className="px-4 py-3 tabular-nums">{row.rank}</td>
                <td className="px-4 py-3 font-medium">{row.player_name}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex flex-wrap items-center gap-2">
                    <TeamFlag teamCode={row.team_a} showName size="sm" />
                    <span className="text-zinc-400">+</span>
                    <TeamFlag teamCode={row.team_b} showName size="sm" />
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold">
                  {row.points}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
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
