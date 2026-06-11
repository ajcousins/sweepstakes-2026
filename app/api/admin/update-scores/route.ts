import { NextResponse } from 'next/server';
import { jsonError, jsonOk } from '@/lib/api';
import { requireAdmin } from '@/lib/admin';
import { syncScores } from '@/lib/score-updater/sync';

export async function POST() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return jsonError(auth.message, auth.status);
  }

  try {
    const summary = await syncScores();
    const body = { summary, logs: summary.logs };

    if (summary.validationErrors.length > 0) {
      return NextResponse.json(
        { ...body, error: 'Validation errors during score update' },
        { status: 400 },
      );
    }

    return jsonOk(body);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Score update failed';
    return jsonError(message, 500);
  }
}
