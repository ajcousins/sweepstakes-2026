'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';

export function RegisterForm() {
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

      router.push('/register/success');
      router.refresh();
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
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
  );
}
