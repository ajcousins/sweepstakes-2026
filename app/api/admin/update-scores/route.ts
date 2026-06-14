import { NextResponse } from 'next/server';
import { jsonError, jsonOk } from '@/lib/api';
import { requireAdmin } from '@/lib/admin';
import { runScoreSync } from '@/lib/score-updater/run-sync';

export async function POST() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return jsonError(auth.message, auth.status);
  }

  const result = await runScoreSync();
  if (!result.ok) {
    if (result.status === 400 && result.summary) {
      return NextResponse.json(
        {
          summary: result.summary,
          logs: result.logs,
          error: result.error,
        },
        { status: 400 },
      );
    }
    return jsonError(result.error, result.status);
  }

  return jsonOk({ summary: result.summary, logs: result.logs });
}
