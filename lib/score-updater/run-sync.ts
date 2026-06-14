import { syncScores, type SyncSummary } from '@/lib/score-updater/sync';

export type RunScoreSyncResult =
  | { ok: true; summary: SyncSummary; logs: string[] }
  | {
      ok: false;
      error: string;
      status: 400 | 500;
      summary?: SyncSummary;
      logs?: string[];
    };

export async function runScoreSync(): Promise<RunScoreSyncResult> {
  try {
    const summary = await syncScores();
    const logs = summary.logs;

    if (summary.validationErrors.length > 0) {
      return {
        ok: false,
        error: 'Validation errors during score update',
        status: 400,
        summary,
        logs,
      };
    }

    return { ok: true, summary, logs };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Score update failed',
      status: 500,
    };
  }
}
