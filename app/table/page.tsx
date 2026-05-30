'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LeaderboardTable, type LeaderboardRowView } from '@/components/LeaderboardTable';
import { LeaguePageShell } from '@/components/LeaguePageShell';
import { MatchScoresList } from '@/components/MatchScoresList';
import { SiteHeader } from '@/components/SiteHeader';
import type { MatchResultRow } from '@/lib/match-results';
import { getStoredPlayerId } from '@/lib/storage-client';

type LeaderboardResponse = {
  rows: LeaderboardRowView[];
  welcome_message: string | null;
  info_message: string | null;
  highlight_player_id: string | null;
  is_admin?: boolean;
};

type MatchResultsResponse = {
  results: MatchResultRow[];
};

export default function TablePage() {
  return (
    <LeaguePageShell>
      <TablePageContent />
    </LeaguePageShell>
  );
}

function TablePageContent() {
  const router = useRouter();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [matchResults, setMatchResults] = useState<MatchResultRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [leaderboardRes, matchResultsRes] = await Promise.all([
        fetch('/api/leaderboard', { credentials: 'include' }),
        fetch('/api/match-results', { credentials: 'include' }),
      ]);

      const leaderboardJson = await leaderboardRes.json();
      if (leaderboardRes.status === 401) {
        router.replace('/');
        return;
      }
      if (!leaderboardRes.ok) {
        setError(leaderboardJson.error ?? 'Could not load table');
        return;
      }

      const matchResultsJson = (await matchResultsRes.json()) as MatchResultsResponse;
      if (!matchResultsRes.ok) {
        setError(
          'error' in matchResultsJson && typeof matchResultsJson.error === 'string'
            ? matchResultsJson.error
            : 'Could not load match results',
        );
        return;
      }

      setData(leaderboardJson);
      setMatchResults(matchResultsJson.results);
    } catch {
      setError('Could not load table');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    void load();
  }, [load]);

  const playerLoggedIn = Boolean(
    data?.highlight_player_id ?? getStoredPlayerId(),
  );

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader leagueReady isAdmin={data?.is_admin} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        {/* <p className="mb-4 rounded-lg bg-primary-subtle px-4 py-3 text-primary-ink">
          Announcement text
        </p> */}
        {!playerLoggedIn && (
          <Button href="/register" className="mb-6 px-6">
            Join league
          </Button>
        )}
        <h1 className="mb-2 text-2xl font-bold">League table</h1>
        {data?.info_message && (
          <p className="mb-6 text-sm text-zinc-600">{data.info_message}</p>
        )}
        {loading && <p className="text-zinc-500">Loading…</p>}
        {error && (
          <p className="text-red-600" role="alert">
            {error}
          </p>
        )}
        {data && !loading && (
          <LeaderboardTable
            rows={data.rows}
            highlightPlayerId={data.highlight_player_id}
          />
        )}

        <h2 className="mt-12 mb-6 text-2xl font-bold">Match scores</h2>
        {!loading && !error && <MatchScoresList results={matchResults} />}
      </main>
    </div>
  );
}
