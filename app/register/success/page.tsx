'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import {
  clearRegisterSuccess,
  loadRegisterSuccess,
} from '@/lib/register-success';
import { TEAMS } from '@/lib/teams';
import { getStoredLeagueId } from '@/lib/storage-client';

export default function RegisterSuccessPage() {
  const router = useRouter();
  const [payload] = useState<ReturnType<typeof loadRegisterSuccess>>(() => {
    if (typeof window === 'undefined') return null;
    return loadRegisterSuccess();
  });

  useEffect(() => {
    if (!getStoredLeagueId()) {
      router.replace('/');
      return;
    }
    if (!payload) {
      router.replace('/table');
      return;
    }
    return () => {
      clearRegisterSuccess();
    };
  }, [router, payload]);

  if (!payload) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p className="text-zinc-500">Loading…</p>
      </div>
    );
  }

  const teamA = TEAMS[payload.team_a as keyof typeof TEAMS];
  const teamB = TEAMS[payload.team_b as keyof typeof TEAMS];

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader leagueReady playerLoggedIn />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12 text-center">
        <h1 className="mb-2 text-2xl font-bold">You&apos;re in!</h1>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">Your World Cup teams:</p>
        <div className="mb-8 flex flex-col items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-10 dark:border-emerald-900 dark:bg-emerald-950/40">
          <div className="text-4xl">
            {teamA?.flag ?? ''} {teamB?.flag ?? ''}
          </div>
          <p className="text-lg font-semibold">
            {teamA?.teamName ?? payload.team_a}{' '}
            <span className="font-normal text-zinc-500">+</span>{' '}
            {teamB?.teamName ?? payload.team_b}
          </p>
        </div>
        {payload.goodluck_message && (
          <p className="mb-8 text-lg text-emerald-800 dark:text-emerald-200">
            {payload.goodluck_message}
          </p>
        )}
        <Link
          href="/table"
          className="inline-block rounded-lg bg-emerald-700 px-6 py-2.5 font-medium text-white hover:bg-emerald-600"
        >
          View league table
        </Link>
      </main>
    </div>
  );
}
