'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextLink } from '@/components/ui/TextLink';
import {
  MatchResultForm,
  emptyMatchForm,
  matchToFormValues,
  type MatchFormValues,
} from '@/components/MatchResultForm';
import { formatKickOffDisplay, type MatchResultRow } from '@/lib/match-results';

type Props = {
  initialResults: MatchResultRow[];
};

function formToPayload(values: MatchFormValues) {
  return {
    kick_off: values.kick_off,
    stage: values.stage.trim() || null,
    home_team: values.home_team,
    away_team: values.away_team,
    home_score: Number(values.home_score),
    away_score: Number(values.away_score),
    went_to_extra_time: values.went_to_extra_time,
    home_penalties_score: values.home_penalties_score
      ? Number(values.home_penalties_score)
      : null,
    away_penalties_score: values.away_penalties_score
      ? Number(values.away_penalties_score)
      : null,
  };
}

export function AdminMatchesPanel({ initialResults }: Props) {
  const router = useRouter();
  const [results, setResults] = useState(initialResults);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [createForm, setCreateForm] = useState(emptyMatchForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<MatchFormValues>(emptyMatchForm());

  const reload = useCallback(async () => {
    setListLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/match-results', { credentials: 'include' });
      const json = await res.json();
      if (res.status === 401) {
        router.replace('/login');
        return;
      }
      if (res.status === 403) {
        router.replace('/table');
        return;
      }
      if (!res.ok) {
        setError(json.error ?? 'Could not load matches');
        return;
      }
      setResults(json.results);
    } catch {
      setError('Could not load matches');
    } finally {
      setListLoading(false);
    }
  }, [router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    setWarning(null);
    setError(null);
    try {
      const res = await fetch('/api/admin/match-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formToPayload(createForm)),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Could not save');
        return;
      }
      if (json.warning) setWarning(json.warning);
      setNotice('Match added.');
      setCreateForm(emptyMatchForm());
      await reload();
      router.refresh();
    } catch {
      setError('Could not save');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(row: MatchResultRow) {
    setEditingId(row.id_result);
    setEditForm(matchToFormValues(row));
    setNotice(null);
    setWarning(null);
    setError(null);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    setNotice(null);
    setWarning(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/match-results/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formToPayload(editForm)),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Could not update');
        return;
      }
      if (json.warning) setWarning(json.warning);
      setNotice('Match updated.');
      setEditingId(null);
      await reload();
      router.refresh();
    } catch {
      setError('Could not update');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this match result?')) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/match-results/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Could not delete');
        return;
      }
      setNotice('Match deleted.');
      if (editingId === id) setEditingId(null);
      await reload();
      router.refresh();
    } catch {
      setError('Could not delete');
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Match results</h1>
        <TextLink href="/table" className="text-sm">
          ← Leaderboard
        </TextLink>
      </div>

      {notice && (
        <p className="mb-4 rounded-lg bg-primary-subtle px-4 py-2 text-sm text-primary-ink">
          {notice}
        </p>
      )}
      {warning && (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-900" role="alert">
          {warning}
        </p>
      )}
      {error && (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold">Add match</h2>
        <MatchResultForm
          values={createForm}
          onChange={setCreateForm}
          onSubmit={handleCreate}
          submitLabel="Add match"
          loading={saving && !editingId}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">All matches</h2>
        {listLoading && <p className="text-zinc-500">Loading…</p>}
        {!listLoading && results.length === 0 && (
          <p className="text-zinc-500">No matches recorded yet.</p>
        )}
        <ul className="flex flex-col gap-3">
          {results.map((row) => (
            <li
              key={row.id_result}
              className="rounded-xl border border-zinc-200 p-4"
            >
              {editingId === row.id_result ? (
                <MatchResultForm
                  values={editForm}
                  onChange={setEditForm}
                  onSubmit={handleUpdate}
                  onCancel={() => setEditingId(null)}
                  submitLabel="Save changes"
                  loading={saving}
                />
              ) : (
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {row.home_team_name} {row.home_score} – {row.away_score}{' '}
                      {row.away_team_name}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {row.stage ?? '—'} ·{' '}
                      {formatKickOffDisplay(row.kick_off)}
                      {row.went_to_extra_time && ' · ET'}
                      {row.home_penalties_score != null &&
                        ` · Pens ${row.home_penalties_score}-${row.away_penalties_score}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(row)}
                      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(row.id_result)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
