'use client';

import Link from 'next/link';
import { useLeagueTitle } from '@/lib/league-session-context';

type Props = {
  leagueReady: boolean;
  isAdmin?: boolean;
};

export function SiteHeader({ leagueReady, isAdmin }: Props) {
  const leagueTitle = useLeagueTitle();
  const title = leagueReady && leagueTitle ? leagueTitle : '';

  return (
    <header className="bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
        <Link href={leagueReady ? '/table' : '/'} className="text-lg font-semibold tracking-tight">
          {title}
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {leagueReady && isAdmin && (
            <Link
              href="/admin/matches"
              className="text-amber-700 hover:text-amber-900"
            >
              Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
