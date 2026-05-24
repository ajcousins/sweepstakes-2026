'use client';

import Link from 'next/link';

type Props = {
  leagueReady: boolean;
  playerLoggedIn: boolean;
};

export function SiteHeader({ leagueReady, playerLoggedIn }: Props) {
  return (
    <header className="border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
        <Link href={leagueReady ? '/table' : '/'} className="text-lg font-semibold tracking-tight">
          Sweepstakes 2026
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {leagueReady && (
            <>
              <Link
                href="/table"
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                League table
              </Link>
              {!playerLoggedIn && (
                <>
                  <Link
                    href="/login"
                    className="rounded-full bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full border border-zinc-300 px-4 py-2 font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-900"
                  >
                    Register
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
