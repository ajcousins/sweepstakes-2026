'use client';

import { TEAMS } from '@/lib/teams';
import { kickOffToDatetimeLocal } from '@/lib/match-results';
import type { MatchResultRow } from '@/lib/match-results';

export type MatchFormValues = {
  kick_off: string;
  stage: string;
  home_team: string;
  away_team: string;
  home_score: string;
  away_score: string;
  went_to_extra_time: boolean;
  home_penalties_score: string;
  away_penalties_score: string;
};

export const emptyMatchForm = (): MatchFormValues => ({
  kick_off: '',
  stage: '',
  home_team: '',
  away_team: '',
  home_score: '0',
  away_score: '0',
  went_to_extra_time: false,
  home_penalties_score: '',
  away_penalties_score: '',
});

export function matchToFormValues(row: MatchResultRow): MatchFormValues {
  return {
    kick_off: kickOffToDatetimeLocal(row.kick_off),
    stage: row.stage ?? '',
    home_team: row.home_team,
    away_team: row.away_team,
    home_score: String(row.home_score),
    away_score: String(row.away_score),
    went_to_extra_time: row.went_to_extra_time,
    home_penalties_score:
      row.home_penalties_score != null ? String(row.home_penalties_score) : '',
    away_penalties_score:
      row.away_penalties_score != null ? String(row.away_penalties_score) : '',
  };
}

const teamOptions = Object.values(TEAMS)
  .map((t) => ({ code: t.code, name: t.teamName }))
  .sort((a, b) => a.name.localeCompare(b.name));

type Props = {
  values: MatchFormValues;
  onChange: (values: MatchFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  submitLabel: string;
  loading?: boolean;
};

export function MatchResultForm({
  values,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  loading,
}: Props) {
  const set = (patch: Partial<MatchFormValues>) =>
    onChange({ ...values, ...patch });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Kick-off</label>
          <input
            type="datetime-local"
            required
            value={values.kick_off}
            onChange={(e) => set({ kick_off: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Stage</label>
          <input
            type="text"
            placeholder="e.g. Group B, Semi Final"
            value={values.stage}
            onChange={(e) => set({ stage: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Home team</label>
          <select
            required
            value={values.home_team}
            onChange={(e) => set({ home_team: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          >
            <option value="">Select…</option>
            {teamOptions.map((t) => (
              <option key={t.code} value={t.code}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Away team</label>
          <select
            required
            value={values.away_team}
            onChange={(e) => set({ away_team: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          >
            <option value="">Select…</option>
            {teamOptions.map((t) => (
              <option key={t.code} value={t.code}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Home score (incl. ET)</label>
          <input
            type="number"
            min={0}
            required
            value={values.home_score}
            onChange={(e) => set({ home_score: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Away score (incl. ET)</label>
          <input
            type="number"
            min={0}
            required
            value={values.away_score}
            onChange={(e) => set({ away_score: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.went_to_extra_time}
          onChange={(e) => set({ went_to_extra_time: e.target.checked })}
        />
        Went to extra time
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Home pens (optional)</label>
          <input
            type="number"
            min={0}
            value={values.home_penalties_score}
            onChange={(e) => set({ home_penalties_score: e.target.value })}
            placeholder="—"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Away pens (optional)</label>
          <input
            type="number"
            min={0}
            value={values.away_penalties_score}
            onChange={(e) => set({ away_penalties_score: e.target.value })}
            placeholder="—"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
        >
          {loading ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-zinc-300 px-4 py-2 font-medium hover:bg-zinc-100"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
