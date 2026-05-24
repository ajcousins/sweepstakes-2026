'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LeagueGateForm } from '@/components/LeagueGateForm';
import { useLeagueSession } from '@/lib/use-league-session';

export default function HomePage() {
  const router = useRouter();
  const session = useLeagueSession();

  useEffect(() => {
    if (session === 'in_league') {
      router.replace('/table');
    }
  }, [router, session]);

  if (session === 'pending' || session === 'in_league') {
    return (
      <div className="flex min-h-full flex-col bg-gradient-to-b from-emerald-50 to-white">
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16">
          <p className="text-zinc-500">Loading…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-emerald-50 to-white">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">World Cup Sweepstakes</h1>
        <p className="mb-8 text-zinc-600">
          Enter your league name and password to view the table and register as a player.
        </p>
        <LeagueGateForm />
      </main>
    </div>
  );
}
