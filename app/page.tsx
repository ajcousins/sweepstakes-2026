'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LeagueGateForm } from '@/components/LeagueGateForm';
import { getStoredLeagueId } from '@/lib/storage-client';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (getStoredLeagueId()) {
      router.replace('/table');
    }
  }, [router]);

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-emerald-50 to-white dark:from-zinc-950 dark:to-black">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">World Cup Sweepstakes</h1>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">
          Enter your league name and password to view the table and register as a player.
        </p>
        <LeagueGateForm />
      </main>
    </div>
  );
}
