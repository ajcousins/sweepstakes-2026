'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LeaguePageShell } from '@/components/LeaguePageShell';
import { SiteHeader } from '@/components/SiteHeader';
import { setStoredPlayerId } from '@/lib/storage-client';

export default function LoginPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/player/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ player_name: playerName, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Login failed');
        return;
      }

      setStoredPlayerId(data.id_player);
      router.push('/table');
      router.refresh();
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LeaguePageShell>
      <div className="flex min-h-full flex-col">
        <SiteHeader leagueReady playerLoggedIn={false} />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
        <h1 className="mb-6 text-2xl font-bold">Player log in</h1>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="player_name" className="mb-1 block text-sm font-medium">
              Player name
            </label>
            <input
              id="player_name"
              required
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
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
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p className="mt-6 text-sm text-zinc-600">
          No account?{' '}
          <Link href="/register" className="font-medium text-emerald-700">
            Register
          </Link>
        </p>
        </main>
      </div>
    </LeaguePageShell>
  );
}
