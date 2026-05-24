'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { LeagueSessionProvider } from '@/lib/league-session-context';
import { useLeagueSession } from '@/lib/use-league-session';

type Props = {
  children: React.ReactNode;
  /** Redirect to `/` when not in a league (default true). */
  redirectIfOut?: boolean;
};

/** Renders children only after league session is confirmed; avoids nav flash. */
export function LeaguePageShell({ children, redirectIfOut = true }: Props) {
  const router = useRouter();
  const { status, leagueTitle } = useLeagueSession();

  useEffect(() => {
    if (redirectIfOut && status === 'out_of_league') {
      router.replace('/');
    }
  }, [redirectIfOut, router, status]);

  if (status !== 'in_league') {
    return (
      <div className="flex min-h-full flex-col">
        <SiteHeader leagueReady={false} playerLoggedIn={false} />
        <main className="mx-auto flex flex-1 items-center justify-center px-4 py-16">
          <p className="text-zinc-500">Loading…</p>
        </main>
      </div>
    );
  }

  return (
    <LeagueSessionProvider leagueTitle={leagueTitle}>{children}</LeagueSessionProvider>
  );
}
