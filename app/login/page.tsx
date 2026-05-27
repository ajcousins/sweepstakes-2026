'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LeaguePageShell } from '@/components/LeaguePageShell';
import { SiteHeader } from '@/components/SiteHeader';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { TextLink } from '@/components/ui/TextLink';
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
        <SiteHeader leagueReady />
        <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
          <h1 className="mb-6 text-2xl font-bold">Player log in</h1>
          <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
            <TextField
              id="player_name"
              label="Player name"
              required
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
            <TextField
              id="password"
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Logging in…' : 'Log in'}
            </Button>
          </form>
          <p className="mt-6 text-sm text-zinc-600">
            Haven&apos;t joined yet?{' '}
            <TextLink href="/register">Join the league!</TextLink>
          </p>
        </main>
      </div>
    </LeaguePageShell>
  );
}
