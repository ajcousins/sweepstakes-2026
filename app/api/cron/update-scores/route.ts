import { jsonError, jsonOk } from '@/lib/api';
import { verifyCronRequest } from '@/lib/cron-auth';
import { runScoreSync } from '@/lib/score-updater/run-sync';

export async function POST(request: Request) {
  if (!verifyCronRequest(request).ok) {
    return jsonError('Unauthorized', 401);
  }

  const result = await runScoreSync();
  if (!result.ok) {
    if (result.status === 400 && result.summary) {
      return jsonError(result.error, 400);
    }
    return jsonError(result.error, result.status);
  }

  const { summary } = result;
  return jsonOk({
    ok: true,
    inserted: summary.inserted,
    skippedExisting: summary.skippedExisting,
    completed: summary.completed,
    skippedNotCompleted: summary.skippedNotCompleted,
  });
}
