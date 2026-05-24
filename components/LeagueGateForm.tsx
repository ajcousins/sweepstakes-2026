'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setStoredLeagueId } from '@/lib/storage-client';

export function LeagueGateForm() {
  const router = useRouter();
  const [leagueName, setLeagueName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/league/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ league_name: leagueName, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Login failed');
        return;
      }

      setStoredLeagueId(data.id_league);
      router.push('/table');
      router.refresh();
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-4">
      <div>
        <label htmlFor="league_name" className="mb-1 block text-sm font-medium">
          League name
        </label>
        <input
          id="league_name"
          type="text"
          autoComplete="username"
          required
          value={leagueName}
          onChange={(e) => setLeagueName(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="league_password" className="mb-1 block text-sm font-medium">
          League password
        </label>
        <input
          id="league_password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-emerald-700 px-4 py-2.5 font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
      >
        {loading ? 'Entering…' : 'Enter league'}
      </button>
    </form>
  );
}
