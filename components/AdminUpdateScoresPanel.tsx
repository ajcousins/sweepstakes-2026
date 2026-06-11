'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { TextLink } from '@/components/ui/TextLink';
import type { SyncSummary } from '@/lib/score-updater/sync';

export function AdminUpdateScoresPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[] | null>(null);

  async function handleUpdate() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/update-scores', {
        method: 'POST',
        credentials: 'include',
      });
      const json = (await res.json()) as {
        error?: string;
        logs?: string[];
        summary?: SyncSummary;
      };

      if (res.status === 401) {
        router.replace('/login');
        return;
      }
      if (res.status === 403) {
        router.replace('/table');
        return;
      }

      if (json.logs) {
        setLogs(json.logs);
      }

      if (!res.ok) {
        setError(json.error ?? 'Score update failed');
        return;
      }
    } catch {
      setError('Score update failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Update scores</h1>
        <TextLink href="/table" className="text-sm">
          ← Leaderboard
        </TextLink>
      </div>

      <div className="mb-6">
        <Button onClick={handleUpdate} disabled={loading}>
          {loading ? 'Updating…' : 'Update scores'}
        </Button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {logs ? (
        <pre className="overflow-x-auto rounded-xl inset-shadow-md bg-zinc-100 p-4 font-mono text-sm whitespace-pre-wrap text-zinc-900">
          {logs.join('\n')}
        </pre>
      ) : (
        <p className="text-zinc-500">
          Click &ldquo;Update scores&rdquo; to fetch completed World Cup matches from BBC
          Sport and insert any new results.
        </p>
      )}
    </main>
  );
}
