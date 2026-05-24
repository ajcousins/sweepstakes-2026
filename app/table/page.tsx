'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LeaderboardTable, type LeaderboardRowView } from '@/components/LeaderboardTable';
import { LeaguePageShell } from '@/components/LeaguePageShell';
import { SiteHeader } from '@/components/SiteHeader';
import { getStoredPlayerId } from '@/lib/storage-client';

type LeaderboardResponse = {
  rows: LeaderboardRowView[];
  welcome_message: string | null;
  info_message: string | null;
  highlight_player_id: string | null;
  is_admin?: boolean;
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/leaderboard', { credentials: 'include' });
      const json = await res.json();
      if (res.status === 401) {
        router.replace('/');
        return;
      }
      if (!res.ok) {
        setError(json.error ?? 'Could not load table');
        return;
      }
      setData(json);
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
      <SiteHeader
        leagueReady
        playerLoggedIn={playerLoggedIn}
        isAdmin={data?.is_admin}
      />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        {data?.welcome_message && (
          <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-emerald-900">
            {data.welcome_message}
          </p>
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
      </main>
    </div>
  );
}
