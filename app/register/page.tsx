'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LeaguePageShell } from '@/components/LeaguePageShell';
import { SiteHeader } from '@/components/SiteHeader';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { TextLink } from '@/components/ui/TextLink';
import { saveRegisterSuccess } from '@/lib/register-success';
import { setStoredPlayerId } from '@/lib/storage-client';

export default function RegisterPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/player/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          player_name: playerName,
          password,
          confirm_password: confirmPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Join failed');
        return;
      }

      setStoredPlayerId(data.id_player);
      saveRegisterSuccess({
        team_a: data.team_a,
        team_b: data.team_b,
        goodluck_message: data.goodluck_message,
      });
      router.push('/register/success');
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
          <h1 className="mb-6 text-2xl font-bold">Join the league</h1>
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              id="confirm_password"
              label="Confirm password"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Joining…' : 'Join'}
            </Button>
          </form>
          <p className="mt-6 text-sm text-zinc-600">
            Already joined?{' '}
            <TextLink href="/login">Log in</TextLink>
          </p>
        </main>
      </div>
    </LeaguePageShell>
  );
}
