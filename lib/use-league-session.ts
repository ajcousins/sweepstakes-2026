'use client';

import { useEffect, useState } from 'react';
import { clearStoredLeague, setStoredLeagueId } from '@/lib/storage-client';

export type LeagueSessionStatus = 'pending' | 'in_league' | 'out_of_league';

/** Resolves league access from the httpOnly session cookie (source of truth). */
export function useLeagueSession(): LeagueSessionStatus {
  const [status, setStatus] = useState<LeagueSessionStatus>('pending');

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      try {
        const res = await fetch('/api/league/session', { credentials: 'include' });
        if (cancelled) return;

        if (res.ok) {
          const json = (await res.json()) as { id_league: string };
          setStoredLeagueId(json.id_league);
          setStatus('in_league');
          return;
        }

        clearStoredLeague();
        setStatus('out_of_league');
      } catch {
        if (!cancelled) {
          clearStoredLeague();
          setStatus('out_of_league');
        }
      }
    }

    void resolve();
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
