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
  winningTeam: string | null;
};

const thClass =
  'sticky top-0 z-10 bg-zinc-100 px-2 py-2 font-medium shadow-[0_1px_0_0_rgb(228_228_231)] sm:px-4 sm:py-3';
const tdClass = 'px-2 py-2 sm:px-4 sm:py-3';

export function LeaderboardTable({
  rows,
  highlightPlayerId,
  winningTeam,
}: Props) {
  if (rows.length === 0) {
    return (
      <p className="border border-dashed border-zinc-300 px-4 py-8 text-center text-zinc-500">
        No players registered yet. Be the first to register.
      </p>
    );
  }

  const competitionFinished = winningTeam != null;

  return (
    <div className="border border-zinc-200">
      <table className="w-full table-fixed text-left text-sm">
        <colgroup>
          <col className="w-6" />
          <col className="md:w-20 w-15" />
          <col className="w-16 sm:w-36 md:w-48" />
          <col className="md:w-12 w-8" />
          <col className="md:w-12 w-8" />
        </colgroup>
        <thead className="text-zinc-600">
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
            const isChampion = competitionFinished && row.rank === 1;
            const highlighted = row.id_player === highlightPlayerId;
            const rowClass = isChampion
              ? 'bg-champion-subtle text-champion-ink'
              : highlighted
                ? 'bg-primary-subtle'
                : 'border-t border-zinc-100';
            return (
              <tr key={row.id_player} className={rowClass}>
                <td
                  className={`${tdClass} tabular-nums ${isChampion ? 'font-bold' : ''}`}
                >
                  {isChampion ? 'C' : row.rank}
                </td>
                <td className={`${tdClass} text-xs sm:text-sm font-normal wrap-break-words`}>
                  {row.player_name}
                </td>
                <td className={tdClass}>
                  <span className="flex items-center gap-3 sm:gap-4">
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
