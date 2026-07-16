export type CompetitionFinishedPlayer = {
  id_player: string;
  player_name: string;
  team_a: string;
  team_b: string;
  rank: number;
};

/** Natural-language list: Alice | Alice and Bob | Alice, Bob and Charlie */
export function formatNameList(names: string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0]!;
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

export function formatCompetitionFinishedMessage(
  rows: CompetitionFinishedPlayer[],
  winningTeam: string,
): string {
  const winners = rows.filter((r) => r.rank === 1);
  const winnerIds = new Set(winners.map((r) => r.id_player));

  const teamHolders = rows.filter(
    (r) =>
      !winnerIds.has(r.id_player) &&
      (r.team_a === winningTeam || r.team_b === winningTeam),
  );

  const congrats = `Congratulations to ${formatNameList(winners.map((r) => r.player_name))} 🎉!`;

  if (teamHolders.length === 0) {
    return congrats;
  }

  return `${congrats} Kudos also to ${formatNameList(teamHolders.map((r) => r.player_name))} ⭐!`;
}
