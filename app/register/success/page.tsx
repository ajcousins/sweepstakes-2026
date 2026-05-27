'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LeaguePageShell } from '@/components/LeaguePageShell';
import { SiteHeader } from '@/components/SiteHeader';
import {
  clearRegisterSuccess,
  loadRegisterSuccess,
} from '@/lib/register-success';
import { TeamFlag } from '@/components/TeamFlag';

export default function RegisterSuccessPage() {
  return (
    <LeaguePageShell>
      <RegisterSuccessContent />
    </LeaguePageShell>
  );
}

function RegisterSuccessContent() {
  const router = useRouter();
  const [payload] = useState<ReturnType<typeof loadRegisterSuccess>>(() => {
    if (typeof window === 'undefined') return null;
    return loadRegisterSuccess();
  });

  useEffect(() => {
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
      <div className="flex min-h-full flex-col">
        <SiteHeader leagueReady />
        <main className="mx-auto flex flex-1 items-center justify-center px-4 py-16">
          <p className="text-zinc-500">Loading…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader leagueReady />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12 text-center">
        <h1 className="mb-2 text-2xl font-bold">You&apos;re in!</h1>
        <p className="mb-8 text-zinc-600">Your World Cup teams:</p>
        <div className="mb-8 flex flex-col items-center gap-6 rounded-2xl border border-primary-border bg-primary-subtle px-8 py-12">
          <div className="flex items-end justify-center gap-8 sm:gap-12">
            <TeamFlag
              teamCode={payload.team_a}
              size="xl"
              showName
              nameClassName="max-w-[8rem] text-center text-base font-semibold leading-snug sm:text-lg"
            />
            <span className="pb-10 text-2xl font-light text-zinc-400">+</span>
            <TeamFlag
              teamCode={payload.team_b}
              size="xl"
              showName
              nameClassName="max-w-[8rem] text-center text-base font-semibold leading-snug sm:text-lg"
            />
          </div>
        </div>
        {payload.goodluck_message && (
          <p className="mb-8 text-lg text-primary-ink">
            {payload.goodluck_message}
          </p>
        )}
        <Link
          href="/table"
          className="inline-block rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-primary-hover active:bg-primary-pressed"
        >
          View league table
        </Link>
      </main>
    </div>
  );
}
