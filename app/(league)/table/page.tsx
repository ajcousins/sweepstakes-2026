import { Button } from '@/components/ui/Button';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { MatchScoresList } from '@/components/MatchScoresList';
import { fetchLeaderboard } from '@/lib/leaderboard-service';
import { fetchMatchResults } from '@/lib/match-results-service';
import { getLeagueSession, getPlayerSession } from '@/lib/session';

export default async function TablePage() {
  const idLeague = await getLeagueSession();
  if (!idLeague) {
    return null;
  }

  const playerSession = await getPlayerSession();
  const highlightPlayerId =
    playerSession?.id_league === idLeague ? playerSession.id_player : null;

  const [{ rows, info_message }, matchResults] = await Promise.all([
    fetchLeaderboard(idLeague),
    fetchMatchResults(),
  ]);

  const playerLoggedIn = highlightPlayerId != null;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      {!playerLoggedIn && (
        <Button href="/register" className="mb-6 px-6">
          Join league
        </Button>
      )}
      <h1 className="mb-2 text-2xl font-bold">League table</h1>
      {info_message && (
        <p className="mb-6 text-sm text-zinc-600">{info_message}</p>
      )}
      <LeaderboardTable rows={rows} highlightPlayerId={highlightPlayerId} />
      <h2 className="mt-12 mb-6 text-2xl font-bold">Match scores</h2>
      <MatchScoresList results={matchResults} />
    </main>
  );
}
